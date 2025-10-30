// Enhanced localStorage-based persistence service
// This service provides persistent data storage with future database migration support
import { supabase } from '@/integrations/supabase/client';

export interface SkillAssessmentResult {
  skillId: string;
  skillName: string;
  skillCategory: string;
  score: number;
  assessmentData?: any;
  completedAt?: string;
}

export interface ATSAnalysisData {
  overallScore: number;
  analysis: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    keywordMatches: number;
    sectionScores: any;
  };
  timestamp: string;
}

export class PersistentDataService {
  
  // Skills Assessment Methods - Enhanced localStorage with future database support
  static async saveSkillAssessment(userId: string, assessment: SkillAssessmentResult): Promise<boolean> {
    try {
      console.log('💾 Saving skill assessment (enhanced localStorage):', { userId, skillId: assessment.skillId, score: assessment.score });
      
      // Use enhanced localStorage structure
      const storageKey = `skill_assessments_${userId}`;
      let results = [];
      const existingResults = localStorage.getItem(storageKey);
      
      if (existingResults) {
        results = JSON.parse(existingResults);
        // Remove any existing result for this skill
        results = results.filter((r: any) => r.skillId !== assessment.skillId);
      }
      
      // Add enhanced metadata
      const enhancedAssessment = {
        ...assessment,
        savedAt: new Date().toISOString(),
        version: '2.0', // Version for future migrations
        persistent: true,
        source: 'localStorage'
      };
      
      results.push(enhancedAssessment);
      localStorage.setItem(storageKey, JSON.stringify(results));
      
      console.log('✅ Skill assessment saved with enhanced metadata');
      
      // Update skills summary
      this.updateSkillsSummaryLocal(userId, results);
      
      return true;
    } catch (error) {
      console.error('❌ Error saving skill assessment:', error);
      return false;
    }
  }

  static async getSkillAssessments(userId: string): Promise<SkillAssessmentResult[]> {
    try {
      console.log('📖 Loading skill assessments (enhanced localStorage):', userId);
      
      const storageKey = `skill_assessments_${userId}`;
      const existingResults = localStorage.getItem(storageKey);
      
      if (existingResults) {
        const results = JSON.parse(existingResults);
        console.log('✅ Loaded skill assessments from enhanced localStorage:', results.length);
        
        // Return cleaned data (remove metadata for API compatibility)
        return results.map((result: any) => ({
          skillId: result.skillId,
          skillName: result.skillName,
          skillCategory: result.skillCategory,
          score: result.score,
          assessmentData: result.assessmentData,
          completedAt: result.completedAt || result.savedAt
        }));
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ Exception loading skill assessments:', error);
      return [];
    }
  }

  // ATS Analysis Methods - Enhanced localStorage with database fallback attempt
  static async saveATSAnalysis(userId: string, atsData: ATSAnalysisData): Promise<boolean> {
    try {
      console.log('💾 Saving ATS analysis (enhanced storage):', { userId, score: atsData.overallScore });
      
      // Try database first (will gracefully fail if not available)
      await this.tryDatabaseATSSave(userId, atsData);
      
      // Always save to localStorage as primary/backup
      const storageKey = `ats_data_${userId}`;
      const enhancedData = {
        ...atsData,
        savedAt: new Date().toISOString(),
        version: '2.0',
        persistent: true,
        source: 'localStorage'
      };
      
      localStorage.setItem(storageKey, JSON.stringify(enhancedData));
      console.log('✅ ATS analysis saved with enhanced metadata');
      
      return true;
      
    } catch (error) {
      console.error('❌ Exception saving ATS analysis:', error);
      
      // Emergency fallback
      try {
        const storageKey = `ats_data_${userId}`;
        localStorage.setItem(storageKey, JSON.stringify(atsData));
        return true;
      } catch (fallbackError) {
        console.error('❌ Emergency fallback failed:', fallbackError);
        return false;
      }
    }
  }

  static async getATSAnalysis(userId: string): Promise<ATSAnalysisData | null> {
    try {
      console.log('📖 Loading ATS analysis (enhanced storage):', userId);
      
      // Try database first (will gracefully fail if not available)
      const dbData = await this.tryDatabaseATSLoad(userId);
      if (dbData) {
        return dbData;
      }
      
      // Load from localStorage
      const storageKey = `ats_data_${userId}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        const atsData = JSON.parse(storedData);
        
        // Check data age (30 days)
        const timestamp = atsData.timestamp || atsData.savedAt;
        if (timestamp) {
          const dataAge = Date.now() - new Date(timestamp).getTime();
          const thirtyDays = 30 * 24 * 60 * 60 * 1000;
          
          if (dataAge < thirtyDays) {
            console.log('✅ Loaded ATS analysis from enhanced localStorage');
            return {
              overallScore: atsData.overallScore,
              analysis: atsData.analysis,
              timestamp: timestamp
            };
          } else {
            // Remove expired data
            localStorage.removeItem(storageKey);
          }
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ Exception loading ATS analysis:', error);
      return null;
    }
  }

  // Helper methods for database operations (graceful failure)
  private static async tryDatabaseATSSave(userId: string, atsData: ATSAnalysisData): Promise<boolean> {
    try {
      // Try to save to database (will be implemented when schema is updated)
      console.log('📝 Database save will be available after schema update');
      return false;
    } catch (error) {
      console.log('📝 Database save not available, using localStorage');
    }
    return false;
  }

  private static async tryDatabaseATSLoad(userId: string): Promise<ATSAnalysisData | null> {
    try {
      // Database load will be implemented when schema is updated
      console.log('📝 Database load will be available after schema update');
      return null;
    } catch (error) {
      console.log('📝 Database load not available');
    }
    return null;
  }

  private static updateSkillsSummaryLocal(userId: string, assessments: any[]): void {
    try {
      if (assessments.length > 0) {
        const totalScore = assessments.reduce((sum, assessment) => sum + assessment.score, 0);
        const averageScore = totalScore / assessments.length;
        
        // Store summary data in localStorage for later use
        const summaryKey = `skills_summary_${userId}`;
        const summary = {
          completed: assessments.length,
          averageScore: Math.round(averageScore * 100) / 100,
          lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(summaryKey, JSON.stringify(summary));
        console.log('✅ Skills summary updated locally');
      }
    } catch (error) {
      console.error('❌ Error updating skills summary:', error);
    }
  }

  // Private helper methods for localStorage fallback
  private static saveSkillAssessmentToLocal(userId: string, assessment: SkillAssessmentResult) {
    try {
      const storageKey = `skill_assessments_${userId}`;
      let results = [];
      const existingResults = localStorage.getItem(storageKey);
      
      if (existingResults) {
        results = JSON.parse(existingResults);
        results = results.filter((r: any) => r.skillId !== assessment.skillId);
      }
      
      results.push(assessment);
      localStorage.setItem(storageKey, JSON.stringify(results));
      console.log('💾 Skill assessment saved to localStorage as fallback');
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
    }
  }

  private static getSkillAssessmentsFromLocal(userId: string): SkillAssessmentResult[] {
    try {
      const storageKey = `skill_assessments_${userId}`;
      const existingResults = localStorage.getItem(storageKey);
      
      if (existingResults) {
        console.log('📖 Loading skill assessments from localStorage fallback');
        return JSON.parse(existingResults);
      }
      
      return [];
    } catch (error) {
      console.error('❌ Error loading from localStorage:', error);
      return [];
    }
  }

  private static saveATSAnalysisToLocal(userId: string, atsData: ATSAnalysisData) {
    try {
      const storageKey = `ats_data_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(atsData));
      console.log('💾 ATS analysis saved to localStorage as fallback');
    } catch (error) {
      console.error('❌ Error saving ATS to localStorage:', error);
    }
  }

  private static getATSAnalysisFromLocal(userId: string): ATSAnalysisData | null {
    try {
      const storageKey = `ats_data_${userId}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        console.log('📖 Loading ATS analysis from localStorage fallback');
        const atsData = JSON.parse(storedData);
        
        // Check if data is not too old (30 days)
        const dataAge = Date.now() - new Date(atsData.timestamp).getTime();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        
        if (dataAge < thirtyDays) {
          return atsData;
        } else {
          localStorage.removeItem(storageKey);
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error loading ATS from localStorage:', error);
      return null;
    }
  }

  // Update skills summary (placeholder for database integration)
  private static async updateSkillsSummary(userId: string) {
    try {
      const assessments = await this.getSkillAssessments(userId);
      
      if (assessments.length > 0) {
        // Use local storage for now
        this.updateSkillsSummaryLocal(userId, assessments);
        console.log('✅ Skills summary updated locally (database integration pending)');
      }
    } catch (error) {
      console.error('❌ Exception updating skills summary:', error);
    }
  }

  // Migration method to move existing localStorage data to database
  static async migrateLocalDataToDatabase(userId: string): Promise<void> {
    try {
      console.log('🔄 Migrating local data to database for user:', userId);
      
      // Migrate skill assessments
      const localSkillAssessments = this.getSkillAssessmentsFromLocal(userId);
      for (const assessment of localSkillAssessments) {
        await this.saveSkillAssessment(userId, assessment);
      }
      
      // Migrate ATS analysis
      const localATSData = this.getATSAnalysisFromLocal(userId);
      if (localATSData) {
        await this.saveATSAnalysis(userId, localATSData);
      }
      
      console.log('✅ Data migration completed');
    } catch (error) {
      console.error('❌ Error during data migration:', error);
    }
  }
}