import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { CheckCircle, Clock, MapPin, Star, User, X } from "lucide-react";
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { useToast } from '../components/ui/use-toast';

const ProfessionalMessages = () => {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    availableNow: false,
    verifiedOnly: false,
    minRating: 0
  });
  const { toast } = useToast();

  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        // First, fetch the builder's projects
        const projectsResponse = await axios.get(`/api/projects?builder=${user._id}`);
        const projects = Array.isArray(projectsResponse.data) ? projectsResponse.data : [];

        if (projects.length === 0) {
          setApplicants([]);
          setLoading(false);
          return;
        }

        // For each project, fetch its applications
        const applicationsPromises = projects.map(async (project) => {
          try {
            const applicationsResponse = await axios.get(`/api/applications/project/${project._id}`);
            const applications = Array.isArray(applicationsResponse.data) ? applicationsResponse.data : [];
            
            // For each application, fetch the contractor details
            const applicationsWithContractorDetails = await Promise.all(
              applications.map(async (application) => {
                try {
                  // Get contractor details from the application
                  const contractor = application.worker;
                  return {
                    ...application,
                    projectTitle: project.title,
                    projectName: project.title,
                    contractor: {
                      businessName: contractor.businessName,
                      businessType: contractor.businessType,
                      yearsOfExperience: contractor.yearsOfExperience,
                      licenseNumber: contractor.licenseNumber,
                      insuranceInfo: contractor.insuranceInfo,
                      projectTypes: contractor.projectTypes
                    }
                  };
                } catch (error) {
                  console.error(`Error processing contractor details for application ${application._id}:`, error);
                  return null;
                }
              })
            );

            return applicationsWithContractorDetails.filter(app => app !== null);
          } catch (error) {
            console.error(`Error fetching applications for project ${project._id}:`, error);
            return [];
          }
        });

        const applicationsArrays = await Promise.all(applicationsPromises);
        const allApplications = applicationsArrays.flat();

        if (allApplications.length === 0) {
          setApplicants([]);
          setLoading(false);
          return;
        }

        setApplicants(allApplications);
      } catch (error) {
        console.error('Error fetching applicants:', error);
        toast({
          title: "Error",
          description: "Failed to fetch applicants",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchApplicants();
    } else {
      setLoading(false);
    }
  }, [user, toast]);

  const handleAccept = async (applicationId) => {
    try {
      await axios.patch(`/api/applications/${applicationId}/status`, {
        status: 'accepted'
      });
      
      // Update the applicants list to remove the accepted application
      setApplicants(prev => prev.filter(app => app._id !== applicationId));
      
      toast({
        title: "Success",
        description: "Application accepted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept application",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (applicationId) => {
    try {
      await axios.patch(`/api/applications/${applicationId}/status`, {
        status: 'rejected'
      });
      
      // Update the applicants list to remove the rejected application
      setApplicants(prev => prev.filter(app => app._id !== applicationId));
      
      toast({
        title: "Success",
        description: "Application rejected successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF4B55] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applicants...</p>
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
          <Link to="/professional-projects" className="hover:text-[#FF4B55]">Find Projects</Link>
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
          {/* Left Sidebar - Filters */}
          <div className="w-full md:w-1/4 md:pr-8 mb-6 md:mb-0">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="availableNow"
                  name="availableNow"
                  checked={filters.availableNow}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-[#FF4B55] border-gray-300 rounded focus:ring-[#FF4B55]"
                />
                <label htmlFor="availableNow" className="ml-2 text-sm text-gray-700">
                  Available Now
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="verifiedOnly"
                  name="verifiedOnly"
                  checked={filters.verifiedOnly}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-[#FF4B55] border-gray-300 rounded focus:ring-[#FF4B55]"
                />
                <label htmlFor="verifiedOnly" className="ml-2 text-sm text-gray-700">
                  Verified Only
                </label>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Minimum Rating</h3>
                <div className="flex items-center gap-1">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setFilters(prev => ({ ...prev, minRating: rating }))}
                      className={`p-2 rounded ${
                        filters.minRating === rating 
                          ? "bg-[#FF4B55] text-white" 
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {rating}+
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="w-full md:w-3/4">
            <h2 className="text-xl font-bold mb-4">Applications</h2>
            
            {applicants.length > 0 ? (
              <div className="space-y-4">
                {applicants.map((application) => (
                  <div key={application._id} className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-start mb-4">
                          <div>
                        <h3 className="text-lg font-semibold">{application.contractor.businessName}</h3>
                        <p className="text-gray-600">{application.contractor.businessType}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Applied for</p>
                        <p className="font-medium">{application.projectTitle}</p>
                            </div>
                          </div>
                          
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Business License</p>
                        <p className="font-medium">{application.contractor.businessLicense}</p>
                        </div>
                      <div>
                        <p className="text-sm text-gray-500">Years of Experience</p>
                        <p className="font-medium">{application.contractor.yearsOfExperience} years</p>
                          </div>
                      <div>
                        <p className="text-sm text-gray-500">License Number</p>
                        <p className="font-medium">{application.contractor.licenseNumber}</p>
                          </div>
                      <div>
                        <p className="text-sm text-gray-500">Insurance Info</p>
                        <p className="font-medium">{application.contractor.insuranceInfo}</p>
                          </div>
                        </div>
                        
                    <div className="flex justify-end gap-4 mt-4">
                      <Button
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        onClick={() => handleReject(application._id)}
                      >
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                        onClick={() => handleAccept(application._id)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
      </main>
    </div>
  );
};

export default ProfessionalMessages;
