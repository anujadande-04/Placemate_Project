import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Target,
  Award,
  TrendingUp,
  FileCheck
} from "lucide-react";

interface ATSScoreResult {
  overallScore: number;
  breakdown: {
    keywordMatch: number;
    formatting: number;
    sections: number;
    length: number;
    readability: number;
  };
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
  industryRelevance: number;
}

interface ATSResumeAnalyzerProps {
  onScoreUpdate?: (score: ATSScoreResult) => void;
  initialScore?: ATSScoreResult | null;
}

const ATSResumeAnalyzer: React.FC<ATSResumeAnalyzerProps> = ({ 
  onScoreUpdate, 
  initialScore 
}) => {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [atsScore, setATSScore] = useState<ATSScoreResult | null>(initialScore || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Common technical keywords for different domains
  const technicalKeywords = {
    software: [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
      'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'Git', 'Docker', 'AWS',
      'Azure', 'Kubernetes', 'DevOps', 'API', 'REST', 'GraphQL', 'TypeScript',
      'Spring Boot', 'Django', 'Flask', 'Express.js', 'Redux', 'Webpack'
    ],
    dataScience: [
      'Machine Learning', 'Data Science', 'Python', 'R', 'TensorFlow', 'PyTorch',
      'Pandas', 'NumPy', 'Scikit-learn', 'SQL', 'Tableau', 'Power BI', 'Excel',
      'Statistics', 'Deep Learning', 'NLP', 'Computer Vision', 'Big Data', 'Hadoop'
    ],
    general: [
      'Communication', 'Leadership', 'Problem Solving', 'Team Work', 'Project Management',
      'Analytical', 'Critical Thinking', 'Time Management', 'Agile', 'Scrum'
    ]
  };

  const requiredSections = [
    'contact', 'email', 'phone', 'experience', 'education', 'skills', 'projects'
  ];

  const analyzeResumeText = useCallback((text: string): ATSScoreResult => {
    const lowerText = text.toLowerCase();
    const words = text.split(/\s+/).length;
    
    // 1. Keyword Analysis
    const allKeywords = [
      ...technicalKeywords.software,
      ...technicalKeywords.dataScience,
      ...technicalKeywords.general
    ];
    
    const foundKeywords = allKeywords.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
    const keywordScore = Math.min((foundKeywords.length / 15) * 100, 100);

    // 2. Section Analysis
    const foundSections = requiredSections.filter(section => {
      const sectionPatterns = {
        contact: /contact|address|location/,
        email: /@[\w.-]+\.\w+/,
        phone: /\+?\d{10,}/,
        experience: /experience|work|employment|internship/,
        education: /education|degree|university|college|school/,
        skills: /skills|technologies|technical|proficient/,
        projects: /projects|portfolio|github|built|developed/
      };
      return sectionPatterns[section as keyof typeof sectionPatterns]?.test(lowerText) || false;
    });
    const sectionScore = (foundSections.length / requiredSections.length) * 100;

    // 3. Formatting Analysis (simplified)
    const hasProperFormatting = text.includes('\n') && text.includes(' ');
    const formattingScore = hasProperFormatting ? 85 : 45;

    // 4. Length Analysis
    const idealLength = words >= 200 && words <= 800;
    const lengthScore = idealLength ? 90 : Math.max(40, 90 - Math.abs(words - 500) / 10);

    // 5. Readability (simplified)
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;
    const readabilityScore = avgWordsPerSentence < 25 ? 85 : Math.max(50, 85 - (avgWordsPerSentence - 25) * 2);

    // Overall score calculation
    const breakdown = {
      keywordMatch: Math.round(keywordScore),
      formatting: Math.round(formattingScore),
      sections: Math.round(sectionScore),
      length: Math.round(lengthScore),
      readability: Math.round(readabilityScore)
    };

    const overallScore = Math.round(
      (breakdown.keywordMatch * 0.3) +
      (breakdown.sections * 0.25) +
      (breakdown.formatting * 0.2) +
      (breakdown.length * 0.15) +
      (breakdown.readability * 0.1)
    );

    // Generate suggestions
    const suggestions: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Analyze each component
    if (breakdown.keywordMatch < 60) {
      suggestions.push("Add more relevant technical keywords and skills");
      weaknesses.push("Limited keyword optimization");
    } else {
      strengths.push("Good keyword usage");
    }

    if (breakdown.sections < 70) {
      suggestions.push("Include all essential sections: Contact, Experience, Education, Skills, Projects");
      weaknesses.push("Missing important resume sections");
    } else {
      strengths.push("Well-structured with key sections");
    }

    if (breakdown.length < 60) {
      suggestions.push(words < 200 ? "Expand your resume with more details" : "Make your resume more concise");
      weaknesses.push("Resume length needs optimization");
    } else {
      strengths.push("Appropriate resume length");
    }

    if (breakdown.formatting < 70) {
      suggestions.push("Improve formatting and structure for better ATS readability");
      weaknesses.push("Formatting could be improved");
    } else {
      strengths.push("Good formatting structure");
    }

    // Industry relevance
    const industryRelevance = Math.round(
      (foundKeywords.filter(kw => 
        technicalKeywords.software.includes(kw) || 
        technicalKeywords.dataScience.includes(kw)
      ).length / 10) * 100
    );

    return {
      overallScore,
      breakdown,
      suggestions,
      strengths,
      weaknesses,
      industryRelevance: Math.min(industryRelevance, 100)
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    
    // For demo purposes, we'll simulate text extraction
    // In a real implementation, you'd use a library like pdf-parse or mammoth
    if (file.type === 'text/plain') {
      const text = await file.text();
      setResumeText(text);
    } else {
      // Simulate extracted text for PDF/DOCX files
      setResumeText(`
        John Doe
        Email: john.doe@email.com
        Phone: +1-234-567-8900
        
        EXPERIENCE
        Software Engineer Intern at Tech Company (2023-2024)
        - Developed web applications using React and Node.js
        - Implemented REST APIs and database integration
        - Collaborated with team using Git and Agile methodologies
        
        EDUCATION
        Bachelor of Computer Science Engineering
        University Name - CGPA: 8.5
        
        SKILLS
        JavaScript, Python, React, Node.js, SQL, MongoDB, Git, HTML, CSS
        
        PROJECTS
        E-commerce Website - Built using React and Express.js
        Machine Learning Model - Developed prediction algorithm using Python
      `);
    }
  };

  const analyzeResume = async () => {
    if (!resumeText.trim()) {
      alert('Please upload a resume or paste resume text');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = analyzeResumeText(resumeText);
    setATSScore(result);
    setIsAnalyzing(false);
    
    // Call parent callback if provided
    if (onScoreUpdate) {
      onScoreUpdate(result);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            ATS Resume Analysis
          </CardTitle>
          <CardDescription className="text-gray-600">
            Upload your resume to get an ATS compatibility score and improvement suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="resume-upload" className="text-sm font-semibold text-gray-700">
              Upload Resume (PDF, DOCX, or TXT)
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="resume-upload"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {selectedFile && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {selectedFile.name}
                </Badge>
              )}
            </div>
          </div>

          {/* Text Area for Manual Input */}
          <div className="space-y-2">
            <Label htmlFor="resume-text" className="text-sm font-semibold text-gray-700">
              Or Paste Resume Text
            </Label>
            <textarea
              id="resume-text"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here for analysis..."
              className="w-full min-h-32 p-3 border-2 border-gray-300 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-200 resize-vertical"
            />
          </div>

          {/* Analyze Button */}
          <Button 
            onClick={analyzeResume}
            disabled={isAnalyzing || !resumeText.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing Resume...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Analyze ATS Compatibility
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {atsScore && (
        <div className="space-y-4">
          {/* Overall Score */}
          <Card className="border-2 border-green-100">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardTitle className="text-lg text-gray-800 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  ATS Compatibility Score
                </span>
                <Badge className={`px-3 py-1 text-white ${getScoreBadgeColor(atsScore.overallScore)}`}>
                  {atsScore.overallScore}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Overall ATS Score</span>
                    <span>{atsScore.overallScore}%</span>
                  </div>
                  <Progress value={atsScore.overallScore} className="h-3" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-700 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {atsScore.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-orange-700 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {atsScore.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Breakdown */}
          <Card className="border-2 border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Detailed Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(atsScore.breakdown).map(([key, score]) => (
                  <div key={key} className={`p-3 rounded-lg ${getScoreColor(score)}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-bold">{score}%</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card className="border-2 border-yellow-100">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50">
              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Improvement Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {atsScore.suggestions.map((suggestion, index) => (
                  <Alert key={index} className="border-blue-200 bg-blue-50">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      {suggestion}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ATSResumeAnalyzer;