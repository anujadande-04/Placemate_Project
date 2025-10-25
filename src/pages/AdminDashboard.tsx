import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  created_at: string;
  updated_at: string;
  name: string;
  cgpa: number;
  branch: string;
  profile_completed: boolean;
  technologies: string[];
  projects: string[];
  internships: string[];
  experience: string;
  resume_url: string;
  certifications_urls: string[];
  placement_status?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Real-time data states
  const [students, setStudents] = useState<StudentData[]>([]);
  const [totalRegisteredCount, setTotalRegisteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  
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
  }, []);

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
      
      // Try multiple approaches to get student count
      let allStudents: StudentData[] = [];
      
      // Method 1: Get from student_details table
      const { data: studentDetails, error: detailsError } = await supabase
        .from('student_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentDetails && !detailsError) {
        allStudents = studentDetails;
        console.log(`📊 Found ${studentDetails.length} students with profile details`);
      }

      // Method 2: Create a more comprehensive approach 
      // Since we might not have access to auth.users, let's use a different strategy

      // Method 3: If still no data, try a simple count query
      if (allStudents.length === 0) {
        const { count, error: countError } = await supabase
          .from('student_details')
          .select('*', { count: 'exact', head: true });
          
        console.log(`� Count query result: ${count} students`);
        
        if (count && count > 0) {
          // Create placeholder entries for the count
          const placeholderStudents: StudentData[] = Array.from({ length: count }, (_, index) => ({
            id: `placeholder-${index}`,
            name: `Student ${index + 1}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            branch: 'Not Specified',
            cgpa: null,
            profile_completed: false,
            technologies: [],
            projects: [],
            internships: [],
            experience: '',
            resume_url: '',
            certifications_urls: []
          }));
          
          allStudents = placeholderStudents;
        }
      }
      
      console.log(`✅ Total students to display: ${allStudents.length}`);
      setStudents(allStudents);
      
    } catch (error) {
      console.error('❌ Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalRegisteredCount = async () => {
    try {
      // Method 1: Check if there's a profiles table or users table
      const { count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (profilesCount && profilesCount > 0) {
        console.log(`📊 Found ${profilesCount} registered users in profiles table`);
        setTotalRegisteredCount(profilesCount);
        return;
      }

      // Method 2: Use student_details count as fallback
      const { count: studentsCount } = await supabase
        .from('student_details')
        .select('*', { count: 'exact', head: true });
      
      console.log(`📊 Found ${studentsCount || 0} students in student_details table`);
      setTotalRegisteredCount(studentsCount || 0);

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
    const totalStudents = Math.max(totalRegisteredCount, students.length); // Use the higher count
    const completedProfiles = students.filter(s => s.profile_completed).length;
    const placedStudents = students.filter(s => s.placement_status === 'placed').length;
    const placementRate = totalStudents > 0 ? (placedStudents / totalStudents * 100).toFixed(1) : "0";
    
    return { totalStudents, completedProfiles, placedStudents, placementRate };
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
      const { totalStudents, placedStudents, placementRate } = getStatistics();
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
      pdf.text(`Students Placed: ${placedStudents}`, 30, 115);
      pdf.text(`Placement Rate: ${placementRate}%`, 30, 130);

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
                onClick={exportPlacementStats}
                variant="outline" 
                className="border-2 border-blue-400 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transform transition-all duration-300 hover:scale-105"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Reports
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
              const { totalStudents, placementRate } = getStatistics();
              return [
                {
                  title: "Total Students",
                  value: totalStudents.toString(),
                  subtitle: `${students.filter(s => s.profile_completed).length} profiles completed`,
                  icon: Users,
                  gradient: "from-blue-400 to-blue-600",
                  bgGradient: "from-gray-800 to-black"
                },
                {
                  title: "Placement Rate",
                  value: `${placementRate}%`,
                  subtitle: `${students.filter(s => s.placement_status === 'placed').length} students placed`,
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
                          if (student.placement_status === 'placed') return { text: "Placed", color: "bg-gradient-to-r from-green-400 to-blue-400" };
                          if ((student.cgpa || 0) >= 8.5) return { text: "Excellent", color: "bg-gradient-to-r from-blue-400 to-purple-400" };
                          if ((student.cgpa || 0) >= 7.0) return { text: "Good", color: "bg-gradient-to-r from-blue-400 to-purple-400" };
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
                              <Badge className={`px-3 py-1 font-semibold text-white ${status.color}`}>
                                {status.text}
                              </Badge>
                              <Button 
                                variant="outline" 
                                size="sm"
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
                          const { totalStudents, placedStudents, placementRate } = getStatistics();
                          return [
                            { label: "Total Students Registered", value: totalStudents },
                            { label: "Students Placed", value: placedStudents },
                            { label: "Placement Rate", value: `${placementRate}%` },
                            { label: "Profiles Completed", value: students.filter(s => s.profile_completed).length }
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
    </div>
  );
};

export default AdminDashboard;