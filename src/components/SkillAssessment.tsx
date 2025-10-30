import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SimpleChart, ProgressRing } from "@/components/ui/charts";
import { skillAssessmentService, type Skill, type SkillCategory, type AssessmentQuestion } from "@/services/skillAssessmentService";
import { PersistentDataService, type SkillAssessmentResult } from "@/services/persistentDataServiceSimple";
import { supabase } from "@/integrations/supabase/client";
import { 
  Code, 
  Brain, 
  Award, 
  CheckCircle,
  Clock,
  Star,
  Target,
  BookOpen,
  Lightbulb,
  TrendingUp,
  Users,
  MessageSquare,
  Zap,
  Trophy,
  PlayCircle,
  FileText,
  BarChart3,
  Activity,
  Server,
  Cloud,
  ExternalLink,
  ArrowRight,
  TrendingDown
} from "lucide-react";

interface SkillAssessmentProps {
  studentDetails: any;
  user: any;
  onMetricsUpdate?: () => void;
}

const SkillAssessment: React.FC<SkillAssessmentProps> = ({ studentDetails, user, onMetricsUpdate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('frontend');
  const [currentAssessment, setCurrentAssessment] = useState<Skill | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [assessmentStarted, setAssessmentStarted] = useState<boolean>(false);
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [currentQuestions, setCurrentQuestions] = useState<AssessmentQuestion[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Helper function to clear all assessment results
  const clearAllResults = () => {
    if (user?.id) {
      localStorage.removeItem(`skillAssessment_${user.id}`);
      const categories = skillAssessmentService.getSkillCategories();
      setSkillCategories(categories);
    }
  };

  useEffect(() => {
    const loadSkillData = async () => {
      // Load skill categories from service
      const categories = skillAssessmentService.getSkillCategories();
      
      // Load saved assessment results from database (with localStorage fallback)
      if (user?.id) {
        try {
          const savedResults = await PersistentDataService.getSkillAssessments(user.id);
          
          // Apply saved results to categories
          const updatedCategories = categories.map(category => ({
            ...category,
            skills: category.skills.map(skill => {
              const savedResult = savedResults.find(r => r.skillId === skill.id);
              if (savedResult) {
                return {
                  ...skill,
                  score: savedResult.score,
                  completed: true
                };
              }
              return skill;
            })
          }));
          setSkillCategories(updatedCategories);
          
          // Migrate any local data to database
          await PersistentDataService.migrateLocalDataToDatabase(user.id);
          
        } catch (error) {
          console.error('Error loading saved assessment results:', error);
          setSkillCategories(categories);
        }
      } else {
        setSkillCategories(categories);
      }
    };

    loadSkillData();
  }, [user?.id]);

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Code': <Code className="h-6 w-6" />,
      'Server': <Server className="h-6 w-6" />,
      'Cloud': <Cloud className="h-6 w-6" />,
      'Users': <Users className="h-6 w-6" />
    };
    return iconMap[iconName] || <Code className="h-6 w-6" />;
  };

  const getSkillCategoryById = (categoryId: string) => {
    return skillCategories.find(cat => cat.id === categoryId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const startAssessment = (skill: Skill) => {
    const questions = skillAssessmentService.getQuestionsForSkill(skill.id);
    setCurrentQuestions(questions);
    setCurrentAssessment(skill);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setAssessmentStarted(true);
    setStartTime(new Date());
  };

  const handleAnswer = async (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);

    if (currentQuestion < currentQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate score and show results
      const correctAnswers = newAnswers.reduce((count, answer, index) => {
        return count + (answer === currentQuestions[index].correctAnswer ? 1 : 0);
      }, 0);
      const score = Math.round((correctAnswers / currentQuestions.length) * 100);
      
      // Update skill score and store result
      if (currentAssessment && user) {
        currentAssessment.score = score;
        currentAssessment.completed = true;
        
        const timeSpent = startTime ? (new Date().getTime() - startTime.getTime()) / 1000 : 0;
        const assessmentResult = {
          skillId: currentAssessment.id,
          score,
          totalQuestions: currentQuestions.length,
          correctAnswers,
          timeSpent,
          completedAt: new Date(),
          weakAreas: [],
          strengths: []
        };
        
        // Store in memory (existing service)
        skillAssessmentService.storeAssessmentResult(user.id, assessmentResult);
        
        // Store in database with localStorage fallback
        try {
          const skillAssessmentData: SkillAssessmentResult = {
            skillId: currentAssessment.id,
            skillName: currentAssessment.name,
            skillCategory: currentAssessment.category,
            score: score,
            assessmentData: {
              correctAnswers,
              totalQuestions: currentQuestions.length,
              timeSpent: startTime ? (Date.now() - startTime.getTime()) / 1000 : 0,
              questions: currentQuestions.map((q, idx) => ({
                question: q.question,
                selectedAnswer: answers[idx],
                correctAnswer: q.correctAnswer,
                isCorrect: answers[idx] === q.correctAnswer
              }))
            },
            completedAt: new Date().toISOString()
          };

          // Save to database (with localStorage fallback built-in)
          await PersistentDataService.saveSkillAssessment(user.id, skillAssessmentData);
          
          // Update the skill categories state to reflect the new score
          setSkillCategories(prevCategories => 
            prevCategories.map(category => ({
              ...category,
              skills: category.skills.map(skill => 
                skill.id === currentAssessment.id 
                  ? { ...skill, score, completed: true }
                  : skill
              )
            }))
          );
          
        } catch (error) {
          console.error('Error saving assessment result:', error);
        }
        
        // Trigger metrics update in parent component
        if (onMetricsUpdate) {
          onMetricsUpdate();
        }
      }
      
      setShowResults(true);
    }
  };

  const resetAssessment = () => {
    setCurrentAssessment(null);
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
    setAssessmentStarted(false);
    setCurrentQuestions([]);
    setStartTime(null);
  };

  const calculateOverallProgress = () => {
    const totalSkills = skillCategories.reduce((sum, cat) => sum + cat.skills.length, 0);
    const completedSkills = skillCategories.reduce((sum, cat) => 
      sum + cat.skills.filter(skill => skill.completed).length, 0);
    return totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;
  };

  const getRecommendations = () => {
    if (!user) return [];
    const userSkills = studentDetails?.technologies || [];
    const completedAssessments = skillAssessmentService.getUserAssessmentHistory(user.id);
    return skillAssessmentService.getPersonalizedRecommendations(userSkills, completedAssessments);
  };

  const getMarketDemandData = () => {
    return skillCategories.map(cat => ({
      label: cat.name,
      value: cat.marketDemand || 0,
      color: cat.marketDemand >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
             cat.marketDemand >= 70 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
             'bg-gradient-to-r from-orange-500 to-red-500'
    }));
  };

  if (assessmentStarted && currentAssessment && !showResults) {
    // Assessment in progress
    return (
      <div className="space-y-6">
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Target className="h-6 w-6 text-blue-600" />
              {currentAssessment.name} Assessment
            </CardTitle>
            <CardDescription>
              Question {currentQuestion + 1} of {currentQuestions.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Progress value={((currentQuestion + 1) / currentQuestions.length) * 100} className="h-2" />
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-black">
                  {currentQuestions[currentQuestion]?.question}
                </h3>
                <div className="space-y-3">
                  {currentQuestions[currentQuestion]?.options.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full text-left justify-start h-auto p-4 hover:bg-blue-50"
                      onClick={() => handleAnswer(index)}
                    >
                      <span className="mr-3 font-semibold">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={resetAssessment}>
                Exit Assessment
              </Button>
              <Badge variant="secondary">
                <Clock className="h-4 w-4 mr-1" />
                {currentAssessment.estimatedTime} min
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults && currentAssessment) {
    // Show results
    const score = currentAssessment.score || 0;
    return (
      <div className="space-y-6">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-600" />
              Assessment Completed!
            </CardTitle>
            <CardDescription>
              {currentAssessment.name} - Results
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(score)}`}>
                {score}%
              </div>
              <p className="text-lg text-black">Your Score</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{answers.length}</div>
                <p className="text-sm text-black">Questions Answered</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {answers.filter((answer, index) => answer === currentQuestions[index]?.correctAnswer).length}
                </div>
                <p className="text-sm text-black">Correct Answers</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{currentAssessment.estimatedTime}</div>
                <p className="text-sm text-black">Minutes</p>
              </div>
            </div>
            
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                {score >= 80 ? "Excellent work! You have a strong understanding of this topic." :
                 score >= 60 ? "Good job! Consider reviewing some concepts to improve further." :
                 "Keep practicing! Focus on the fundamentals and try again later."}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-3 justify-center">
              <Button onClick={resetAssessment} className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                View All Assessments
              </Button>
              <Button variant="outline" onClick={() => startAssessment(currentAssessment)}>
                Retake Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {calculateOverallProgress()}%
            </div>
            <p className="text-sm text-black">Overall Progress</p>
            <Progress value={calculateOverallProgress()} className="mt-3 h-2" />
          </CardContent>
        </Card>
        
        <Card className="border-2 border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {skillCategories.reduce((sum, cat) => sum + cat.skills.filter(s => s.completed).length, 0)}
            </div>
            <p className="text-sm text-black">Assessments Completed</p>
            <div className="flex justify-center mt-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round(skillCategories.reduce((sum, cat) => {
                const completedSkills = cat.skills.filter(s => s.completed && s.score);
                const avgScore = completedSkills.length > 0 
                  ? completedSkills.reduce((s, skill) => s + (skill.score || 0), 0) / completedSkills.length 
                  : 0;
                return sum + avgScore;
              }, 0) / skillCategories.length)}%
            </div>
            <p className="text-sm text-black">Average Score</p>
            <div className="flex justify-center mt-3">
              <Star className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3">
          {skillCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
              {category.icon}
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {skillCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {getIconComponent(category.icon)}
                  {category.name}
                  <Badge variant="outline" className="ml-auto">
                    Market Demand: {category.marketDemand}%
                  </Badge>
                </CardTitle>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.skills.map((skill) => (
                    <Card key={skill.id} className="border hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-lg">{skill.name}</h3>
                          <div className="flex flex-col items-end gap-2">
                            {skill.completed ? (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {skill.score}%
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not Started</Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              Market Value: {skill.marketValue}%
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-black mb-3">{skill.description}</p>
                        
                        {skill.prerequisites.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-black mb-1">Prerequisites:</p>
                            <div className="flex flex-wrap gap-1">
                              {skill.prerequisites.map(prereq => (
                                <Badge key={prereq} variant="outline" className="text-xs">
                                  {prereq}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mb-4">
                          <Badge className={getDifficultyColor(skill.difficulty)}>
                            {skill.difficulty}
                          </Badge>
                          <div className="flex items-center gap-4 text-sm text-black">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {skill.estimatedTime} min
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {skill.questions} questions
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          onClick={() => startAssessment(skill)}
                          className="w-full flex items-center gap-2"
                          variant={skill.completed ? "outline" : "default"}
                        >
                          <PlayCircle className="h-4 w-4" />
                          {skill.completed ? 'Retake Assessment' : 'Start Assessment'}
                        </Button>
                        
                        {skill.learningResources.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-black mb-2">Learning Resources:</p>
                            <div className="space-y-1">
                              {skill.learningResources.slice(0, 2).map((resource, index) => (
                                <a 
                                  key={index}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                  {resource.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-yellow-600" />
            Recommended Next Steps
          </CardTitle>
          <CardDescription>
            Based on your progress, here are some skills to focus on next
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {getRecommendations().map((skill) => (
              <Card key={skill.id} className="border border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">{skill.name}</h4>
                  <p className="text-sm text-black mb-3">{skill.description}</p>
                  <Button 
                    size="sm" 
                    onClick={() => startAssessment(skill)}
                    className="w-full"
                  >
                    Start Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SkillAssessment;