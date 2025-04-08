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

const ContractorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPostJobDialogOpen, setPostJobDialogOpen] = useState(false);
  const [isContactDialogOpen, setContactDialogOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

    fetchProjects();
  }, [navigate, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (formData) => {
    try {
      // Create project data with the current user's ID
      const projectData = {
        ...formData,
        status: 'active',
        contractor: user._id,
        employmentType: 'Contract',
        timeline: {
          startDate: formData.startDate,
          endDate: formData.endDate
        },
        hourlyRate: {
          min: parseInt(formData.hourlyRate.split('-')[0]),
          max: parseInt(formData.hourlyRate.split('-')[1])
        }
      };

      // Create the project
      await createProject(projectData);
      
      // Close the dialog
      setPostJobDialogOpen(false);
      
      // Reset form data
      setFormData({
        title: '',
        projectType: 'Commercial',
        location: '',
        timeline: '',
        hourlyRate: '',
        description: ''
      });
      
      // Refresh the projects list
      const response = await getProjects();
      setProjects(response.data);
      
      // Show success message
      toast({
        title: "Success",
        description: "Project posted successfully",
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to post project",
        variant: "destructive",
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#004A57] text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#FF4B55] transform rotate-45" />
            <span className="text-[#EEE] text-xl font-medium">LabourNet</span>
          </a>
          <nav className="hidden md:flex space-x-6 ml-12">
            <a href="/contractor-dashboard" className="hover:text-[#FF4B55]">Dashboard</a>
            <a href="/contractor-job-posting" className="hover:text-[#FF4B55]">Jobs</a>
            <a href="/workers" className="hover:text-[#FF4B55]">Workers</a>
            <a href="/analytics" className="hover:text-[#FF4B55]">Analytics</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <button
              className="flex items-center gap-2 transition-transform hover:scale-105 bg-[#FF4B55] text-white px-4 py-2 rounded-md"
              onClick={openPostJobDialog}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14m-7-7v14"></path>
              </svg>
              Post Job
            </button>
            {isPostJobDialogOpen && (
              <dialog className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0 rounded-lg" open>
                <div className="sticky top-0 flex justify-between items-center bg-white p-4 border-b z-10">
                    <h2 className="text-lg font-semibold">Post a New Project</h2>
                          <button
                            onClick={closePostJobDialog}
                    className="text-gray-500 hover:text-gray-700"
                          >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                          </button>
                </div>
                <PostJobForm onSubmit={handleSubmit} />
              </dialog>
            )}
          </div>
          <a href="/company-profile">
            <div className="w-8 h-8 rounded-full bg-gray-300 cursor-pointer hover:ring-2 hover:ring-[#FF4B55] transition-all duration-300"></div>
          </a>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-[#004A57] text-white py-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Find Construction Jobs & Workers</h1>
          <p className="text-[#EEE] mb-6">Connect with top builders and manage your workforce efficiently.<br />
          Access high-value construction jobs and skilled laborers.</p>
          
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <div className="flex-grow relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              <input 
                type="text" 
                placeholder="Search for workers or jobs..." 
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg hover:border-[#FF4B55] focus:border-[#FF4B55] focus:outline-none transition-colors"
                id="searchQuery"
              />
            </div>
            <button className="bg-[#FF4B55] text-white px-4 py-2 rounded-md md:w-auto">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4 max-w-5xl">
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

        {/* Popular Categories */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-[#121224] mb-6">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-[#FF4B55] transition-colors cursor-pointer">
              <h3 className="font-semibold">Commercial</h3>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-[#FF4B55] transition-colors cursor-pointer">
              <h3 className="font-semibold">Residential</h3>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-[#FF4B55] transition-colors cursor-pointer">
              <h3 className="font-semibold">Industrial</h3>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-[#FF4B55] transition-colors cursor-pointer">
              <h3 className="font-semibold">Infrastructure</h3>
            </div>
          </div>
        </div>

        {/* Footer Content */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm border-t border-gray-200 pt-8">
          <div>
            <h3 className="font-semibold mb-4">About LabourNet</h3>
            <p className="text-gray-600">Connecting quality workers with great construction jobs across the nation.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="/contractor-job-posting" className="hover:text-[#FF4B55]">Find Jobs</a></li>
              <li>
                <span 
                  className="hover:text-[#FF4B55] cursor-pointer"
                  onClick={openPostJobDialog}
                >Post a Job</span>
              </li>
              <li><a href="/workers" className="hover:text-[#FF4B55]">Our Services</a></li>
              <li><a href="/company-profile" className="hover:text-[#FF4B55]">For Employers</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-600">
              <li><a href="#" className="hover:text-[#FF4B55]">Help Center</a></li>
              <li><a href="#" className="hover:text-[#FF4B55]">Training Programs</a></li>
              <li><a href="#" className="hover:text-[#FF4B55]">Career Resources</a></li>
              <li><a href="#" className="hover:text-[#FF4B55]">Safety Guidelines</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <button
              className="w-full mb-4 px-4 py-2 border rounded-md hover:border-[#FF4B55]"
              onClick={openContactDialog}
            >
              Contact Us
            </button>
            {isContactDialogOpen && (
              <dialog className="max-w-4xl p-6 rounded-lg" open>
                <div>
                  <div>
                    <h2 className="text-lg font-semibold">Contact Us</h2>
                    <p className="text-gray-500">Send us a message and we'll get back to you</p>
                  </div>
                  <div>
                    <form className="mt-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Name</label>
                          <input type="text" className="w-full p-2 border rounded" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Email</label>
                          <input type="email" className="w-full p-2 border rounded" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Message</label>
                          <textarea className="w-full p-2 border rounded h-32"></textarea>
                        </div>
                        <div>
                          <button type="submit" className="bg-[#FF4B55] text-white px-4 py-2 rounded-md">
                            Send Message
                          </button>
                          <button
                            type="button"
                            onClick={closeContactDialog}
                            className="ml-2 px-4 py-2 border rounded-md"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </dialog>
            )}
            <ul className="space-y-2 text-gray-600">
              <li>123 Build St., Suite 700</li>
              <li>San Francisco, CA 94103</li>
              <li>(555) 123-4567</li>
              <li>support@labournet.com</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContractorDashboard;