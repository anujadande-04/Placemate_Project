// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Input } from "@/components/ui/input";
// import { 
//   Users, 
//   Building2, 
//   TrendingUp, 
//   Calendar,
//   Search,
//   Filter,
//   Download,
//   Plus,
//   BarChart3,
//   Target
// } from "lucide-react";

// const AdminDashboard = () => {
//   return (
//     <div className="min-h-screen bg-background p-6">
//       <div className="max-w-7xl mx-auto space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
//             <p className="text-muted-foreground">Placement Officer Portal</p>
//           </div>
//           <div className="flex items-center gap-3">
//             <Button variant="outline" size="sm">
//               <Download className="h-4 w-4 mr-2" />
//               Export Reports
//             </Button>
//             <Button size="sm">
//               <Plus className="h-4 w-4 mr-2" />
//               Add Placement Drive
//             </Button>
//           </div>
//         </div>

//         {/* Key Metrics */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Students</CardTitle>
//               <Users className="h-4 w-4 text-primary" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">1,247</div>
//               <p className="text-xs text-muted-foreground">+12% from last year</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Placement Rate</CardTitle>
//               <TrendingUp className="h-4 w-4 text-primary" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-primary">87.5%</div>
//               <p className="text-xs text-muted-foreground">+3.2% from last year</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
//               <Building2 className="h-4 w-4 text-primary" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">156</div>
//               <p className="text-xs text-muted-foreground">+23 new partnerships</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Upcoming Drives</CardTitle>
//               <Calendar className="h-4 w-4 text-primary" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">18</div>
//               <p className="text-xs text-muted-foreground">This month</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Main Content */}
//         <Tabs defaultValue="students" className="space-y-6">
//           <TabsList className="grid w-full grid-cols-4">
//             <TabsTrigger value="students">Students</TabsTrigger>
//             <TabsTrigger value="companies">Companies</TabsTrigger>
//             <TabsTrigger value="analytics">Analytics</TabsTrigger>
//             <TabsTrigger value="reports">Reports</TabsTrigger>
//           </TabsList>

//           <TabsContent value="students" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <CardTitle>Student Management</CardTitle>
//                     <CardDescription>
//                       Monitor student profiles and placement readiness
//                     </CardDescription>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <div className="relative">
//                       <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
//                       <Input placeholder="Search students..." className="pl-9 w-64" />
//                     </div>
//                     <Button variant="outline" size="icon">
//                       <Filter className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {[
//                     { name: "John Doe", id: "CS2020001", cgpa: "8.5", score: "85", status: "Ready" },
//                     { name: "Jane Smith", id: "CS2020002", cgpa: "9.1", score: "92", status: "Excellent" },
//                     { name: "Mike Johnson", id: "CS2020003", cgpa: "7.8", score: "76", status: "Needs Improvement" },
//                     { name: "Sarah Wilson", id: "CS2020004", cgpa: "8.9", score: "88", status: "Ready" },
//                   ].map((student, index) => (
//                     <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
//                       <div className="flex items-center gap-4">
//                         <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
//                           <Users className="h-4 w-4 text-primary" />
//                         </div>
//                         <div>
//                           <p className="font-medium">{student.name}</p>
//                           <p className="text-sm text-muted-foreground">{student.id}</p>
//                         </div>
//                       </div>
//                       <div className="flex items-center gap-6">
//                         <div className="text-center">
//                           <p className="text-sm font-medium">CGPA</p>
//                           <p className="text-lg font-bold text-primary">{student.cgpa}</p>
//                         </div>
//                         <div className="text-center">
//                           <p className="text-sm font-medium">Score</p>
//                           <p className="text-lg font-bold">{student.score}/100</p>
//                         </div>
//                         <Badge 
//                           variant={student.status === "Excellent" ? "default" : 
//                                   student.status === "Ready" ? "secondary" : "destructive"}
//                         >
//                           {student.status}
//                         </Badge>
//                         <Button variant="outline" size="sm">
//                           View Details
//                         </Button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="companies" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Company Partnerships</CardTitle>
//                 <CardDescription>
//                   Manage placement drives and company relationships
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {[
//                     { name: "TCS", drives: 3, hired: 45, package: "7.5 LPA", status: "Active" },
//                     { name: "Infosys", drives: 2, hired: 32, package: "6.5 LPA", status: "Active" },
//                     { name: "Wipro", drives: 1, hired: 18, package: "6.0 LPA", status: "Scheduled" },
//                     { name: "Accenture", drives: 2, hired: 28, package: "8.0 LPA", status: "Active" },
//                   ].map((company, index) => (
//                     <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
//                       <CardContent className="p-4">
//                         <div className="flex items-center justify-between mb-4">
//                           <div className="flex items-center gap-2">
//                             <Building2 className="h-5 w-5 text-primary" />
//                             <span className="font-semibold">{company.name}</span>
//                           </div>
//                           <Badge variant={company.status === "Active" ? "default" : "secondary"}>
//                             {company.status}
//                           </Badge>
//                         </div>
//                         <div className="space-y-2 text-sm">
//                           <div className="flex justify-between">
//                             <span className="text-muted-foreground">Drives:</span>
//                             <span className="font-medium">{company.drives}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-muted-foreground">Hired:</span>
//                             <span className="font-medium">{company.hired}</span>
//                           </div>
//                           <div className="flex justify-between">
//                             <span className="text-muted-foreground">Package:</span>
//                             <span className="font-medium text-primary">{company.package}</span>
//                           </div>
//                         </div>
//                         <Button size="sm" className="w-full mt-4">
//                           Manage Drives
//                         </Button>
//                       </CardContent>
//                     </Card>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="analytics" className="space-y-6">
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <BarChart3 className="h-5 w-5 text-primary" />
//                     Placement Trends
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="h-64 flex items-center justify-center text-muted-foreground">
//                     Interactive placement trend chart will be displayed here
//                   </div>
//                 </CardContent>
//               </Card>

//               <Card>
//                 <CardHeader>
//                   <CardTitle className="flex items-center gap-2">
//                     <Target className="h-5 w-5 text-primary" />
//                     Department-wise Performance
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {[
//                       { dept: "Computer Science", rate: "92%", color: "bg-primary" },
//                       { dept: "Information Technology", rate: "88%", color: "bg-primary/80" },
//                       { dept: "Electronics", rate: "84%", color: "bg-primary/60" },
//                       { dept: "Mechanical", rate: "76%", color: "bg-primary/40" },
//                     ].map((dept, index) => (
//                       <div key={index} className="space-y-2">
//                         <div className="flex justify-between text-sm">
//                           <span>{dept.dept}</span>
//                           <span className="font-medium">{dept.rate}</span>
//                         </div>
//                         <div className="h-2 bg-muted rounded">
//                           <div 
//                             className={`h-full ${dept.color} rounded`}
//                             style={{ width: dept.rate }}
//                           ></div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </TabsContent>

//           <TabsContent value="reports" className="space-y-6">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Generate Reports</CardTitle>
//                 <CardDescription>
//                   Create comprehensive placement reports and analytics
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
//                     <CardContent className="p-4 text-center">
//                       <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
//                       <h3 className="font-medium mb-1">Placement Statistics</h3>
//                       <p className="text-sm text-muted-foreground mb-3">
//                         Overall placement rates and trends
//                       </p>
//                       <Button size="sm" className="w-full">
//                         Generate Report
//                       </Button>
//                     </CardContent>
//                   </Card>

//                   <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
//                     <CardContent className="p-4 text-center">
//                       <Users className="h-8 w-8 text-primary mx-auto mb-2" />
//                       <h3 className="font-medium mb-1">Student Performance</h3>
//                       <p className="text-sm text-muted-foreground mb-3">
//                         Individual student readiness analysis
//                       </p>
//                       <Button size="sm" className="w-full">
//                         Generate Report
//                       </Button>
//                     </CardContent>
//                   </Card>

//                   <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
//                     <CardContent className="p-4 text-center">
//                       <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
//                       <h3 className="font-medium mb-1">Company Analysis</h3>
//                       <p className="text-sm text-muted-foreground mb-3">
//                         Hiring patterns and company performance
//                       </p>
//                       <Button size="sm" className="w-full">
//                         Generate Report
//                       </Button>
//                     </CardContent>
//                   </Card>
//                 </div>
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Calendar,
  Search,
  Filter,
  Download,
  Plus,
  BarChart3,
  Target
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";


const AdminDashboard = () => 
  {
  const navigate = useNavigate();
  
  // State for admin creation dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    fullName: "",
    email: "",
    role: "",
    password: ""
  });
  const [dialogError, setDialogError] = useState("");
  const [dialogSuccess, setDialogSuccess] = useState("");

  // Debug: Log dialog state changes
  console.log("Dialog state:", isDialogOpen);

  const handleLogout = async() => 
  {
    try{
      const { error } = await supabase.auth.signOut();
      if(error) throw error;

      navigate("/login");
    }
    catch (err) 
    {
    console.error("Error logging out:", err.message);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialogError("");
    setDialogSuccess("");
    setIsCreating(true);

    try {
      // Validate form
      if (!newAdmin.fullName || !newAdmin.email || !newAdmin.role || !newAdmin.password) {
        setDialogError("Please fill in all fields.");
        setIsCreating(false);
        return;
      }

      if (newAdmin.password.length < 6) {
        setDialogError("Password must be at least 6 characters long.");
        setIsCreating(false);
        return;
      }

      // Create admin account using Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
        options: {
          data: {
            full_name: newAdmin.fullName,
            role: newAdmin.role,
          }
        }
      });

      if (error) {
        setDialogError(error.message);
        setIsCreating(false);
        return;
      }

      if (data.user) {
        setDialogSuccess(`Admin account created successfully! ${data.user.email_confirmed_at ? 'Account is ready to use.' : 'Verification email sent to ' + newAdmin.email}`);
        
        // Reset form
        setNewAdmin({
          fullName: "",
          email: "",
          role: "",
          password: ""
        });

        // Close dialog after 2 seconds
        setTimeout(() => {
          setIsDialogOpen(false);
          setDialogSuccess("");
        }, 2000);
      }
    } catch (err: any) {
      setDialogError("Failed to create admin account. Please try again.");
      console.error("Admin creation error:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const resetDialog = () => {
    console.log("Reset dialog function called");
    setNewAdmin({
      fullName: "",
      email: "",
      role: "",
      password: ""
    });
    setDialogError("");
    setDialogSuccess("");
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
              <Button className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Add Placement Drive
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
            {[
              {
                title: "Total Students",
                value: "1,247",
                subtitle: "+12% from last year",
                icon: Users,
                gradient: "from-blue-400 to-blue-600",
                bgGradient: "from-blue-50 to-blue-100"
              },
              {
                title: "Placement Rate",
                value: "87.5%",
                subtitle: "+3.2% from last year",
                icon: TrendingUp,
                gradient: "from-green-400 to-green-600",
                bgGradient: "from-green-50 to-green-100"
              },
              // {
              //   title: "Active Companies",
              //   value: "156",
              //   subtitle: "+23 new partnerships",
              //   icon: Building2,
              //   gradient: "from-purple-400 to-purple-600",
              //   bgGradient: "from-purple-50 to-purple-100"
              // },
              // {
              //   title: "Upcoming Drives",
              //   value: "18",
              //   subtitle: "This month",
              //   icon: Calendar,
              //   gradient: "from-pink-400 to-pink-600",
              //   bgGradient: "from-pink-50 to-pink-100"
              // }
            ].map((metric, index) => (
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
                  <div className="space-y-4">
                    {[
                      { name: "John Doe", id: "CS2020001", cgpa: "8.5", score: "85", status: "Ready" },
                      { name: "Jane Smith", id: "CS2020002", cgpa: "9.1", score: "92", status: "Excellent" },
                      { name: "Mike Johnson", id: "CS2020003", cgpa: "7.8", score: "76", status: "Needs Improvement" },
                      { name: "Sarah Wilson", id: "CS2020004", cgpa: "8.9", score: "88", status: "Ready" },
                    ].map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{student.name}</p>
                            <p className="text-sm text-gray-600">{student.id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">CGPA</p>
                            <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{student.cgpa}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Score</p>
                            <p className="text-lg font-bold text-gray-800">{student.score}/100</p>
                          </div>
                          <Badge 
                            className={`px-3 py-1 font-semibold ${
                              student.status === "Excellent" ? "bg-gradient-to-r from-green-400 to-blue-400 text-white" : 
                              student.status === "Ready" ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white" : 
                              "bg-gradient-to-r from-orange-400 to-red-400 text-white"
                            }`}
                          >
                            {student.status}
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
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admins" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl bg-gradient-to-r from-purple-700 to-pink-600 bg-clip-text text-transparent">
                        Admin Management
                      </CardTitle>
                      <CardDescription className="text-gray-600 font-medium">
                        Manage admin users and their permissions
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
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "John Admin", email: "admin@gmail.com", role: "Super Admin", status: "Active", lastLogin: "2 hours ago" },
                      { name: "Jane Coordinator", email: "jane.admin@college.edu", role: "Placement Coordinator", status: "Active", lastLogin: "1 day ago" },
                      { name: "Mike Officer", email: "mike.admin@college.edu", role: "Admin", status: "Inactive", lastLogin: "1 week ago" },
                    ].map((admin, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl hover:shadow-md transition-all duration-300 transform hover:scale-105">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{admin.name}</p>
                            <p className="text-sm text-gray-600">{admin.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Role</p>
                            <p className="text-sm font-bold text-gray-800">{admin.role}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Last Login</p>
                            <p className="text-sm text-gray-700">{admin.lastLogin}</p>
                          </div>
                          <Badge 
                            className={`px-3 py-1 font-semibold ${
                              admin.status === "Active" ? "bg-gradient-to-r from-green-400 to-blue-400 text-white" : 
                              "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
                            }`}
                          >
                            {admin.status}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-2 border-purple-300 text-purple-600 hover:bg-purple-50 font-semibold rounded-lg transform transition-all duration-300 hover:scale-105"
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-2 border-red-300 text-red-600 hover:bg-red-50 font-semibold rounded-lg transform transition-all duration-300 hover:scale-105"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <h3 className="font-bold text-lg text-gray-800 mb-3 flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      Add New Admin
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Input 
                        placeholder="Full Name" 
                        className="border-2 border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 rounded-lg"
                      />
                      <Input 
                        placeholder="Email Address" 
                        type="email"
                        className="border-2 border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 rounded-lg"
                      />
                      <select className="border-2 border-purple-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 rounded-lg px-3 py-2 text-gray-800 bg-white">
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="coordinator">Placement Coordinator</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg transform transition-all duration-300 hover:scale-105">
                        Create Admin
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      <strong>Note:</strong> New admin will receive an email with login credentials and setup instructions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* <TabsContent value="companies" className="space-y-6">
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
                      { 
                        icon: Building2, 
                        title: "Company Analysis", 
                        description: "Hiring patterns and company performance",
                        gradient: "from-purple-50 to-purple-100",
                        iconGradient: "from-purple-500 to-pink-500"
                      }
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