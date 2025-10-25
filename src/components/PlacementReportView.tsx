/**
 * Comprehensive Placement Report Component
 * Displays detailed placement prediction report with visualizations
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Brain, 
  Award, 
  Calendar, 
  CheckCircle,
  AlertCircle,
  Download,
  Share,
  BookOpen,
  Code,
  Users
} from 'lucide-react';
import { PlacementReport } from '@/services/reportGenerationService';

interface PlacementReportViewProps {
  report: PlacementReport;
  onClose: () => void;
  onExport?: () => void;
  onShare?: () => void;
}

export const PlacementReportView: React.FC<PlacementReportViewProps> = ({
  report,
  onClose,
  onExport,
  onShare
}) => {
  const { 
    studentInfo, 
    placementPrediction, 
    skillAnalysis, 
    marketInsights, 
    recommendations, 
    careerPath, 
    actionPlan 
  } = report;

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600';
    if (probability >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Placement Prediction Report
          </h1>
          <p className="text-gray-300">
            Generated on {report.generatedAt.toLocaleDateString()} for {studentInfo.name}
          </p>
        </div>
        <div className="flex space-x-2">
          {onExport && (
            <Button variant="outline" onClick={onExport} className="border-gray-600 text-white hover:bg-gray-800">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          )}
          {onShare && (
            <Button variant="outline" onClick={onShare} className="border-gray-600 text-white hover:bg-gray-800">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="border-gray-600 text-white hover:bg-gray-800">
            Close
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Placement Probability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getProbabilityColor(placementPrediction.probability)}`}>
              {placementPrediction.probability}%
            </div>
            <Badge className={getConfidenceColor(placementPrediction.confidence)}>
              {placementPrediction.confidence} Confidence
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Skills Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {skillAnalysis.completedSkills}/{skillAnalysis.totalSkills}
            </div>
            <Progress 
              value={(skillAnalysis.completedSkills / skillAnalysis.totalSkills) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Market Readiness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {skillAnalysis.marketDemandScore}/100
            </div>
            <p className="text-sm text-gray-400">Based on industry demand</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Report Content */}
      <Tabs defaultValue="prediction" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800 border-slate-700">
          <TabsTrigger value="prediction" className="text-gray-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white">Prediction</TabsTrigger>
          <TabsTrigger value="skills" className="text-gray-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white">Skills</TabsTrigger>
          <TabsTrigger value="recommendations" className="text-gray-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white">Advice</TabsTrigger>
          <TabsTrigger value="career" className="text-gray-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white">Career</TabsTrigger>
          <TabsTrigger value="action" className="text-gray-300 data-[state=active]:bg-slate-700 data-[state=active]:text-white">Action Plan</TabsTrigger>
        </TabsList>

        {/* Placement Prediction Tab */}
        <TabsContent value="prediction" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Target className="w-5 h-5 mr-2" />
                  Placement Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Prediction Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Probability:</span>
                      <span className={`font-semibold ${getProbabilityColor(placementPrediction.probability)}`}>
                        {placementPrediction.probability}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Category:</span>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">{placementPrediction.placementCategory}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Timeline:</span>
                      <span className="text-white">{placementPrediction.timelineEstimate}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Users className="w-5 h-5 mr-2" />
                  Student Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-white">Academic</h4>
                    <p className="text-gray-400">CGPA: {studentInfo.cgpa || 'Not provided'}/10</p>
                    <p className="text-gray-400">Branch: {studentInfo.branch || 'Not specified'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Experience</h4>
                    <p className="text-gray-400">
                      Projects: {studentInfo.projects && studentInfo.projects.length > 0 ? studentInfo.projects.length : 'None listed'}
                    </p>
                    <p className="text-gray-400">
                      Internships: {studentInfo.internships && studentInfo.internships.length > 0 ? studentInfo.internships.length : 'None listed'}
                    </p>
                    <p className="text-gray-400">
                      Certifications: {studentInfo.certifications > 0 ? studentInfo.certifications : 'None listed'}
                    </p>
                  </div>
                </div>
                
                <Separator className="bg-slate-700" />
                
                <div>
                  <h4 className="font-semibold text-white mb-2">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {studentInfo.technologies && studentInfo.technologies.length > 0 ? (
                      studentInfo.technologies.map((tech, index) => (
                        <Badge key={index} variant="secondary" className="bg-slate-700 text-gray-300">{tech}</Badge>
                      ))
                    ) : (
                      <p className="text-gray-400">No technologies listed</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Skills Analysis Tab */}
        <TabsContent value="skills" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {skillAnalysis.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-white">{strength}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {skillAnalysis.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-white">{weakness}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Code className="w-5 h-5 mr-2" />
                  Skill Gaps to Address
                </CardTitle>
                <CardDescription className="text-gray-400">
                  These skills are in high demand but missing from your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {skillAnalysis.skillGaps.map((gap, index) => (
                    <Badge key={index} variant="destructive" className="justify-center">
                      {gap}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Technical Readiness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-2">
                  {skillAnalysis.technicalReadiness}%
                </div>
                <Progress value={skillAnalysis.technicalReadiness} className="mb-2" />
                <p className="text-sm text-gray-400">
                  Based on completed skill assessments
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Market Demand Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-2">
                  {skillAnalysis.marketDemandScore}/100
                </div>
                <Progress value={skillAnalysis.marketDemandScore} className="mb-2" />
                <p className="text-sm text-gray-400">
                  Based on current industry trends
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Immediate Actions</CardTitle>
                <CardDescription>Next 2 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recommendations.immediate.map((action, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-white">Short-term Goals</CardTitle>
                <CardDescription>Next 3 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recommendations.shortTerm.map((goal, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white text-sm">{goal}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-white">Long-term Vision</CardTitle>
                <CardDescription>Next 6-12 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recommendations.longTerm.map((vision, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white text-sm">{vision}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Skill Priorities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recommendations.skillPriorities.map((priority, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {priority}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-white">Certification Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recommendations.certificationSuggestions.map((cert, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-blue-500" />
                      <span className="text-white">{cert}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Career Path Tab */}
        <TabsContent value="career" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-white">Recommended Career Path</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">Primary Role</h4>
                  <Badge variant="default" className="text-lg px-4 py-2">
                    {careerPath.primaryRole}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Alternative Roles</h4>
                  <div className="space-y-1">
                    {careerPath.alternativeRoles.map((role, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-1">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Experience Level</h4>
                  <Badge variant="secondary">{careerPath.experienceLevel}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-white">Progression Path</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {careerPath.progressionPath.map((stage, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <span className="text-white">{stage}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">Required Skills for {careerPath.primaryRole}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {careerPath.requiredSkills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="justify-center">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Action Plan Tab */}
        <TabsContent value="action" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Calendar className="w-5 h-5 mr-2" />
                  Next 30 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {actionPlan.next30Days.map((action, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Calendar className="w-5 h-5 mr-2" />
                  Next 90 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {actionPlan.next90Days.map((action, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Calendar className="w-5 h-5 mr-2" />
                  Next 6 Months
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {actionPlan.next6Months.map((action, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Target className="w-5 h-5 mr-2" />
                Key Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {actionPlan.milestones.map((milestone, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-white">{milestone.target}</h4>
                      <Badge 
                        variant={milestone.priority === 'High' ? 'destructive' : 
                                milestone.priority === 'Medium' ? 'default' : 'secondary'}
                      >
                        {milestone.priority} Priority
                      </Badge>
                    </div>
                    <p className="text-gray-600">Deadline: {milestone.deadline}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
