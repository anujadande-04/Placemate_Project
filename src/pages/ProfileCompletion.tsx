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
import { useToast } from "@/hooks/use-toast";

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Back to original 5 steps

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

  const testStorageConnection = async () => {
    try {
      console.log('Testing storage connection...');
      const { data, error } = await supabase.storage.listBuckets();
      console.log('Storage connection test result:', { data, error });
      
      if (error) {
        toast({
          title: "Storage Connection Issue",
          description: `Storage error: ${error.message}. Please check your Supabase configuration.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Storage Connection OK",
          description: `Found ${data?.length || 0} buckets: ${data?.map(b => b.name).join(', ') || 'none'}`,
        });
      }
    } catch (error) {
      console.error('Storage connection test failed:', error);
      toast({
        title: "Storage Test Failed",
        description: "Unable to connect to storage. Please check your network and Supabase settings.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    ensureStorageBuckets();
    fetchUser();
  }, []);

  const ensureStorageBuckets = async () => {
    try {
      console.log('Checking storage buckets...');
      
      // Check if resumes bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        console.log('Attempting to create bucket anyway...');
      }

      console.log('Available buckets:', buckets?.map(b => b.name));
      
      const resumesBucketExists = buckets?.some(bucket => bucket.name === 'resumes');
      
      if (!resumesBucketExists) {
        console.log('Creating resumes bucket...');
        
        // Try creating with minimal configuration first
        const { data: bucketData, error: createError } = await supabase.storage.createBucket('resumes', {
          public: true
        });
        
        if (createError) {
          console.error('Error creating resumes bucket:', createError);
          // Check if bucket already exists
          if (createError.message?.includes('already exists') || createError.message?.includes('Duplicate')) {
            console.log('Resumes bucket already exists');
          } else {
            console.warn('Bucket creation failed, upload may still work if bucket exists:', createError.message);
            // Don't throw error, let the upload attempt proceed
          }
        } else {
          console.log('Resumes bucket created successfully:', bucketData);
        }
      } else {
        console.log('Resumes bucket already exists');
      }
      
      // Also ensure certificates bucket exists for other functionality
      const certificatesBucketExists = buckets?.some(bucket => bucket.name === 'certificates');
      if (!certificatesBucketExists) {
        console.log('Creating certificates bucket...');
        const { error: certCreateError } = await supabase.storage.createBucket('certificates', {
          public: true
        });
        
        if (certCreateError && !certCreateError.message?.includes('already exists')) {
          console.error('Error creating certificates bucket:', certCreateError);
        }
      }
      
    } catch (error) {
      console.error('Error ensuring storage buckets:', error);
      // Don't throw error here, let upload attempt proceed
      console.log('Continuing with upload attempt despite bucket setup issues...');
    }
  };

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

    console.log('File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    // Validate file type - check both MIME type and extension
    if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file only.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size: ${(file.size / 1024 / 1024).toFixed(2)}MB. Please upload a file smaller than 5MB.`,
        variant: "destructive",
      });
      return;
    }

    // Validate file is not empty
    if (file.size === 0) {
      toast({
        title: "Empty file",
        description: "The selected file appears to be empty. Please choose a valid PDF file.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting upload process...');
      
      // Get current user first
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      console.log('User authenticated:', currentUser.id);
      
      // Ensure storage buckets exist
      try {
        await ensureStorageBuckets();
      } catch (bucketError) {
        console.warn('Bucket creation failed, but continuing with upload:', bucketError);
        // Continue with upload attempt even if bucket creation fails
      }

      // Use actual file extension
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const fileName = `${currentUser.id}/resume_${Date.now()}.${fileExt}`;
      
      console.log('Generated filename:', fileName);
      
      // First, try to delete existing resume if any (cleanup old files)
      try {
        const { data: existingFiles } = await supabase.storage
          .from('resumes')
          .list(currentUser.id);
        
        if (existingFiles && existingFiles.length > 0) {
          const oldFiles = existingFiles.map(f => `${currentUser.id}/${f.name}`);
          await supabase.storage.from('resumes').remove(oldFiles);
          console.log('Cleaned up old resume files');
        }
      } catch (deleteError) {
        console.log('No existing files to delete or cleanup failed:', deleteError);
      }
      
      // Upload the new resume
      console.log('Uploading to storage...');
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, { 
          cacheControl: '3600',
          upsert: false 
        });

      if (error) {
        console.error('Upload error details:', {
          message: error.message,
          error: error,
          fileName,
          fileSize: file.size
        });
        throw error;
      }

      console.log('Upload successful:', data);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(data.path);

      console.log('Generated public URL:', publicUrl);

      // Verify URL is valid
      if (!publicUrl || !publicUrl.includes(fileName.split('/')[1])) {
        throw new Error('Failed to generate valid URL for uploaded file');
      }

      setFormData(prev => ({ ...prev, resume: publicUrl }));
      
      toast({
        title: "Resume uploaded successfully",
        description: `${file.name} has been uploaded and is ready to use.`,
      });

      console.log('Upload process completed successfully');
      
    } catch (error) {
      console.error('Error uploading resume:', error);
      
      let errorMessage = 'Failed to upload resume. Please try again.';
      
      if (error.message?.includes('not authenticated')) {
        errorMessage = 'Please log in again to upload your resume.';
      } else if (error.message?.includes('Bucket not found') || error.message?.includes('bucket')) {
        errorMessage = 'Storage bucket not found. Please contact your administrator to set up the "resumes" storage bucket in Supabase.';
      } else if (error.message?.includes('row-level security') || error.message?.includes('policy')) {
        errorMessage = 'Storage access denied. Please contact your administrator to configure storage policies for the "resumes" bucket.';
      } else if (error.message?.includes('not allowed') || error.message?.includes('unauthorized')) {
        errorMessage = 'File upload permission denied. Please log in again or contact support.';
      } else if (error.message?.includes('size') || error.message?.includes('too large')) {
        errorMessage = 'File size exceeds limit. Please use a PDF file smaller than 5MB.';
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('duplicate') || error.message?.includes('exists')) {
        errorMessage = 'File upload conflict. Please try again.';
      } else if (error.message?.includes('Invalid') || error.message?.includes('mime')) {
        errorMessage = 'Invalid file type. Please upload a valid PDF file only.';
      }
      
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
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
              
              {/* Debug section - remove this in production */}
              {/* <div className="bg-gray-50 p-3 rounded-lg mt-4 max-w-md mx-auto">
                <p className="text-xs text-gray-500 mb-2">Troubleshooting Tools:</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={testStorageConnection}
                  className="text-xs"
                >
                  Test Storage Connection
                </Button>
              </div> */}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="resume" className="text-black mb-2 block">Upload Resume (PDF only, max 5MB)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Input
                    id="resume"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleResumeUpload}
                    className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Choose a PDF file to upload your resume
                  </p>
                </div>
              </div>
              
              {loading && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-blue-800">Uploading resume...</span>
                  </div>
                </div>
              )}
              
              {formData.resume && !loading && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="text-green-800 font-medium">Resume uploaded successfully!</span>
                  </div>
                  <a 
                    href={formData.resume} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm inline-flex items-center gap-1"
                  >
                    <FileText className="h-4 w-4" />
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