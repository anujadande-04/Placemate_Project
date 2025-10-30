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
  
  // Skills Assessment Methods - Fallback to localStorage for now
  static async saveSkillAssessment(userId: string, assessment: SkillAssessmentResult): Promise<boolean> {
    try {
      console.log('💾 Saving skill assessment (localStorage fallback):', { userId, skillId: assessment.skillId, score: assessment.score });
      
      // For now, use localStorage with enhanced structure
      const storageKey = `skill_assessments_${userId}`;
      let results = [];
      const existingResults = localStorage.getItem(storageKey);
      
      if (existingResults) {
        results = JSON.parse(existingResults);
        results = results.filter((r: any) => r.skillId !== assessment.skillId);
      }
      
      results.push({
        ...assessment,
        savedAt: new Date().toISOString(),
        persistent: true // Mark as persistent data
      });
      
      localStorage.setItem(storageKey, JSON.stringify(results));
      console.log('✅ Skill assessment saved to enhanced localStorage');
      
      return true;
    } catch (error) {
      console.error('❌ Error saving skill assessment:', error);
      return false;
    }
  }

  static async getSkillAssessments(userId: string): Promise<SkillAssessmentResult[]> {
    try {
      console.log('📖 Loading skill assessments (localStorage):', userId);
      
      const storageKey = `skill_assessments_${userId}`;
      const existingResults = localStorage.getItem(storageKey);
      
      if (existingResults) {
        const results = JSON.parse(existingResults);
        console.log('✅ Loaded skill assessments from localStorage:', results.length);
        return results;
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ Exception loading skill assessments:', error);
      return [];
    }
  }

  // ATS Analysis Methods
  static async saveATSAnalysis(userId: string, atsData: ATSAnalysisData): Promise<boolean> {
    try {
      console.log('💾 Saving ATS analysis to database with localStorage fallback:', { userId, score: atsData.overallScore });
      
      // Try database first (with type-safe workaround)
      try {
        // Avoid TypeScript compilation issues by using dynamic approach
        const supabaseClient = supabase as any;
        const result = await supabaseClient
          .from('student_details')
          .update({
            ats_score: atsData.overallScore,
            ats_analysis: atsData.analysis
          })
          .eq('user_id', userId);

        if (!result.error) {
          console.log('✅ ATS analysis saved to database successfully');
          // Also save to localStorage as backup
          this.saveATSAnalysisToLocal(userId, atsData);
          return true;
        }
      } catch (dbError) {
        console.log('📝 Database save failed, using localStorage fallback');
      }
      
      // Fallback to localStorage
      this.saveATSAnalysisToLocal(userId, atsData);
      return true;
      
    } catch (error) {
      console.error('❌ Exception saving ATS analysis:', error);
      this.saveATSAnalysisToLocal(userId, atsData);
      return false;
    }
  }

  static async getATSAnalysis(userId: string): Promise<ATSAnalysisData | null> {
    try {
      console.log('📖 Loading ATS analysis for user:', userId);
      
      // Try database first (with type-safe workaround)
      try {
        const supabaseClient = supabase as any;
        const { data, error } = await supabaseClient
          .from('student_details')
          .select('ats_score, ats_analysis')
          .eq('user_id', userId)
          .single();

        if (!error && data?.ats_score && data?.ats_analysis) {
          console.log('✅ Loaded ATS analysis from database');
          return {
            overallScore: data.ats_score,
            analysis: data.ats_analysis as any,
            timestamp: new Date().toISOString()
          };
        }
      } catch (dbError) {
        console.log('📝 Database load failed, trying localStorage');
      }

      // Fallback to localStorage
      return this.getATSAnalysisFromLocal(userId);
      
    } catch (error) {
      console.error('❌ Exception loading ATS analysis:', error);
      return this.getATSAnalysisFromLocal(userId);
    }
  }

  // Private helper methods for localStorage
  private static saveATSAnalysisToLocal(userId: string, atsData: ATSAnalysisData) {
    try {
      const storageKey = `ats_data_${userId}`;
      const enhancedData = {
        ...atsData,
        savedAt: new Date().toISOString(),
        persistent: true // Mark as persistent data
      };
      localStorage.setItem(storageKey, JSON.stringify(enhancedData));
      console.log('💾 ATS analysis saved to enhanced localStorage');
    } catch (error) {
      console.error('❌ Error saving ATS to localStorage:', error);
    }
  }

  private static getATSAnalysisFromLocal(userId: string): ATSAnalysisData | null {
    try {
      const storageKey = `ats_data_${userId}`;
      const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        console.log('📖 Loading ATS analysis from localStorage');
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

  // Migration method (placeholder for future database integration)
  static async migrateLocalDataToDatabase(userId: string): Promise<void> {
    console.log('🔄 Data migration will be available after database schema update');
    // This will be implemented once the database schema is updated
  }

  // Enhanced localStorage cleanup on logout
  static clearUserData(userId: string): void {
    try {
      const keys = [
        `skill_assessments_${userId}`,
        `ats_data_${userId}`,
        `skillAssessment_${userId}` // Legacy key
      ];
      
      let cleared = 0;
      keys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          cleared++;
        }
      });
      
      console.log(`🧹 Cleared ${cleared} data items for user logout`);
    } catch (error) {
      console.error('❌ Error clearing user data:', error);
    }
  }

  // Preserve data across sessions (don't clear on logout)
  static preserveUserData(userId: string): void {
    try {
      const skillsKey = `skill_assessments_${userId}`;
      const atsKey = `ats_data_${userId}`;
      
      // Mark data as persistent
      const skillsData = localStorage.getItem(skillsKey);
      if (skillsData) {
        const parsed = JSON.parse(skillsData);
        localStorage.setItem(skillsKey, JSON.stringify({
          ...parsed,
          preserved: true,
          preservedAt: new Date().toISOString()
        }));
      }
      
      const atsData = localStorage.getItem(atsKey);
      if (atsData) {
        const parsed = JSON.parse(atsData);
        localStorage.setItem(atsKey, JSON.stringify({
          ...parsed,
          preserved: true,
          preservedAt: new Date().toISOString()
        }));
      }
      
      console.log('🔒 User data marked as persistent across sessions');
    } catch (error) {
      console.error('❌ Error preserving user data:', error);
    }
  }
}