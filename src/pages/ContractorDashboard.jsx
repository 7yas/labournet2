import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { getProjects, createProject, createApplication } from '../lib/api';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '../components/ui/dialog';
import PostJobForm from '../components/PostJobForm';
import { motion } from 'framer-motion';
import Footer from '../components/layout/Footer';
import { Briefcase, Calendar, MapPin, Clock } from 'lucide-react';
import ContractorNavbar from '../components/layout/ContractorNavbar';
import axios from 'axios';

const ContractorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, token } = useAuth();
  const [isPostJobDialogOpen, setPostJobDialogOpen] = useState(false);
  const [isContactDialogOpen, setContactDialogOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showApplications, setShowApplications] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    projectType: 'Commercial',
    location: '',
    timeline: '',
    hourlyRate: '',
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [activeFilter, setActiveFilter] = useState("All Projects");

  useEffect(() => {
    if (!user || !token) {
      navigate('/login?role=contractor');
      return;
    }
    fetchProjects();
  }, [user, token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (formData) => {
    try {
      const jobPostData = {
        title: formData.title,
        location: formData.location,
        employmentType: formData.employmentType || 'Full-time',
        hourlyRate: formData.hourlyRate,
        jobDescription: formData.description,
        requirements: formData.requirements || '',
        company: user.businessName || 'Your Company',
        projectType: formData.projectType,
        timeline: formData.timeline || '3 months',
        expiresAfter: '30 days',
        status: 'active',
        postedBy: user._id
      };

      const response = await fetch('http://localhost:5000/api/contractor-job-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jobPostData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post job');
      }

      toast({
        title: 'Success',
        description: 'Job posted successfully',
      });

      closePostJobDialog();
      fetchProjects();
    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to post job',
        variant: 'destructive',
      });
    }
  };

  const handleApplyNow = async (projectId) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please login to apply for projects",
          variant: "destructive",
        });
        navigate('/login?role=contractor');
        return;
      }

      // Find the project details
      const project = projects.find(p => p._id === projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Create application data
      const applicationData = {
        project: projectId,
        contractor: user._id,
        status: 'pending',
        coverLetter: `I am interested in working on your project "${project.title}". I have ${user.yearsOfExperience} years of experience in ${user.businessType}. My business name is ${user.businessName} and I am licensed (License #: ${user.licenseNumber}).`,
        expectedRate: 35,
        contractorDetails: {
          businessName: user.businessName,
          businessType: user.businessType,
          yearsOfExperience: user.yearsOfExperience,
          licenseNumber: user.licenseNumber,
          insuranceInfo: user.insuranceInfo,
          projectTypes: user.projectTypes,
          address: user.address,
          phoneNumber: user.phoneNumber,
          email: user.email
        }
      };

      console.log('Submitting application:', applicationData);

      // Submit application
      const response = await createApplication(applicationData);
      console.log('Application response:', response.data);
      
      toast({
        title: "Success",
        description: "Your application has been submitted successfully",
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  const openPostJobDialog = () => setPostJobDialogOpen(true);
  const closePostJobDialog = () => setPostJobDialogOpen(false);

  const openContactDialog = () => setContactDialogOpen(true);
  const closeContactDialog = () => setContactDialogOpen(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to fetch projects');
      if (error.response?.status === 401) {
        navigate('/login?role=contractor');
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch projects. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/worker-applications/contractor/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setApplications(response.data);
      setShowApplications(true);
    } catch (err) {
      setError('Failed to fetch applications');
    }
  };

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      const response = await axios.patch(
        `http://localhost:5000/api/worker-applications/${applicationId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update the applications list
      setApplications(applications.map(app => 
        app._id === applicationId ? response.data : app
      ));
    } catch (err) {
      setError('Failed to update application status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-white">
      <ContractorNavbar />
      
      <main className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Post Job Button */}
        <div className="flex justify-end mb-6">
            <button
              onClick={openPostJobDialog}
            className="bg-[#FF4B55] text-white px-4 py-2 rounded-lg hover:bg-[#e03e48] transition-colors"
          >
                            Post Job
                          </button>
        </div>

        {/* Post Job Dialog */}
        <Dialog open={isPostJobDialogOpen} onOpenChange={setPostJobDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogTitle>Post a New Job</DialogTitle>
            <DialogDescription>
              Fill out the form below to post a new job opportunity.
            </DialogDescription>
            <PostJobForm 
              onSubmit={handleSubmit}
              onClose={closePostJobDialog}
            />
          </DialogContent>
        </Dialog>

        {/* Available Projects Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#121224] mb-6">Available projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map(project => (
            <div
                key={project._id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:border-[#FF4B55] transition-colors card-hover cursor-pointer"
                onClick={() => navigate(`/project-detail-view/${project._id}`)}
            >
              <div className="h-40 bg-gray-200"></div>
              <div className="p-4">
                <div className="flex justify-between mb-2">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      {project.projectType}
                    </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {project.timeline?.endDate ? 
                        `${Math.ceil((new Date(project.timeline.endDate) - new Date()) / (1000 * 60 * 60 * 24))} days` : 
                        'Ongoing'}
                  </span>
                </div>
                  <h3 className="font-semibold mb-1">{project.title}</h3>
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {project.location}
                  </p>
                  <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Posted by: {project.postedBy?.businessName || '-'}
                </p>
                <div className="flex justify-between items-center">
                    <span className="text-[#FF4B55] font-bold">
                      ${project.hourlyRate?.min}-{project.hourlyRate?.max}/hr
                  </span>
                  <button
                    className="text-[#FF4B55] text-sm font-medium border border-[#FF4B55] px-3 py-1 rounded hover:bg-[#FF4B55] hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyNow(project._id);
                      }}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
            ))}
          </div>
        </div>

        {showApplications ? (
          <div className="bg-white rounded-lg shadow p-6 mt-12">
            <h2 className="text-2xl font-semibold mb-4">Worker Applications</h2>
            {applications.length === 0 ? (
              <p className="text-gray-500">No applications found</p>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{application.fullName}</h3>
                        <p className="text-gray-600">{application.email}</p>
                        <p className="text-gray-600">Project: {application.projectTitle}</p>
                        <p className="text-gray-600">Skills: {application.skills.join(', ')}</p>
                        <p className="text-gray-600">Hourly Rate: ${application.hourlyRate}</p>
                      </div>
                      <div className="flex space-x-2">
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApplicationStatus(application._id, 'accepted')}
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleApplicationStatus(application._id, 'rejected')}
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {application.status !== 'pending' && (
                          <span className={`px-3 py-1 rounded ${
                            application.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-end mt-6">
            <button
              onClick={fetchApplications}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              View Applications
            </button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default ContractorDashboard;