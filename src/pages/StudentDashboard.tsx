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
import { skillAssessmentService } from "@/services/skillAssessmentService";
import { reportGenerationService, PlacementReport } from "@/services/reportGenerationService";

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
    previousPlacementScore: 0
  });
  const [currentReport, setCurrentReport] = useState<PlacementReport | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
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
  }, []);

  const fetchUserData = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
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
        setStudentDetails(studentDetails);
        
        // Initialize edit form with current data
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
          
          // Load certificate signed URLs
          if (studentDetails.certifications_urls && studentDetails.certifications_urls.length > 0) {
            loadCertificateSignedUrls(studentDetails.certifications_urls);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
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
        
        setRealTimeMetrics(prev => ({
          placementScore,
          skillsCompleted: skillsProgress.completed,
          totalSkills: skillsProgress.total,
          certificationsCount,
          cgpa,
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
    if (!studentDetails) return 0;
    
    let score = 0;
    let maxScore = 100;
    
    // CGPA contribution (40% of total score)
    const cgpaScore = studentDetails.cgpa ? Math.min((studentDetails.cgpa / 10) * 40, 40) : 0;
    score += cgpaScore;
    
    // Skills and technologies contribution (30% of total score)
    const technologies = studentDetails.technologies || [];
    const skillsScore = Math.min(technologies.length * 3, 30);
    score += skillsScore;
    
    // Certifications contribution (15% of total score)
    const certifications = studentDetails.certifications_urls || [];
    const certScore = Math.min(certifications.length * 2, 15);
    score += certScore;
    
    // Projects and experience contribution (15% of total score)
    const projects = studentDetails.projects || [];
    const internships = studentDetails.internships || [];
    const experience = studentDetails.experience || '';
    
    let expScore = 0;
    expScore += Math.min(projects.length * 2, 8);
    expScore += Math.min(internships.length * 2, 4);
    expScore += experience.length > 50 ? 3 : 0;
    
    score += Math.min(expScore, 15);
    
    return Math.round(score);
  };

  const calculateSkillsProgress = () => {
    const skillCategories = skillAssessmentService.getSkillCategories();
    const allSkills = skillCategories.flatMap(cat => cat.skills);
    const completedSkills = allSkills.filter(skill => skill.completed);
    
    return {
      completed: completedSkills.length,
      total: allSkills.length,
      percentage: allSkills.length > 0 ? Math.round((completedSkills.length / allSkills.length) * 100) : 0
    };
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

  // Force metrics refresh - useful when skills are completed
  const refreshMetrics = () => {
    if (studentDetails) {
      const placementScore = calculatePlacementScore();
      const skillsProgress = calculateSkillsProgress();
      const certificationsCount = (studentDetails.certifications_urls || []).length;
      const cgpa = studentDetails.cgpa || 0;
      
      setRealTimeMetrics(prev => ({
        placementScore,
        skillsCompleted: skillsProgress.completed,
        totalSkills: skillsProgress.total,
        certificationsCount,
        cgpa,
        previousPlacementScore: prev.placementScore || placementScore - 5
      }));
    }
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
      
      setRealTimeMetrics(prev => ({
        placementScore,
        skillsCompleted: skillsProgress.completed,
        totalSkills: skillsProgress.total,
        certificationsCount,
        cgpa,
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
                value: `${realTimeMetrics.placementScore}/100`,
                subtitle: getPlacementScoreChange(realTimeMetrics.placementScore).text,
                progress: realTimeMetrics.placementScore,
                icon: TrendingUp,
                gradient: "from-pink-400 to-pink-600",
                bgGradient: "from-pink-50 to-pink-100"
              },
              {
                title: "Skills Completed",
                value: `${realTimeMetrics.skillsCompleted}/${realTimeMetrics.totalSkills}`,
                subtitle: `${Math.round((realTimeMetrics.skillsCompleted / realTimeMetrics.totalSkills) * 100) || 0}% completion rate`,
                progress: realTimeMetrics.totalSkills > 0 ? Math.round((realTimeMetrics.skillsCompleted / realTimeMetrics.totalSkills) * 100) : 0,
                icon: Target,
                gradient: "from-blue-400 to-blue-600",
                bgGradient: "from-blue-50 to-blue-100"
              },
              {
                title: "Certifications",
                value: realTimeMetrics.certificationsCount.toString(),
                subtitle: realTimeMetrics.certificationsCount > 0 ? 
                  `${realTimeMetrics.certificationsCount} ${realTimeMetrics.certificationsCount === 1 ? 'certificate' : 'certificates'} uploaded` : 
                  'No certificates yet',
                progress: null,
                icon: Award,
                gradient: "from-purple-400 to-purple-600",
                bgGradient: "from-purple-50 to-purple-100"
              },
              {
                title: "CGPA",
                value: realTimeMetrics.cgpa > 0 ? realTimeMetrics.cgpa.toFixed(2) : 'N/A',
                subtitle: getCGPAGrade(realTimeMetrics.cgpa),
                progress: realTimeMetrics.cgpa > 0 ? Math.round((realTimeMetrics.cgpa / 10) * 100) : 0,
                icon: BookOpen,
                gradient: "from-emerald-400 to-emerald-600",
                bgGradient: "from-emerald-50 to-emerald-100"
              }
            ].map((metric, index) => (
              <Card 
                key={metric.title} 
                className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 bg-gradient-to-br ${metric.bgGradient} group cursor-pointer`}
                onClick={() => {
                  // Add click functionality to show detailed metric information
                  console.log(`Clicked on ${metric.title} metric`);
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
                      Updated now
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
    </div>
  );
};

export default StudentDashboard;