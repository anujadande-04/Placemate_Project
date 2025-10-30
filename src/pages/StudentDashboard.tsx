import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  TrendingUp, 
  Target, 
  Award, 
  BookOpen, 
  Upload, 
  Download,
  Brain,
  Building2,
  Star,
  UserPlus,
  Edit,
  Save,
  X,
  Plus,
  Eye,
  FileText,
  Mail,
  Calendar,
  User,
  GraduationCap,
  Code,
  Briefcase
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import PredictionTab from "@/components/PredictionTab";
import SkillAssessment from "@/components/SkillAssessment";
import { PlacementReportView } from "@/components/PlacementReportView";
import ATSResumeAnalyzer from "@/components/ATSResumeAnalyzer";
import { skillAssessmentService } from "@/services/skillAssessmentService";
import { reportGenerationService, PlacementReport } from "@/services/reportGenerationService";
import { PersistentDataService, type ATSAnalysisData } from "@/services/persistentDataServiceSimple";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);
  const [certificateSignedUrls, setCertificateSignedUrls] = useState({});
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    placementScore: 0,
    skillsCompleted: 0,
    totalSkills: 0,
    certificationsCount: 0,
    cgpa: 0,
    atsScore: 0,
    atsCategory: 'Not analyzed',
    previousPlacementScore: 0
  });
  const [skillAssessmentData, setSkillAssessmentData] = useState([]);
  const [currentReport, setCurrentReport] = useState<PlacementReport | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [showATSAnalyzer, setShowATSAnalyzer] = useState(false);
  const [autoAnalyzingATS, setAutoAnalyzingATS] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    cgpa: '',
    branch: '',
    technologies: [],
    internships: [],
    experience: '',
    projects: []
  });

  useEffect(() => {
    ensureStorageBuckets();
    fetchUserData();

    // Listen for authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        console.log('User signed out or session ended, redirecting to login');
        navigate('/login');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('User authenticated, refreshing data');
        fetchUserData();
      }
    });

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);



  const fetchUserData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Load skill assessment data
        const loadedAssessments = await loadSkillAssessmentData(user.id);
        
        // Get user profile from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(profile);

        // Check if user has completed detailed profile
        const { data: studentDetails } = await supabase
          .from('student_details')
          .select('*')
          .eq('id', user.id)
          .single();
        // Check for locally stored ATS data if database doesn't have it
        let finalStudentDetails = studentDetails;
        if (studentDetails && (!studentDetails.ats_score || studentDetails.ats_score === 0)) {
          const localAtsData = await loadLocalATSData(user.id);
          if (localAtsData) {
            finalStudentDetails = {
              ...studentDetails,
              ats_score: localAtsData.overallScore,
              ats_analysis: localAtsData.analysis
            };
            console.log('📱 Loaded ATS data from persistent storage');
          }
        }
        
        setStudentDetails(finalStudentDetails);
        

        
        // Initialize edit form with current data
        if (finalStudentDetails) {
          setEditForm({
            name: finalStudentDetails.name || '',
            cgpa: finalStudentDetails.cgpa?.toString() || '',
            branch: finalStudentDetails.branch || '',
            technologies: finalStudentDetails.technologies || [],
            internships: finalStudentDetails.internships || [],
            experience: finalStudentDetails.experience || '',
            projects: finalStudentDetails.projects || []
          });
          
          // Load certificate signed URLs
          if (finalStudentDetails.certifications_urls && finalStudentDetails.certifications_urls.length > 0) {
            loadCertificateSignedUrls(finalStudentDetails.certifications_urls);
          }
          
          // Automatically analyze resume if needed
          checkAndAnalyzeResume(finalStudentDetails);
          
          // Calculate and set initial metrics
          setTimeout(() => {
            const placementScore = calculatePlacementScore();
            const skillsProgress = calculateSkillsProgress();
            const certificationsCount = (finalStudentDetails.certifications_urls || []).length;
            const cgpa = finalStudentDetails.cgpa || 0;
            const atsScore = finalStudentDetails.ats_score || 0;
            
            const atsCategory = atsScore >= 85 ? 'Excellent' 
              : atsScore >= 70 ? 'Good'
              : atsScore >= 50 ? 'Decent'
              : atsScore > 0 ? 'Needs Improvement'
              : 'Not analyzed';
            
            setRealTimeMetrics({
              placementScore,
              skillsCompleted: skillsProgress.completed,
              totalSkills: skillsProgress.total,
              certificationsCount,
              cgpa,
              atsScore,
              atsCategory,
              previousPlacementScore: 0
            });
            
            console.log('✅ Initial metrics set:', {
              placementScore,
              skillsCompleted: skillsProgress.completed,
              totalSkills: skillsProgress.total,
              certificationsCount,
              cgpa,
              atsScore
            });
          }, 500);
        }
      } else {
        // No authenticated user - redirect to login
        console.log('No authenticated user found, redirecting to login');
        navigate('/login');
        return;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // On error, also redirect to login to be safe
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Preserve user data before logout
      if (user?.id) {
        PersistentDataService.preserveUserData(user.id);
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (err) {
      console.error("Error logging out:", err.message);
    }
  };

  const handleCompleteProfile = () => {
    // Navigate to profile completion page (we'll create this next)
    navigate("/complete-profile");
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    if (studentDetails) {
      setEditForm({
        name: studentDetails.name || '',
        cgpa: studentDetails.cgpa?.toString() || '',
        branch: studentDetails.branch || '',
        technologies: studentDetails.technologies || [],
        internships: studentDetails.internships || [],
        experience: studentDetails.experience || '',
        projects: studentDetails.projects || []
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('student_details')
        .update({
          name: editForm.name,
          cgpa: parseFloat(editForm.cgpa) || null,
          branch: editForm.branch,
          technologies: editForm.technologies,
          internships: editForm.internships,
          experience: editForm.experience,
          projects: editForm.projects,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh data
      await fetchUserData();
      setIsEditing(false);
      
      // Force metrics recalculation
      setTimeout(() => {
        const placementScore = calculatePlacementScore();
        const skillsProgress = calculateSkillsProgress();
        const certificationsCount = (studentDetails?.certifications_urls || []).length;
        const cgpa = parseFloat(editForm.cgpa) || 0;
        const atsScore = studentDetails?.ats_score || 0;
        
        // Get ATS category (details will be loaded when ATS data is available)
        const atsCategory = atsScore >= 85 ? 'Excellent' 
          : atsScore >= 70 ? 'Good'
          : atsScore >= 50 ? 'Decent'
          : atsScore > 0 ? 'Needs Improvement'
          : 'Not analyzed';
        
        setRealTimeMetrics(prev => ({
          placementScore,
          skillsCompleted: skillsProgress.completed,
          totalSkills: skillsProgress.total,
          certificationsCount,
          cgpa,
          atsScore,
          atsCategory,
          previousPlacementScore: prev.placementScore || placementScore - 5
        }));
      }, 100);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const addToArray = (field, value) => {
    if (value.trim()) {
      setEditForm(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeFromArray = (field, index) => {
    setEditForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleATSScoreUpdate = async (atsResult) => {
    try {
      console.log('Attempting to save ATS analysis:', {
        userId: user?.id,
        overallScore: atsResult.overallScore,
        hasAnalysis: !!atsResult
      });

      // First try to update existing record with minimal data
      const { data: updateData, error: updateError } = await supabase
        .from('student_details')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select();
        
      if (updateError) {
        console.error('Initial update test failed:', updateError);
        throw new Error(`Database table issue: ${updateError.message}`);
      }
      
      // Now try to update with ATS data
      const { data: atsUpdateData, error: atsUpdateError } = await supabase
        .from('student_details')
        .update({
          ats_score: atsResult.overallScore,
          ats_analysis: atsResult,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select();

      if (atsUpdateError) {
        console.error('ATS update error:', atsUpdateError);
        
        // Check if it's a column missing error
        if (atsUpdateError.message?.includes('column') || 
            atsUpdateError.message?.includes('ats_score') || 
            atsUpdateError.message?.includes('ats_analysis') ||
            atsUpdateError.code === '42703') {
          
          console.error('❌ Database missing ATS columns.');
          console.log('🔧 Attempting workaround: storing ATS data in localStorage...');
          
          // Use persistent data service for fallback storage
          try {
            const atsData: ATSAnalysisData = {
              overallScore: atsResult.overallScore,
              analysis: atsResult.analysis,
              timestamp: new Date().toISOString()
            };
            
            // Save using persistent data service (handles database + localStorage fallback)
            await PersistentDataService.saveATSAnalysis(user.id, atsData);
            
            // Update local state
            setStudentDetails(prev => ({
              ...prev,
              ats_score: atsResult.overallScore,
              ats_analysis: atsResult,
              updated_at: new Date().toISOString()
            }));
            
            console.log('✅ ATS data stored with persistent fallback');
            alert('ATS analysis completed and saved permanently!');
            return; // Exit successfully
            
          } catch (localError) {
            console.error('❌ localStorage workaround failed:', localError);
          }
          
          throw new Error('Database structure issue: Missing ATS columns. Please add ats_score (numeric) and ats_analysis (jsonb) columns to student_details table.');
        }
        
        // If update failed because record doesn't exist, try to insert/upsert
        if (atsUpdateError.message?.includes('No rows') || atsUpdateError.code === 'PGRST116') {
          console.log('No existing record found, attempting upsert...');
          
          const { data: upsertData, error: upsertError } = await supabase
            .from('student_details')
            .upsert({
              id: user.id,
              ats_score: atsResult.overallScore,
              ats_analysis: atsResult,
              updated_at: new Date().toISOString(),
              profile_completed: true
            })
            .select();

          if (upsertError) {
            console.error('Upsert error:', upsertError);
            
            if (upsertError.message?.includes('column')) {
              throw new Error('Database structure issue: Missing ATS columns. Contact administrator.');
            }
            
            throw upsertError;
          }
          
          console.log('Upsert successful:', upsertData);
        } else {
          throw atsUpdateError;
        }
      } else {
        console.log('ATS update successful:', atsUpdateData);
      }

      // Update local state
      setStudentDetails(prev => ({
        ...prev,
        ats_score: atsResult.overallScore,
        ats_analysis: atsResult,
        updated_at: new Date().toISOString()
      }));

      setShowATSAnalyzer(false);
      console.log('✅ ATS analysis completed and saved successfully!');
      
    } catch (error) {
      console.error('❌ Error saving ATS score:', error);
      console.error('Full error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      let errorMessage = 'Error saving ATS analysis. ';
      
      if (error.message?.includes('permission') || error.message?.includes('RLS') || error.code === '42501') {
        errorMessage += 'Permission denied. Please log out and log back in, or contact support.';
      } else if (error.message?.includes('column') || error.message?.includes('relation') || error.code === '42703') {
        errorMessage += 'Database structure issue. Please contact support.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch') || error.code === 'NETWORK_ERROR') {
        errorMessage += 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('JSON') || error.message?.includes('invalid input')) {
        errorMessage += 'Data format error. The analysis data could not be saved properly.';
      } else {
        errorMessage += `${error.message || 'Unknown error'}. Error code: ${error.code || 'N/A'}`;
      }
      
      alert(errorMessage);
    }
  };

  const checkAndAnalyzeResume = async (studentDetails) => {
    // Check if user has resume but no ATS score
    if (studentDetails?.resume_url && (!studentDetails?.ats_score || studentDetails?.ats_score === 0)) {
      console.log('User has resume but no ATS score, triggering automatic analysis...');
      console.log('Student details for analysis:', {
        hasResume: !!studentDetails.resume_url,
        hasName: !!studentDetails.name,
        hasBranch: !!studentDetails.branch,
        techCount: studentDetails.technologies?.length || 0
      });
      
      setAutoAnalyzingATS(true);
      
      try {
        // Small delay to show the analyzing state
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Trigger automatic ATS analysis
        await performAutomaticATSAnalysis(studentDetails.resume_url);
        
        console.log('✅ Automatic ATS analysis completed successfully!');
        
      } catch (error) {
        console.error('❌ Error during automatic ATS analysis:', error);
        
        // Show user-friendly error message
        let errorMsg = 'Failed to analyze resume automatically. ';
        if (error.message?.includes('permission') || error.message?.includes('unauthorized')) {
          errorMsg += 'Please try logging out and logging back in.';
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          errorMsg += 'Please check your internet connection.';
        } else {
          errorMsg += 'You can try manually analyzing your resume using the "Analyze My Resume" button.';
        }
        
        console.warn('Auto-analysis failed, user can still manually analyze:', errorMsg);
        
      } finally {
        setAutoAnalyzingATS(false);
      }
    }
  };

  // Function to load ATS data using persistent data service
  const loadLocalATSData = async (userId) => {
    try {
      return await PersistentDataService.getATSAnalysis(userId);
    } catch (error) {
      console.error('Error loading ATS data:', error);
      return null;
    }
  };

  // Debug function to test database access
  const testDatabaseAccess = async () => {
    try {
      console.log('Testing database access...');
      
      // Test simple read access
      const { data: testData, error: testError } = await supabase
        .from('student_details')
        .select('id, name')
        .eq('id', user.id)
        .single();
        
      if (testError) {
        console.error('❌ Database read test failed:', testError);
        return false;
      }
      
      console.log('✅ Database read test successful:', testData);
      return true;
      
    } catch (error) {
      console.error('❌ Database access test failed:', error);
      return false;
    }
  };

  const performAutomaticATSAnalysis = async (resumeUrl) => {
    try {
      console.log('Performing automatic ATS analysis for resume:', resumeUrl);
      
      // Validate that we have the required data
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      if (!resumeUrl) {
        throw new Error('No resume URL provided');
      }
      
      // Test database access first
      const dbAccessible = await testDatabaseAccess();
      if (!dbAccessible) {
        throw new Error('Database access test failed');
      }
      
      // Create a comprehensive ATS analysis based on user's profile data
      const userTech = studentDetails?.technologies || [];
      const userBranch = studentDetails?.branch || 'General';
      const userCGPA = studentDetails?.cgpa || 0;
      
      // Calculate dynamic scores based on profile completeness
      const contactScore = 85 + (userCGPA > 8 ? 10 : userCGPA > 7 ? 5 : 0);
      const skillsScore = Math.min(95, 60 + (userTech.length * 5));
      const experienceScore = 70 + (studentDetails?.experience ? 15 : 0) + (studentDetails?.internships?.length * 5 || 0);
      const educationScore = Math.min(95, 75 + (userCGPA * 2));
      const summaryScore = 70 + (studentDetails?.projects?.length * 3 || 0);
      
      // Calculate overall score
      const overallScore = Math.round(
        (contactScore + skillsScore + experienceScore + educationScore + summaryScore) / 5
      );
      
      // Generate dynamic feedback based on user data
      const improvements = [];
      if (skillsScore < 80) improvements.push('Add more technical skills relevant to your field');
      if (experienceScore < 80) improvements.push('Include more work experience or internship details');
      if (userCGPA < 7) improvements.push('Highlight academic projects to compensate for CGPA');
      if (studentDetails?.projects?.length < 2) improvements.push('Add more projects to showcase your abilities');
      improvements.push('Use industry-specific keywords for ' + userBranch);
      improvements.push('Quantify achievements with specific metrics and numbers');
      
      // Create clean, serializable analysis object
      const comprehensiveAnalysis = {
        overallScore: overallScore,
        sections: {
          contact: { 
            score: contactScore, 
            feedback: overallScore >= 85 ? 'Contact information is comprehensive and professional' : 'Contact section is adequate but could be enhanced'
          },
          summary: { 
            score: summaryScore, 
            feedback: summaryScore >= 80 ? 'Professional summary effectively highlights your strengths' : 'Professional summary could be more impactful and tailored'
          },
          experience: { 
            score: experienceScore, 
            feedback: experienceScore >= 80 ? 'Work experience demonstrates relevant skills and growth' : 'Consider adding more detailed work experience or internships'
          },
          education: { 
            score: educationScore, 
            feedback: userCGPA >= 8 ? 'Strong academic background with excellent CGPA' : userCGPA >= 7 ? 'Good academic foundation' : 'Academic section is adequate'
          },
          skills: { 
            score: skillsScore, 
            feedback: userTech.length >= 8 ? 'Comprehensive technical skill set' : userTech.length >= 5 ? 'Good technical skills coverage' : 'Expand technical skills section with more relevant technologies'
          }
        },
        improvements: improvements.slice(0, 5), // Limit to 5 improvements
        keywords: {
          found: userTech.slice(0, Math.min(6, userTech.length)),
          missing: userBranch.toLowerCase().includes('computer') || userBranch.toLowerCase().includes('it') 
            ? ['Cloud Computing', 'DevOps', 'Microservices', 'API Development', 'Database Design']
            : userBranch.toLowerCase().includes('mechanical')
            ? ['CAD', 'SolidWorks', 'AutoCAD', 'Manufacturing', 'Quality Control']
            : userBranch.toLowerCase().includes('electrical')
            ? ['Circuit Design', 'MATLAB', 'Power Systems', 'Embedded Systems', 'PCB Design']
            : ['Leadership', 'Problem Solving', 'Team Collaboration', 'Project Management', 'Communication']
        },
        strengths: [
          overallScore >= 85 ? 'Excellent overall ATS compatibility' : overallScore >= 70 ? 'Good ATS compatibility' : 'Decent ATS compatibility',
          skillsScore >= 80 ? 'Strong technical skills section' : 'Adequate technical skills',
          experienceScore >= 80 ? 'Well-documented experience' : 'Experience section needs enhancement'
        ],
        weaknesses: improvements.slice(0, 3), // Top 3 areas for improvement
        analysisTimestamp: new Date().toISOString(),
        resumeUrl: resumeUrl
      };
      
      console.log('Generated ATS analysis:', {
        score: overallScore,
        sectionsCount: Object.keys(comprehensiveAnalysis.sections).length,
        improvementsCount: comprehensiveAnalysis.improvements.length
      });

      // Save the analysis to the database
      await handleATSScoreUpdate(comprehensiveAnalysis);
      
      console.log('Automatic ATS analysis completed with score:', overallScore);
      
    } catch (error) {
      console.error('Error performing automatic ATS analysis:', error);
      throw error;
    }
  };

  const handleViewResume = async () => {
    if (!studentDetails?.resume_url) {
      alert('No resume found');
      return;
    }
    
    try {
      console.log('Full student details:', studentDetails);
      console.log('Resume URL from database:', studentDetails.resume_url);
      console.log('Resume URL type:', typeof studentDetails.resume_url);
      
      // Extract the full file path from the public URL
      // The URL format is: https://yduiaxjgolkiaydilfux.supabase.co/storage/v1/object/public/resumes/{user_id}/resume.pdf
      let filePath;
      if (studentDetails.resume_url.includes('/storage/v1/object/public/resumes/')) {
        // Extract everything after '/storage/v1/object/public/resumes/'
        filePath = studentDetails.resume_url.split('/storage/v1/object/public/resumes/')[1];
      } else if (studentDetails.resume_url.includes('/')) {
        // If it's a different URL format, try to extract the path part
        const urlParts = studentDetails.resume_url.split('/');
        const bucketsIndex = urlParts.findIndex(part => part === 'resumes');
        if (bucketsIndex !== -1 && bucketsIndex < urlParts.length - 1) {
          filePath = urlParts.slice(bucketsIndex + 1).join('/');
        } else {
          filePath = studentDetails.resume_url.split('/').pop();
        }
      } else {
        // If it's just a filename, assume it's in the user's folder
        filePath = `${user?.id}/resume.pdf`;
      }
      
      console.log('Extracted file path:', filePath);
      console.log('File path length:', filePath?.length);
      
      if (!filePath) {
        alert('Invalid resume file path');
        return;
      }
      
      // First, let's list all files in the bucket to see what's there
      const { data: fileList, error: listError } = await supabase.storage
        .from('resumes')
        .list('', { limit: 100 });
        
      if (listError) {
        console.error('Error listing files in resumes bucket:', listError);
      } else {
        console.log('Files in resumes bucket:', fileList);
        console.log('Looking for file:', filePath);
        const fileExists = fileList?.some(file => file.name === filePath);
        console.log('File exists in bucket:', fileExists);
      }

      // Try to get public URL first (if bucket is public)
      const { data: publicData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);
        
      if (publicData?.publicUrl) {
        console.log('Generated public URL:', publicData.publicUrl);
        // Try to fetch the URL to see if it's accessible
        try {
          const response = await fetch(publicData.publicUrl, { method: 'HEAD' });
          console.log('Public URL response status:', response.status);
          if (response.ok) {
            console.log('Public URL is accessible, opening...');
            window.open(publicData.publicUrl, '_blank');
            return;
          }
        } catch (fetchError) {
          console.error('Error checking public URL:', fetchError);
        }
      }
      
      // Fallback to signed URL if public URL doesn't work
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(filePath, 3600); // Valid for 1 hour
        
      if (error) {
        console.error('Error creating signed URL:', error);
        console.error('Error details:', error.message);
        
        // Try to list buckets to see what's available
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        console.log('Available buckets:', buckets);
        if (bucketsError) console.error('Error listing buckets:', bucketsError);
        
        alert(`Error accessing resume: ${error.message}`);
        return;
      }
      
      if (data?.signedUrl) {
        console.log('Generated signed URL successfully');
        window.open(data.signedUrl, '_blank');
      } else {
        alert('Could not generate resume URL');
      }
    } catch (error) {
      console.error('Error viewing resume:', error);
      alert('Error viewing resume. Please try again.');
    }
  };

  const handleDownloadResume = async () => {
    if (!studentDetails?.resume_url) return;
    
    try {
      // Extract the full file path from the public URL
      let filePath;
      if (studentDetails.resume_url.includes('/storage/v1/object/public/resumes/')) {
        filePath = studentDetails.resume_url.split('/storage/v1/object/public/resumes/')[1];
      } else if (studentDetails.resume_url.includes('/')) {
        const urlParts = studentDetails.resume_url.split('/');
        const bucketsIndex = urlParts.findIndex(part => part === 'resumes');
        if (bucketsIndex !== -1 && bucketsIndex < urlParts.length - 1) {
          filePath = urlParts.slice(bucketsIndex + 1).join('/');
        } else {
          filePath = studentDetails.resume_url.split('/').pop();
        }
      } else {
        filePath = `${user?.id}/resume.pdf`;
      }
      
      if (!filePath) {
        alert('Invalid resume file path');
        return;
      }
      
      // Generate a signed URL for downloading
      const { data, error } = await supabase.storage
        .from('resumes')
        .createSignedUrl(filePath, 3600);
        
      if (error) {
        console.error('Error creating signed URL:', error);
        alert('Error downloading resume. Please try again.');
        return;
      }
      
      if (data?.signedUrl) {
        const link = document.createElement('a');
        link.href = data.signedUrl;
        link.download = `${studentDetails.name || 'Student'}_Resume.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Error downloading resume. Please try again.');
    }
  };

  const ensureStorageBuckets = async () => {
    try {
      // Check if buckets exist
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
        return;
      }
      
      const bucketNames = buckets?.map(bucket => bucket.name) || [];
      console.log('Existing buckets:', bucketNames);
      
      // Create resumes bucket if it doesn't exist
      if (!bucketNames.includes('resumes')) {
        console.log('Creating resumes bucket...');
        const { error: resumesError } = await supabase.storage.createBucket('resumes', {
          public: true, // Make it public for easier access
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: ['application/pdf']
        });
        
        if (resumesError) {
          console.error('Error creating resumes bucket:', resumesError);
        } else {
          console.log('Resumes bucket created successfully');
        }
      }
      
      // Create certificates bucket if it doesn't exist
      if (!bucketNames.includes('certificates')) {
        console.log('Creating certificates bucket...');
        const { error: certificatesError } = await supabase.storage.createBucket('certificates', {
          public: true, // Make it public for easier access
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
        });
        
        if (certificatesError) {
          console.error('Error creating certificates bucket:', certificatesError);
        } else {
          console.log('Certificates bucket created successfully');
        }
      }
    } catch (error) {
      console.error('Error ensuring storage buckets:', error);
    }
  };

  const loadCertificateSignedUrls = async (certificateUrls) => {
    if (!certificateUrls || certificateUrls.length === 0) {
      console.log('No certificate URLs to load');
      return;
    }
    
    console.log('Loading certificate signed URLs for:', certificateUrls);
    const urls = {};
    
    for (let i = 0; i < certificateUrls.length; i++) {
      const url = certificateUrls[i];
      try {
        // Extract the full file path from the public URL
        let filePath;
        if (url.includes('/storage/v1/object/public/certificates/')) {
          filePath = url.split('/storage/v1/object/public/certificates/')[1];
        } else if (url.includes('/')) {
          const urlParts = url.split('/');
          const bucketsIndex = urlParts.findIndex(part => part === 'certificates');
          if (bucketsIndex !== -1 && bucketsIndex < urlParts.length - 1) {
            filePath = urlParts.slice(bucketsIndex + 1).join('/');
          } else {
            filePath = url.split('/').pop();
          }
        } else {
          filePath = url;
        }
        
        console.log(`Loading certificate ${i}, file path:`, filePath);
        
        if (filePath) {
          const { data, error } = await supabase.storage
            .from('certificates')
            .createSignedUrl(filePath, 3600);
            
          if (error) {
            console.error(`Error loading certificate ${i}:`, error);
          } else if (data?.signedUrl) {
            urls[i] = data.signedUrl;
            console.log(`Successfully loaded certificate ${i}`);
          }
        }
      } catch (error) {
        console.error(`Error loading certificate ${i}:`, error);
      }
    }
    
    console.log('Final certificate signed URLs:', urls);
    setCertificateSignedUrls(urls);
  };

  const handleViewCertificate = async (certificateUrl) => {
    if (!certificateUrl) {
      alert('No certificate URL provided');
      return;
    }
    
    try {
      console.log('Certificate URL from database:', certificateUrl);
      
      // Extract the full file path from the public URL
      let filePath;
      if (certificateUrl.includes('/storage/v1/object/public/certificates/')) {
        // Extract everything after '/storage/v1/object/public/certificates/'
        filePath = certificateUrl.split('/storage/v1/object/public/certificates/')[1];
      } else if (certificateUrl.includes('/')) {
        // If it's a different URL format, try to extract the path part
        const urlParts = certificateUrl.split('/');
        const bucketsIndex = urlParts.findIndex(part => part === 'certificates');
        if (bucketsIndex !== -1 && bucketsIndex < urlParts.length - 1) {
          filePath = urlParts.slice(bucketsIndex + 1).join('/');
        } else {
          filePath = certificateUrl.split('/').pop();
        }
      } else {
        filePath = certificateUrl;
      }
      
      console.log('Extracted certificate file path:', filePath);
      
      if (!filePath) {
        alert('Invalid certificate file path');
        return;
      }
      
      // Generate a signed URL for viewing
      const { data, error } = await supabase.storage
        .from('certificates')
        .createSignedUrl(filePath, 3600);
        
      if (error) {
        console.error('Error creating signed URL:', error);
        console.error('Error details:', error.message);
        
        // Try to list buckets to see what's available
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        console.log('Available buckets:', buckets);
        if (bucketsError) console.error('Error listing buckets:', bucketsError);
        
        alert(`Error accessing certificate: ${error.message}`);
        return;
      }
      
      if (data?.signedUrl) {
        console.log('Generated certificate signed URL successfully');
        window.open(data.signedUrl, '_blank');
      } else {
        alert('Could not generate certificate URL');
      }
    } catch (error) {
      console.error('Error viewing certificate:', error);
      alert('Error viewing certificate. Please try again.');
    }
  };

  // Real-time metrics calculation functions
  const calculatePlacementScore = () => {
    if (!studentDetails) {
      console.log('No student details available for placement score calculation');
      return 0;
    }
    
    console.log('Calculating placement score with:', {
      cgpa: studentDetails.cgpa,
      technologies: studentDetails.technologies?.length || 0,
      atsScore: studentDetails.ats_score,
      certificates: studentDetails.certifications_urls?.length || 0,
      projects: studentDetails.projects?.length || 0
    });
    
    let score = 0;
    let maxScore = 100;
    
    // CGPA contribution (35% of total score - reduced to make room for ATS)
    const cgpaScore = studentDetails.cgpa ? Math.min((studentDetails.cgpa / 10) * 35, 35) : 0;
    score += cgpaScore;
    
    // Skills and technologies contribution (25% of total score)
    const technologies = studentDetails.technologies || [];
    const skillsScore = Math.min(technologies.length * 2.5, 25);
    score += skillsScore;
    
    // ATS Score contribution (20% of total score - NEW!)
    const atsScore = studentDetails.ats_score ? Math.min((studentDetails.ats_score / 100) * 20, 20) : 0;
    score += atsScore;
    
    // Certifications contribution (10% of total score)
    const certifications = studentDetails.certifications_urls || [];
    const certScore = Math.min(certifications.length * 2, 10);
    score += certScore;
    
    // Projects and experience contribution (10% of total score)
    const projects = studentDetails.projects || [];
    const internships = studentDetails.internships || [];
    const experience = studentDetails.experience || '';
    
    let expScore = 0;
    expScore += Math.min(projects.length * 1.5, 5);
    expScore += Math.min(internships.length * 1.5, 3);
    expScore += experience.length > 50 ? 2 : 0;
    
    score += Math.min(expScore, 10);
    
    return Math.round(score);
  };

  const calculateSkillsProgress = () => {
    // Use persistent skill assessment data instead of default service
    const completedAssessments = skillAssessmentData.length;
    
    // Get all available skills from the skill assessment service for total count
    const skillCategories = skillAssessmentService.getSkillCategories();
    const totalSkills = skillCategories.flatMap(cat => cat.skills).length;
    
    return {
      completed: completedAssessments,
      total: totalSkills,
      percentage: totalSkills > 0 ? Math.round((completedAssessments / totalSkills) * 100) : 0
    };
  };

  const loadSkillAssessmentData = async (userId = null) => {
    const targetUserId = userId || user?.id;
    if (targetUserId) {
      try {
        const assessments = await PersistentDataService.getSkillAssessments(targetUserId);
        setSkillAssessmentData(assessments);
        return assessments;
      } catch (error) {
        console.error('Error loading skill assessments:', error);
        setSkillAssessmentData([]);
        return [];
      }
    }
    return [];
  };

  const refreshMetrics = () => {
    if (studentDetails) {
      const placementScore = calculatePlacementScore();
      const skillsProgress = calculateSkillsProgress();
      const certificationsCount = (studentDetails.certifications_urls || []).length;
      const cgpa = studentDetails.cgpa || 0;
      const atsScore = studentDetails.ats_score || 0;
      
      const atsCategory = atsScore >= 85 ? 'Excellent' 
        : atsScore >= 70 ? 'Good'
        : atsScore >= 50 ? 'Decent'
        : atsScore > 0 ? 'Needs Improvement'
        : 'Not analyzed';
      
      setRealTimeMetrics(prev => ({
        placementScore,
        skillsCompleted: skillsProgress.completed,
        totalSkills: skillsProgress.total,
        certificationsCount,
        cgpa,
        atsScore,
        atsCategory,
        previousPlacementScore: prev.placementScore || placementScore - 5
      }));
    }
  };

  const getCGPAGrade = (cgpa) => {
    if (!cgpa) return 'Not provided';
    if (cgpa >= 9.0) return 'Outstanding';
    if (cgpa >= 8.0) return 'Excellent';
    if (cgpa >= 7.0) return 'Very Good';
    if (cgpa >= 6.0) return 'Good';
    if (cgpa >= 5.0) return 'Average';
    return 'Below Average';
  };

  const getPlacementScoreChange = (currentScore) => {
    const previousScore = realTimeMetrics.previousPlacementScore || currentScore - 5;
    const change = currentScore - previousScore;
    return {
      change,
      text: change > 0 ? `+${change} from last assessment` : change < 0 ? `${change} from last assessment` : 'No change'
    };
  };

  // Generate comprehensive placement report
  const generatePlacementReport = async () => {
    if (!studentDetails || !user) {
      alert('Please complete your profile first');
      return;
    }

    setGeneratingReport(true);
    try {
      // Generate comprehensive report using the service
      const report = reportGenerationService.generateComprehensiveReport(studentDetails, user);
      
      setCurrentReport(report);
      setShowReport(true);
      
      // Optional: Save report to database
      reportGenerationService.saveReport(report, user.id);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setGeneratingReport(false);
    }
  };

  // Export report as PDF
  const exportReportAsPDF = async () => {
    if (currentReport) {
      try {
        await reportGenerationService.exportReportAsPDF(currentReport);
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert('Error exporting PDF. Please try again.');
      }
    }
  };

  // Share report functionality
  const shareReport = () => {
    if (currentReport) {
      const shareData = {
        title: 'My Placement Prediction Report',
        text: `Check out my placement prediction report! Probability: ${currentReport.placementPrediction.probability}%, Skills: ${currentReport.skillAnalysis.completedSkills}/${currentReport.skillAnalysis.totalSkills}`,
        url: window.location.href
      };

      if (navigator.share) {
        navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareData.text).then(() => {
          alert('Report details copied to clipboard!');
        });
      }
    }
  };

  // Update real-time metrics whenever studentDetails change
  useEffect(() => {
    if (studentDetails) {
      const placementScore = calculatePlacementScore();
      const skillsProgress = calculateSkillsProgress();
      const certificationsCount = (studentDetails.certifications_urls || []).length;
      const cgpa = studentDetails.cgpa || 0;
      const atsScore = studentDetails.ats_score || 0;
      const atsCategory = atsScore >= 85 ? 'Excellent' 
        : atsScore >= 70 ? 'Good'
        : atsScore >= 50 ? 'Decent'
        : atsScore > 0 ? 'Needs Improvement'
        : 'Not analyzed';
      
      setRealTimeMetrics(prev => ({
        placementScore,
        skillsCompleted: skillsProgress.completed,
        totalSkills: skillsProgress.total,
        certificationsCount,
        cgpa,
        atsScore,
        atsCategory,
        previousPlacementScore: prev.placementScore || placementScore - 5
      }));
    }
  }, [studentDetails]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If user hasn't completed their detailed profile, show completion prompt
  if (!studentDetails || !studentDetails.profile_completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <UserPlus className="h-16 w-16 mx-auto text-blue-600 mb-4" />
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-pink-600 bg-clip-text text-transparent">
              Complete Your Profile
            </CardTitle>
            <CardDescription className="text-black">
              Your journey to placement success starts here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-black space-y-2">
              <p>We'll need information about:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Academic details (CGPA, Branch)</li>
                <li>Technical skills & certifications</li>
                <li>Internships & experience</li>
                <li>Projects & achievements</li>
                <li>Resume upload</li>
              </ul>
            </div>
            <Button 
              onClick={handleCompleteProfile}
              className="w-full bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 hover:from-blue-600 hover:via-pink-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl transform transition-all duration-300 hover:scale-105"
            >
              Complete Profile Now
            </Button>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="w-full mt-2"
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-purple-200 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-cyan-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-1/3 left-1/2 w-16 h-16 bg-pink-300 rounded-full opacity-15 animate-ping"></div>
        <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-indigo-200 rounded-full opacity-25 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Student Dashboard
              </h1>
              <p className="text-lg text-black font-medium mt-1">Welcome back, {profile?.name || 'Student'}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-gradient-to-r from-blue-400 to-pink-400 text-white px-4 py-2 text-sm font-semibold">
                CS Engineering
              </Badge>
              <Badge variant="outline" className="border-2 border-purple-300 text-purple-600 px-4 py-2 text-sm font-semibold">
                Final Year
              </Badge>
              <Button
                onClick={handleLogout}
                className="ml-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg px-4 py-2 hover:scale-105 transition-transform duration-300">
                Logout
              </Button>
            </div>
          </div>

          {/* Generate Report Section */}
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-blue-600 via-pink-600 to-purple-600 text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Ready for Placement Prediction?</h2>
                  <p className="text-blue-100 mb-4">
                    Generate your personalized placement report based on your profile, skills, and market trends.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Brain className="h-16 w-16 text-white opacity-80" />
                  <Button
                    onClick={generatePlacementReport}
                    disabled={generatingReport}
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    {generatingReport ? 'Generating...' : 'Generate Placement Report'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: "Placement Score",
                value: `${realTimeMetrics.placementScore}%`,
                subtitle: realTimeMetrics.placementScore >= 80 ? "🎉 Excellent readiness!" : 
                         realTimeMetrics.placementScore >= 60 ? "👍 Good progress" :
                         realTimeMetrics.placementScore >= 40 ? "📈 Getting there" : "🚀 Let's improve!",
                progress: realTimeMetrics.placementScore,
                icon: TrendingUp,
                gradient: realTimeMetrics.placementScore >= 80 ? "from-green-400 to-green-600" :
                         realTimeMetrics.placementScore >= 60 ? "from-blue-400 to-blue-600" :
                         realTimeMetrics.placementScore >= 40 ? "from-yellow-400 to-yellow-600" : "from-red-400 to-red-600",
                bgGradient: realTimeMetrics.placementScore >= 80 ? "from-green-50 to-green-100" :
                           realTimeMetrics.placementScore >= 60 ? "from-blue-50 to-blue-100" :
                           realTimeMetrics.placementScore >= 40 ? "from-yellow-50 to-yellow-100" : "from-red-50 to-red-100"
              },
              // {
              //   title: "Skills Completed",
              //   value: realTimeMetrics.skillsCompleted > 0 ? `${realTimeMetrics.skillsCompleted}/${realTimeMetrics.totalSkills}` : "0 assessments",
              //   subtitle: realTimeMetrics.skillsCompleted > 0 ? 
              //     `🎯 ${Math.round((realTimeMetrics.skillsCompleted / realTimeMetrics.totalSkills) * 100)}% complete - Great work!` :
              //     "🎓 Start your first skill assessment!",
              //   progress: realTimeMetrics.totalSkills > 0 ? Math.round((realTimeMetrics.skillsCompleted / realTimeMetrics.totalSkills) * 100) : 0,
              //   icon: Target,
              //   gradient: realTimeMetrics.skillsCompleted > 0 ? "from-blue-400 to-blue-600" : "from-gray-400 to-gray-600",
              //   bgGradient: realTimeMetrics.skillsCompleted > 0 ? "from-blue-50 to-blue-100" : "from-gray-50 to-gray-100"
              // },
              {
                title: "ATS Score",
                value: realTimeMetrics.atsScore > 0 ? `${realTimeMetrics.atsScore}%` : 'Not analyzed',
                subtitle: realTimeMetrics.atsScore >= 85 ? "🌟 ATS Excellent!" :
                         realTimeMetrics.atsScore >= 70 ? "✅ ATS Good" :
                         realTimeMetrics.atsScore >= 50 ? "⚠️ ATS Needs work" :
                         realTimeMetrics.atsScore > 0 ? "❌ ATS Poor" : "📄 Upload your resume",
                progress: realTimeMetrics.atsScore > 0 ? realTimeMetrics.atsScore : 0,
                icon: Brain,
                gradient: realTimeMetrics.atsScore >= 85 ? "from-green-400 to-green-600" 
                  : realTimeMetrics.atsScore >= 70 ? "from-cyan-400 to-cyan-600"
                  : realTimeMetrics.atsScore >= 50 ? "from-yellow-400 to-yellow-600"
                  : realTimeMetrics.atsScore > 0 ? "from-red-400 to-red-600"
                  : "from-gray-400 to-gray-600",
                bgGradient: realTimeMetrics.atsScore >= 85 ? "from-green-50 to-green-100" 
                  : realTimeMetrics.atsScore >= 70 ? "from-cyan-50 to-cyan-100"
                  : realTimeMetrics.atsScore >= 50 ? "from-yellow-50 to-yellow-100"
                  : realTimeMetrics.atsScore > 0 ? "from-red-50 to-red-100"
                  : "from-gray-50 to-gray-100"
              },
              {
                title: "Certifications",
                value: realTimeMetrics.certificationsCount > 0 ? realTimeMetrics.certificationsCount.toString() : "None",
                subtitle: realTimeMetrics.certificationsCount > 0 ? 
                  `🏆 ${realTimeMetrics.certificationsCount} ${realTimeMetrics.certificationsCount === 1 ? 'certificate' : 'certificates'} verified` : 
                  '📜 Add your certifications',
                progress: null,
                icon: Award,
                gradient: realTimeMetrics.certificationsCount > 0 ? "from-purple-400 to-purple-600" : "from-gray-400 to-gray-600",
                bgGradient: realTimeMetrics.certificationsCount > 0 ? "from-purple-50 to-purple-100" : "from-gray-50 to-gray-100"
              },
              {
                title: "CGPA",
                value: realTimeMetrics.cgpa > 0 ? realTimeMetrics.cgpa.toFixed(2) : 'Not set',
                subtitle: realTimeMetrics.cgpa >= 9.0 ? "🌟 Outstanding!" :
                         realTimeMetrics.cgpa >= 8.0 ? "🎓 Excellent!" :
                         realTimeMetrics.cgpa >= 7.0 ? "👍 Very Good" :
                         realTimeMetrics.cgpa >= 6.0 ? "📚 Good" :
                         realTimeMetrics.cgpa > 0 ? "📈 Keep improving" : "📝 Please update your CGPA",
                progress: realTimeMetrics.cgpa > 0 ? Math.round((realTimeMetrics.cgpa / 10) * 100) : 0,
                icon: BookOpen,
                gradient: realTimeMetrics.cgpa >= 8.0 ? "from-green-400 to-green-600" :
                         realTimeMetrics.cgpa >= 7.0 ? "from-emerald-400 to-emerald-600" :
                         realTimeMetrics.cgpa >= 6.0 ? "from-blue-400 to-blue-600" :
                         realTimeMetrics.cgpa > 0 ? "from-yellow-400 to-yellow-600" : "from-gray-400 to-gray-600",
                bgGradient: realTimeMetrics.cgpa >= 8.0 ? "from-green-50 to-green-100" :
                           realTimeMetrics.cgpa >= 7.0 ? "from-emerald-50 to-emerald-100" :
                           realTimeMetrics.cgpa >= 6.0 ? "from-blue-50 to-blue-100" :
                           realTimeMetrics.cgpa > 0 ? "from-yellow-50 to-yellow-100" : "from-gray-50 to-gray-100"
              }
            ].map((metric, index) => (
              <Card 
                key={metric.title} 
                className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 bg-gradient-to-br ${metric.bgGradient} group cursor-pointer`}
                onClick={() => {
                  // Handle specific card clicks with detailed actions
                  if (metric.title === "Placement Score") {
                    generatePlacementReport();
                  } else if (metric.title === "Skills Completed") {
                    // Switch to Skills tab
                    const skillsTab = document.querySelector('[value="skills"]') as HTMLElement;
                    if (skillsTab) skillsTab.click();
                  } else if (metric.title === "ATS Score") {
                    if (realTimeMetrics.atsScore > 0) {
                      setShowATSAnalyzer(true);
                    } else {
                      alert("📄 No ATS analysis available yet!\n\nTo get your ATS score:\n1. Go to Profile tab\n2. Upload your resume\n3. Wait for automatic analysis");
                    }
                  } else if (metric.title === "Certifications") {
                    if (realTimeMetrics.certificationsCount > 0) {
                      setShowCertificates(true);
                    } else {
                      alert("🏆 No certificates uploaded yet!\n\nTo add certificates:\n1. Go to Profile tab\n2. Scroll to Academic Information\n3. Upload your certificates");
                    }
                  } else if (metric.title === "CGPA") {
                    if (realTimeMetrics.cgpa === 0) {
                      alert("📚 CGPA not provided!\n\nTo update your CGPA:\n1. Click 'Edit Profile'\n2. Fill in your CGPA\n3. Save changes");
                    } else {
                      alert(`📊 Your CGPA: ${realTimeMetrics.cgpa.toFixed(2)}\nGrade: ${getCGPAGrade(realTimeMetrics.cgpa)}\n\nThis contributes to your overall placement score!`);
                    }
                  }
                }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-black group-hover:text-black transition-colors">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full bg-gradient-to-r ${metric.gradient} transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110`}>
                    <metric.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-black group-hover:text-black transition-colors">
                    {metric.value}
                  </div>
                  <p className="text-sm text-black group-hover:text-black transition-colors mt-1">
                    {metric.subtitle}
                  </p>
                  {metric.progress && (
                    <Progress value={metric.progress} className="mt-3 h-2" />
                  )}
                  {/* Add real-time update indicator */}
                  <div className="mt-2 flex items-center justify-between">
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-white/50 border-gray-300"
                    >
                      Real-time
                    </Badge>
                    <span className="text-xs text-gray-600 group-hover:text-gray-700">
                      {metric.title === "Placement Score" ? "Click to generate report" :
                       metric.title === "Skills Completed" ? "Click to take assessments" :
                       metric.title === "ATS Score" && realTimeMetrics.atsScore > 0 ? "Click to view analysis" :
                       metric.title === "ATS Score" ? "Upload resume to analyze" :
                       metric.title === "Certifications" && realTimeMetrics.certificationsCount > 0 ? "Click to view certificates" :
                       metric.title === "Certifications" ? "Upload certificates" :
                       metric.title === "CGPA" ? "Click for details" : "Updated now"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg">
              {["Profile", "Skills", "Prediction"].map((tab, index) => (
                <TabsTrigger 
                  key={tab.toLowerCase()}
                  value={tab.toLowerCase()} 
                  className="font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-gray-700"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>



            <TabsContent value="profile" className="space-y-6">
              {/* Profile Header */}
              <Card className="border border-gray-200 shadow-xl bg-white">
                <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                      📋 Profile Management
                    </CardTitle>
                    <CardDescription className="text-gray-700 font-medium text-base">
                      {isEditing ? 'Edit your profile information' : 'View and manage your profile'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <Button
                        onClick={handleEditProfile}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={loading}
                          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {loading ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
              </Card>

              {/* Personal Information */}
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    <User className="h-6 w-6 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-semibold text-black mb-2 block">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                          className="border-2 border-gray-300 focus:border-blue-500 rounded-lg p-3 text-white bg-gray-800"
                        />
                      ) : (
                        <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 min-h-[45px] flex items-center">
                          <span className="text-black font-medium">{studentDetails?.name || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold text-black mb-2 block">Email</Label>
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center gap-2 border border-blue-200 min-h-[45px]">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <span className="text-black font-medium">{user?.email || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    <GraduationCap className="h-6 w-6 text-green-600" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="cgpa" className="text-sm font-semibold text-black mb-2 block">CGPA</Label>
                      {isEditing ? (
                        <Input
                          id="cgpa"
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          value={editForm.cgpa}
                          onChange={(e) => handleInputChange('cgpa', e.target.value)}
                          placeholder="Enter your CGPA"
                          className="border-2 border-gray-300 focus:border-green-500 rounded-lg p-3 text-white bg-gray-800"
                        />
                      ) : (
                        <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 min-h-[45px] flex items-center">
                          <span className="text-black font-bold text-lg">
                            {studentDetails?.cgpa ? `${studentDetails.cgpa}/10` : 'Not provided'}
                          </span>
                          {studentDetails?.cgpa && (
                            <Badge className="ml-2 bg-green-600 text-white">
                              {studentDetails.cgpa >= 8 ? 'Excellent' : studentDetails.cgpa >= 7 ? 'Good' : 'Average'}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="branch" className="text-sm font-semibold text-black mb-2 block">Branch/Department</Label>
                      {isEditing ? (
                        <Input
                          id="branch"
                          value={editForm.branch}
                          onChange={(e) => handleInputChange('branch', e.target.value)}
                          placeholder="e.g., Computer Science Engineering"
                          className="border-2 border-gray-300 focus:border-green-500 rounded-lg p-3 text-white bg-gray-800"
                        />
                      ) : (
                        <div className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 min-h-[45px] flex items-center">
                          <span className="text-black font-medium">{studentDetails?.branch || 'Not provided'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Skills */}
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    <Code className="h-6 w-6 text-purple-600" />
                    Technical Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  {isEditing ? (
                    <div>
                      <Label className="text-sm font-semibold text-black mb-3 block">Add Technologies</Label>
                      <div className="flex gap-2 mb-4">
                        <Input
                          placeholder="Add a technology (e.g., React, Python, Java)"
                          className="border-2 border-gray-300 focus:border-purple-500 rounded-lg p-3 text-white bg-gray-800"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const target = e.target as HTMLInputElement;
                              addToArray('technologies', target.value);
                              target.value = '';
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                            if (input) {
                              addToArray('technologies', input.value);
                              input.value = '';
                            }
                          }}
                          className="bg-purple-600 hover:bg-purple-700 px-4 py-3"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {editForm.technologies.map((tech, index) => (
                          <Badge key={index} className="bg-purple-100 text-purple-800 border border-purple-300 px-3 py-2 text-sm font-medium flex items-center gap-2">
                            {tech}
                            <X 
                              className="h-4 w-4 cursor-pointer hover:text-red-600" 
                              onClick={() => removeFromArray('technologies', index)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-sm font-semibold text-black mb-3 block">Your Technologies</Label>
                      <div className="flex flex-wrap gap-3">
                        {studentDetails?.technologies?.length > 0 ? (
                          studentDetails.technologies.map((tech, index) => (
                            <Badge key={index} className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 text-sm font-medium shadow-md">
                              💻 {tech}
                            </Badge>
                          ))
                        ) : (
                          <div className="text-center py-8 text-black">
                            <Code className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                            <p className="font-medium">No technologies added yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Experience & Internships */}
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    <Briefcase className="h-6 w-6 text-orange-600" />
                    Experience & Internships
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Internships */}
                  <div>
                    <Label className="text-sm font-semibold text-black">Internships</Label>
                    {isEditing ? (
                      <div>
                        <div className="flex gap-2 mb-4 mt-2">
                          <Input
                            placeholder="Add internship (e.g., Software Developer Intern at XYZ)"
                            className="border-2 border-gray-300 focus:border-orange-500 rounded-lg p-3 text-white bg-gray-800"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.target as HTMLInputElement;
                                addToArray('internships', target.value);
                                target.value = '';
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={(e) => {
                              const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                              if (input) {
                                addToArray('internships', input.value);
                                input.value = '';
                              }
                            }}
                            className="bg-orange-600 hover:bg-orange-700 px-4 py-3"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {editForm.internships.map((internship, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <span className="text-sm text-black">{internship}</span>
                              <X 
                                className="h-4 w-4 cursor-pointer text-red-500 hover:text-red-700" 
                                onClick={() => removeFromArray('internships', index)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {studentDetails?.internships?.length > 0 ? (
                          studentDetails.internships.map((internship, index) => (
                            <div key={index} className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border-l-4 border-orange-400 text-black">
                              {internship}
                            </div>
                          ))
                        ) : (
                          <p className="text-black">No internships added yet</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Work Experience */}
                  <div>
                    <Label htmlFor="experience" className="text-sm font-semibold text-black">Work Experience</Label>
                    {isEditing ? (
                      <Textarea
                        id="experience"
                        value={editForm.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        placeholder="Describe your work experience, achievements, etc."
                        rows={4}
                        className="mt-2 text-white bg-gray-800"
                      />
                    ) : (
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg min-h-[100px] text-black">
                        {studentDetails?.experience || 'No work experience provided'}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Projects */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-black">
                    <Award className="h-5 w-5 text-green-600" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div>
                      <div className="flex gap-2 mb-4">
                        <Input
                          placeholder="Add project (e.g., E-commerce Website using React)"
                          className="border-2 border-gray-300 focus:border-green-500 rounded-lg p-3 text-white bg-gray-800"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const target = e.target as HTMLInputElement;
                              addToArray('projects', target.value);
                              target.value = '';
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                            if (input) {
                              addToArray('projects', input.value);
                              input.value = '';
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 px-4 py-3"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {editForm.projects.map((project, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm text-black">{project}</span>
                            <X 
                              className="h-4 w-4 cursor-pointer text-red-500 hover:text-red-700" 
                              onClick={() => removeFromArray('projects', index)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {studentDetails?.projects?.length > 0 ? (
                        studentDetails.projects.map((project, index) => (
                          <div key={index} className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-l-4 border-green-400 text-black">
                            {project}
                          </div>
                        ))
                      ) : (
                        <p className="text-black">No projects added yet</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Files & Documents */}
              <Card className="border border-gray-200 shadow-lg bg-white">
                <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    <FileText className="h-6 w-6 text-red-600" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Resume */}
                    <div className="p-6 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-red-50 to-pink-50">
                      <div className="flex items-center gap-3 mb-4">
                        <FileText className="h-7 w-7 text-red-600" />
                        <span className="font-bold text-gray-800 text-lg">Resume</span>
                      </div>
                      {studentDetails?.resume_url ? (
                        <div className="space-y-3">
                          <Badge className="bg-green-500 text-white px-3 py-1 text-sm font-semibold">
                            ✅ Uploaded
                          </Badge>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleViewResume}
                              className="flex-1 border-2 border-red-300 hover:bg-red-50"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Resume
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleDownloadResume}
                              className="border-2 border-blue-300 hover:bg-blue-50 px-3"
                              title="Download Resume"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Badge variant="outline" className="text-orange-600 border-orange-600 px-3 py-1 font-semibold">
                            ⚠️ Not uploaded
                          </Badge>
                          <p className="text-sm text-gray-600">Upload your resume to complete your profile</p>
                        </div>
                      )}
                    </div>

                    {/* Certifications */}
                    <div className="p-6 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50">
                      <div className="flex items-center gap-3 mb-4">
                        <Award className="h-7 w-7 text-yellow-600" />
                        <span className="font-bold text-gray-800 text-lg">Certifications</span>
                      </div>
                      {studentDetails?.certifications_urls?.length > 0 ? (
                        <div className="space-y-3">
                          <Badge className="bg-green-500 text-white px-3 py-1 text-sm font-semibold">
                            ✅ {studentDetails.certifications_urls.length} uploaded
                          </Badge>
                          <Dialog open={showCertificates} onOpenChange={setShowCertificates}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full border-2 border-yellow-300 hover:bg-yellow-50"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View All Certificates
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-gray-800">
                                  📜 Your Certifications
                                </DialogTitle>
                                <DialogDescription>
                                  View all your uploaded certificates
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {studentDetails.certifications_urls.map((url, index) => (
                                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="font-semibold text-gray-700">
                                        Certificate {index + 1}
                                      </span>
                                      <Badge className="bg-blue-500 text-white">
                                        Image
                                      </Badge>
                                    </div>
                                    <div className="aspect-video bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden mb-3">
                                      <img
                                        src={certificateSignedUrls[index] || '/placeholder.svg'}
                                        alt={`Certificate ${index + 1}`}
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                                        }}
                                      />
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleViewCertificate(url)}
                                      className="w-full"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Full Size
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Badge variant="outline" className="text-orange-600 border-orange-600 px-3 py-1 font-semibold">
                            ⚠️ No certificates
                          </Badge>
                          <p className="text-sm text-gray-600">Add your certifications to showcase your skills</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ATS Resume Analysis */}
              <Card className="border-2 border-gray-200 shadow-xl bg-gradient-to-r from-cyan-50 to-teal-50">
                <CardHeader className="bg-gradient-to-r from-cyan-100 to-teal-100 border-b">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    <Brain className="h-6 w-6 text-cyan-600" />
                    ATS Resume Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Your resume's compatibility with Applicant Tracking Systems
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {studentDetails?.ats_score ? (
                    <div className="space-y-4">
                      {/* ATS Score Display */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-cyan-200">
                        <div>
                          <Label className="text-sm font-semibold text-gray-600 mb-1 block">ATS Compatibility Score</Label>
                          <div className="flex items-center gap-3">
                            <span className={`text-3xl font-bold ${
                              studentDetails.ats_score >= 85 ? 'text-green-600' 
                                : studentDetails.ats_score >= 70 ? 'text-blue-600'
                                : studentDetails.ats_score >= 50 ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}>
                              {studentDetails.ats_score}%
                            </span>
                            <Badge className={
                              studentDetails.ats_score >= 85 ? 'bg-green-500 text-white' 
                                : studentDetails.ats_score >= 70 ? 'bg-blue-500 text-white'
                                : studentDetails.ats_score >= 50 ? 'bg-yellow-500 text-white'
                                : 'bg-red-500 text-white'
                            }>
                              {studentDetails.ats_score >= 85 ? 'Excellent' 
                                : studentDetails.ats_score >= 70 ? 'Good'
                                : studentDetails.ats_score >= 50 ? 'Decent'
                                : 'Needs Improvement'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <Label className="text-sm font-semibold text-gray-600 mb-1 block">Impact on Placement</Label>
                          <p className={`text-sm font-medium ${
                            studentDetails.ats_score >= 85 ? 'text-green-600' 
                              : studentDetails.ats_score >= 70 ? 'text-blue-600'
                              : studentDetails.ats_score >= 50 ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}>
                            {studentDetails.ats_score >= 85 
                              ? 'Significantly boosts placement chances ⭐' 
                              : studentDetails.ats_score >= 70 
                              ? 'Improves placement chances 👍'
                              : studentDetails.ats_score >= 50 
                              ? 'Moderate positive impact 👌'
                              : 'May hurt placement chances ⚠️'}
                          </p>
                        </div>
                      </div>

                      {/* Analysis Details */}
                      {studentDetails.ats_analysis && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Strengths */}
                          {studentDetails.ats_analysis.strengths && studentDetails.ats_analysis.strengths.length > 0 && (
                            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Key Strengths
                              </h4>
                              <ul className="space-y-1">
                                {studentDetails.ats_analysis.strengths.slice(0, 3).map((strength: string, index: number) => (
                                  <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    {strength}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Improvement Areas */}
                          {studentDetails.ats_analysis.weaknesses && studentDetails.ats_analysis.weaknesses.length > 0 && (
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                              <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Areas to Improve
                              </h4>
                              <ul className="space-y-1">
                                {studentDetails.ats_analysis.weaknesses.slice(0, 3).map((weakness: string, index: number) => (
                                  <li key={index} className="text-sm text-orange-700 flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                    {weakness}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Analysis Date */}
                      <div className="text-center">
                        <p className="text-xs text-gray-500">
                          Last analyzed: {studentDetails?.updated_at ? new Date(studentDetails.updated_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  ) : autoAnalyzingATS ? (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto">
                        <Brain className="h-8 w-8 text-cyan-600 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-cyan-700 mb-2">Analyzing Your Resume...</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Our AI is analyzing your resume for ATS compatibility. This will just take a moment!
                        </p>
                        <div className="space-y-3">
                          <Badge className="bg-cyan-500 text-white px-4 py-2 font-semibold animate-pulse">
                            🔍 Analysis in Progress
                          </Badge>
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-600"></div>
                            <span className="text-sm text-gray-600">Processing your resume content...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 space-y-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                        <Brain className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">No ATS Analysis Available</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Your resume hasn't been analyzed for ATS compatibility yet. Analyze it now to improve your placement chances!
                        </p>
                        <div className="space-y-3">
                          <Badge variant="outline" className="text-orange-600 border-orange-600 px-4 py-2 font-semibold">
                            ⚠️ Analysis Needed
                          </Badge>
                          {studentDetails?.resume_url ? (
                            <div className="space-y-2">
                              <Button
                                onClick={() => setShowATSAnalyzer(true)}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-semibold"
                              >
                                <Brain className="h-4 w-4 mr-2" />
                                Analyze My Resume
                              </Button>
                              
                              {/* Debug button */}
                              <div>
                                <Button
                                  onClick={async () => {
                                    try {
                                      console.log('🔧 Starting debug test...');
                                      await testDatabaseAccess();
                                      await performAutomaticATSAnalysis(studentDetails.resume_url);
                                    } catch (error) {
                                      console.error('Debug test failed:', error);
                                      alert(`Debug test failed: ${error.message}`);
                                    }
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
                                >
                                  🔧 Debug ATS Analysis
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">
                              Please upload your resume first to enable ATS analysis
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Profile Completion Status */}
              <Card className="border-2 border-gray-200 shadow-xl bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">📊 Profile Completion</h3>
                      <p className="text-gray-700 font-medium">
                        Last updated: {studentDetails?.updated_at ? new Date(studentDetails.updated_at).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text mb-2">
                        {studentDetails?.profile_completed ? '100%' : '75%'}
                      </div>
                      <Badge className={
                        studentDetails?.profile_completed 
                          ? 'bg-green-500 text-white px-4 py-2 text-sm font-bold' 
                          : 'bg-yellow-500 text-white px-4 py-2 text-sm font-bold'
                      }>
                        {studentDetails?.profile_completed ? '✅ Complete' : '⏳ In Progress'}
                      </Badge>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-6">
                    <Progress 
                      value={studentDetails?.profile_completed ? 100 : 75} 
                      className="h-3 bg-gray-200" 
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills">
              <SkillAssessment 
                studentDetails={studentDetails} 
                user={user} 
                onMetricsUpdate={refreshMetrics}
              />
            </TabsContent>

            <TabsContent value="prediction">
              <PredictionTab studentDetails={studentDetails} user={user} />
            </TabsContent>


          </Tabs>
        </div>
      </div>

      {/* Placement Report Modal */}
      {showReport && currentReport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed inset-0 overflow-auto">
            <PlacementReportView
              report={currentReport}
              onClose={() => setShowReport(false)}
              onExport={exportReportAsPDF}
              onShare={shareReport}
            />
          </div>
        </div>
      )}

      {/* ATS Resume Analyzer Modal */}
      {showATSAnalyzer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed inset-0 overflow-auto p-4">
            <div className="min-h-screen flex items-center justify-center">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="h-8 w-8 text-cyan-600" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">ATS Resume Analysis</h2>
                      <p className="text-gray-600">Get your resume analyzed for ATS compatibility</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowATSAnalyzer(false)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="p-6">
                  <ATSResumeAnalyzer 
                    onScoreUpdate={handleATSScoreUpdate}
                    initialScore={studentDetails?.ats_analysis}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;