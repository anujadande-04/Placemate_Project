
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
import html2canvas from 'html2canvas';


interface StudentData {
  id: string;
  created_at: string;
  email: string;
  full_name: string;
  cgpa: number;
  branch: string;
  profile_completed: boolean;
  placement_status: string;
  technologies: string[];
  projects: string[];
  internships: string[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Real-time data states
  const [students, setStudents] = useState<StudentData[]>([]);
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
  }, []);

  // Filter students based on search term
  useEffect(() => {
    const filtered = students.filter(student => 
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.branch?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('student_details')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
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
    const totalStudents = students.length;
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

    return Object.entries(branchCounts).map(([branch, count]) => ({
      name: branch,
      value: count
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
        pdf.text(`${branch.name}: ${branch.value} students`, 30, yPos);
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
        pdf.text(`${index + 1}. ${student.full_name || 'N/A'} - CGPA: ${student.cgpa || 'N/A'}`, 30, yPos);
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
              <Button variant="outline" className="border-2 border-blue-400 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transform transition-all duration-300 hover:scale-105">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
              {/* <Button className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Add Placement Drive
              </Button> */}
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
                  bgGradient: "from-blue-50 to-blue-100"
                },
                {
                  title: "Placement Rate",
                  value: `${placementRate}%`,
                  subtitle: `${students.filter(s => s.placement_status === 'placed').length} students placed`,
                  icon: TrendingUp,
                  gradient: "from-green-400 to-green-600",
                  bgGradient: "from-green-50 to-green-100"
                }
              ];
            })().map((metric, index) => (
              <Card key={metric.title} className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 bg-gradient-to-br ${metric.bgGradient} group cursor-pointer`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700 group-hover:text-gray-800 transition-colors">
                    {metric.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full bg-gradient-to-r ${metric.gradient} transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110`}>
                    <metric.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                    {metric.value}
                  </div>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors mt-1">
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
                      <Button variant="outline" size="icon" className="border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-lg">
                        <Filter className="h-4 w-4" />
                      </Button>
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
                      {filteredStudents.map((student, index) => {
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
                              <p className="font-semibold text-gray-800">{student.full_name || 'N/A'}</p>
                              <p className="text-sm text-gray-600">{student.email}</p>
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
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                      console.log("Dialog onOpenChange called with:", open);
                      setIsDialogOpen(open);
                      if (open) {
                        resetDialog();
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Admin
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] bg-white">
                        <DialogHeader>
                          <DialogTitle className="text-xl bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
                            Create New Admin Account
                          </DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Fill in the details to create a new admin account. The admin will receive login credentials via email.
                          </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-gray-700 font-semibold">
                              Full Name
                            </Label>
                            <Input
                              id="fullName"
                              type="text"
                              placeholder="Enter admin's full name"
                              value={newAdmin.fullName}
                              onChange={(e) => setNewAdmin({...newAdmin, fullName: e.target.value})}
                              className="border-2 border-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 rounded-lg"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 font-semibold">
                              Email Address
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="Enter admin's email"
                              value={newAdmin.email}
                              onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                              className="border-2 border-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 rounded-lg"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="role" className="text-gray-700 font-semibold">
                              Admin Role
                            </Label>
                            <select 
                              id="role"
                              value={newAdmin.role}
                              onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                              className="w-full border-2 border-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 rounded-lg px-3 py-2 text-gray-800 bg-white"
                              required
                            >
                              <option value="">Select Role</option>
                              <option value="admin">Admin</option>
                              <option value="coordinator">Placement Coordinator</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700 font-semibold">
                              Temporary Password
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              placeholder="Create temporary password (min 6 chars)"
                              value={newAdmin.password}
                              onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                              className="border-2 border-gray-300 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 rounded-lg"
                              required
                            />
                          </div>

                          {/* Success Message */}
                          {dialogSuccess && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm text-green-600 font-medium">
                                {dialogSuccess}
                              </p>
                            </div>
                          )}

                          {/* Error Message */}
                          {dialogError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <p className="text-sm text-red-600 font-medium">
                                {dialogError}
                              </p>
                            </div>
                          )}

                          <DialogFooter className="gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsDialogOpen(false)}
                              className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50"
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={isCreating}
                              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isCreating ? "Creating..." : "Create Admin"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
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

            <TabsContent value="reports" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Company Partnerships
                  </CardTitle>
                  <CardDescription className="text-gray-600 font-medium">
                    Manage placement drives and company relationships
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { name: "TCS", drives: 3, hired: 45, package: "7.5 LPA", status: "Active", gradient: "from-blue-50 to-blue-100" },
                      { name: "Infosys", drives: 2, hired: 32, package: "6.5 LPA", status: "Active", gradient: "from-green-50 to-green-100" },
                      { name: "Wipro", drives: 1, hired: 18, package: "6.0 LPA", status: "Scheduled", gradient: "from-purple-50 to-purple-100" },
                      { name: "Accenture", drives: 2, hired: 28, package: "8.0 LPA", status: "Active", gradient: "from-pink-50 to-pink-100" },
                    ].map((company, index) => (
                      <Card key={index} className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 bg-gradient-to-br ${company.gradient} group cursor-pointer`}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                                <Building2 className="h-5 w-5 text-white" />
                              </div>
                              <span className="font-bold text-gray-800 text-lg">{company.name}</span>
                            </div>
                            <Badge 
                              className={`px-3 py-1 font-semibold ${
                                company.status === "Active" ? "bg-gradient-to-r from-green-400 to-blue-400 text-white" : 
                                "bg-gradient-to-r from-yellow-400 to-orange-400 text-white"
                              }`}
                            >
                              {company.status}
                            </Badge>
                          </div>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-medium">Drives:</span>
                              <span className="font-bold text-gray-800">{company.drives}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-medium">Hired:</span>
                              <span className="font-bold text-gray-800">{company.hired}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 font-medium">Package:</span>
                              <span className="font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">{company.package}</span>
                            </div>
                          </div>
                          <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-lg transform transition-all duration-300 hover:scale-105">
                            Manage Drives
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent> */}

            {/* <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
                        Placement Trends
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-600 font-medium bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                      Interactive placement trend chart will be displayed here
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                        Department-wise Performance
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { dept: "Computer Science", rate: "92%", color: "bg-gradient-to-r from-blue-500 to-purple-500" },
                        { dept: "Information Technology", rate: "88%", color: "bg-gradient-to-r from-green-500 to-blue-500" },
                        { dept: "Electronics", rate: "84%", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
                        { dept: "Mechanical", rate: "76%", color: "bg-gradient-to-r from-orange-500 to-red-500" },
                      ].map((dept, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700">{dept.dept}</span>
                            <span className="font-bold text-gray-800">{dept.rate}</span>
                          </div>
                          <div className="h-3 bg-gray-200 rounded-full">
                            <div 
                              className={`h-full ${dept.color} rounded-full`}
                              style={{ width: dept.rate }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent> */}

            <TabsContent value="reports" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Generate Reports
                  </CardTitle>
                  <CardDescription className="text-gray-600 font-medium">
                    Create comprehensive placement reports and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { 
                        icon: BarChart3, 
                        title: "Placement Statistics", 
                        description: "Overall placement rates and trends",
                        gradient: "from-blue-50 to-blue-100",
                        iconGradient: "from-blue-500 to-purple-500"
                      },
                      { 
                        icon: Users, 
                        title: "Student Performance", 
                        description: "Individual student readiness analysis",
                        gradient: "from-green-50 to-green-100",
                        iconGradient: "from-green-500 to-blue-500"
                      },
                      // { 
                      //   icon: Building2, 
                      //   title: "Company Analysis", 
                      //   description: "Hiring patterns and company performance",
                      //   gradient: "from-purple-50 to-purple-100",
                      //   iconGradient: "from-purple-500 to-pink-500"
                      // }
                    ].map((report, index) => (
                      <Card key={index} className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 bg-gradient-to-br ${report.gradient} group cursor-pointer`}>
                        <CardContent className="p-6 text-center">
                          <div className={`p-3 rounded-full bg-gradient-to-r ${report.iconGradient} mx-auto mb-4 w-fit transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110`}>
                            <report.icon className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">{report.title}</h3>
                          <p className="text-sm text-gray-600 mb-4 group-hover:text-gray-700 transition-colors">
                            {report.description}
                          </p>
                          <Button className={`w-full bg-gradient-to-r ${report.iconGradient} hover:opacity-90 text-white font-bold rounded-lg transform transition-all duration-300 hover:scale-105`}>
                            Generate Report
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
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