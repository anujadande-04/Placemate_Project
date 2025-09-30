import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Target, 
  Award, 
  BookOpen, 
  Upload, 
  Brain,
  Building2,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const StudentDashboard = () => 
  {
    const navigate = useNavigate();

    const handleLogout = async () => {
    try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    navigate("/login"); // Redirect user to login page
    } 
    catch (err) 
    {
    console.error("Error logging out:", err.message);
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
                Student Dashboard
              </h1>
              <p className="text-lg text-gray-600 font-medium mt-1">Welcome back, John Doe</p>
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

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: "Placement Score",
                value: "85/100",
                subtitle: "+5 from last assessment",
                progress: 85,
                icon: TrendingUp,
                gradient: "from-pink-400 to-pink-600",
                bgGradient: "from-pink-50 to-pink-100"
              },
              {
                title: "Skills Completed",
                value: "12/15",
                subtitle: "3 assessments pending",
                progress: 80,
                icon: Target,
                gradient: "from-blue-400 to-blue-600",
                bgGradient: "from-blue-50 to-blue-100"
              },
              {
                title: "Certifications",
                value: "8",
                subtitle: "2 in progress",
                progress: null,
                icon: Award,
                gradient: "from-purple-400 to-purple-600",
                bgGradient: "from-purple-50 to-purple-100"
              },
              {
                title: "CGPA",
                value: "8.5",
                subtitle: "Excellent performance",
                progress: null,
                icon: BookOpen,
                gradient: "from-emerald-400 to-emerald-600",
                bgGradient: "from-emerald-50 to-emerald-100"
              }
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
                  {metric.progress && (
                    <Progress value={metric.progress} className="mt-3 h-2" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm p-2 rounded-xl shadow-lg">
              {["Overview", "Profile", "Skills", "Prediction", "Companies"].map((tab, index) => (
                <TabsTrigger 
                  key={tab.toLowerCase()}
                  value={tab.toLowerCase()} 
                  className="font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-gray-700"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Prediction Card */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <span className="bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent">
                        AI Placement Prediction
                      </span>
                    </CardTitle>
                    <CardDescription className="text-gray-600 font-medium">
                      Based on your current profile and market trends
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent mb-2">
                        92%
                      </div>
                      <p className="text-gray-600 font-medium">
                        High probability of placement
                      </p>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: "Technical Skills", value: 90, color: "bg-blue-500" },
                        { label: "Academic Performance", value: 95, color: "bg-green-500" },
                        { label: "Soft Skills", value: 85, color: "bg-purple-500" }
                      ].map((skill) => (
                        <div key={skill.label}>
                          <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                            <span>{skill.label}</span>
                            <span>{skill.value}%</span>
                          </div>
                          <Progress value={skill.value} className="h-3" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommended Actions */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                  <CardHeader>
                    <CardTitle className="text-xl bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
                      Recommended Actions
                    </CardTitle>
                    <CardDescription className="text-gray-600 font-medium">
                      Complete these to improve your placement chances
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { icon: Upload, text: "Update Resume", button: "Upload", gradient: "from-pink-400 to-pink-600" },
                      { icon: Target, text: "Complete React Assessment", button: "Start", gradient: "from-blue-400 to-blue-600" },
                      { icon: Award, text: "Add Project Documentation", button: "Add", gradient: "from-purple-400 to-purple-600" }
                    ].map((action, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full bg-gradient-to-r ${action.gradient}`}>
                            <action.icon className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{action.text}</span>
                        </div>
                        <Button 
                          size="sm" 
                          className={`bg-gradient-to-r ${action.gradient} hover:opacity-90 text-white font-semibold rounded-lg transform transition-all duration-300 hover:scale-105`}
                        >
                          {action.button}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl hover:shadow-md transition-shadow duration-300">
                      <div className="h-3 w-3 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">Completed JavaScript Assessment</p>
                        <p className="text-xs text-gray-600 mt-1">Score: 88/100 • 2 hours ago</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-3 py-1 text-xs font-semibold">
                        Completed
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl hover:shadow-md transition-shadow duration-300">
                      <div className="h-3 w-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">TCS Placement Drive Registration</p>
                        <p className="text-xs text-gray-600 mt-1">Deadline: Tomorrow • 1 day ago</p>
                      </div>
                      <Badge variant="outline" className="border-2 border-orange-300 text-orange-600 px-3 py-1 text-xs font-semibold">
                        Pending
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="profile">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Profile Management
                  </CardTitle>
                  <CardDescription className="text-gray-600 font-medium">
                    Keep your profile updated to get better predictions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Profile management interface coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Skills Assessment
                  </CardTitle>
                  <CardDescription className="text-gray-600 font-medium">
                    Take assessments to evaluate your technical and soft skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Skills assessment interface coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="prediction">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Detailed Prediction Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-600 font-medium">
                    Comprehensive AI analysis of your placement probability
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Detailed prediction interface coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="companies">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Recommended Companies
                  </CardTitle>
                  <CardDescription className="text-gray-600 font-medium">
                    Companies matching your profile and skills
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { name: "TCS", role: "Software Developer", package: "7.5 LPA", match: "95%", gradient: "from-blue-50 to-blue-100" },
                      { name: "Infosys", role: "System Engineer", package: "6.5 LPA", match: "88%", gradient: "from-green-50 to-green-100" },
                      { name: "Wipro", role: "Developer Trainee", package: "6.0 LPA", match: "82%", gradient: "from-purple-50 to-purple-100" },
                    ].map((company, index) => (
                      <Card key={index} className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 bg-gradient-to-br ${company.gradient} group cursor-pointer`}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                                <Building2 className="h-4 w-4 text-white" />
                              </div>
                              <span className="font-bold text-gray-800 text-lg">{company.name}</span>
                            </div>
                            <Badge className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-3 py-1 text-xs font-semibold">
                              {company.match} match
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 font-medium">{company.role}</p>
                          <p className="text-lg font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                            {company.package}
                          </p>
                          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-lg transform transition-all duration-300 hover:scale-105">
                            Apply Now
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

export default StudentDashboard;