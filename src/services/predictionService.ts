import { mlPredictor, type MLPredictionResult } from './mlPredictor';

interface StudentProfile {
  cgpa: number;
  branch: string;
  workExp: number;
  internships: number;
  projects: number;
  skills: string[];
  resumeScore?: number;
  softSkills?: number;
}

interface DatasetRow {
  StudentID: string;
  CGPA: number;
  Degree: string;
  WorkExp: number;
  Internships: number;
  Projects: number;
  Skills: string;
  ResumeScore: number;
  SoftSkills: number;
  Placed: string;
  Salary: number;
}

interface PredictionResult {
  // ML Model Results
  binaryPrediction: 'Yes' | 'No';
  placementProbability: number; // 0-100 percentage
  confidence: 'High' | 'Medium' | 'Low';
  
  // Traditional Results
  expectedSalary: number;
  analysis: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  benchmarkComparison: {
    cgpaPercentile: number;
    internshipPercentile: number;
    projectPercentile: number;
    skillsMatch: number;
  };
}

class PlacementPredictor {
  private dataset: DatasetRow[] = [];
  private skillsMap: Map<string, number> = new Map();
  private isDatasetLoaded = false;

  async loadDataset() {
    if (this.isDatasetLoaded) return;
    
    try {
      const response = await fetch('/dataset.csv');
      if (!response.ok) {
        throw new Error(`Failed to fetch dataset: ${response.statusText}`);
      }
      const csvText = await response.text();
      this.parseCSV(csvText);
      this.buildSkillsMap();
      this.isDatasetLoaded = true;
      console.log('📊 Dataset loaded successfully!', `${this.dataset.length} records`);
    } catch (error) {
      console.error('Error loading dataset:', error);
      throw new Error('Failed to load placement data');
    }
  }

  private async ensureDatasetLoaded() {
    if (!this.isDatasetLoaded) {
      await this.loadDataset();
    }
  }

  private parseCSV(csvText: string) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    
    this.dataset = lines.slice(1).map(line => {
      const values = this.parseCSVLine(line);
      return {
        StudentID: values[0],
        CGPA: parseFloat(values[1]),
        Degree: values[2],
        WorkExp: parseInt(values[3]),
        Internships: parseInt(values[4]),
        Projects: parseInt(values[5]),
        Skills: values[6].replace(/"/g, ''),
        ResumeScore: parseInt(values[7]),
        SoftSkills: parseInt(values[8]),
        Placed: values[9],
        Salary: parseInt(values[10])
      };
    });
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  private buildSkillsMap() {
    const skillCounts = new Map<string, number>();
    
    this.dataset.forEach(row => {
      if (row.Placed === 'Yes') {
        const skills = row.Skills.split(',').map(s => s.trim());
        skills.forEach(skill => {
          skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
        });
      }
    });

    // Calculate skill importance scores
    const totalPlaced = this.dataset.filter(r => r.Placed === 'Yes').length;
    skillCounts.forEach((count, skill) => {
      this.skillsMap.set(skill, count / totalPlaced);
    });
  }

  async predict(profile: StudentProfile): Promise<PredictionResult> {
    // Ensure dataset is loaded for statistical fallback
    await this.ensureDatasetLoaded();
    
    // Try ML prediction first
    let mlResult: MLPredictionResult | null = null;
    
    try {
      // Ensure ML model is loaded
      if (!mlPredictor.getModelInfo()) {
        await mlPredictor.loadModel();
      }
      
      mlResult = mlPredictor.predict(profile);
      console.log(`🤖 Enhanced ML Prediction: ${mlResult.binaryPrediction} (${mlResult.probabilityPercentage}%)`);
    } catch (error) {
      console.warn('ML prediction failed, falling back to statistical method:', error);
    }

    // Statistical analysis (always computed for additional insights)
    const similarProfiles = this.findSimilarProfiles(profile);
    const statisticalProbability = this.calculatePlacementProbability(profile, similarProfiles);
    const expectedSalary = this.calculateExpectedSalary(profile, similarProfiles);
    const analysis = this.analyzeProfile(profile);
    const benchmarkComparison = this.calculateBenchmarks(profile);
    
    console.log('📊 Statistical Analysis:', {
      similarProfilesCount: similarProfiles.length,
      placedInSimilar: similarProfiles.filter(p => p.Placed === 'Yes').length,
      statisticalProbability: (statisticalProbability * 100).toFixed(1) + '%',
      expectedSalary: expectedSalary
    });

    // Use ML results if available and reasonable, otherwise fall back to statistical
    let finalProbability, binaryPrediction, confidence;
    
    if (mlResult && mlResult.probabilityPercentage > 5 && mlResult.probabilityPercentage < 95) {
      // ML prediction seems reasonable
      finalProbability = mlResult.probabilityPercentage;
      binaryPrediction = mlResult.binaryPrediction;
      confidence = mlResult.confidence;
      console.log('✅ Using ML prediction');
    } else {
      // Fall back to statistical method
      finalProbability = Math.round(statisticalProbability * 100);
      binaryPrediction = statisticalProbability >= 0.5 ? 'Yes' : 'No';
      confidence = 'Medium';
      console.log('⚠️ Using statistical fallback, ML result:', mlResult?.probabilityPercentage);
    }

    return {
      binaryPrediction,
      placementProbability: finalProbability,
      confidence,
      expectedSalary,
      analysis,
      benchmarkComparison
    };
  }

  private findSimilarProfiles(profile: StudentProfile): DatasetRow[] {
    const branchMatch = this.dataset.filter(row => 
      this.normalizeBranch(row.Degree) === this.normalizeBranch(profile.branch)
    );

    return branchMatch
      .map(row => ({
        ...row,
        similarity: this.calculateSimilarity(profile, row)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 50); // Top 50 similar profiles
  }

  private normalizeBranch(branch: string): string {
    const mapping: { [key: string]: string } = {
      'Computer Science Engineering': 'CSE',
      'Computer Science': 'CSE',
      'Information Technology': 'IT',
      'Electronics and Communication Engineering': 'ECE',
      'Electronics': 'ECE',
      'Mechanical Engineering': 'MECH',
      'Mechanical': 'MECH',
      'Civil Engineering': 'CIVIL',
      'Civil': 'CIVIL'
    };
    return mapping[branch] || branch.toUpperCase();
  }

  private calculateSimilarity(profile: StudentProfile, row: any): number {
    let similarity = 0;
    let weights = 0;

    // CGPA similarity (weight: 0.3)
    const cgpaDiff = Math.abs(profile.cgpa - row.CGPA);
    similarity += (1 - cgpaDiff / 10) * 0.3;
    weights += 0.3;

    // Experience similarity (weight: 0.2)
    const expDiff = Math.abs(profile.workExp - row.WorkExp);
    similarity += (1 - expDiff / 5) * 0.2;
    weights += 0.2;

    // Internships similarity (weight: 0.2)
    const internDiff = Math.abs(profile.internships - row.Internships);
    similarity += (1 - internDiff / 5) * 0.2;
    weights += 0.2;

    // Projects similarity (weight: 0.2)
    const projDiff = Math.abs(profile.projects - row.Projects);
    similarity += (1 - projDiff / 10) * 0.2;
    weights += 0.2;

    // Skills similarity (weight: 0.1)
    const skillsMatch = this.calculateSkillsMatch(profile.skills, row.Skills);
    similarity += skillsMatch * 0.1;
    weights += 0.1;

    return similarity / weights;
  }

  private calculateSkillsMatch(profileSkills: string[], rowSkills: string): number {
    const rowSkillsArray = rowSkills.split(',').map(s => s.trim().toLowerCase());
    const profileSkillsLower = profileSkills.map(s => s.toLowerCase());
    
    const intersection = profileSkillsLower.filter(skill => 
      rowSkillsArray.some(rs => rs.includes(skill) || skill.includes(rs))
    );
    
    return intersection.length / Math.max(profileSkillsLower.length, rowSkillsArray.length);
  }

  private calculatePlacementProbability(profile: StudentProfile, similarProfiles: any[]): number {
    if (similarProfiles.length === 0) return 0.5;

    const placedCount = similarProfiles.filter(p => p.Placed === 'Yes').length;
    let baseProbability = placedCount / similarProfiles.length;

    // Adjust based on profile strengths
    if (profile.cgpa >= 8.5) baseProbability += 0.1;
    if (profile.internships >= 2) baseProbability += 0.1;
    if (profile.projects >= 3) baseProbability += 0.1;
    if (profile.workExp >= 1) baseProbability += 0.1;

    // Adjust based on skills
    const highValueSkills = ['React', 'Python', 'Java', 'ML', 'AI', 'DSA'];
    const hasHighValueSkills = profile.skills.some(skill => 
      highValueSkills.some(hvs => skill.toLowerCase().includes(hvs.toLowerCase()))
    );
    if (hasHighValueSkills) baseProbability += 0.05;

    return Math.min(baseProbability, 0.98);
  }

  private calculateExpectedSalary(profile: StudentProfile, similarProfiles: any[]): number {
    const placedProfiles = similarProfiles.filter(p => p.Placed === 'Yes' && p.Salary > 0);
    
    if (placedProfiles.length === 0) {
      // Default estimation based on profile
      let baseSalary = 400000; // 4 LPA base
      
      if (profile.cgpa >= 8.5) baseSalary += 200000;
      if (profile.internships >= 2) baseSalary += 150000;
      if (profile.projects >= 3) baseSalary += 100000;
      if (profile.workExp >= 1) baseSalary += 250000;
      
      return baseSalary;
    }

    const avgSalary = placedProfiles.reduce((sum, p) => sum + p.Salary, 0) / placedProfiles.length;
    
    // Adjust based on profile compared to similar profiles
    const avgCGPA = placedProfiles.reduce((sum, p) => sum + p.CGPA, 0) / placedProfiles.length;
    const cgpaMultiplier = profile.cgpa / avgCGPA;
    
    return Math.round(avgSalary * cgpaMultiplier);
  }

  private analyzeProfile(profile: StudentProfile): {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];
    
    console.log('🔍 Analyzing Profile:', {
      cgpa: profile.cgpa,
      workExp: profile.workExp,
      internships: profile.internships,
      projects: profile.projects,
      skillsCount: profile.skills.length
    });

    // Analyze CGPA
    if (profile.cgpa >= 8.5) {
      strengths.push(`Excellent CGPA of ${profile.cgpa} - Top performer`);
    } else if (profile.cgpa >= 7.5) {
      strengths.push(`Good CGPA of ${profile.cgpa} - Above average`);
    } else if (profile.cgpa < 6.5) {
      weaknesses.push(`CGPA of ${profile.cgpa} is below industry preference`);
      recommendations.push('Focus on improving academic performance in remaining semesters');
    }

    // Analyze practical experience (work + internships + projects)
    const totalPracticalExperience = profile.workExp + (profile.internships * 0.5) + (profile.projects * 0.3);
    
    if (profile.workExp >= 1) {
      strengths.push(`${profile.workExp} year(s) of work experience - Great advantage`);
    } else if (profile.internships >= 1 || profile.projects >= 2) {
      strengths.push('Good practical exposure through internships and projects');
    } else if (totalPracticalExperience < 1) {
      weaknesses.push('Limited practical exposure - Need more hands-on experience');
      recommendations.push('Gain practical experience through internships, projects, or part-time work');
    }

    // Analyze internships
    if (profile.internships >= 2) {
      strengths.push(`${profile.internships} internships completed - Shows initiative`);
    } else if (profile.internships === 1) {
      strengths.push('1 internship completed - Good start');
      recommendations.push('Complete at least one more internship in your domain');
    } else {
      weaknesses.push('No internship experience - Critical gap');
      recommendations.push('Immediately apply for internships - this is crucial for placement');
    }

    // Analyze projects
    if (profile.projects >= 4) {
      strengths.push(`${profile.projects} projects - Excellent hands-on experience`);
    } else if (profile.projects >= 2) {
      strengths.push(`${profile.projects} projects - Good practical work`);
      recommendations.push('Add 1-2 more projects to strengthen your portfolio');
    } else if (profile.projects === 1) {
      recommendations.push('Build at least 2-3 more substantial projects showcasing different skills');
    } else {
      weaknesses.push('No projects - Missing practical portfolio');
      recommendations.push('Immediately start building projects - create at least 3-4 substantial projects');
    }

    // Analyze skills
    const inDemandSkills = ['React', 'Python', 'Java', 'ML', 'AI', 'DSA', 'SQL', 'JavaScript'];
    const hasInDemandSkills = profile.skills.filter(skill => 
      inDemandSkills.some(demand => skill.toLowerCase().includes(demand.toLowerCase()))
    );

    if (hasInDemandSkills.length >= 3) {
      strengths.push(`Strong skill set with ${hasInDemandSkills.join(', ')}`);
    } else {
      weaknesses.push('Limited in-demand technical skills');
      recommendations.push('Learn trending technologies like React, Python, ML, or DSA');
    }

    // Additional recommendations
    if (profile.cgpa < 7.0 && profile.internships < 2) {
      recommendations.push('Focus on gaining practical experience through internships and projects to compensate for CGPA');
    }

    if (profile.skills.length < 4) {
      recommendations.push('Expand your skill set - aim for at least 5-6 relevant technical skills');
    }

    console.log('📝 Profile Analysis Results:', {
      strengthsCount: strengths.length,
      weaknessesCount: weaknesses.length,
      weaknesses: weaknesses,
      strengths: strengths.slice(0, 3) // Show first 3 strengths
    });
    
    return { strengths, weaknesses, recommendations };
  }

  private calculateBenchmarks(profile: StudentProfile): {
    cgpaPercentile: number;
    internshipPercentile: number;
    projectPercentile: number;
    skillsMatch: number;
  } {
    const cgpaPercentile = this.calculatePercentile(
      this.dataset.map(r => r.CGPA),
      profile.cgpa
    );

    const internshipPercentile = this.calculatePercentile(
      this.dataset.map(r => r.Internships),
      profile.internships
    );

    const projectPercentile = this.calculatePercentile(
      this.dataset.map(r => r.Projects),
      profile.projects
    );

    // Calculate skills match with successful candidates
    const successfulSkills = this.dataset
      .filter(r => r.Placed === 'Yes')
      .map(r => r.Skills.split(',').map(s => s.trim()))
      .flat();

    const skillsMatch = profile.skills.reduce((match, skill) => {
      const skillCount = successfulSkills.filter(s => 
        s.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(s.toLowerCase())
      ).length;
      return match + (skillCount / successfulSkills.length);
    }, 0) / profile.skills.length;

    return {
      cgpaPercentile: Math.round(cgpaPercentile * 100),
      internshipPercentile: Math.round(internshipPercentile * 100),
      projectPercentile: Math.round(projectPercentile * 100),
      skillsMatch: Math.round(skillsMatch * 100)
    };
  }

  private calculatePercentile(values: number[], target: number): number {
    const sorted = values.sort((a, b) => a - b);
    const lowerCount = sorted.filter(v => v < target).length;
    return lowerCount / sorted.length;
  }

  getIndustryTrends() {
    const trends = {
      topSkills: this.getTopSkills(),
      avgSalaryByBranch: this.getAvgSalaryByBranch(),
      placementRateByBranch: this.getPlacementRateByBranch(),
      salaryTrends: this.getSalaryTrends()
    };

    return trends;
  }

  private getTopSkills(): Array<{ skill: string; demand: number; avgSalary: number }> {
    const skillStats = new Map<string, { count: number; totalSalary: number }>();

    this.dataset.filter(r => r.Placed === 'Yes').forEach(row => {
      const skills = row.Skills.split(',').map(s => s.trim());
      skills.forEach(skill => {
        const current = skillStats.get(skill) || { count: 0, totalSalary: 0 };
        skillStats.set(skill, {
          count: current.count + 1,
          totalSalary: current.totalSalary + row.Salary
        });
      });
    });

    return Array.from(skillStats.entries())
      .map(([skill, stats]) => ({
        skill,
        demand: stats.count,
        avgSalary: Math.round(stats.totalSalary / stats.count)
      }))
      .sort((a, b) => b.demand - a.demand)
      .slice(0, 10);
  }

  private getAvgSalaryByBranch(): Array<{ branch: string; avgSalary: number; count: number }> {
    const branchStats = new Map<string, { totalSalary: number; count: number }>();

    this.dataset.filter(r => r.Placed === 'Yes').forEach(row => {
      const current = branchStats.get(row.Degree) || { totalSalary: 0, count: 0 };
      branchStats.set(row.Degree, {
        totalSalary: current.totalSalary + row.Salary,
        count: current.count + 1
      });
    });

    return Array.from(branchStats.entries())
      .map(([branch, stats]) => ({
        branch,
        avgSalary: Math.round(stats.totalSalary / stats.count),
        count: stats.count
      }))
      .sort((a, b) => b.avgSalary - a.avgSalary);
  }

  private getPlacementRateByBranch(): Array<{ branch: string; rate: number; total: number }> {
    const branchStats = new Map<string, { placed: number; total: number }>();

    this.dataset.forEach(row => {
      const current = branchStats.get(row.Degree) || { placed: 0, total: 0 };
      branchStats.set(row.Degree, {
        placed: current.placed + (row.Placed === 'Yes' ? 1 : 0),
        total: current.total + 1
      });
    });

    return Array.from(branchStats.entries())
      .map(([branch, stats]) => ({
        branch,
        rate: Math.round((stats.placed / stats.total) * 100),
        total: stats.total
      }))
      .sort((a, b) => b.rate - a.rate);
  }

  private getSalaryTrends(): Array<{ range: string; count: number; percentage: number }> {
    const placed = this.dataset.filter(r => r.Placed === 'Yes');
    const total = placed.length;

    const ranges = [
      { range: '< 4 LPA', min: 0, max: 400000 },
      { range: '4-6 LPA', min: 400000, max: 600000 },
      { range: '6-8 LPA', min: 600000, max: 800000 },
      { range: '8-10 LPA', min: 800000, max: 1000000 },
      { range: '> 10 LPA', min: 1000000, max: Infinity }
    ];

    return ranges.map(({ range, min, max }) => {
      const count = placed.filter(r => r.Salary >= min && r.Salary < max).length;
      return {
        range,
        count,
        percentage: Math.round((count / total) * 100)
      };
    });
  }
}

export const placementPredictor = new PlacementPredictor();
export type { StudentProfile, PredictionResult };