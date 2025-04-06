import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { CheckIcon, XIcon, MapPinIcon, CalendarIcon, ClockIcon, BriefcaseIcon, PhoneIcon } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { api } from "../services/api";

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock user ID for testing
  const mockUserId = "65f8a1b2c3d4e5f6a7b8c9d0";
  
  const [projects, setProjects] = useState([]);
  const [showAllJobs, setShowAllJobs] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contractorDetails, setContractorDetails] = useState(null);

  // Fetch projects posted by contractors
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Fetch only projects posted by contractors
        const response = await api.getProjects();
        // Filter projects to only show those posted by contractors
        const contractorProjects = response.data.filter(project => 
          project.contractorDetails && project.contractorDetails._id
        );
        setProjects(contractorProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: "Error",
          description: "Failed to fetch projects. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Load active jobs from localStorage on component mount
  useEffect(() => {
    const savedActiveJobs = localStorage.getItem('activeJobs');
    if (savedActiveJobs) {
      setActiveJobs(JSON.parse(savedActiveJobs));
    }
  }, []);

  const handleAccept = async (project) => {
    try {
      // No need to fetch contractor details separately as they're already populated
      setContractorDetails(project.contractorDetails);
      setSelectedJob(project);
    setShowAcceptDialog(true);
    } catch (error) {
      console.error('Error preparing job application:', error);
      toast({
        title: "Error",
        description: "Failed to prepare job application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmAccept = async () => {
    if (selectedJob && contractorDetails) {
      try {
        // Apply to the project
        await api.applyToProject({
          project: selectedJob._id,
          worker: mockUserId,
          status: 'pending',
          coverLetter: "I am interested in working on this project",
          expectedRate: selectedJob.hourlyRate.min,
          contractorDetails: {
            businessName: contractorDetails.businessName,
            businessType: contractorDetails.businessType,
            yearsOfExperience: contractorDetails.yearsOfExperience,
            licenseNumber: contractorDetails.licenseNumber,
            insuranceInfo: contractorDetails.insuranceInfo,
            projectTypes: contractorDetails.projectTypes,
            phoneNumber: contractorDetails.phoneNumber
          }
        });

        // Add job to active jobs with contractor details
        const updatedActiveJobs = [...activeJobs, {
          ...selectedJob,
          accepted: true,
          contractor: contractorDetails
        }];
      setActiveJobs(updatedActiveJobs);
      
      // Save to localStorage
      localStorage.setItem('activeJobs', JSON.stringify(updatedActiveJobs));
      
      // Remove the job from available jobs
        setProjects(projects.filter(p => p._id !== selectedJob._id));
      
      setShowAcceptDialog(false);
      
      toast({
        title: "Job Accepted",
          description: "Your application has been submitted successfully.",
        });
      } catch (error) {
        console.error('Error applying to project:', error);
        toast({
          title: "Error",
          description: "Failed to apply for the job. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleReject = (projectId) => {
    setProjects(projects.filter(project => project._id !== projectId));
  };

  const goToProfile = () => {
    navigate('/worker-profile');
  };

  const goToActiveWork = () => {
    navigate('/active-work');
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleViewJobDetail = (projectId) => {
    navigate(`/job-detail/${projectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A57] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F7]">
      {/* Header */}
      <header className="bg-[#004A57] text-white py-3 px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#5D8AA8] transform rotate-45" />
          <span className="text-[#EEE] text-xl font-medium">LabourNet</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-5 h-5 rounded-full bg-[#5D8AA8] flex items-center justify-center text-white text-xs">
              {activeJobs.length}
            </div>
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
            <span>Test Worker</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        {showAllJobs ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Jobs Near You</h1>
              <Button variant="primary" onClick={() => setShowAllJobs(false)}>
                Back to Dashboard
              </Button>
            </div>
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project._id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h2 className="text-lg font-semibold">{project.title}</h2>
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        <span>{project.location}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <BriefcaseIcon className="w-4 h-4 mr-1" />
                        <span>{project.projectType}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <CalendarIcon className="w-4 h-4 mr-1" />
                        <span>{project.employmentType}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm mt-1">
                        <BriefcaseIcon className="w-4 h-4 mr-1" />
                        <span>Posted by: {project.contractorDetails?.businessName}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">₹{project.hourlyRate.min}/hr</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button 
                      className="flex items-center justify-center" 
                      onClick={() => handleAccept(project)}
                      variant="primary"
                    >
                      <CheckIcon className="w-4 h-4 mr-1" /> Apply Now
                    </Button>
                    <Button 
                      className="flex items-center justify-center bg-[#5D8AA8] hover:bg-[#4A7A96] text-white" 
                      onClick={() => handleReject(project._id)}
                    >
                      <XIcon className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats Cards */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-gray-500 text-sm mb-2">Total Applications</h2>
                <p className="text-4xl font-bold">{activeJobs.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-gray-500 text-sm mb-2">Available Jobs</h2>
                <p className="text-4xl font-bold">{projects.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-gray-500 text-sm mb-2">Active Jobs</h2>
                <p className="text-4xl font-bold">{activeJobs.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {/* Jobs Near You */}
              <div className="col-span-2 bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Jobs Near You</h2>
                  <Button variant="primary" onClick={() => setShowAllJobs(true)}>
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {projects.slice(0, 3).map(project => (
                    <div key={project._id} className="border-b pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{project.title}</h3>
                          <p className="text-gray-500 text-sm">{project.location}</p>
                        </div>
                        <span className="text-[#004A57] font-semibold">₹{project.hourlyRate.min}/hr</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">{project.projectType}</span>
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">{project.employmentType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Button className="w-full" onClick={goToProfile}>
                    Update Profile
                  </Button>
                  <Button className="w-full" onClick={goToActiveWork}>
                    View Active Work
                  </Button>
                  <Button className="w-full" variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Accept Job Dialog with Contractor Details */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
          <DialogContent>
          <DialogHeader>
              <DialogTitle>Apply for Job</DialogTitle>
          </DialogHeader>
            {selectedJob && contractorDetails && (
            <div className="py-4">
              <h3 className="text-lg font-semibold mb-4">Contractor Details</h3>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                  <BriefcaseIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span>{contractorDetails.businessName}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPinIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span>{contractorDetails.location}</span>
                </div>
                <div className="flex items-start gap-2">
                  <PhoneIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span>{contractorDetails.phoneNumber}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <BriefcaseIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span>{contractorDetails.businessType}</span>
                </div>
                <div className="flex items-start gap-2">
                    <CalendarIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span>{contractorDetails.yearsOfExperience} years of experience</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-4">Job Details</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <BriefcaseIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span>{selectedJob.title}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span>{selectedJob.location}</span>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span>{selectedJob.employmentType}</span>
                </div>
                <div className="flex items-start gap-2">
                    <ClockIcon className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span>₹{selectedJob.hourlyRate.min}/hr</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
              <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmAccept}>
                Confirm Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </main>
    </div>
  );
};

export default WorkerDashboard;