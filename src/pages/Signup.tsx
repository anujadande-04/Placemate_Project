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

  // Debug function to test Supabase connection
  const testConnection = async () => {
    try {
      console.log("Testing Supabase connection...");
      console.log("Supabase URL:", "https://yduiaxjgolkiaydilfux.supabase.co");
      console.log("Current origin:", window.location.origin);
      
      // Test basic connection
      const response = await fetch("https://yduiaxjgolkiaydilfux.supabase.co/rest/v1/", {
        method: 'GET',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkdWlheGpnb2xraWF5ZGlsZnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMzM4MjIsImV4cCI6MjA3MzYwOTgyMn0.Ws16Qu16E98shNmhR5_myYnd7mUWPbLnI64iJZLvu6o'
        }
      });
      
      console.log("Direct fetch response:", response.status, response.statusText);
      
      // Test Supabase auth
      const { data, error } = await supabase.auth.getSession();
      console.log("Supabase auth test result:", { data, error });
      
      alert(`Connection tests:\nDirect fetch: ${response.ok ? 'Success' : 'Failed'}\nSupabase auth: ${error ? 'Failed - ' + error.message : 'Success'}`);
    } catch (err: any) {
      console.error("Connection test error:", err);
      alert(`Connection test failed: ${err.message}`);
    }
  };

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
      console.log("Attempting signup with:", { email, userType, fullName });
      
      // Test Supabase connection first
      const { data: testData, error: testError } = await supabase.auth.getSession();
      console.log("Supabase connection test:", { testData, testError });

      // Sign up the user with email confirmation redirect
      const redirectUrl = `${window.location.origin}/auth/callback`;
      console.log("Redirect URL:", redirectUrl);
      
      // Signup payload with email confirmation redirect
      const signupPayload = {
        email: email,
        password: password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: userType, // Set the role during signup
          }
        }
      };
      
      console.log("Signup payload:", signupPayload);
      
      let data, error;
      
      try {
        // First attempt with full payload
        const result = await supabase.auth.signUp(signupPayload);
        data = result.data;
        error = result.error;
      } catch (signupError: any) {
        console.error("First signup attempt failed:", signupError);
        
        // Fallback to minimal signup
        console.log("Trying minimal signup...");
        try {
          const result = await supabase.auth.signUp({
            email: email,
            password: password
          });
          data = result.data;
          error = result.error;
          console.log("Minimal signup result:", { data, error });
        } catch (minimalError: any) {
          console.error("Minimal signup also failed:", minimalError);
          throw minimalError;
        }
      }

      console.log("Signup response:", { data, error });

      if (error) {
        console.error("Signup failed:", error.message);
        setErrorMessage(`Signup failed: ${error.message}`);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Insert extra user info into profiles table (only id and name allowed by types)
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              { id: data.user.id, name: fullName }
            ]);
          if (profileError) {
            console.error("Profile insert failed:", profileError.message);
            setErrorMessage("Account created, but failed to save profile info.");
          }
        } catch (profileErr: any) {
          console.error("Unexpected profile error:", profileErr.message);
        }

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
      console.error("Unexpected error:", err);
      console.error("Error details:", {
        message: err.message,
        name: err.name,
        stack: err.stack,
        code: err.code
      });
      
      // Handle specific error types
      if (err.message?.toLowerCase().includes('fetch') || err.name === 'TypeError') {
        setErrorMessage("❌ Network error: Cannot connect to the authentication server. Please:\n• Check your internet connection\n• Try refreshing the page\n• Disable any VPN or firewall temporarily");
      } else if (err.message?.toLowerCase().includes('cors')) {
        setErrorMessage("❌ CORS error: Browser security settings are blocking the request. Try using a different browser or contact support.");
      } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        setErrorMessage("❌ Server unreachable: The authentication server is not responding. Please try again later.");
      } else {
        setErrorMessage(`❌ Error: ${err.message || 'Unknown error occurred'}. Please try again or contact support if the problem persists.`);
      }
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

              {/* Debug Connection Test - Remove in production */}
              {/* <div className="mt-4 text-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                  className="text-sm"
                >
                  🔧 Test Connection
                </Button>
              </div> */}

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
