import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SimpleChart, SimpleDonutChart, ProgressRing } from "@/components/ui/charts";
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Award, 
  BookOpen, 
  Briefcase,
  Code,
  CheckCircle,
  XCircle,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Trophy,
  Zap,
  ArrowUp,
  ArrowDown,
  Brain,
  Rocket,
  FileText,
  Layout,
  AlertTriangle
} from "lucide-react";

interface PredictionTabProps {
  studentDetails: any;
  user: any;
}

interface PredictionResults {
  binaryPrediction: 'Yes' | 'No';
  placementProbability: number; // 0-100 percentage
  confidence: 'High' | 'Medium' | 'Low';
  expectedSalary: number;
  analysis: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  benchmarkComparison: {
    cgpaPercentile: number;
    internshipPercentile: number;
    projectPercentile: number;
    skillsMatch: number;
  };
}

interface IndustryTrends {
  topSkills: Array<{ skill: string; demand: number; avgSalary: number }>;
  avgSalaryByBranch: Array<{ branch: string; avgSalary: number; count: number }>;
  placementRateByBranch: Array<{ branch: string; rate: number; total: number }>;
  salaryTrends: Array<{ range: string; count: number; percentage: number }>;
}

const PredictionTab: React.FC<PredictionTabProps> = ({ studentDetails, user }) => {
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResults | null>(null);
  const [industryTrends, setIndustryTrends] = useState<IndustryTrends | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (studentDetails && studentDetails.profile_completed) {
      analyzePlacement();
    }
  }, [studentDetails]);

  const analyzePlacement = async () => {
    setLoading(true);
    setError(null);

    try {
      // Dynamic import to load the prediction service
      const { placementPredictor } = await import('@/services/predictionService');
      
      // Load dataset if not already loaded
      await placementPredictor.loadDataset();

      // Calculate work experience from the experience text
      const experienceText = studentDetails.experience || '';
      let workExpYears = 0;
      
      // Extract years of experience from text (look for various patterns)
      const patterns = [
        /(\d+)\s*(?:years?|yrs?)/i,
        /(\d+)\s*(?:year|yr)\s*(?:of|in)/i,
        /experience:\s*(\d+)/i,
        /worked\s*(?:for)?\s*(\d+)/i
      ];
      
      for (const pattern of patterns) {
        const match = experienceText.match(pattern);
        if (match) {
          workExpYears = parseInt(match[1]);
          break;
        }
      }
      
      // If no explicit years mentioned but substantial experience description exists
      if (workExpYears === 0 && experienceText.trim().length > 50) {
        // Look for experience indicators
        const experienceKeywords = ['worked', 'employee', 'job', 'company', 'position', 'role', 'intern'];
        const hasExperienceKeywords = experienceKeywords.some(keyword => 
          experienceText.toLowerCase().includes(keyword)
        );
        
        if (hasExperienceKeywords) {
          workExpYears = 1; // Assume at least 1 year if detailed experience is described
        }
      }
      
      console.log('📋 Experience Analysis:', {
        textLength: experienceText.length,
        extractedYears: workExpYears,
        sampleText: experienceText.substring(0, 100)
      });

      // Utility function to count valid internships/projects (filters out negative responses)
      const countValidItems = (items: string[] | null | undefined): number => {
        if (!items || !Array.isArray(items)) return 0;
        
        // Filter out negative responses like "no", "not any", "none", etc.
        const negativeResponses = [
          'no', 'not any', 'none', 'nil', 'nothing', 'not applicable', 'n/a', 'na',
          'no internships', 'no projects', 'not done', 'haven\'t done', 'didn\'t do',
          'zero', '0', 'not completed', 'not available', 'not yet', 'not started'
        ];
        
        const validItems = items.filter(item => {
          if (!item || typeof item !== 'string') return false;
          
          const itemLower = item.trim().toLowerCase();
          
          // Check if it's empty or just whitespace
          if (itemLower.length === 0) return false;
          
          // Check if it matches any negative response
          return !negativeResponses.some(negative => 
            itemLower === negative || itemLower.includes(negative)
          );
        });
        
        return validItems.length;
      };

      const validInternshipsCount = countValidItems(studentDetails.internships);
      const validProjectsCount = countValidItems(studentDetails.projects);

      console.log('🔍 Project/Internship Analysis:', {
        rawInternships: studentDetails.internships,
        rawProjects: studentDetails.projects,
        validInternshipsCount,
        validProjectsCount
      });

      // Prepare student profile for prediction
      const profile = {
        cgpa: studentDetails.cgpa || 0,
        branch: studentDetails.branch || 'Computer Science Engineering',
        workExp: workExpYears,
        internships: validInternshipsCount,
        projects: validProjectsCount,
        skills: studentDetails.technologies || [],
        resumeScore: studentDetails.resume_url ? 85 : 70, // Higher score if resume uploaded
        softSkills: studentDetails.soft_skills || 4, // Use actual soft skills rating
        atsScore: studentDetails.ats_score || undefined // Include ATS score if available
      };

      console.log('🔍 Student Profile for Prediction:', {
        ...profile,
        experienceText: experienceText.substring(0, 100) + (experienceText.length > 100 ? '...' : ''),
        hasResume: !!studentDetails.resume_url,
        skillsCount: profile.skills.length,
        atsScoreCategory: profile.atsScore ? 
          (profile.atsScore >= 85 ? 'Excellent' : 
           profile.atsScore >= 70 ? 'Good' : 
           profile.atsScore >= 50 ? 'Decent' : 'Poor') : 'Not analyzed'
      });

      // Get predictions (now async with ML model)
      const result = await placementPredictor.predict(profile);
      
      console.log('✅ Final Prediction Result:', {
        binaryPrediction: result.binaryPrediction,
        placementProbability: result.placementProbability,
        confidence: result.confidence,
        expectedSalary: result.expectedSalary
      });
      
      setPredictions(result);

      // Get industry trends
      const trends = placementPredictor.getIndustryTrends();
      setIndustryTrends(trends);

    } catch (err) {
      console.error('Prediction error:', err);
      setError('Failed to analyze placement data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProbabilityColor = (probability: number) => {
    // probability is now 0-100, so adjust thresholds
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProbabilityBg = (probability: number) => {
    // probability is now 0-100, so adjust thresholds
    if (probability >= 80) return 'bg-green-100';
    if (probability >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const formatSalary = (salary: number) => {
    if (salary >= 1000000) {
      return `₹${(salary / 1000000).toFixed(1)}L`;
    }
    return `₹${(salary / 100000).toFixed(1)}L`;
  };

  if (!studentDetails || !studentDetails.profile_completed) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Complete Your Profile First</h3>
          <p className="text-gray-500">Please complete your profile to get AI-powered placement predictions</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Analyzing Your Profile</h3>
          <p className="text-gray-500">Training AI model with 100,000+ student records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-6">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button onClick={analyzePlacement} className="ml-4" size="sm">
            Retry Analysis
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!predictions) {
    return (
      <div className="flex items-center justify-center h-64">
        <Button onClick={analyzePlacement} className="bg-blue-600 hover:bg-blue-700">
          <Brain className="h-4 w-4 mr-2" />
          Start AI Placement Analysis
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Placement Prediction</h2>
        <p className="text-gray-600">Get personalized insights based on 100,000+ student placement records</p>
      </div>

      <Tabs defaultValue="prediction" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prediction">Prediction</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="trends">Industry Trends</TabsTrigger>
        </TabsList>

        {/* Prediction Tab */}
        <TabsContent value="prediction" className="space-y-6">
          {/* Main Prediction Card */}
          <div className="grid grid-cols-1 gap-6">
            {/* ML Placement Prediction */}
            <Card className={`border-2 ${predictions.binaryPrediction === 'Yes' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Brain className="h-6 w-6" />
                  AI Placement Prediction
                </CardTitle>
                <CardDescription>
                  Advanced machine learning model prediction based on your profile
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                {/* Binary Prediction */}
                <div className="mb-4">
                  <div className={`text-4xl font-bold mb-2 ${predictions.binaryPrediction === 'Yes' ? 'text-green-600' : 'text-red-600'}`}>
                    {predictions.binaryPrediction === 'Yes' ? 'PLACED' : 'NOT PLACED'}
                  </div>
                  <Badge variant={predictions.binaryPrediction === 'Yes' ? 'default' : 'destructive'} className="text-sm">
                    {predictions.confidence} Confidence
                  </Badge>
                </div>
                
                {/* Probability Percentage */}
                <div className="mb-4">
                  <div className={`text-3xl font-semibold mb-2 ${getProbabilityColor(predictions.placementProbability / 100)}`}>
                    {predictions.placementProbability}%
                  </div>
                  <Progress 
                    value={predictions.placementProbability} 
                    className="h-3 mb-2"
                  />
                  <p className="text-sm text-gray-600">Placement Probability</p>
                </div>
                
                <div className="flex items-center justify-center gap-2">
                  {predictions.placementProbability >= 80 ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-600 font-semibold">Excellent Chances</span>
                    </>
                  ) : predictions.placementProbability >= 60 ? (
                    <>
                      <Activity className="h-5 w-5 text-yellow-600" />
                      <span className="text-yellow-600 font-semibold">Good Chances</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="text-red-600 font-semibold">Needs Improvement</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Benchmark Comparison */}
          <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                Benchmark Comparison
              </CardTitle>
              <CardDescription>How you compare to other students in the dataset</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center">
                  <ProgressRing
                    percentage={predictions.benchmarkComparison.cgpaPercentile}
                    color="#8b5cf6"
                    title="CGPA Percentile"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <ProgressRing
                    percentage={predictions.benchmarkComparison.internshipPercentile}
                    color="#06b6d4"
                    title="Internship Percentile"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <ProgressRing
                    percentage={predictions.benchmarkComparison.projectPercentile}
                    color="#10b981"
                    title="Project Percentile"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <ProgressRing
                    percentage={predictions.benchmarkComparison.skillsMatch}
                    color="#f59e0b"
                    title="Skills Match"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card className="border-2 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Trophy className="h-6 w-6" />
                  Your Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions.analysis.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{strength}</span>
                    </div>
                  ))}
                  {predictions.analysis.strengths.length === 0 && (
                    <p className="text-gray-500 italic">Focus on building your strengths through the recommendations</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="border-2 bg-gradient-to-br from-red-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <XCircle className="h-6 w-6" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions.analysis.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-200">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{weakness}</span>
                    </div>
                  ))}
                  {predictions.analysis.weaknesses.length === 0 && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Star className="h-5 w-5" />
                      <span>Great! No major weaknesses identified</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ATS Score Section */}
          <Card className="border-2 bg-gradient-to-br from-cyan-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-cyan-700">
                <Brain className="h-6 w-6" />
                ATS Resume Analysis
              </CardTitle>
              <CardDescription>
                Applicant Tracking System compatibility score and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* ATS Score Display */}
                <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-cyan-200">
                  <div className="flex-shrink-0">
                    {studentDetails?.ats_score ? (
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${
                          studentDetails.ats_score >= 85 ? 'text-green-600' :
                          studentDetails.ats_score >= 70 ? 'text-blue-600' :
                          studentDetails.ats_score >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {studentDetails.ats_score}
                        </div>
                        <div className="text-sm text-gray-600">ATS Score</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-400">--</div>
                        <div className="text-sm text-gray-500">Not Analyzed</div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-700">Resume ATS Compatibility:</span>
                      <Badge 
                        variant="outline" 
                        className={
                          studentDetails?.ats_score ? 
                            (studentDetails.ats_score >= 85 ? 'border-green-600 text-green-600' :
                             studentDetails.ats_score >= 70 ? 'border-blue-600 text-blue-600' :
                             studentDetails.ats_score >= 50 ? 'border-yellow-600 text-yellow-600' :
                             'border-red-600 text-red-600') :
                            'border-gray-400 text-gray-400'
                        }
                      >
                        {studentDetails?.ats_score ? 
                          (studentDetails.ats_score >= 85 ? 'Excellent' :
                           studentDetails.ats_score >= 70 ? 'Good' :
                           studentDetails.ats_score >= 50 ? 'Decent' :
                           'Needs Improvement') :
                          'Not Analyzed'
                        }
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {studentDetails?.ats_score ? 
                        `Your resume scored ${studentDetails.ats_score}/100 for ATS compatibility. ${
                          studentDetails.ats_score >= 85 ? 'Excellent! Your resume is highly optimized for ATS systems.' :
                          studentDetails.ats_score >= 70 ? 'Good score! Minor improvements could boost your visibility.' :
                          studentDetails.ats_score >= 50 ? 'Decent score, but there\'s room for improvement to increase your chances.' :
                          'Your resume needs significant improvements to pass ATS filters effectively.'
                        }` :
                        'Upload your resume to get a detailed ATS compatibility analysis and improve your application success rate.'
                      }
                    </p>
                  </div>
                </div>

                {/* ATS Analysis Details */}
                {studentDetails?.ats_analysis && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Detailed Analysis
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Skills Analysis */}
                      {studentDetails.ats_analysis.skillsAnalysis && (
                        <div className="p-3 bg-white rounded-lg border border-cyan-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Code className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-gray-700">Skills</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {studentDetails.ats_analysis.skillsAnalysis.score}/100
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {studentDetails.ats_analysis.skillsAnalysis.analysis}
                          </p>
                        </div>
                      )}

                      {/* Experience Analysis */}
                      {studentDetails.ats_analysis.experienceAnalysis && (
                        <div className="p-3 bg-white rounded-lg border border-cyan-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-gray-700">Experience</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {studentDetails.ats_analysis.experienceAnalysis.score}/100
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {studentDetails.ats_analysis.experienceAnalysis.analysis}
                          </p>
                        </div>
                      )}

                      {/* Format Analysis */}
                      {studentDetails.ats_analysis.formatAnalysis && (
                        <div className="p-3 bg-white rounded-lg border border-cyan-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Layout className="h-4 w-4 text-purple-600" />
                            <span className="font-medium text-gray-700">Format</span>
                            <Badge variant="outline" className="ml-auto text-xs">
                              {studentDetails.ats_analysis.formatAnalysis.score}/100
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {studentDetails.ats_analysis.formatAnalysis.analysis}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Key Improvements */}
                    {studentDetails.ats_analysis.improvements && studentDetails.ats_analysis.improvements.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Key Improvements
                        </h4>
                        <div className="space-y-2">
                          {studentDetails.ats_analysis.improvements.slice(0, 3).map((improvement, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{improvement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <Card className="border-2 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Lightbulb className="h-6 w-6" />
                AI-Powered Recommendations
              </CardTitle>
              <CardDescription>
                Personalized action items to improve your placement chances
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {predictions.analysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 mb-2">{recommendation}</p>
                      <Badge variant="outline" className="text-blue-600 border-blue-600">
                        Priority: {index < 2 ? 'High' : index < 4 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Plan */}
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Rocket className="h-6 w-6" />
                  Your 30-Day Action Plan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/20 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Week 1-2</h4>
                    <p className="text-sm">Focus on immediate improvements: update resume, apply for internships</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Week 3-4</h4>
                    <p className="text-sm">Start new projects, learn in-demand skills, build portfolio</p>
                  </div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Ongoing</h4>
                    <p className="text-sm">Network actively, practice coding, prepare for interviews</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Industry Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          {industryTrends && (
            <>
              {/* Data Source Information */}
              <Alert className="border-blue-200 bg-blue-50">
                <Activity className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Data Basis:</strong> All industry trends and statistics are derived from analyzing your placement dataset (dataset.csv) containing historical placement records. 
                  The insights include: skill demand based on placed students, salary ranges from actual placement data, and branch-wise placement rates calculated from the dataset records.
                </AlertDescription>
              </Alert>

              {/* Top Skills */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-6 w-6 text-green-600" />
                    Most In-Demand Skills
                  </CardTitle>
                  <CardDescription>
                    Skills with highest placement rates and salaries (analyzed from successfully placed students in dataset)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <SimpleChart
                        data={industryTrends.topSkills.slice(0, 8).map((skill, index) => ({
                          label: skill.skill,
                          value: skill.demand,
                          color: `bg-gradient-to-r ${
                            index % 4 === 0 ? 'from-green-500 to-emerald-500' :
                            index % 4 === 1 ? 'from-blue-500 to-cyan-500' :
                            index % 4 === 2 ? 'from-purple-500 to-violet-500' :
                            'from-orange-500 to-red-500'
                          }`
                        }))}
                        title="Demand (Number of Successful Placements)"
                        type="bar"
                      />
                    </div>
                    <div>
                      <SimpleChart
                        data={industryTrends.topSkills.slice(0, 8).map((skill, index) => ({
                          label: skill.skill,
                          value: Math.round(skill.avgSalary / 100000),
                          color: `bg-gradient-to-r ${
                            skill.avgSalary > 800000 ? 'from-yellow-500 to-orange-500' :
                            skill.avgSalary > 600000 ? 'from-green-500 to-emerald-500' :
                            'from-blue-500 to-cyan-500'
                          }`
                        }))}
                        title="Average Salary (in Lakhs) - Historical Data"
                        type="bar"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Branch-wise Statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                      Placement Rate by Branch
                    </CardTitle>
                    <CardDescription>
                      Historical placement success rates calculated from dataset records
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SimpleChart
                      data={industryTrends.placementRateByBranch.map(branch => ({
                        label: branch.branch,
                        value: branch.rate,
                        color: branch.rate > 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                               branch.rate > 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                               'bg-gradient-to-r from-red-500 to-pink-500'
                      }))}
                      type="progress"
                      maxValue={100}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-6 w-6 text-purple-600" />
                      Average Salary by Branch
                    </CardTitle>
                    <CardDescription>
                      Mean salary packages from historical placement data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SimpleChart
                      data={industryTrends.avgSalaryByBranch.map(branch => ({
                        label: branch.branch,
                        value: Math.round(branch.avgSalary / 100000),
                        color: 'bg-gradient-to-r from-purple-500 to-pink-500'
                      }))}
                      title="Average Salary (in Lakhs) - Historical Data"
                      type="bar"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Salary Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-6 w-6 text-orange-600" />
                    Historical Salary Distribution
                  </CardTitle>
                  <CardDescription>
                    Distribution of actual placement salaries from dataset records across all branches
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex justify-center">
                      <SimpleDonutChart
                        data={industryTrends.salaryTrends.map((trend, index) => ({
                          label: trend.range,
                          value: trend.count,
                          color: [
                            '#ef4444', // red-500
                            '#f97316', // orange-500
                            '#eab308', // yellow-500
                            '#22c55e', // green-500
                            '#8b5cf6'  // violet-500
                          ][index] || '#6b7280'
                        }))}
                        title="Students by Salary Range"
                      />
                    </div>
                    <div className="space-y-4">
                      {industryTrends.salaryTrends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ 
                                backgroundColor: [
                                  '#ef4444', '#f97316', '#eab308', '#22c55e', '#8b5cf6'
                                ][index] || '#6b7280'
                              }}
                            />
                            <div>
                              <div className="font-semibold">{trend.range}</div>
                              <div className="text-sm text-gray-600">{trend.count} students</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-orange-600">
                              {trend.percentage}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Button */}
      <div className="text-center pt-6">
        <Button 
          onClick={analyzePlacement} 
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
          size="lg"
        >
          <Zap className="h-5 w-5 mr-2" />
          Re-analyze Profile
        </Button>
      </div>
    </div>
  );
};

export default PredictionTab;