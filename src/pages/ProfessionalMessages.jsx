import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { CheckCircle, Clock, MapPin, Star, User, X } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import { getProjects, getProjectApplications, updateApplicationStatus } from '../lib/api';
import { useToast } from '../components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Briefcase, Phone, Mail, Award } from 'lucide-react';

const ProfessionalMessages = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login?role=professional');
      return;
    }
    fetchApplications();
  }, [user, navigate]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all projects for the professional
      const projectsResponse = await getProjects();
      console.log('Projects response:', projectsResponse.data);
      
      // Filter projects where the professional is the owner
      const professionalProjects = projectsResponse.data.filter(
        project => project.postedBy === user._id
      );
      console.log('Professional projects:', professionalProjects);

      if (professionalProjects.length === 0) {
        console.log('No projects found for professional');
        setApplications([]);
        setLoading(false);
        return;
      }

      // Get applications for each project
      const applicationsPromises = professionalProjects.map(async (project) => {
        try {
          const response = await getProjectApplications(project._id);
          return response.data.map(app => ({
            ...app,
            projectTitle: project.title,
            projectId: project._id
          }));
        } catch (error) {
          console.error(`Error fetching applications for project ${project._id}:`, error);
          return [];
        }
      });

      const applicationsResults = await Promise.all(applicationsPromises);
      const allApplications = applicationsResults.flat();
      console.log('All applications:', allApplications);
      
      setApplications(allApplications);
    } catch (error) {
      console.error('Error in fetchApplications:', error);
      setError('Failed to fetch applications');
      toast({
        title: "Error",
        description: "Failed to fetch applications. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      await updateApplicationStatus(applicationId, status);
      toast({
        title: "Success",
        description: `Application ${status} successfully`,
      });
      
      // Update the local state
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status } : app
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status} application`,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F7]">
      {/* Header */}
      <header className="bg-[#004A57] text-white py-3 px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#FF4B55] transform rotate-45" />
          <span className="text-[#EEE] text-xl font-medium">LabourNet</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/professional-dashboard" className="hover:text-[#FF4B55]">Dashboard</Link>
          <Link to="/professional-profile" className="hover:text-[#FF4B55]">My Profile</Link>
          <Link to="/professional-messages" className="hover:text-[#FF4B55] text-[#FF4B55]">Messages</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8 bg-gray-300">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row">
          {/* Main Content */}
          <div className="w-full">
            <h2 className="text-xl font-bold mb-4">Applications</h2>
            
            {/* Application Cards */}
            <div className="space-y-4">
              {applications.length > 0 ? (
                applications.map((application) => (
                  <div 
                    key={application._id}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-lg font-semibold">{application.projectTitle}</h2>
                        <p className="text-sm text-gray-500">From: {application.contractor?.businessName || 'Unknown Contractor'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {application.status}
                      </span>
              </div>
              
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <h3 className="font-medium mb-2">Contractor Details</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            <span>{application.contractor?.businessName || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span>{application.contractor?.email || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span>{application.contractor?.phoneNumber || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span>{application.contractor?.address || '-'}</span>
                          </div>
                        </div>
              </div>
              
              <div>
                        <h3 className="font-medium mb-2">Professional Information</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{application.contractor?.yearsOfExperience || '0'} years of experience</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-gray-500" />
                            <span>License: {application.contractor?.licenseNumber || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            <span>Business Type: {application.contractor?.businessType || '-'}</span>
                </div>
              </div>
            </div>
          </div>
          
                    <div className="mb-4">
                      <h3 className="font-medium mb-2">Skills & Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {application.contractor?.skills?.map((skill, index) => (
                          <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                            {skill}
                          </span>
                        ))}
                </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {application.contractor?.certifications?.map((cert, index) => (
                          <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                            {cert}
                                </span>
                        ))}
                            </div>
                          </div>
                          
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-500">Expected Rate: ${application.expectedRate}/hr</p>
                        <p className="text-sm text-gray-500">Availability: {application.contractor?.availability || '-'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedApplicant(application);
                            setShowDetailsDialog(true);
                          }}
                        >
                          View Details
                        </Button>
                        {application.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                              onClick={() => handleApplicationStatus(application._id, 'accepted')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                          <Button
                              variant="outline"
                            size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                              onClick={() => handleApplicationStatus(application._id, 'rejected')}
                          >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                          </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <User className="h-16 w-16 mx-auto text-gray-300 mb-3" />
                  <h3 className="text-lg font-medium text-gray-600">No Applications Yet</h3>
                  <p className="text-gray-500">
                    When contractors apply to your projects, they will appear here.
                  </p>
              </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApplicant && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Cover Letter</h3>
                <p className="text-gray-600">{selectedApplicant.coverLetter}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Insurance Information</h3>
                <p className="text-gray-600">{selectedApplicant.contractor?.insuranceInfo || '-'}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Project Types</h3>
                <p className="text-gray-600">{selectedApplicant.contractor?.projectTypes || '-'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfessionalMessages;
