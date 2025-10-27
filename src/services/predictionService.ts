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
  atsScore?: number; // New ATS score field (0-100)
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

    // Simplified decision logic - prioritize clear rule-based predictions
    let finalProbability, binaryPrediction, confidence;
    
    const hasInternships = profile.internships > 0;
    const hasProjects = profile.projects > 0;
    const hasExperience = profile.workExp > 0;
    const hasGoodCGPA = profile.cgpa >= 7.0;
    
    console.log('🤔 Prediction Decision Logic:', {
      profileSummary: {
        cgpa: profile.cgpa,
        workExp: profile.workExp,
        internships: profile.internships,
        projects: profile.projects,
        skillsCount: profile.skills.length,
        hasInternships,
        hasProjects,
        hasExperience,
        hasGoodCGPA
      },
      mlAvailable: !!mlResult,
      mlProbability: mlResult?.probabilityPercentage,
      statisticalProbability: (statisticalProbability * 100).toFixed(1),
      similarProfilesFound: similarProfiles.length
    });
    
    // Primary: Use rule-based heuristic for clear cases
    if ((hasInternships && hasProjects) || (!hasInternships && !hasProjects && !hasExperience)) {
      // Clear cases: either has both internships & projects (high chance) or has nothing (low chance)
      finalProbability = Math.round(statisticalProbability * 100);
      binaryPrediction = statisticalProbability >= 0.5 ? 'Yes' : 'No';
      
      if (hasInternships && hasProjects) {
        confidence = hasGoodCGPA ? 'High' : 'Medium';
        console.log('✅ Using rule-based prediction - Strong profile with internships and projects');
      } else {
        confidence = 'High'; // High confidence in low prediction for profiles with nothing
        console.log('✅ Using rule-based prediction - Weak profile with no practical experience');
      }
    }
    // Secondary: Use statistical method if we have good similar profiles
    else if (similarProfiles.length >= 10) {
      // We have enough similar profiles for reliable statistical prediction
      finalProbability = Math.round(statisticalProbability * 100);
      binaryPrediction = statisticalProbability >= 0.5 ? 'Yes' : 'No';
      
      // Determine confidence based on data quality
      if (similarProfiles.length >= 20) {
        confidence = 'High';
      } else {
        confidence = 'Medium';
      }
      
      console.log('✅ Using statistical prediction - sufficient similar profiles', {
        similarProfiles: similarProfiles.length,
        finalProbability
      });
    }
    // Tertiary: Use ML if it provides a reasonable prediction
    else if (mlResult && mlResult.probabilityPercentage >= 20 && mlResult.probabilityPercentage <= 80) {
      finalProbability = mlResult.probabilityPercentage;
      binaryPrediction = mlResult.binaryPrediction;
      confidence = 'Medium';
      console.log('✅ Using ML prediction - reasonable result with limited data');
    }
    // Quaternary: Blend statistical and ML if both available
    else if (mlResult && similarProfiles.length > 0) {
      // Give more weight to statistical method
      const statisticalWeight = 0.7;
      const mlWeight = 0.3;
      
      finalProbability = Math.round(
        (statisticalProbability * 100 * statisticalWeight) + 
        (mlResult.probabilityPercentage * mlWeight)
      );
      binaryPrediction = finalProbability >= 50 ? 'Yes' : 'No';
      confidence = 'Medium';
      
      console.log('✅ Using blended prediction', {
        statisticalPct: (statisticalProbability * 100).toFixed(1),
        mlPct: mlResult.probabilityPercentage,
        finalProbability
      });
    }
    // Final fallback: Use statistical even with limited data
    else {
      finalProbability = Math.round(statisticalProbability * 100);
      binaryPrediction = statisticalProbability >= 0.5 ? 'Yes' : 'No';
      confidence = 'Low';
      console.log('⚠️ Using statistical prediction as fallback');
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

  private calculateProfileStrength(profile: StudentProfile): number {
    let strength = 0;
    let maxScore = 0;

    // CGPA contribution (0-30 points)
    strength += Math.min(profile.cgpa / 10 * 30, 30);
    maxScore += 30;

    // Experience contribution (0-20 points)
    strength += Math.min(profile.workExp / 3 * 20, 20);
    maxScore += 20;

    // Internships contribution (0-15 points)
    strength += Math.min(profile.internships / 3 * 15, 15);
    maxScore += 15;

    // Projects contribution (0-20 points)
    strength += Math.min(profile.projects / 5 * 20, 20);
    maxScore += 20;

    // Skills contribution (0-15 points)
    strength += Math.min(profile.skills.length / 10 * 15, 15);
    maxScore += 15;

    return strength / maxScore;
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
    console.log('🧮 Calculating placement probability...', {
      similarProfilesCount: similarProfiles.length,
      profileSummary: {
        cgpa: profile.cgpa,
        branch: profile.branch,
        workExp: profile.workExp,
        internships: profile.internships,
        projects: profile.projects,
        skillsCount: profile.skills.length
      }
    });

    if (similarProfiles.length === 0) {
      console.log('⚠️ No similar profiles found, using enhanced heuristics');
      return this.calculateHeuristicProbability(profile);
    }

    // Analyze similar profiles in detail
    const placedProfiles = similarProfiles.filter(p => p.Placed === 'Yes');
    const notPlacedProfiles = similarProfiles.filter(p => p.Placed === 'No');
    
    console.log('📊 Similar profiles analysis:', {
      total: similarProfiles.length,
      placed: placedProfiles.length,
      notPlaced: notPlacedProfiles.length,
      basePlacementRate: (placedProfiles.length / similarProfiles.length * 100).toFixed(1) + '%'
    });

    // Calculate base placement rate
    let placementProbability = placedProfiles.length / similarProfiles.length;
    
    // Calculate profile strength relative to similar profiles
    const profileStrengthScore = this.calculateRelativeStrength(profile, similarProfiles);
    
    console.log('💪 Profile strength analysis:', {
      strengthScore: profileStrengthScore.toFixed(3),
      strengthLevel: profileStrengthScore > 0.7 ? 'Strong' : 
                   profileStrengthScore > 0.4 ? 'Average' : 'Weak'
    });

    // Adjust probability based on profile strength
    if (profileStrengthScore > 0.8) {
      // Very strong profile
      placementProbability = Math.min(0.95, placementProbability + 0.25);
    } else if (profileStrengthScore > 0.6) {
      // Strong profile
      placementProbability = Math.min(0.90, placementProbability + 0.15);
    } else if (profileStrengthScore > 0.4) {
      // Average profile
      placementProbability = placementProbability + 0.05;
    } else if (profileStrengthScore < 0.3) {
      // Weak profile
      placementProbability = Math.max(0.10, placementProbability - 0.20);
    }
    
    // Apply skill matching bonus
    const skillBonus = this.calculateSkillMatchBonus(profile, placedProfiles);
    placementProbability += skillBonus;
    
    // Apply branch-specific adjustments
    const branchAdjustment = this.calculateBranchAdjustment(profile.branch, similarProfiles);
    placementProbability += branchAdjustment;
    
    // Ensure probability is within reasonable bounds
    placementProbability = Math.max(0.05, Math.min(0.95, placementProbability));
    
    console.log('✅ Final probability calculation:', {
      baseProbability: (placedProfiles.length / similarProfiles.length * 100).toFixed(1) + '%',
      strengthAdjustment: ((profileStrengthScore - 0.5) * 20).toFixed(1) + '%',
      skillBonus: (skillBonus * 100).toFixed(1) + '%',
      branchAdjustment: (branchAdjustment * 100).toFixed(1) + '%',
      finalProbability: (placementProbability * 100).toFixed(1) + '%'
    });
    
    return placementProbability;
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
    }

    // Analyze practical experience (work + internships + projects)
    const totalPracticalExperience = profile.workExp + (profile.internships * 0.5) + (profile.projects * 0.3);
    
    if (profile.workExp >= 1) {
      strengths.push(`${profile.workExp} year(s) of work experience - Great advantage`);
    } else if (profile.internships >= 1 || profile.projects >= 2) {
      strengths.push('Good practical exposure through internships and projects');
    } else if (totalPracticalExperience < 1) {
      weaknesses.push('Limited practical exposure - Need more hands-on experience');
    }

    // Analyze internships
    if (profile.internships >= 2) {
      strengths.push(`${profile.internships} internships completed - Shows initiative`);
    } else if (profile.internships === 1) {
      strengths.push('1 internship completed - Good start');
    } else {
      weaknesses.push('No internship experience - Critical gap');
    }

    // Analyze projects
    if (profile.projects >= 4) {
      strengths.push(`${profile.projects} projects - Excellent hands-on experience`);
    } else if (profile.projects >= 2) {
      strengths.push(`${profile.projects} projects - Good practical work`);
    } else if (profile.projects === 1) {
      weaknesses.push('Need more projects to strengthen portfolio');
    } else {
      weaknesses.push('No projects - Missing practical portfolio');
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
    }

    // Generate recommendations based on weaknesses
    const recommendations: string[] = [];
    
    if (profile.cgpa < 7.0) {
      recommendations.push("Focus on improving academic performance - aim for 7.5+ CGPA");
    }
    
    if (profile.internships === 0) {
      recommendations.push("Apply for internships to gain practical experience");
    }
    
    if (profile.projects < 3) {
      recommendations.push("Build more projects to showcase your technical skills");
    }
    
    if (profile.skills.length < 3) {
      recommendations.push("Learn additional programming languages and frameworks");
    }
    
    if (profile.workExp === 0) {
      recommendations.push("Consider part-time work or freelancing to gain industry experience");
    }
    
    // Add skill-specific recommendations
    const hasWebDev = profile.skills.some(skill => 
      skill.toLowerCase().includes('react') || 
      skill.toLowerCase().includes('node') || 
      skill.toLowerCase().includes('javascript')
    );
    
    if (!hasWebDev && profile.branch.toLowerCase().includes('computer')) {
      recommendations.push("Learn modern web development frameworks like React.js");
    }
    
    // Limit recommendations to top 5
    const topRecommendations = recommendations.slice(0, 5);
    
    console.log('📝 Profile Analysis Results:', {
      strengthsCount: strengths.length,
      weaknessesCount: weaknesses.length,
      recommendationsCount: topRecommendations.length,
      weaknesses: weaknesses,
      strengths: strengths.slice(0, 3),
      recommendations: topRecommendations
    });
    
    return { strengths, weaknesses, recommendations: topRecommendations };
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

  private calculateHeuristicProbability(profile: StudentProfile): number {
    console.log('🎯 Starting heuristic prediction for profile:', {
      cgpa: profile.cgpa,
      workExp: profile.workExp,
      internships: profile.internships,
      projects: profile.projects,
      skills: profile.skills.length,
      branch: profile.branch,
      atsScore: profile.atsScore
    });

    // Validate inputs and ensure they are numbers
    const internshipsCount = Math.max(0, Math.floor(Number(profile.internships) || 0));
    const projectsCount = Math.max(0, Math.floor(Number(profile.projects) || 0));
    const workExpYears = Math.max(0, Number(profile.workExp) || 0);
    const cgpaValue = Math.max(0, Math.min(10, Number(profile.cgpa) || 0));

    console.log('🔍 Validated inputs:', {
      internshipsCount,
      projectsCount,
      workExpYears,
      cgpaValue,
      skillsCount: profile.skills?.length || 0
    });

    // Rule-based prediction system
    const hasInternships = internshipsCount > 0;
    const hasProjects = projectsCount > 0;
    const hasExperience = workExpYears > 0;
    const hasGoodCGPA = cgpaValue >= 7.0;
    const hasDecentCGPA = cgpaValue >= 6.0;
    const hasSkills = (profile.skills?.length || 0) > 0;
    const isCSBranch = ['Computer Science Engineering', 'Information Technology', 'Computer Science'].includes(profile.branch);
    
    // ATS score categories
    const hasExcellentATS = profile.atsScore && profile.atsScore >= 85;
    const hasGoodATS = profile.atsScore && profile.atsScore >= 70;
    const hasDecentATS = profile.atsScore && profile.atsScore >= 50;
    const hasATS = profile.atsScore && profile.atsScore > 0;

    let probability = 0.1; // Base 10% for everyone (more realistic baseline)
    let reasoning = [];

    // Critical success factors - internships and projects are essential for good placement chances
    if (hasInternships && hasProjects) {
      if (hasGoodCGPA && hasExcellentATS) {
        probability = 0.90; // 90% - Perfect profile with excellent ATS
        reasoning.push('Has internships, projects, good CGPA (7.0+), and excellent ATS score (85+)');
      } else if (hasGoodCGPA) {
        probability = 0.85; // 85% - Excellent profile
        reasoning.push('Has internships, projects, and good CGPA (7.0+)');
      } else if (hasDecentCGPA && hasGoodATS) {
        probability = 0.82; // 82% - Good profile with good ATS
        reasoning.push('Has internships, projects, decent CGPA (6.0+), and good ATS score (70+)');
      } else if (hasDecentCGPA) {
        probability = 0.75; // 75% - Good profile
        reasoning.push('Has internships, projects, and decent CGPA (6.0+)');
      } else if (hasGoodATS) {
        probability = 0.70; // 70% - Average profile but good ATS
        reasoning.push('Has internships, projects, and good ATS score despite low CGPA');
      } else {
        probability = 0.65; // 65% - Average profile but has experience
        reasoning.push('Has internships and projects but low CGPA');
      }
    }
    // Has either internships OR projects (but not both) - significant disadvantage without both
    else if (hasInternships || hasProjects) {
      if (hasGoodCGPA && hasSkills && hasExcellentATS) {
        probability = 0.65; // 65% - Good academic + some practical experience + excellent ATS
        reasoning.push((hasInternships ? 'Has internships' : 'Has projects') + ' with good CGPA, skills, and excellent ATS score, but missing ' + (hasInternships ? 'projects' : 'internships'));
      } else if (hasGoodCGPA && hasSkills) {
        probability = 0.55; // 55% - Good academic + some practical experience
        reasoning.push((hasInternships ? 'Has internships' : 'Has projects') + ' with good CGPA and skills, but missing ' + (hasInternships ? 'projects' : 'internships') + ' reduces chances');
      } else if (hasGoodCGPA && hasGoodATS) {
        probability = 0.50; // 50% - Good academic + good ATS
        reasoning.push((hasInternships ? 'Has internships' : 'Has projects') + ' with good CGPA and good ATS score, but incomplete practical experience');
      } else if (hasGoodCGPA) {
        probability = 0.45; // 45% - Good academic + limited practical experience
        reasoning.push((hasInternships ? 'Has internships' : 'Has projects') + ' and good CGPA, but missing other practical experience');
      } else if (hasDecentCGPA && hasGoodATS) {
        probability = 0.40; // 40% - Average academic + good ATS
        reasoning.push((hasInternships ? 'Has internships' : 'Has projects') + ' with decent CGPA and good ATS score, but limited overall profile');
      } else if (hasDecentCGPA) {
        probability = 0.35; // 35% - Average academic + some practical experience
        reasoning.push((hasInternships ? 'Has internships' : 'Has projects') + ' but average CGPA and missing other practical experience');
      } else if (hasDecentATS) {
        probability = 0.30; // 30% - Limited experience but decent ATS
        reasoning.push('Some practical experience and decent ATS score, but low CGPA is concerning');
      } else {
        probability = 0.25; // 25% - Limited experience and low academic performance
        reasoning.push('Limited practical experience with low CGPA significantly reduces placement chances');
      }
    }
    // No internships or projects - rely on academics, skills, and ATS
    // NOTE: Without practical experience, placement chances are significantly lower
    else {
      if (cgpaValue >= 9.0 && hasSkills && isCSBranch && hasExcellentATS) {
        probability = 0.45; // 45% - Exceptional academic performance + ATS + CS branch
        reasoning.push('Exceptional CGPA (9.0+) with skills, high-demand branch, and excellent ATS score, but lacks practical experience');
      } else if (cgpaValue >= 8.5 && hasSkills && isCSBranch && hasGoodATS) {
        probability = 0.40; // 40% - Excellent academic performance in CS
        reasoning.push('Excellent CGPA (8.5+) with skills and good ATS in high-demand branch, but no practical experience');
      } else if (cgpaValue >= 8.5 && hasSkills && isCSBranch) {
        probability = 0.35; // 35% - Excellent academic performance can partially compensate
        reasoning.push('Excellent CGPA (8.5+) with skills in high-demand branch, but no practical experience significantly reduces chances');
      } else if (hasGoodCGPA && hasSkills && hasExcellentATS) {
        probability = 0.35; // 35% - Good academics + skills + excellent ATS
        reasoning.push('Good CGPA, skills, and excellent ATS score but no practical experience is a major disadvantage');
      } else if (hasGoodCGPA && hasSkills && isCSBranch) {
        probability = 0.30; // 30% - Good academics with skills in CS
        reasoning.push('Good CGPA with skills in CS branch, but lack of practical experience reduces opportunities');
      } else if (hasGoodCGPA && hasSkills) {
        probability = 0.25; // 25% - Good academics with skills
        reasoning.push('Good CGPA and skills but no practical experience limits placement opportunities');
      } else if (hasGoodCGPA && hasGoodATS) {
        probability = 0.25; // 25% - Good academics + good ATS
        reasoning.push('Good CGPA and good ATS score, but no practical experience or limited skills');
      } else if (hasGoodCGPA) {
        probability = 0.20; // 20% - Good academics only
        reasoning.push('Good CGPA alone is insufficient without practical experience and skills');
      } else if (hasDecentCGPA && hasSkills && hasGoodATS && isCSBranch) {
        probability = 0.25; // 25% - Average academics + skills + good ATS in CS
        reasoning.push('Decent CGPA with skills and good ATS in CS, but no practical experience is concerning');
      } else if (hasDecentCGPA && hasSkills) {
        probability = 0.20; // 20% - Average academics with some skills
        reasoning.push('Decent CGPA with some skills, but lack of practical experience significantly hurts chances');
      } else if (hasExcellentATS && hasSkills) {
        probability = 0.22; // 22% - Excellent ATS with skills can help slightly
        reasoning.push('Excellent ATS score with skills shows potential, but no practical experience is a major gap');
      } else if (hasGoodATS && hasSkills) {
        probability = 0.18; // 18% - Good ATS with skills provides minimal boost
        reasoning.push('Good ATS score with some skills, but no practical experience limits opportunities');
      } else {
        probability = 0.15; // 15% - Very low chances
        reasoning.push('No practical experience, limited skills, and poor academic performance make placement very unlikely');
      }
    }

    // Bonus for work experience
    if (hasExperience) {
      probability += 0.05;
      reasoning.push(`+5% bonus for ${workExpYears} years work experience`);
    }

    // Bonus for high-demand branches
    if (isCSBranch) {
      probability += 0.03;
      reasoning.push('+3% bonus for high-demand CS/IT branch');
    }

    // Additional ATS-specific bonuses (if not already factored in above)
    if (hasATS && !hasExcellentATS && !hasGoodATS) {
      // Small bonus for having any ATS analysis done
      probability += 0.02;
      reasoning.push(`+2% bonus for resume ATS analysis (${profile.atsScore}/100)`);
    }

    // Ensure probability stays within bounds
    // Allow lower minimum for profiles with no practical experience
    const minProbability = (hasInternships || hasProjects || hasExperience) ? 0.15 : 0.05;
    probability = Math.max(minProbability, Math.min(0.90, probability));

    console.log('✅ Heuristic prediction completed:', {
      finalProbability: (probability * 100).toFixed(1) + '%',
      prediction: probability >= 0.5 ? 'PLACED' : 'NOT PLACED',
      confidence: probability >= 0.7 ? 'High' : probability >= 0.5 ? 'Medium' : 'Low',
      reasoning: reasoning,
      keyFactors: {
        hasInternships: `${hasInternships} (count: ${internshipsCount})`,
        hasProjects: `${hasProjects} (count: ${projectsCount})`,
        hasExperience: `${hasExperience} (years: ${workExpYears})`,
        hasGoodCGPA: `${hasGoodCGPA} (cgpa: ${cgpaValue})`,
        hasSkills: hasSkills ? (profile.skills?.length || 0) : 0,
        isCSBranch,
        atsScore: profile.atsScore || 'Not analyzed',
        atsCategory: hasExcellentATS ? 'Excellent' : hasGoodATS ? 'Good' : hasDecentATS ? 'Decent' : hasATS ? 'Poor' : 'Not analyzed'
      }
    });

    return probability;
  }

  private calculateRelativeStrength(profile: StudentProfile, similarProfiles: any[]): number {
    if (similarProfiles.length === 0) return 0.5;

    const avgCGPA = similarProfiles.reduce((sum, p) => sum + p.CGPA, 0) / similarProfiles.length;
    const avgExp = similarProfiles.reduce((sum, p) => sum + p.WorkExp, 0) / similarProfiles.length;
    const avgInternships = similarProfiles.reduce((sum, p) => sum + p.Internships, 0) / similarProfiles.length;
    const avgProjects = similarProfiles.reduce((sum, p) => sum + p.Projects, 0) / similarProfiles.length;

    let strengthScore = 0;

    // CGPA comparison (40% weight)
    strengthScore += (profile.cgpa / Math.max(avgCGPA, 1)) * 0.4;

    // Experience comparison (25% weight)
    strengthScore += (profile.workExp / Math.max(avgExp, 0.5)) * 0.25;

    // Internships comparison (20% weight)
    strengthScore += (profile.internships / Math.max(avgInternships, 1)) * 0.2;

    // Projects comparison (15% weight)
    strengthScore += (profile.projects / Math.max(avgProjects, 1)) * 0.15;

    return Math.max(0, Math.min(2, strengthScore)); // Cap at 2x average
  }

  private calculateSkillMatchBonus(profile: StudentProfile, placedProfiles: any[]): number {
    if (placedProfiles.length === 0 || profile.skills.length === 0) return 0;

    // Extract skills from placed profiles
    const placedSkills = new Set<string>();
    placedProfiles.forEach(p => {
      if (p.Skills) {
        p.Skills.split(',').forEach(skill => {
          placedSkills.add(skill.trim().toLowerCase());
        });
      }
    });

    // Count matching skills
    let matchingSkills = 0;
    profile.skills.forEach(skill => {
      const normalizedSkill = skill.toLowerCase().trim();
      if (placedSkills.has(normalizedSkill)) {
        matchingSkills++;
      }
    });

    // Calculate bonus (max 0.1 or 10%)
    const skillMatchRatio = matchingSkills / Math.max(profile.skills.length, 1);
    return Math.min(0.1, skillMatchRatio * 0.15);
  }

  private calculateBranchAdjustment(branch: string, similarProfiles: any[]): number {
    if (similarProfiles.length === 0) return 0;

    // Check if this is a high-demand branch
    const highDemandBranches = [
      'Computer Science Engineering',
      'Information Technology', 
      'Computer Science'
    ];

    if (highDemandBranches.includes(branch)) {
      return 0.05; // 5% bonus for high-demand branches
    }

    return 0;
  }
}

export const placementPredictor = new PlacementPredictor();
export type { StudentProfile, PredictionResult };