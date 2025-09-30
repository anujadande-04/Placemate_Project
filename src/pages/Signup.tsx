import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const userType = "student"; // Fixed to student only
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    // Validation
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      setIsLoading(false);
      return;
    }

    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
            role: userType, // Set the role during signup
          }
        }
      });

      if (error) {
        console.error("Signup failed:", error.message);
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        if (!data.user.email_confirmed_at) {
          setSuccessMessage("Please check your email for verification link before logging in.");
        } else {
          setSuccessMessage("Account created successfully! Redirecting to login...");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      }
    } catch (err: any) {
      console.error("Unexpected error:", err.message);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
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
              Join the Intelligent Student Placement Platform
            </p>
          </div>

          {/* Signup Card */}
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm transform transition-all duration-500 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-pink-600 bg-clip-text text-transparent">
                Create Student Account
              </CardTitle>
              <CardDescription className="text-gray-600 font-medium">
                Join as a student to access placement predictions and career guidance
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {/* Student Registration Info */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-pink-500">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Student Registration</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Create your student account to access placement predictions, skill assessments, and career guidance.
                </p>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-700 font-semibold">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="border-2 border-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 text-black placeholder-gray-800 transition-all duration-300 bg-white"
                  />
                </div>

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
                    placeholder="Create a password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-2 border-gray-600 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 rounded-lg px-4 py-3 text-black placeholder-gray-800 transition-all duration-300 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-semibold">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border-2 border-gray-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 rounded-lg px-4 py-3 text-black placeholder-gray-800 transition-all duration-300 bg-white"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 hover:from-blue-600 hover:via-pink-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl transform transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Creating Student Account..." : "Create Student Account"}
                </Button>
              </form>

              {/* Success Message Display */}
              {successMessage && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600 font-medium text-center">
                    {successMessage}
                  </p>
                </div>
              )}

              {/* Error Message Display */}
              {errorMessage && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium text-center">
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* Login Link */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link 
                    to="/login"
                    className="text-blue-600 hover:text-pink-500 font-semibold transition-colors duration-300"
                  >
                    Sign in here
                  </Link>
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

export default Signup;
