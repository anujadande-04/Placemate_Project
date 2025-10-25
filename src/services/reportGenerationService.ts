/**
 * Report Generation Service
 * Generates comprehensive placement reports based on student data
 */

import { skillAssessmentService } from './skillAssessmentService';

export interface PlacementReport {
  id: string;
  generatedAt: Date;
  studentInfo: StudentInfo;
  placementPrediction: PlacementPrediction;
  skillAnalysis: SkillAnalysis;
  marketInsights: MarketInsights;
  recommendations: Recommendations;
  careerPath: CareerPath;
  actionPlan: ActionPlan;
}

export interface StudentInfo {
  name: string;
  cgpa: number;
  branch: string;
  technologies: string[];
  projects: string[];
  internships: string[];
  certifications: number;
  experience: string;
}

export interface PlacementPrediction {
  probability: number; // 0-100
  confidence: 'High' | 'Medium' | 'Low';
  expectedSalary: {
    min: number;
    max: number;
    average: number;
  };
  placementCategory: 'Product-Based' | 'Service-Based' | 'Startup' | 'Government';
  timelineEstimate: string;
}

export interface SkillAnalysis {
  strengths: string[];
  weaknesses: string[];
  completedSkills: number;
  totalSkills: number;
  skillGaps: string[];
  marketDemandScore: number;
  technicalReadiness: number;
}

export interface MarketInsights {
  industryTrends: string[];
  inDemandSkills: string[];
  emergingTechnologies: string[];
  salaryTrends: {
    technology: string;
    averageSalary: number;
    growth: number;
  }[];
  competitionLevel: 'Low' | 'Medium' | 'High';
}

export interface Recommendations {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  skillPriorities: string[];
  certificationSuggestions: string[];
}

export interface CareerPath {
  primaryRole: string;
  alternativeRoles: string[];
  progressionPath: string[];
  requiredSkills: string[];
  experienceLevel: 'Entry' | 'Mid' | 'Senior';
}

export interface ActionPlan {
  next30Days: string[];
  next90Days: string[];
  next6Months: string[];
  milestones: {
    target: string;
    deadline: string;
    priority: 'High' | 'Medium' | 'Low';
  }[];
}

class ReportGenerationService {
  private static instance: ReportGenerationService;

  public static getInstance(): ReportGenerationService {
    if (!ReportGenerationService.instance) {
      ReportGenerationService.instance = new ReportGenerationService();
    }
    return ReportGenerationService.instance;
  }

  generateComprehensiveReport(studentDetails: any, user: any): PlacementReport {
    const reportId = `report_${user.id}_${Date.now()}`;
    const now = new Date();

    const studentInfo = this.extractStudentInfo(studentDetails);
    const placementPrediction = this.calculatePlacementPrediction(studentInfo);
    const skillAnalysis = this.analyzeSkills(studentDetails);
    const marketInsights = this.getMarketInsights(studentInfo.technologies);
    const recommendations = this.generateRecommendations(studentInfo, skillAnalysis, marketInsights);
    const careerPath = this.suggestCareerPath(studentInfo, skillAnalysis);
    const actionPlan = this.createActionPlan(recommendations, skillAnalysis);

    return {
      id: reportId,
      generatedAt: now,
      studentInfo,
      placementPrediction,
      skillAnalysis,
      marketInsights,
      recommendations,
      careerPath,
      actionPlan
    };
  }

  private extractStudentInfo(studentDetails: any): StudentInfo {
    // Safely extract arrays, ensuring they are actually arrays
    const technologies = Array.isArray(studentDetails.technologies) ? studentDetails.technologies : [];
    const projects = Array.isArray(studentDetails.projects) ? studentDetails.projects : [];
    const internships = Array.isArray(studentDetails.internships) ? studentDetails.internships : [];
    const certifications_urls = Array.isArray(studentDetails.certifications_urls) ? studentDetails.certifications_urls : [];
    
    return {
      name: studentDetails.name || 'Student',
      cgpa: studentDetails.cgpa || 0,
      branch: studentDetails.branch || 'Computer Science',
      technologies,
      projects,
      internships,
      certifications: certifications_urls.length,
      experience: studentDetails.experience || ''
    };
  }

  private calculatePlacementPrediction(studentInfo: StudentInfo): PlacementPrediction {
    let score = 0;
    let maxScore = 100;

    // CGPA weight: 35%
    const cgpaScore = Math.min((studentInfo.cgpa / 10) * 35, 35);
    score += cgpaScore;

    // Skills weight: 25%
    const skillsScore = Math.min(studentInfo.technologies.length * 2.5, 25);
    score += skillsScore;

    // Projects weight: 20%
    const projectsScore = Math.min(studentInfo.projects.length * 4, 20);
    score += projectsScore;

    // Internships weight: 15%
    const internshipScore = Math.min(studentInfo.internships.length * 7.5, 15);
    score += internshipScore;

    // Certifications weight: 5%
    const certScore = Math.min(studentInfo.certifications * 2.5, 5);
    score += certScore;

    const probability = Math.round(score);
    
    return {
      probability,
      confidence: probability >= 80 ? 'High' : probability >= 60 ? 'Medium' : 'Low',
      expectedSalary: this.calculateSalaryRange(studentInfo, probability),
      placementCategory: this.determinePlacementCategory(studentInfo, probability),
      timelineEstimate: this.estimateTimeline(probability)
    };
  }

  private calculateSalaryRange(studentInfo: StudentInfo, probability: number): { min: number; max: number; average: number } {
    const baseSalary = 400000; // Base 4 LPA
    const cgpaMultiplier = studentInfo.cgpa / 10;
    const skillsMultiplier = 1 + (studentInfo.technologies.length * 0.1);
    const projectsMultiplier = 1 + (studentInfo.projects.length * 0.05);
    
    const average = Math.round(baseSalary * cgpaMultiplier * skillsMultiplier * projectsMultiplier);
    const min = Math.round(average * 0.8);
    const max = Math.round(average * 1.3);

    return { min, max, average };
  }

  private determinePlacementCategory(studentInfo: StudentInfo, probability: number): 'Product-Based' | 'Service-Based' | 'Startup' | 'Government' {
    const highDemandTechs = ['react', 'node.js', 'python', 'javascript', 'typescript', 'aws', 'docker'];
    const techSkills = studentInfo.technologies.filter(tech => 
      highDemandTechs.some(highTech => tech.toLowerCase().includes(highTech))
    );

    if (probability >= 85 && techSkills.length >= 4) return 'Product-Based';
    if (probability >= 70) return 'Service-Based';
    if (probability >= 60) return 'Startup';
    return 'Government';
  }

  private estimateTimeline(probability: number): string {
    if (probability >= 80) return '2-4 months';
    if (probability >= 60) return '4-6 months';
    return '6-12 months';
  }

  private analyzeSkills(studentDetails: any): SkillAnalysis {
    const skillCategories = skillAssessmentService.getSkillCategories();
    const allSkills = skillCategories.flatMap(cat => cat.skills);
    const completedSkills = allSkills.filter(skill => skill.completed);
    const technologies = studentDetails.technologies || [];

    const strengths = this.identifyStrengths(technologies, completedSkills);
    const weaknesses = this.identifyWeaknesses(allSkills, completedSkills);
    const skillGaps = this.identifySkillGaps(technologies);
    
    return {
      strengths,
      weaknesses,
      completedSkills: completedSkills.length,
      totalSkills: allSkills.length,
      skillGaps,
      marketDemandScore: this.calculateMarketDemandScore(technologies),
      technicalReadiness: this.calculateTechnicalReadiness(completedSkills, allSkills)
    };
  }

  private identifyStrengths(technologies: string[], completedSkills: any[]): string[] {
    const strengths = [];
    
    // High-demand technologies
    const highDemandTechs = ['JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'Docker'];
    const userHighDemandTechs = technologies.filter(tech => 
      highDemandTechs.some(highTech => tech.toLowerCase().includes(highTech.toLowerCase()))
    );
    
    if (userHighDemandTechs.length >= 3) {
      strengths.push('Strong foundation in high-demand technologies');
    }
    
    // Skill completion rate
    const completionRate = completedSkills.length > 0 ? (completedSkills.length / 20) * 100 : 0;
    if (completionRate >= 70) {
      strengths.push('Excellent skill assessment performance');
    }
    
    // Full-stack capabilities
    const frontendTechs = technologies.filter(tech => 
      ['react', 'vue', 'angular', 'html', 'css', 'javascript'].some(fe => tech.toLowerCase().includes(fe))
    );
    const backendTechs = technologies.filter(tech => 
      ['node', 'python', 'java', 'express', 'django', 'spring'].some(be => tech.toLowerCase().includes(be))
    );
    
    if (frontendTechs.length >= 2 && backendTechs.length >= 1) {
      strengths.push('Full-stack development capabilities');
    }

    return strengths.length > 0 ? strengths : ['Foundational programming knowledge'];
  }

  private identifyWeaknesses(allSkills: any[], completedSkills: any[]): string[] {
    const weaknesses = [];
    const completionRate = allSkills.length > 0 ? (completedSkills.length / allSkills.length) * 100 : 0;
    
    if (completionRate < 30) {
      weaknesses.push('Limited skill assessment completion');
    }
    
    const categories = ['frontend', 'backend', 'devops'];
    categories.forEach(category => {
      const categorySkills = allSkills.filter(skill => skill.category === category);
      const categoryCompleted = completedSkills.filter(skill => skill.category === category);
      const categoryRate = categorySkills.length > 0 ? (categoryCompleted.length / categorySkills.length) * 100 : 0;
      
      if (categoryRate < 20) {
        weaknesses.push(`Limited ${category} experience`);
      }
    });

    return weaknesses.length > 0 ? weaknesses : ['Areas for improvement will be identified through skill assessments'];
  }

  private identifySkillGaps(technologies: string[]): string[] {
    const marketRequiredSkills = [
      'React.js', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
      'AWS', 'Docker', 'Git', 'Database Management', 'API Development'
    ];
    
    return marketRequiredSkills.filter(skill => 
      !technologies.some(tech => tech.toLowerCase().includes(skill.toLowerCase()))
    );
  }

  private calculateMarketDemandScore(technologies: string[]): number {
    const highDemandSkills = {
      'javascript': 95,
      'react': 90,
      'node.js': 88,
      'python': 92,
      'typescript': 85,
      'aws': 87,
      'docker': 83,
      'java': 80,
      'angular': 75,
      'vue': 70
    };
    
    let totalScore = 0;
    let matchedSkills = 0;
    
    technologies.forEach(tech => {
      Object.keys(highDemandSkills).forEach(skill => {
        if (tech.toLowerCase().includes(skill)) {
          totalScore += highDemandSkills[skill];
          matchedSkills++;
        }
      });
    });
    
    return matchedSkills > 0 ? Math.round(totalScore / matchedSkills) : 60;
  }

  private calculateTechnicalReadiness(completedSkills: any[], allSkills: any[]): number {
    if (allSkills.length === 0) return 50;
    return Math.round((completedSkills.length / allSkills.length) * 100);
  }

  private getMarketInsights(technologies: string[]): MarketInsights {
    return {
      industryTrends: [
        'AI/ML integration in software development',
        'Cloud-native application development',
        'Microservices architecture adoption',
        'DevOps and automation practices',
        'Full-stack JavaScript development'
      ],
      inDemandSkills: [
        'React.js', 'Node.js', 'Python', 'AWS', 'Docker',
        'TypeScript', 'GraphQL', 'Kubernetes', 'MongoDB', 'PostgreSQL'
      ],
      emergingTechnologies: [
        'Next.js', 'Rust', 'WebAssembly', 'Edge Computing',
        'Serverless Architecture', 'Blockchain Development'
      ],
      salaryTrends: [
        { technology: 'React.js', averageSalary: 800000, growth: 15 },
        { technology: 'Node.js', averageSalary: 750000, growth: 12 },
        { technology: 'Python', averageSalary: 850000, growth: 18 },
        { technology: 'AWS', averageSalary: 900000, growth: 20 },
        { technology: 'Docker', averageSalary: 700000, growth: 14 }
      ],
      competitionLevel: this.assessCompetitionLevel(technologies)
    };
  }

  private assessCompetitionLevel(technologies: string[]): 'Low' | 'Medium' | 'High' {
    const advancedTechs = ['aws', 'docker', 'kubernetes', 'microservices', 'graphql'];
    const advancedCount = technologies.filter(tech => 
      advancedTechs.some(advanced => tech.toLowerCase().includes(advanced))
    ).length;
    
    if (advancedCount >= 3) return 'Low';
    if (advancedCount >= 1) return 'Medium';
    return 'High';
  }

  private generateRecommendations(
    studentInfo: StudentInfo,
    skillAnalysis: SkillAnalysis,
    marketInsights: MarketInsights
  ): Recommendations {
    const immediate = [];
    const shortTerm = [];
    const longTerm = [];
    const skillPriorities = [];
    const certificationSuggestions = [];

    // Immediate recommendations (next 2 weeks)
    if (skillAnalysis.completedSkills < 5) {
      immediate.push('Complete at least 3 skill assessments to understand your current level');
    }
    immediate.push('Update your resume with latest projects and skills');
    immediate.push('Set up a professional LinkedIn profile');

    // Short-term recommendations (next 3 months)
    if (studentInfo.cgpa < 7.0) {
      shortTerm.push('Focus on improving academic performance');
    }
    shortTerm.push('Build 2-3 portfolio projects showcasing different technologies');
    shortTerm.push('Apply for internships to gain practical experience');

    // Long-term recommendations (next 6-12 months)
    longTerm.push('Contribute to open-source projects');
    longTerm.push('Attend tech conferences and networking events');
    longTerm.push('Consider specializing in a high-demand area');

    // Skill priorities based on gaps
    skillAnalysis.skillGaps.slice(0, 5).forEach(skill => {
      skillPriorities.push(`Learn ${skill} - high market demand`);
    });

    // Certification suggestions
    if (studentInfo.technologies.includes('aws') || studentInfo.technologies.includes('cloud')) {
      certificationSuggestions.push('AWS Certified Solutions Architect');
    }
    certificationSuggestions.push('Google Cloud Professional Developer');
    certificationSuggestions.push('Microsoft Azure Fundamentals');

    return {
      immediate,
      shortTerm,
      longTerm,
      skillPriorities,
      certificationSuggestions
    };
  }

  private suggestCareerPath(studentInfo: StudentInfo, skillAnalysis: SkillAnalysis): CareerPath {
    const technologies = studentInfo.technologies;
    let primaryRole = 'Software Developer';
    const alternativeRoles = [];

    // Determine primary role based on skills
    const frontendSkills = technologies.filter(tech => 
      ['react', 'vue', 'angular', 'javascript', 'typescript'].some(fe => tech.toLowerCase().includes(fe))
    );
    const backendSkills = technologies.filter(tech => 
      ['node', 'python', 'java', 'express', 'django'].some(be => tech.toLowerCase().includes(be))
    );
    const cloudSkills = technologies.filter(tech => 
      ['aws', 'azure', 'gcp', 'docker', 'kubernetes'].some(cloud => tech.toLowerCase().includes(cloud))
    );

    if (frontendSkills.length >= 2 && backendSkills.length >= 1) {
      primaryRole = 'Full Stack Developer';
      alternativeRoles.push('Frontend Developer', 'Backend Developer');
    } else if (frontendSkills.length >= 2) {
      primaryRole = 'Frontend Developer';
      alternativeRoles.push('UI/UX Developer', 'React Developer');
    } else if (backendSkills.length >= 2) {
      primaryRole = 'Backend Developer';
      alternativeRoles.push('API Developer', 'Database Developer');
    }

    if (cloudSkills.length >= 2) {
      alternativeRoles.push('DevOps Engineer', 'Cloud Engineer');
    }

    return {
      primaryRole,
      alternativeRoles: alternativeRoles.slice(0, 3),
      progressionPath: [
        'Junior Developer',
        'Software Developer',
        'Senior Developer',
        'Tech Lead',
        'Engineering Manager'
      ],
      requiredSkills: this.getRequiredSkillsForRole(primaryRole),
      experienceLevel: 'Entry'
    };
  }

  private getRequiredSkillsForRole(role: string): string[] {
    const skillMap = {
      'Full Stack Developer': ['JavaScript', 'React', 'Node.js', 'Database', 'Git', 'API Development'],
      'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript', 'Responsive Design'],
      'Backend Developer': ['Python/Java/Node.js', 'Database', 'API Development', 'Security', 'Testing'],
      'Software Developer': ['Programming Languages', 'Problem Solving', 'Git', 'Testing', 'Database']
    };
    
    return skillMap[role] || skillMap['Software Developer'];
  }

  private createActionPlan(recommendations: Recommendations, skillAnalysis: SkillAnalysis): ActionPlan {
    return {
      next30Days: [
        'Complete skill assessments in weak areas',
        'Update portfolio with recent projects',
        'Apply to 5 companies each week',
        'Practice coding problems daily'
      ],
      next90Days: [
        'Build 2 new portfolio projects',
        'Complete online courses for skill gaps',
        'Attend virtual tech meetups',
        'Get 3 professional references'
      ],
      next6Months: [
        'Gain internship or project experience',
        'Contribute to open-source projects',
        'Build professional network',
        'Prepare for technical interviews'
      ],
      milestones: [
        {
          target: 'Complete 80% of skill assessments',
          deadline: '30 days',
          priority: 'High'
        },
        {
          target: 'Build 3 portfolio projects',
          deadline: '90 days',
          priority: 'High'
        },
        {
          target: 'Apply to 50+ companies',
          deadline: '6 months',
          priority: 'Medium'
        }
      ]
    };
  }

  // Export report as PDF using jsPDF
  async exportReportAsPDF(report: PlacementReport): Promise<void> {
    try {
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      const pdf = new jsPDF();
      
      // Set up the document
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;
      
      // Helper function to add text with automatic wrapping
      const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize: number = 12) => {
        pdf.setFontSize(fontSize);
        if (maxWidth) {
          const lines = pdf.splitTextToSize(text, maxWidth);
          pdf.text(lines, x, y);
          return y + (lines.length * fontSize * 0.4);
        } else {
          pdf.text(text, x, y);
          return y + fontSize * 0.4;
        }
      };
      
      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Placement Prediction Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${report.generatedAt.toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      pdf.text(`Student: ${report.studentInfo.name}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // Key Metrics
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Metrics', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(`• Placement Probability: ${report.placementPrediction.probability}%`, 25, yPosition);
      yPosition = addText(`• Confidence Level: ${report.placementPrediction.confidence}`, 25, yPosition);
      yPosition = addText(`• Skills Completed: ${report.skillAnalysis.completedSkills}/${report.skillAnalysis.totalSkills}`, 25, yPosition);
      yPosition = addText(`• Market Readiness: ${report.skillAnalysis.marketDemandScore}/100`, 25, yPosition);
      yPosition += 10;
      
      // Student Profile
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Student Profile', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(`• CGPA: ${report.studentInfo.cgpa}/10`, 25, yPosition);
      yPosition = addText(`• Branch: ${report.studentInfo.branch}`, 25, yPosition);
      yPosition = addText(`• Projects: ${report.studentInfo.projects.length || 'None listed'}`, 25, yPosition);
      yPosition = addText(`• Internships: ${report.studentInfo.internships.length || 'None listed'}`, 25, yPosition);
      yPosition = addText(`• Certifications: ${report.studentInfo.certifications || 'None listed'}`, 25, yPosition);
      yPosition += 5;
      
      if (report.studentInfo.technologies.length > 0) {
        yPosition = addText(`• Technologies: ${report.studentInfo.technologies.join(', ')}`, 25, yPosition, pageWidth - 40);
      }
      yPosition += 10;
      
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Strengths
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Strengths', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      report.skillAnalysis.strengths.forEach((strength) => {
        yPosition = addText(`• ${strength}`, 25, yPosition, pageWidth - 40);
      });
      yPosition += 10;
      
      // Areas for Improvement
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Areas for Improvement', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      report.skillAnalysis.weaknesses.forEach((weakness) => {
        yPosition = addText(`• ${weakness}`, 25, yPosition, pageWidth - 40);
      });
      yPosition += 10;
      
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Recommendations
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recommendations', 20, yPosition);
      yPosition += 10;
      
      // Immediate Actions
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Immediate Actions (Next 2 weeks):', 25, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      report.recommendations.immediate.forEach((action) => {
        yPosition = addText(`• ${action}`, 30, yPosition, pageWidth - 50);
      });
      yPosition += 5;
      
      // Short-term Goals
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Short-term Goals (Next 3 months):', 25, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      report.recommendations.shortTerm.forEach((goal) => {
        yPosition = addText(`• ${goal}`, 30, yPosition, pageWidth - 50);
      });
      yPosition += 5;
      
      // Long-term Vision
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Long-term Vision (Next 6-12 months):', 25, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      report.recommendations.longTerm.forEach((vision) => {
        yPosition = addText(`• ${vision}`, 30, yPosition, pageWidth - 50);
      });
      yPosition += 10;
      
      // Check if we need a new page
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Career Path
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Career Path', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      yPosition = addText(`• Primary Role: ${report.careerPath.primaryRole}`, 25, yPosition);
      yPosition = addText(`• Alternative Roles: ${report.careerPath.alternativeRoles.join(', ')}`, 25, yPosition, pageWidth - 40);
      yPosition += 5;
      yPosition = addText(`• Required Skills: ${report.careerPath.requiredSkills.join(', ')}`, 25, yPosition, pageWidth - 40);
      yPosition += 10;
      
      // Action Plan
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Action Plan Milestones', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      report.actionPlan.milestones.forEach((milestone) => {
        yPosition = addText(`• ${milestone.target} (${milestone.deadline}) - ${milestone.priority} Priority`, 25, yPosition, pageWidth - 40);
      });
      
      // Save the PDF
      const fileName = `${report.studentInfo.name}_Placement_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF exported successfully:', fileName);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please try again.');
    }
  }

  // Save report to database (placeholder)
  saveReport(report: PlacementReport, userId: string): void {
    console.log('Saving report to database:', report, userId);
    // Implementation would save to Supabase database
  }
}

export const reportGenerationService = ReportGenerationService.getInstance();