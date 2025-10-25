import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  Upload, 
  X, 
  Plus, 
  FileText, 
  Award,
  Briefcase,
  Code,
  Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    cgpa: '',
    branch: '',
    technologies: [],
    certifications: [],
    internships: [],
    experience: '',
    projects: [],
    resume: null
  });

  // Temporary input states
  const [techInput, setTechInput] = useState('');
  const [internshipInput, setInternshipInput] = useState('');
  const [projectInput, setProjectInput] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      // Pre-fill name from profiles table if available
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user.id)
        .single();
      if (profile?.name) {
        setFormData(prev => ({ ...prev, name: profile.name }));
      }
    } else {
      navigate('/login');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addToArray = (field, value, inputSetter) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      inputSetter('');
    }
  };

  const removeFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleCertificationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const uploadPromises = files.map(async (file: File) => {
        const fileName = `${user.id}/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
          .from('certificates')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('certificates')
          .getPublicUrl(data.path);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, ...urls]
      }));
    } catch (error) {
      console.error('Error uploading certificates:', error);
      alert('Error uploading certificates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileName = `${user.id}/resume.pdf`;
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(data.path);

      setFormData(prev => ({ ...prev, resume: publicUrl }));
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Error uploading resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('student_details')
        .upsert({
          id: user.id,
          name: formData.name,
          cgpa: parseFloat(formData.cgpa),
          branch: formData.branch,
          technologies: formData.technologies,
          certifications_urls: formData.certifications,
          internships: formData.internships,
          experience: formData.experience,
          projects: formData.projects,
          resume_url: formData.resume,
          profile_completed: true
        });

      if (error) throw error;

      navigate('/student-dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.cgpa && formData.branch;
      case 2:
        return formData.technologies.length > 0;
      case 3:
        return formData.certifications.length > 0;
      case 4:
        return formData.internships.length > 0 || formData.experience || formData.projects.length > 0;
      case 5:
        return formData.resume;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <GraduationCap className="h-16 w-16 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-black">Basic Information</h2>
              <p className="text-black">Let's start with your academic details</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-black">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="cgpa" className="text-black">CGPA</Label>
                <Input
                  id="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa}
                  onChange={(e) => handleInputChange('cgpa', e.target.value)}
                  placeholder="Enter your CGPA (e.g., 8.5)"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="branch" className="text-black">Branch/Department</Label>
                <Input
                  id="branch"
                  value={formData.branch}
                  onChange={(e) => handleInputChange('branch', e.target.value)}
                  placeholder="e.g., Computer Science Engineering"
                  required
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Code className="h-16 w-16 mx-auto text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold text-black">Technical Skills</h2>
              <p className="text-black">Add your programming languages and technologies</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="e.g., React, Python, Java"
                  onKeyPress={(e) => e.key === 'Enter' && addToArray('technologies', techInput, setTechInput)}
                />
                <Button 
                  type="button"
                  onClick={() => addToArray('technologies', techInput, setTechInput)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.technologies.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tech}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFromArray('technologies', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Award className="h-16 w-16 mx-auto text-yellow-600 mb-4" />
              <h2 className="text-2xl font-bold text-black">Certifications</h2>
              <p className="text-black">Upload your certificates (images)</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="certifications" className="text-black">Upload Certificate Images</Label>
                <Input
                  id="certifications"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleCertificationUpload}
                  className="cursor-pointer"
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.certifications.map((url, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={url} 
                      alt={`Certificate ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFromArray('certifications', index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Briefcase className="h-16 w-16 mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-black">Experience & Projects</h2>
              <p className="text-black">Tell us about your internships, experience, and projects</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <Label className="text-black">Internships</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={internshipInput}
                    onChange={(e) => setInternshipInput(e.target.value)}
                    placeholder="e.g., Software Developer Intern at XYZ Company"
                    onKeyPress={(e) => e.key === 'Enter' && addToArray('internships', internshipInput, setInternshipInput)}
                  />
                  <Button 
                    type="button"
                    onClick={() => addToArray('internships', internshipInput, setInternshipInput)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.internships.map((internship, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {internship}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromArray('internships', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="experience" className="text-black">Work Experience</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="Describe your work experience, achievements, etc."
                  rows={4}
                  className="text-black"
                />
              </div>

              <div>
                <Label className="text-black">Projects</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={projectInput}
                    onChange={(e) => setProjectInput(e.target.value)}
                    placeholder="e.g., E-commerce Website using React and Node.js"
                    onKeyPress={(e) => e.key === 'Enter' && addToArray('projects', projectInput, setProjectInput)}
                  />
                  <Button 
                    type="button"
                    onClick={() => addToArray('projects', projectInput, setProjectInput)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.projects.map((project, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {project}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromArray('projects', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="h-16 w-16 mx-auto text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-black">Resume Upload</h2>
              <p className="text-black">Upload your resume (PDF format)</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="resume" className="text-black">Upload Resume (PDF)</Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  className="cursor-pointer"
                />
              </div>
              
              {formData.resume && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="text-green-800">Resume uploaded successfully!</span>
                  </div>
                  <a 
                    href={formData.resume} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View uploaded resume
                  </a>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-purple-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Complete Your Profile
            </h1>
            <Badge variant="outline" className="px-3 py-1 text-black">
              Step {currentStep} of {totalSteps}
            </Badge>
          </div>
          
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        <Card className="shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {renderStep()}
            
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              
              {currentStep === totalSteps ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateCurrentStep() || loading}
                  className="bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 hover:from-blue-600 hover:via-pink-600 hover:to-purple-600"
                >
                  {loading ? 'Saving...' : 'Complete Profile'}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={!validateCurrentStep()}
                  className="bg-gradient-to-r from-blue-500 via-pink-500 to-purple-500 hover:from-blue-600 hover:via-pink-600 hover:to-purple-600"
                >
                  Next
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileCompletion;