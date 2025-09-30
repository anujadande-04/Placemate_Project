import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Brain, TrendingUp, Users, Target, Award } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-blue-200 rounded-full opacity-30 animate-bounce"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-purple-200 rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-cyan-200 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-1/3 left-1/2 w-16 h-16 bg-pink-300 rounded-full opacity-15 animate-ping"></div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-100/40 via-blue-100/40 to-purple-100/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8 group">
              <div className="relative">
                <GraduationCap className="h-16 w-16 text-blue-600 mr-4 transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
                Placemate
              </h1>
            </div>
            <div className="space-y-4">
              <p className="text-xl text-gray-700 mb-2 font-semibold">
                Intelligent Student Placement Prediction Platform
              </p>
              <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Harness the power of AI to predict placement chances, assess skills, and connect students 
                with the right opportunities. Built for colleges to maximize student success.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-semibold px-8 py-3 rounded-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                <Link to="/login">Get Started</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-2 border-blue-400 text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-full transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-pink-600 bg-clip-text text-transparent mb-4">
              Why Choose Placemate?
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              Comprehensive AI-powered platform for placement success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                Icon: Brain,
                title: "AI Predictions",
                description: "Advanced machine learning algorithms analyze student profiles to predict placement probability with high accuracy.",
                color: "from-pink-400 to-pink-600",
                bgColor: "bg-gradient-to-br from-pink-50 to-pink-100"
              },
              {
                Icon: Target,
                title: "Profile Evaluation",
                description: "In-depth analysis of student resumes, academic records, and submitted details to assess placement readiness and highlight strengths and improvement areas.",
                color: "from-blue-400 to-blue-600",
                bgColor: "bg-gradient-to-br from-blue-50 to-blue-100"
              },
              {
                Icon: TrendingUp,
                title: "Analytics & Reports",
                description: "Interactive dashboards with placement trends, student performance metrics, and comprehensive reporting tools.",
                color: "from-purple-400 to-purple-600",
                bgColor: "bg-gradient-to-br from-purple-50 to-purple-100"
              },
              {
                Icon: Users,
                title: "Student Management",
                description: "Centralized platform for managing student profiles, resumes, certifications, and placement readiness.",
                color: "from-cyan-400 to-cyan-600",
                bgColor: "bg-gradient-to-br from-cyan-50 to-cyan-100"
              },
              {
                Icon: Award,
                title: "Career Guidance",
                description: "Personalized recommendations and actionable insights to help students enhance their profiles, improve employability, and align with industry expectations.",
                color: "from-emerald-400 to-emerald-600",
                bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100"
              },
              {
                Icon: GraduationCap,
                title: "Success Tracking",
                description: "Real-time monitoring of placement outcomes and success metrics across departments and years.",
                color: "from-rose-400 to-rose-600",
                bgColor: "bg-gradient-to-br from-rose-50 to-rose-100"
              }
            ].map((feature, index) => (
              <Card 
                key={feature.title}
                className={`border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 ${feature.bgColor} group cursor-pointer`}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full bg-gradient-to-r ${feature.color} transform transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110`}>
                      <feature.Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-100/50 via-blue-100/50 to-purple-100/50"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-700 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Ready to Transform Your Placement Process?
            </h2>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 hover:from-blue-600 hover:via-pink-600 hover:to-purple-600 text-white font-bold px-10 py-4 rounded-full transform transition-all duration-300 hover:scale-110 hover:shadow-2xl">
                <Link to="/login">Start Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
