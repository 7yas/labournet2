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
import axios from "axios";

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
  const [workerDetails, setWorkerDetails] = useState(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch projects posted by contractors
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch jobs from contractorjobpost collection
        const response = await fetch('http://localhost:5000/api/contractor-job-posts', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }

        const data = await response.json();
        
        // Fetch contractor details for each job
        const projectsWithContractorDetails = await Promise.all(
          data.map(async (project) => {
            try {
              // Get the contractor ID correctly
              const contractorId = project.postedBy?._id || project.postedBy;
              if (!contractorId) {
                console.error('No contractor ID found for project:', project._id);
                return project;
              }

              const contractorResponse = await fetch(`http://localhost:5000/api/profiles/contractor/${contractorId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });

              if (contractorResponse.ok) {
                const contractorData = await contractorResponse.json();
                return {
                  ...project,
                  contractorDetails: {
                    businessName: contractorData.businessName,
                    phoneNumber: contractorData.phoneNumber,
                    email: contractorData.email,
                    businessType: contractorData.businessType,
                    yearsOfExperience: contractorData.yearsOfExperience,
                    licenseNumber: contractorData.licenseNumber,
                    insuranceInfo: contractorData.insuranceInfo,
                    projectTypes: contractorData.projectTypes
                  }
                };
              }
              console.error('Failed to fetch contractor details for project:', project._id);
              return project;
            } catch (error) {
              console.error('Error fetching contractor details:', error);
              return project;
            }
          })
        );

        setProjects(projectsWithContractorDetails);
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

  // Fetch worker details
  useEffect(() => {
    const fetchWorkerDetails = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData && userData._id) {
          const response = await api.get(`/users/worker/${userData._id}`);
          setWorkerDetails(response.data);
        }
      } catch (error) {
        console.error('Error fetching worker details:', error);
      }
    };

    fetchWorkerDetails();
  }, []);

  const handleAccept = async (project) => {
    try {
      // Fetch contractor details using the correct ID
      const contractorId = project.postedBy?._id || project.postedBy;
      if (!contractorId) {
        throw new Error('No contractor ID found');
      }

      const response = await fetch(`http://localhost:5000/api/profiles/contractor/${contractorId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contractor details');
      }

      const contractorData = await response.json();
      setContractorDetails(contractorData);
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
        // Get the token and ensure it's properly formatted
        const token = localStorage.getItem('authToken');
        console.log('Token from localStorage:', token); // Debug log

        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        // Get user data
        const userData = JSON.parse(localStorage.getItem('userData'));
        console.log('User data from localStorage:', userData); // Debug log

        if (!userData) {
          throw new Error('No user data found. Please log in again.');
        }

        // Create application data
        const applicationData = {
          worker: userData._id,
          project: selectedJob._id,
          contractor: selectedJob.postedBy._id,
          status: 'pending',
          coverLetter: 'I am interested in this position and would like to apply.',
          expectedRate: selectedJob.hourlyRate?.min || userData.hourlyRate
        };

        console.log('Submitting application with data:', applicationData);

        // Submit application
        const response = await axios.post(
          'http://localhost:5000/api/applications',
          applicationData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 201) {
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
            title: "Application Submitted",
            description: "Your application has been submitted successfully.",
          });
        } else {
          throw new Error('Failed to submit application');
        }
      } catch (error) {
        console.error('Error applying to project:', error);
        console.error('Error response:', error.response?.data);
        
        // Handle specific error cases
        if (error.response?.status === 401) {
          toast({
            title: "Authentication Error",
            description: "Your session has expired. Please log in again.",
            variant: "destructive",
          });
          // Optionally redirect to login page
          // navigate('/login');
        } else if (error.response?.status === 400) {
          toast({
            title: "Validation Error",
            description: error.response.data.message || "Please check your application details and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.response?.data?.message || error.message || "Failed to submit application. Please try again.",
            variant: "destructive",
          });
        }
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

  const handleApply = async (projectId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const workerData = JSON.parse(localStorage.getItem('userData'));
      if (!workerData) {
        throw new Error('Worker data not found');
      }

      const applicationData = {
        project: projectId,
        worker: workerData._id,
        status: 'pending',
        applicationDate: new Date(),
        skills: workerData.skills || [],
        experience: workerData.experience || '',
        availability: workerData.availability || 'Full-time'
      };

      const response = await axios.post(
        'http://localhost:5000/api/worker-applications',
        applicationData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 201) {
        toast({
          title: "Success",
          description: "Application submitted successfully!",
          variant: "default",
        });
        
        // Update the project list to reflect the application
        setProjects(prevProjects => 
          prevProjects.map(project => 
            project._id === projectId 
              ? { ...project, hasApplied: true }
              : project
          )
        );
      }
    } catch (error) {
      console.error('Error applying for job:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
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
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setShowProfileDialog(true)}
          >
            <div className="w-8 h-8 rounded-full bg-gray-300"></div>
            <span>{workerDetails?.fullName || 'Loading...'}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </header>

      {/* Profile Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Worker Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-300"></div>
              <div>
                <h3 className="text-xl font-semibold">{workerDetails?.fullName || 'Worker'}</h3>
                <p className="text-gray-500">{workerDetails?.email || 'No email provided'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                <p>{workerDetails?.phoneNumber || 'No phone number provided'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Address</h4>
                <p>{workerDetails?.address || 'No address provided'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Hourly Rate</h4>
                <p>₹{workerDetails?.hourlyRate || '0'}/hr</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Skills</h4>
                <p>{workerDetails?.skills?.join(', ') || 'No skills listed'}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-briefcase w-4 h-4 mr-1">
                          <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                          <rect width="20" height="14" x="2" y="6" rx="2"></rect>
                        </svg>
                        <span>Posted by: {project.contractorDetails?.businessName || 'Contractor'} ({project.contractorDetails?.phoneNumber || 'No phone'})</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">₹{project.hourlyRate}/hr</div>
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
                    <div key={project._id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            <span>{project.location}</span>
                          </div>
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <BriefcaseIcon className="w-4 h-4 mr-1" />
                            <span>{project.projectType}</span>
                          </div>
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <CalendarIcon className="w-4 h-4 mr-1" />
                            <span>{project.timeline}</span>
                          </div>
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <PhoneIcon className="w-4 h-4 mr-1" />
                            <span>Contact: {project.contractorDetails?.phoneNumber || 'Not provided'}</span>
                          </div>
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-briefcase w-4 h-4 mr-1">
                              <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                              <rect width="20" height="14" x="2" y="6" rx="2"></rect>
                            </svg>
                            <span>Posted by: {project.contractorDetails?.businessName || 'Contractor'} ({project.contractorDetails?.phoneNumber || 'No phone'})</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold">₹{project.hourlyRate}/hr</div>
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