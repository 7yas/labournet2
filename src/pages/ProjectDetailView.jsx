import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Calendar, MapPin, Clock, User, Building, ArrowLeft, Trash2, Users } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { motion } from "framer-motion";
import { api } from "../services/api";

const ProjectDetailView = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.getProject(id);
        setJob(response.data);
      } catch (error) {
        console.error('Error fetching job:', error);
        toast({
          title: "Error",
          description: "Failed to fetch job details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id, toast]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6F7]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6F7]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link to="/contractor-job-posting">
            <Button variant="primary">Return to Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const handleRemoveProject = async () => {
    try {
      await api.deleteProject(id);
      toast({
        title: "Job Removed",
        description: "The job has been successfully removed.",
      });
      navigate("/contractor-job-posting");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove the job",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-[#F6F6F7]">
      {/* Header */}
      <header className="bg-[#004A57] text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#FF4B55] transform rotate-45" />
            <span className="text-[#EEE] text-xl font-medium">LabourNet</span>
          </Link>
          <nav className="hidden md:flex space-x-6 ml-12">
            <Link to="/contractor-dashboard" className="hover:text-[#FF4B55]">Dashboard</Link>
            <Link to="/contractor-job-posting" className="hover:text-[#FF4B55]">Jobs</Link>
            <Link to="/workers" className="hover:text-[#FF4B55]">Workers</Link>
            <Link to="/analytics" className="hover:text-[#FF4B55]">Analytics</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/company-profile">
            <div className="w-8 h-8 rounded-full bg-gray-300 cursor-pointer hover:ring-2 hover:ring-[#FF4B55] transition-all duration-300"></div>
          </Link>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Back button */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-[#004A57] transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
          </Button>
        </div>
      
        <motion.div 
          className="bg-white rounded-lg shadow-sm overflow-hidden mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <div className="flex items-center gap-2 text-gray-600 mt-2 flex-wrap">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                  
                  <span className="mx-2">•</span>
                  
                  <Badge variant="outline" className="bg-gray-50">
                    {job.projectType}
                  </Badge>
                  
                  <span className="mx-2">•</span>
                  
                  <Badge variant="outline" className="bg-gray-50">
                    {job.employmentType}
                  </Badge>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xl font-bold text-[#004A57]">
                  {typeof job.hourlyRate === 'object' 
                    ? `$${job.hourlyRate.min} - $${job.hourlyRate.max}/hr`
                    : `$${job.hourlyRate}/hr`}
                </div>
                <div className="text-sm text-gray-500">
                  {typeof job.timeline === 'object' 
                    ? `${new Date(job.timeline.startDate).toLocaleDateString()} - ${new Date(job.timeline.endDate).toLocaleDateString()}`
                    : job.timeline}
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="flex items-center text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>Status: {job.status}</span>
              </div>
              
              <div className="flex items-center text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>{job.applicantsCount || 0} applicants</span>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="details" className="w-full">
            <div className="px-6 border-b border-gray-200">
              <TabsList className="bg-transparent mb-0 h-auto">
                <TabsTrigger 
                  value="details" 
                  className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#FF4B55] data-[state=active]:text-[#FF4B55] rounded-none"
                >
                  Job Details
                </TabsTrigger>
                <TabsTrigger 
                  value="applications" 
                  className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#FF4B55] data-[state=active]:text-[#FF4B55] rounded-none"
                >
                  Applications
                </TabsTrigger>
                <TabsTrigger 
                  value="workers" 
                  className="py-3 data-[state=active]:border-b-2 data-[state=active]:border-[#FF4B55] data-[state=active]:text-[#FF4B55] rounded-none"
                >
                  Assigned Workers
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="details" className="p-6 mt-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-3">Job Description</h2>
                  <p className="text-gray-700 whitespace-pre-line">{job.jobDescription}</p>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-3">Requirements</h2>
                  <p className="text-gray-700 whitespace-pre-line">{job.requirements || 'No specific requirements listed'}</p>
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-3">Project Timeline</h2>
                  <p className="text-gray-700">
                    {typeof job.timeline === 'object'
                      ? `Start Date: ${new Date(job.timeline.startDate).toLocaleDateString()}\nEnd Date: ${new Date(job.timeline.endDate).toLocaleDateString()}`
                      : job.timeline}
                  </p>
                </div>
                
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    className="border-[#FF4B55] text-[#FF4B55] hover:bg-[#FF4B55] hover:text-white transition-all duration-300 hover:scale-105"
                    onClick={handleRemoveProject}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Remove Job
                  </Button>
                  <Button variant="outline" className="border-[#004A57] text-[#004A57] hover:bg-[#004A57] hover:text-white transition-all duration-300 hover:scale-105">
                    Edit Job
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="applications" className="p-6 mt-0">
              <div className="text-center py-8">
                <User className="h-16 w-16 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-600">No Applications Yet</h3>
                <p className="text-gray-500">
                  {job.applicantsCount ? 
                    "Applications need to be reviewed." : 
                    "When professionals apply to your job, they will appear here."}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="workers" className="p-6 mt-0">
              <div className="text-center py-8">
                <Users className="h-16 w-16 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-600">No Workers Assigned Yet</h3>
                <p className="text-gray-500 mb-4">
                  Assign workers to this job to see them listed here
                </p>
                <Link to="/appoint-workers">
                  <Button 
                    variant="primary" 
                    className="bg-[#FF4B55] hover:bg-[#e03e48] transition-all duration-300 hover:scale-105"
                  >
                    <Users className="mr-2 h-4 w-4" /> Appoint Workers
                  </Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default ProjectDetailView;
