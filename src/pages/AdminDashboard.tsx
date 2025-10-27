import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SimpleChart, SimpleDonutChart } from "@/components/ui/charts";
import { 
  Users, 
  TrendingUp, 
  Search,
  Download,
  BarChart3,
  Target,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  FileText,
  PieChart
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from 'jspdf';

interface StudentData {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  name: string | null;
  cgpa: number | null;
  branch: string | null;
  profile_completed: boolean | null;
  technologies: string[] | null;
  projects: string[] | null;
  internships: string[] | null;
  experience: string | null;
  resume_url: string | null;
  certifications_urls: string[] | null;
  ats_score: number | null;
  ats_analysis: any | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Real-time data states
  const [students, setStudents] = useState<StudentData[]>([]);
  const [totalRegisteredCount, setTotalRegisteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  
  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Load real-time student data
  useEffect(() => {
    fetchStudentData();
    fetchTotalRegisteredCount();

    // Set up auto-refresh every 30 seconds to catch new student registrations
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing student data...');
      fetchStudentData();
      fetchTotalRegisteredCount();
    }, 30000); // 30 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Test function to add sample data (for testing purposes)
  const addSampleStudents = async () => {
    try {
      console.log('🔍 Starting to add sample students...');
      
      // Check current user authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('❌ Authentication check failed:', authError);
        alert('Authentication failed. Please log in again.');
        return;
      }
      console.log('✅ User authenticated:', user.email);
      
      // First, let's test database connectivity
      console.log('🔧 Testing database connectivity...');
      const { data: testData, error: testError } = await supabase
        .from('student_details')
        .select('count(*)', { count: 'exact', head: true });
      
      if (testError) {
        console.error('❌ Database connectivity test failed:', testError);
        alert('Database connection failed: ' + testError.message);
        return;
      }
      
      console.log('✅ Database connectivity test passed');
      
      // Create sample students one by one to avoid potential batch issues
      const sampleStudents = [
        {
          id: `sample-${Date.now()}-1`,
          name: "John Doe",
          cgpa: 8.5,
          branch: "Computer Science Engineering",
          profile_completed: true,
          technologies: ["React", "Node.js", "Python", "JavaScript", "MongoDB"],
          projects: ["E-commerce Website", "Mobile App", "AI Chatbot"],
          internships: ["Tech Company Summer Intern", "Microsoft Internship"],
          experience: "1 year internship at ABC Tech Company with full-stack development",
          resume_url: null,
          certifications_urls: [],
          ats_score: 88,
          ats_analysis: {
            overallScore: 88,
            strengths: ["Strong technical keywords", "Well-structured sections", "Good formatting"],
            weaknesses: ["Could add more soft skills"]
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: `sample-${Date.now()}-2`,
          name: "Jane Smith",
          cgpa: 9.2,
          branch: "Information Technology",
          profile_completed: true,
          technologies: ["Java", "Spring Boot", "MySQL", "Angular", "Docker", "AWS"],
          projects: ["Banking System", "Inventory Management", "Cloud Deployment"],
          internships: ["Google Summer Internship", "Amazon Web Services Intern"],
          experience: "2 years software development experience",
          resume_url: null,
          certifications_urls: [],
          ats_score: 92,
          ats_analysis: {
            overallScore: 92,
            strengths: ["Excellent keyword optimization", "Perfect formatting", "Complete sections"],
            weaknesses: ["Minor improvements in readability"]
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: `sample-${Date.now()}-3`,
          name: "Alex Johnson",
          cgpa: 6.8,
          branch: "Electronics Engineering",
          profile_completed: true,
          technologies: ["C++", "Arduino", "MATLAB", "IoT"],
          projects: ["IoT Home Automation"],
          internships: [],
          experience: null,
          resume_url: null,
          certifications_urls: [],
          ats_score: 45,
          ats_analysis: {
            overallScore: 45,
            strengths: ["Basic sections present"],
            weaknesses: ["Limited keywords", "Poor formatting", "Missing key sections"]
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: `sample-${Date.now()}-4`,
          name: "Sarah Williams",
          cgpa: 8.9,
          branch: "Computer Science Engineering",
          profile_completed: true,
          technologies: ["Python", "Machine Learning", "TensorFlow", "Data Science", "Pandas", "NumPy"],
          projects: ["Prediction Model", "Data Analysis Dashboard", "ML Classifier", "Deep Learning Project"],
          internships: ["Data Science Intern at IBM", "AI Research Intern"],
          experience: "Research assistant for 2 years with machine learning focus",
          resume_url: null,
          certifications_urls: [],
          ats_score: 91,
          ats_analysis: {
            overallScore: 91,
            strengths: ["Excellent technical keywords", "Perfect structure", "Industry-relevant content"],
            weaknesses: ["Could enhance soft skills section"]
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: `sample-${Date.now()}-5`,
          name: "Mike Brown",
          cgpa: 7.2,
          branch: "Information Technology",
          profile_completed: true,
          technologies: ["JavaScript", "React", "CSS", "HTML"],
          projects: ["Portfolio Website", "Simple Calculator"],
          internships: ["Local Company Intern"],
          experience: "6 months internship in web development",
          resume_url: null,
          certifications_urls: [],
          ats_score: 67,
          ats_analysis: {
            overallScore: 67,
            strengths: ["Good basic structure", "Relevant skills listed"],
            weaknesses: ["Limited technical depth", "Could improve keyword usage"]
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      console.log('📝 Sample students prepared:', sampleStudents.length);
      console.log('📊 Sample student structure:', Object.keys(sampleStudents[0]));

      // Try to insert students one by one to identify specific issues
      let successCount = 0;
      let errors = [];

      for (let i = 0; i < sampleStudents.length; i++) {
        const student = sampleStudents[i];
        console.log(`📝 Adding student ${i + 1}: ${student.name}...`);
        
        const { data, error } = await supabase
          .from('student_details')
          .insert([student])
          .select();

        if (error) {
          console.error(`❌ Error adding student ${student.name}:`, error);
          errors.push(`${student.name}: ${error.message}`);
        } else {
          console.log(`✅ Successfully added student ${student.name}:`, data);
          successCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        alert(`Successfully added ${successCount} out of ${sampleStudents.length} students!`);
        fetchStudentData(); // Refresh the data
      }
      
      if (errors.length > 0) {
        console.error('❌ Errors occurred:', errors);
        alert('Some errors occurred:\n' + errors.join('\n'));
      }
      
    } catch (error) {
      console.error('❌ Critical error in addSampleStudents:', error);
      alert('Critical error adding sample students: ' + (error as Error).message);
    }
  };

  // Filter students based on search term
  useEffect(() => {
    const filtered = students.filter(student => 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.branch?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching all registered students...');
      
      // Method 1: Get students from student_details table
      const { data: studentDetails, error: detailsError, count } = await supabase
        .from('student_details')
        .select('*', { count: 'exact' });

      console.log('📊 Student Details Query Result:', {
        data: studentDetails,
        error: detailsError,
        count: count,
        dataLength: studentDetails?.length || 0
      });

      let allStudents: StudentData[] = [];

      if (!detailsError && studentDetails) {
        allStudents = studentDetails;
        console.log(`✅ Found ${allStudents.length} students in student_details table`);
      } else {
        console.log('⚠️ No data in student_details table or error occurred');
        if (detailsError) {
          console.error('Error details:', detailsError);
        }
      }

      // Method 2: Always check profiles table to get all registered users (even if student_details has data)
      console.log('🔍 Checking profiles table for all registered users...');
      
      const { data: profiles, error: profilesError, count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      console.log('👥 Profiles Query Result:', {
        data: profiles,
        error: profilesError,
        count: profilesCount,
        dataLength: profiles?.length || 0
      });

      if (!profilesError && profiles && profiles.length > 0) {
        // Create a map of existing student_details by ID for quick lookup
        const studentDetailsMap = new Map(allStudents.map(s => [s.id, s]));
        
        // Add any users from profiles who don't have student_details yet
        profiles.forEach((profile: any) => {
          if (!studentDetailsMap.has(profile.id)) {
            allStudents.push({
              id: profile.id,
              name: profile.full_name || profile.email || 'New Student',
              created_at: profile.created_at || null,
              updated_at: profile.updated_at || null,
              cgpa: null,
              branch: null,
              profile_completed: false,
              technologies: [],
              projects: [],
              internships: [],
              experience: null,
              resume_url: null,
              certifications_urls: [],
              ats_score: null,
              ats_analysis: null
            });
          }
        });
        
        console.log(`📊 Total students after merging profiles: ${allStudents.length}`);
        console.log(`📊 Students with completed profiles: ${allStudents.filter(s => s.profile_completed).length}`);
        console.log(`📊 Students with only basic registration: ${allStudents.filter(s => !s.profile_completed).length}`);
      }

      // Method 3: If still no data, show debug information
      if (allStudents.length === 0) {
        console.log('⚠️ No students found in either table');
        
        // Test database connectivity
        const { data: testData, error: testError } = await supabase
          .from('student_details')
          .select('count(*)', { head: true, count: 'exact' });
        
        console.log('🔧 Database connectivity test:', {
          accessible: !testError,
          error: testError,
          count: testData
        });
      } else {
        // Log sample data for debugging
        console.log('📊 Student data summary:', {
          total: allStudents.length,
          completed_profiles: allStudents.filter(s => s.profile_completed).length,
          branches: [...new Set(allStudents.map(s => s.branch).filter(Boolean))],
          names: allStudents.slice(0, 3).map(s => s.name),
          sample_student_structure: Object.keys(allStudents[0] || {})
        });
      }
      
      console.log(`✅ Setting ${allStudents.length} students in state`);
      setStudents(allStudents);
      
    } catch (error) {
      console.error('❌ Critical error fetching student data:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalRegisteredCount = async () => {
    try {
      // Get total count from profiles table (all registered users)
      const { count: profilesCount, error: profilesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (profilesError) {
        console.error('❌ Error fetching profiles count:', profilesError);
        setTotalRegisteredCount(0);
        return;
      }
      
      const totalCount = profilesCount || 0;
      console.log(`📊 Found ${totalCount} total registered users in profiles table`);
      setTotalRegisteredCount(totalCount);

    } catch (error) {
      console.error('❌ Error fetching total count:', error);
      setTotalRegisteredCount(0);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (err: any) {
      console.error("Error logging out:", err.message);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setIsChangingPassword(true);

    try {
      // Validate form
      if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
        setPasswordError("Please fill in all fields.");
        setIsChangingPassword(false);
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        setPasswordError("New password must be at least 6 characters long.");
        setIsChangingPassword(false);
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordError("New passwords do not match.");
        setIsChangingPassword(false);
        return;
      }

      // Update password using Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) {
        setPasswordError(error.message);
        setIsChangingPassword(false);
        return;
      }

      setPasswordSuccess("Password updated successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });

      setTimeout(() => {
        setPasswordSuccess("");
      }, 3000);

    } catch (err: any) {
      setPasswordError("Failed to update password. Please try again.");
      console.error("Password change error:", err);
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Calculate statistics from real student data
  const getStatistics = () => {
    const totalStudents = Math.max(students.length, totalRegisteredCount); // Use the higher of the two counts
    const completedProfiles = students.filter(s => s.profile_completed).length;
    const registeredOnly = students.filter(s => !s.profile_completed).length; // Students who only registered
    const activeStudents = students.filter(s => s.name && s.cgpa).length; // Students with detailed info
    const profileCompletionRate = totalStudents > 0 ? (completedProfiles / totalStudents * 100).toFixed(1) : "0";
    
    return { totalStudents, completedProfiles, activeStudents, registeredOnly, profileCompletionRate };
  };

  // Generate branch-wise data for charts
  const getBranchWiseData = () => {
    const branchCounts = students.reduce((acc, student) => {
      const branch = student.branch || 'Not Specified';
      acc[branch] = (acc[branch] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];
    
    return Object.entries(branchCounts).map(([branch, count], index) => ({
      label: branch,
      value: count,
      color: colors[index % colors.length]
    }));
  };

  // Export reports functionality
  const exportPlacementStats = async () => {
    try {
      const pdf = new jsPDF();
      const { totalStudents, completedProfiles, activeStudents, profileCompletionRate } = getStatistics();
      const branchData = getBranchWiseData();

      // Title
      pdf.setFontSize(20);
      pdf.text('Placement Statistics Report', 20, 30);

      // Date
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);

      // Statistics
      pdf.setFontSize(16);
      pdf.text('Overall Statistics', 20, 80);
      pdf.setFontSize(12);
      pdf.text(`Total Students: ${totalStudents}`, 30, 100);
      pdf.text(`Completed Profiles: ${completedProfiles}`, 30, 115);
      pdf.text(`Profile Completion Rate: ${profileCompletionRate}%`, 30, 130);
      pdf.text(`Active Students: ${activeStudents}`, 30, 145);

      // Branch-wise data
      pdf.setFontSize(16);
      pdf.text('Branch-wise Distribution', 20, 160);
      pdf.setFontSize(12);
      let yPos = 180;
      branchData.forEach((branch) => {
        pdf.text(`${branch.label}: ${branch.value} students`, 30, yPos);
        yPos += 15;
      });

      pdf.save('placement-statistics.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const exportStudentPerformance = async () => {
    try {
      const pdf = new jsPDF();

      // Title
      pdf.setFontSize(20);
      pdf.text('Student Performance Report', 20, 30);

      // Date
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);

      // Student performance data
      pdf.setFontSize(16);
      pdf.text('Top Performing Students', 20, 80);
      pdf.setFontSize(12);

      const topStudents = students
        .filter(s => s.cgpa && s.cgpa > 0)
        .sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0))
        .slice(0, 10);

      let yPos = 100;
      topStudents.forEach((student, index) => {
        pdf.text(`${index + 1}. ${student.name || 'N/A'} - CGPA: ${student.cgpa || 'N/A'}`, 30, yPos);
        yPos += 15;
      });

      pdf.save('student-performance.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

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
                Admin Dashboard
              </h1>
              <p className="text-lg text-gray-600 font-medium mt-1">Placement Officer Portal</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => {
                  fetchStudentData();
                  fetchTotalRegisteredCount();
                }}
                variant="outline" 
                className="border-2 border-green-400 text-green-600 hover:bg-green-50 font-semibold rounded-lg transform transition-all duration-300 hover:scale-105"
              >
                <Users className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
              <Button 
                onClick={exportPlacementStats}
                variant="outline" 
                className="border-2 border-blue-400 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transform transition-all duration-300 hover:scale-105"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
              <Button 
                onClick={addSampleStudents}
                variant="outline" 
                className="border-2 border-purple-400 text-purple-600 hover:bg-purple-50 font-semibold rounded-lg transform transition-all duration-300 hover:scale-105"
              >
                <Users className="h-4 w-4 mr-2" />
                Add Test Data
              </Button>
              <Button 
                onClick={async () => {
                  try {
                    console.log('🔧 Quick database test...');
                    const { data, error } = await supabase
                      .from('student_details')
                      .insert([{
                        id: `test-${Date.now()}`,
                        name: "Test Student",
                        cgpa: 8.0,
                        branch: "Test Branch",
                        profile_completed: true,
                        technologies: ["JavaScript"],
                        projects: ["Test Project"],
                        internships: ["Test Internship"],
                        experience: "Test Experience",
                        resume_url: null,
                        certifications_urls: [],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      }])
                      .select();
                    
                    if (error) {
                      console.error('❌ Quick test failed:', error);
                      alert('Quick test failed: ' + error.message);
                    } else {
                      console.log('✅ Quick test passed:', data);
                      alert('Quick test passed! Student added successfully.');
                      fetchStudentData();
                    }
                  } catch (err) {
                    console.error('❌ Quick test error:', err);
                    alert('Quick test error: ' + (err as Error).message);
                  }
                }}
                variant="outline"
                className="border-2 border-orange-400 text-orange-600 hover:bg-orange-50 font-semibold rounded-lg transform transition-all duration-300 hover:scale-105"
              >
                <Target className="h-4 w-4 mr-2" />
                Quick Test
              </Button>
              <Button
                onClick={handleLogout}
                className="ml-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg px-4 py-2 hover:scale-105 transition-transform duration-300">
                Logout
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(() => {
              const { totalStudents, completedProfiles, registeredOnly, profileCompletionRate } = getStatistics();
              return [
                {
                  title: "Total Registered",
                  value: totalStudents.toString(),
                  subtitle: `${completedProfiles} completed, ${registeredOnly} basic only`,
                  icon: Users,
                  gradient: "from-blue-400 to-blue-600",
                  bgGradient: "from-gray-800 to-black"
                },
                {
                  title: "Profile Completion",
                  value: `${profileCompletionRate}%`,
                  subtitle: `${completedProfiles} out of ${totalStudents} students`,
                  icon: TrendingUp,
                  gradient: "from-green-400 to-green-600",
                  bgGradient: "from-gray-800 to-black"
                }
              ];
            })().map((metric, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer">
                <CardHeader className={`bg-gradient-to-r ${metric.bgGradient} border-b group-hover:scale-105 transition-transform duration-300`}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white group-hover:text-gray-200 transition-colors">
                      {metric.title}
                    </CardTitle>
                    <metric.icon className={`h-6 w-6 bg-gradient-to-r ${metric.gradient} text-transparent bg-clip-text`} />
                  </div>
                </CardHeader>
                <CardContent className="bg-gradient-to-r from-gray-800 to-black">
                  <div className="text-3xl font-bold text-white group-hover:text-gray-200 transition-colors">
                    {metric.value}
                  </div>
                  <p className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors mt-1">
                    {metric.subtitle}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="students" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg">
              {["Students", "Admins", "Reports"].map((tab) => (
                <TabsTrigger 
                  key={tab.toLowerCase()}
                  value={tab.toLowerCase()} 
                  className="font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-gray-700"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl bg-gradient-to-r from-blue-700 to-pink-600 bg-clip-text text-transparent">
                        Student Management
                      </CardTitle>
                      <CardDescription className="text-gray-600 font-medium">
                        Monitor student profiles and placement readiness
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                        <Input 
                          placeholder="Search students..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9 w-64 border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 rounded-lg" 
                        />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-gray-600">Loading students...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredStudents.map((student) => {
                        const getStatus = (student: StudentData) => {
                          if (!student.profile_completed) return { text: "Incomplete", color: "bg-gradient-to-r from-orange-400 to-red-400" };
                          if ((student.cgpa || 0) >= 8.5) return { text: "Excellent", color: "bg-gradient-to-r from-green-400 to-blue-400" };
                          if ((student.cgpa || 0) >= 7.0) return { text: "Good", color: "bg-gradient-to-r from-blue-400 to-purple-400" };
                          if ((student.cgpa || 0) >= 6.0) return { text: "Average", color: "bg-gradient-to-r from-yellow-400 to-orange-400" };
                          return { text: "Needs Improvement", color: "bg-gradient-to-r from-orange-400 to-red-400" };
                        };
                        
                        const status = getStatus(student);
                        
                        return (
                          <div key={student.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-300 transform hover:scale-105">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">{student.name || 'N/A'}</p>
                                <p className="text-sm text-gray-600">ID: {student.id}</p>
                                <p className="text-xs text-gray-500">{student.branch || 'Branch not specified'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-600">CGPA</p>
                                <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                  {student.cgpa ? student.cgpa.toFixed(1) : 'N/A'}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-600">Projects</p>
                                <p className="text-lg font-bold text-gray-800">{student.projects?.length || 0}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-600">Skills</p>
                                <p className="text-lg font-bold text-purple-600">{student.technologies?.length || 0}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-600">Internships</p>
                                <p className="text-lg font-bold text-green-600">{student.internships?.length || 0}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-medium text-gray-600">ATS Score</p>
                                <p className={`text-lg font-bold ${
                                  student.ats_score 
                                    ? student.ats_score >= 85 ? 'text-green-600' 
                                      : student.ats_score >= 70 ? 'text-blue-600'
                                      : student.ats_score >= 50 ? 'text-yellow-600'
                                      : 'text-red-600'
                                    : 'text-gray-400'
                                }`}>
                                  {student.ats_score ? `${student.ats_score}%` : 'N/A'}
                                </p>
                              </div>
                              <Badge className={`px-3 py-1 font-semibold text-white ${status.color}`}>
                                {status.text}
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setShowStudentDetails(true);
                                }}
                                className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transform transition-all duration-300 hover:scale-105"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                      {filteredStudents.length === 0 && !loading && (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No students found</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admins Tab - Password Change */}
            <TabsContent value="admins" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
                <CardHeader>
                  <div>
                    <CardTitle className="text-xl bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Admin Settings
                    </CardTitle>
                    <CardDescription className="text-gray-600 font-medium">
                      Change your admin password and manage credentials
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-gray-700 font-semibold">
                        Current Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          placeholder="Enter current password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          className="border-2 border-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 rounded-lg pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                          onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-gray-700 font-semibold">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          placeholder="Enter new password (min 6 chars)"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          className="border-2 border-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 rounded-lg pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                          onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold">
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          placeholder="Confirm new password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          className="border-2 border-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 rounded-lg pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                          onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {passwordSuccess && (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">
                          {passwordSuccess}
                        </AlertDescription>
                      </Alert>
                    )}

                    {passwordError && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700">
                          {passwordError}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button 
                      type="submit" 
                      disabled={isChangingPassword}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isChangingPassword ? "Updating Password..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              {/* Placement Statistics Report */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Placement Statistics Report
                      </CardTitle>
                      <CardDescription className="text-gray-600 font-medium">
                        Branch-wise placement analytics and statistics
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={exportPlacementStats}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg transform transition-all duration-300 hover:scale-105"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Statistics Summary */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Overall Statistics</h3>
                      <div className="space-y-3">
                        {(() => {
                          const { totalStudents, completedProfiles, activeStudents, profileCompletionRate } = getStatistics();
                          return [
                            { label: "Total Students Registered", value: totalStudents },
                            { label: "Profiles Completed", value: completedProfiles },
                            { label: "Profile Completion Rate", value: `${profileCompletionRate}%` },
                            { label: "Active Students", value: activeStudents }
                          ];
                        })().map((stat, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                            <span className="text-gray-700 font-medium">{stat.label}</span>
                            <span className="text-xl font-bold text-blue-600">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Branch-wise Chart */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Branch-wise Distribution</h3>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-4 rounded-lg">
                        {(() => {
                          const branchData = getBranchWiseData();
                          return branchData.length > 0 ? (
                            <SimpleDonutChart data={branchData} />
                          ) : (
                            <div className="text-center py-8 text-gray-500">No data available</div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Student Performance Report */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Student Performance Report
                      </CardTitle>
                      <CardDescription className="text-gray-600 font-medium">
                        Individual student performance and analytics
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={exportStudentPerformance}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transform transition-all duration-300 hover:scale-105"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Performers */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Top Performers (CGPA)</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {students
                          .filter(s => s.cgpa && s.cgpa > 0)
                          .sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0))
                          .slice(0, 10)
                          .map((student, index) => (
                            <div key={student.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </div>
                                <span className="text-gray-700 font-medium">{student.name}</span>
                              </div>
                              <Badge className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                                {student.cgpa?.toFixed(2)} CGPA
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>
                    
                    {/* Performance Metrics */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800">Performance Metrics</h3>
                      <div className="space-y-3">
                        {[
                          { 
                            label: "High Performers (8.5+ CGPA)", 
                            value: students.filter(s => (s.cgpa || 0) >= 8.5).length 
                          },
                          { 
                            label: "Good Performers (7.0-8.5 CGPA)", 
                            value: students.filter(s => (s.cgpa || 0) >= 7.0 && (s.cgpa || 0) < 8.5).length 
                          },
                          { 
                            label: "Need Improvement (<7.0 CGPA)", 
                            value: students.filter(s => (s.cgpa || 0) > 0 && (s.cgpa || 0) < 7.0).length 
                          },
                          { 
                            label: "With Projects", 
                            value: students.filter(s => s.projects && s.projects.length > 0).length 
                          }
                        ].map((metric, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                            <span className="text-gray-700 font-medium">{metric.label}</span>
                            <span className="text-xl font-bold text-purple-600">{metric.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Student Details Dialog */}
      <Dialog open={showStudentDetails} onOpenChange={setShowStudentDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
              Student Profile Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedStudent && (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card className="border-2 border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="text-lg text-gray-800">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Full Name</Label>
                      <p className="text-lg font-medium text-gray-800">{selectedStudent.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Student ID</Label>
                      <p className="text-lg font-medium text-gray-800">{selectedStudent.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Branch</Label>
                      <p className="text-lg font-medium text-gray-800">{selectedStudent.branch || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">CGPA</Label>
                      <p className="text-lg font-medium text-gray-800">
                        {selectedStudent.cgpa ? selectedStudent.cgpa.toFixed(2) : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Profile Status</Label>
                      <Badge className={selectedStudent.profile_completed ? 'bg-green-500' : 'bg-orange-500'}>
                        {selectedStudent.profile_completed ? 'Complete' : 'Incomplete'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Academic Performance</Label>
                      <Badge className={
                        (selectedStudent.cgpa || 0) >= 8.5 ? 'bg-green-500' :
                        (selectedStudent.cgpa || 0) >= 7.0 ? 'bg-blue-500' :
                        (selectedStudent.cgpa || 0) >= 6.0 ? 'bg-yellow-500' : 'bg-orange-500'
                      }>
                        {(selectedStudent.cgpa || 0) >= 8.5 ? 'Excellent' :
                         (selectedStudent.cgpa || 0) >= 7.0 ? 'Good' :
                         (selectedStudent.cgpa || 0) >= 6.0 ? 'Average' : 'Needs Improvement'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Skills */}
              <Card className="border-2 border-green-100">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
                  <CardTitle className="text-lg text-gray-800">Technical Skills</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.technologies && selectedStudent.technologies.length > 0 ? (
                      selectedStudent.technologies.map((tech, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                          {tech}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">No technologies listed</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Projects */}
              <Card className="border-2 border-purple-100">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="text-lg text-gray-800">Projects</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {selectedStudent.projects && selectedStudent.projects.length > 0 ? (
                    <div className="space-y-2">
                      {selectedStudent.projects.map((project, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <p className="font-medium text-gray-800">{project}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No projects listed</p>
                  )}
                </CardContent>
              </Card>

              {/* Experience & Internships */}
              <Card className="border-2 border-orange-100">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
                  <CardTitle className="text-lg text-gray-800">Experience & Internships</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Work Experience</Label>
                      <p className="text-gray-800 mt-1">
                        {selectedStudent.experience || 'No work experience provided'}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Internships</Label>
                      {selectedStudent.internships && selectedStudent.internships.length > 0 ? (
                        <div className="space-y-2 mt-1">
                          {selectedStudent.internships.map((internship, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <p className="font-medium text-gray-800">{internship}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic mt-1">No internships listed</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card className="border-2 border-gray-100">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <CardTitle className="text-lg text-gray-800">Documents</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Resume</Label>
                      <p className="text-gray-800">
                        {selectedStudent.resume_url ? (
                          <a 
                            href={selectedStudent.resume_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Resume
                          </a>
                        ) : (
                          <span className="text-gray-500 italic">No resume uploaded</span>
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Certifications</Label>
                      {selectedStudent.certifications_urls && selectedStudent.certifications_urls.length > 0 ? (
                        <div className="space-y-1 mt-1">
                          {selectedStudent.certifications_urls.map((cert, index) => (
                            <a 
                              key={index} 
                              href={cert} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block text-blue-600 hover:underline"
                            >
                              Certificate {index + 1}
                            </a>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 italic mt-1">No certifications uploaded</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ATS Resume Analysis */}
              <Card className="border-2 border-cyan-100">
                <CardHeader className="bg-gradient-to-r from-cyan-50 to-teal-50">
                  <CardTitle className="text-lg text-gray-800">ATS Resume Analysis</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">ATS Compatibility Score</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-2xl font-bold ${
                          selectedStudent.ats_score 
                            ? selectedStudent.ats_score >= 85 ? 'text-green-600' 
                              : selectedStudent.ats_score >= 70 ? 'text-blue-600'
                              : selectedStudent.ats_score >= 50 ? 'text-yellow-600'
                              : 'text-red-600'
                            : 'text-gray-400'
                        }`}>
                          {selectedStudent.ats_score ? `${selectedStudent.ats_score}%` : 'Not analyzed'}
                        </span>
                        {selectedStudent.ats_score && (
                          <Badge className={
                            selectedStudent.ats_score >= 85 ? 'bg-green-500' 
                              : selectedStudent.ats_score >= 70 ? 'bg-blue-500'
                              : selectedStudent.ats_score >= 50 ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }>
                            {selectedStudent.ats_score >= 85 ? 'Excellent' 
                              : selectedStudent.ats_score >= 70 ? 'Good'
                              : selectedStudent.ats_score >= 50 ? 'Decent'
                              : 'Needs Improvement'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Impact on Placement</Label>
                      <p className="text-gray-800 mt-1">
                        {selectedStudent.ats_score 
                          ? selectedStudent.ats_score >= 85 
                            ? 'Excellent ATS score will significantly boost placement chances'
                            : selectedStudent.ats_score >= 70 
                            ? 'Good ATS score will improve placement chances'
                            : selectedStudent.ats_score >= 50 
                            ? 'Decent ATS score provides moderate help'
                            : 'Poor ATS score may hurt placement chances - needs improvement'
                          : 'No ATS analysis available - recommend analyzing resume for better placement prediction'
                        }
                      </p>
                    </div>
                  </div>
                  {selectedStudent.ats_analysis && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <Label className="text-sm font-semibold text-gray-600">Key Strengths</Label>
                      <ul className="mt-1 text-sm text-gray-700">
                        {selectedStudent.ats_analysis.strengths?.slice(0, 3).map((strength: string, index: number) => (
                          <li key={index} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Registration Information */}
              <Card className="border-2 border-indigo-100">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <CardTitle className="text-lg text-gray-800">Registration Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Registered On</Label>
                      <p className="text-gray-800">
                        {selectedStudent.created_at ? 
                          new Date(selectedStudent.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Not available'
                        }
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-gray-600">Last Updated</Label>
                      <p className="text-gray-800">
                        {selectedStudent.updated_at ? 
                          new Date(selectedStudent.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Not available'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;