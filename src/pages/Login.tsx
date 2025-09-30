
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("student");
   const [errorMessage, setErrorMessage] = useState("");

 const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
 
  try {
      const { data, error } = await supabase.auth.signInWithPassword(
      {
        email,
        password,
      });

      if (error) {
        console.error("Login failed:", error.message);
        setErrorMessage(error.message);
        return;
      }
       else {
        console.log("Login success:", data);

        // Redirect based on userType
        if (userType === "student") {
          navigate("/dashboard/student");
        } else if (userType === "admin") {
          //navigate("/admin-dashboard"); // adjust if admin dashboard exists
          navigate("/dashboard/admin");
        }
        const user= data.user;
        if(!user)
        {
          setErrorMessage("No user found after login..");
          return;
        }

        // const role=user.user_metadata.role 
        // if(role === "student")
        // {
        //   navigate("/dashboard/student");
        // }
        // else if (role === "admin")
        // {
        //   navigate("/dashboard/admin");
        // } 
        // else 
        // {
        //   setErrorMessage("Unauthorized role. Please contact support.");
        // }
     }
    }
     catch (err: any) {
      console.error("Unexpected error:", err.message);
      setErrorMessage("Something went wrong. Please try again.");
    }
  
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-16 w-24 h-24 bg-pink-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-24 w-32 h-32 bg-blue-200 rounded-full opacity-25 animate-bounce"></div>
        <div className="absolute bottom-24 left-1/4 w-20 h-20 bg-purple-200 rounded-full opacity-30 animate-ping"></div>
        <div className="absolute bottom-32 right-1/4 w-28 h-28 bg-cyan-200 rounded-full opacity-15 animate-pulse"></div>
        <div className="absolute top-1/2 left-12 w-16 h-16 bg-rose-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-1/3 right-16 w-12 h-12 bg-indigo-200 rounded-full opacity-25 animate-ping"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6 group">
              <div className="relative">
                <GraduationCap className="h-14 w-14 text-blue-600 mr-3 transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                Placemate
              </h1>
            </div>
            <p className="text-lg text-gray-600 font-medium">
              Intelligent Student Placement Prediction Platform
            </p>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm transform transition-all duration-500 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-pink-600 bg-clip-text text-transparent">
                Welcome Back!
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Choose your account type and enter your credentials
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* User Type Tabs */}
              <Tabs value={userType} onValueChange={setUserType} className="mb-6">
                <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-blue-100 to-pink-100 p-1 rounded-xl">
                  <TabsTrigger 
                    value="student" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Student
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin" 
                    className="flex items-center gap-2 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <Users className="h-4 w-4" />
                    Admin
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-semibold">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border-2 border-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 text-black placeholder-gray-800 transition-all duration-300 bg-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-semibold">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-2 border-gray-600 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 rounded-lg px-4 py-3 text-black placeholder-gray-800 transition-all duration-300 bg-white"
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 hover:from-blue-600 hover:via-pink-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Sign In as {userType === "student" ? "Student" : "Admin"}
                </Button>
              </form>

              {/* Sign Up Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Button 
                    variant="link" 
                    className="p-0 text-blue-600 hover:text-pink-500 font-semibold transition-colors duration-300"
                  >
                    Sign up here
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Decorative Elements */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Secure • Fast • Reliable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
