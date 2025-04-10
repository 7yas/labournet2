import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import PostProjectForm from "@/components/PostProjectForm";
import { useProjectContext } from "@/components/PostProjectForm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Plus, Calendar, User, Building, ArrowRight, Users, MapPin, Clock, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import PostJobForm from '../components/PostJobForm';
import ContractorNavbar from '../components/layout/ContractorNavbar';
import Footer from '../components/layout/Footer';
import axios from 'axios';

const ContractorJobPosting = () => {
  const { projects } = useProjectContext();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPostJobDialogOpen, setPostJobDialogOpen] = useState(false);
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user?._id && token) {
      fetchJobPosts();
      fetchApplicationsCount();
    } else {
      setError('Please log in to view your job posts');
      setLoading(false);
    }
  }, [user, token]);

  const fetchJobPosts = async () => {
    if (!user?._id || !token) {
      setError('Please log in to view your job posts');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch(
        `http://localhost:5000/api/contractor-job-posts/contractor/${user._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched job posts:', data);
      setJobPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching job posts:', error);
      setError(error.message || 'Failed to fetch job posts');
      setJobPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationsCount = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/worker-applications/contractor/count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setApplicationsCount(response.data.count);
    } catch (error) {
      console.error('Error fetching applications count:', error);
      setApplicationsCount(0);
    }
  };

  const handleSubmit = async (formData) => {
    if (!token) {
      toast({
        title: 'Error',
        description: 'Please log in to post a job',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/contractor-job-posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to post job');
      }

      const data = await response.json();
      toast({
        title: 'Success',
        description: 'Job posted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setPostJobDialogOpen(false);
      fetchJobPosts();
    } catch (error) {
      console.error('Error posting job:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <ContractorNavbar />
        <main className="container mx-auto py-8 px-4 max-w-5xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4B55] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading job posts...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <ContractorNavbar />
        <main className="container mx-auto py-8 px-4 max-w-5xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-4">⚠️</div>
              <p className="text-gray-600">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  fetchJobPosts();
                }}
                className="mt-4 text-[#FF4B55] hover:underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ContractorNavbar />
      
      <main className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manage and post jobs</h1>
            <p className="text-gray-600">Create and manage construction jobs across India</p>
          </div>
          <div className="flex gap-3">
            <Link to="/company-profile">
              <Button 
                variant="outline" 
                className="border-[#004A57] text-[#004A57] hover:bg-[#004A57] hover:text-white transition-all duration-300 hover:scale-105"
              >
                <Building className="mr-2 h-4 w-4" />
                View Company Profile
              </Button>
            </Link>
            <Link to="/workers">
              <Button 
                variant="outline" 
                className="border-[#004A57] text-[#004A57] hover:bg-[#004A57] hover:text-white transition-all duration-300 hover:scale-105"
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Workers
              </Button>
            </Link>
            <Dialog open={isPostJobDialogOpen} onOpenChange={setPostJobDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="primary" 
                  className="bg-[#FF4B55] hover:bg-[#e03e48] transition-all duration-300 hover:scale-105"
                >
                  <Plus className="mr-2 h-4 w-4" /> Post Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogTitle>Post a New Job</DialogTitle>
                <DialogDescription>
                  Fill out the form below to post a new job opportunity.
                </DialogDescription>
                <PostJobForm 
                  onSubmit={handleSubmit}
                  onClose={() => setPostJobDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-sm"
            whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Active Jobs</h2>
              <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Active</div>
            </div>
            <p className="text-3xl font-bold">{jobPosts.length}</p>
            <p className="text-gray-500 text-sm mt-1">Currently in progress</p>
          </motion.div>
          
          <motion.div 
            className="bg-white p-6 rounded-lg shadow-sm"
            whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Workers Employed</h2>
              <div className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Current</div>
            </div>
            <p className="text-3xl font-bold">245</p>
            <p className="text-gray-500 text-sm mt-1">Across all jobs</p>
          </motion.div>
          
          <motion.div
            className="bg-white p-6 rounded-lg shadow-sm"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={() => navigate('/worker-applications')}
            style={{ cursor: 'pointer' }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">New Applications</h2>
              <div className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">Pending</div>
            </div>
            <p className="text-3xl font-bold">{applicationsCount}</p>
            <p className="text-gray-500 text-sm mt-1">Waiting for review</p>
          </motion.div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Posted Jobs</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {jobPosts.map((job) => {
              console.log('Individual job data:', job);
              return (
                <motion.div 
                  key={job._id}
                  className="border border-gray-200 rounded-lg p-6 hover:border-[#FF4B55] transition-all duration-300"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <h3 className="text-xl font-semibold text-[#004A57] mb-4">{job.title}</h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Building className="h-4 w-4 mr-2" />
                          <span>{job.projectType}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{job.timeline}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>₹{job.hourlyRate}/hr</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="bg-gray-50 p-4 rounded-lg h-full">
                        <h4 className="font-semibold mb-3 text-[#004A57]">Project Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Project Duration</p>
                            <p className="font-medium">
                              {job.startDate && job.endDate ? (
                                <>
                                  {new Date(job.startDate).toLocaleDateString()} - 
                                  {new Date(job.endDate).toLocaleDateString()}
                                </>
                              ) : (
                                job.timeline || 'Not specified'
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Employment Type</p>
                            <p className="font-medium">{job.employmentType || 'Not specified'}</p>
                          </div>
                          {job.skillsRequired && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-500">Required Skills</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {job.skillsRequired.map((skill, index) => (
                                  <span 
                                    key={index}
                                    className="bg-[#004A57] bg-opacity-10 text-[#004A57] text-sm px-2 py-1 rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {job.languagesRequired && (
                            <div className="md:col-span-2">
                              <p className="text-sm text-gray-500">Required Languages</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {job.languagesRequired.map((language, index) => (
                                  <span 
                                    key={index}
                                    className="bg-[#FF4B55] bg-opacity-10 text-[#FF4B55] text-sm px-2 py-1 rounded-full"
                                  >
                                    {language}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-4">
                          <p className="text-sm text-gray-500 mb-1">Job Description</p>
                          <p className="text-gray-700 whitespace-pre-line">
                            {job.jobDescription || job.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center space-x-6">
                      <span className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                        Posted: {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {job.applicantsCount || 0} applicants
                      </span>
                      {job.status && (
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          job.status === 'active' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-[#004A57] text-[#004A57] hover:bg-[#004A57] hover:text-white"
                        onClick={() => handleEditJob(job._id)}
                      >
                        Edit Job
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => handleDeleteJob(job._id)}
                      >
                        Delete Job
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {jobPosts.length === 0 && !loading && !error && (
            <div className="text-center py-10">
              <Building className="h-16 w-16 mx-auto text-gray-300 mb-3" />
              <h3 className="text-lg font-medium text-gray-600">No Jobs Posted Yet</h3>
              <p className="text-gray-500 mb-4">Start by posting your first construction job</p>
                  <Button 
                  onClick={() => setPostJobDialogOpen(true)}
                    variant="primary" 
                  className="bg-[#FF4B55] hover:bg-[#e03e48]"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Post Your First Job
                  </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContractorJobPosting;