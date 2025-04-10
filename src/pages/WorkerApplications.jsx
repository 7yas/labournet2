import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';

const WorkerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.error('No auth token found');
        throw new Error('No authentication token found');
      }

      // Get user data from localStorage
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData || !userData._id) {
        console.error('No user data found:', userData);
        throw new Error('User data not found');
      }

      console.log('Attempting to fetch applications for contractor ID:', userData._id);

      const response = await axios.get(
        `http://localhost:5000/api/worker-applications/contractor/${userData._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Response received:', response);

      if (response.data) {
        console.log('Applications data:', response.data);
        setApplications(Array.isArray(response.data) ? response.data : []);
      } else {
        console.log('No data in response');
        setApplications([]);
      }
    } catch (error) {
      console.error('Detailed error in fetchApplications:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        
        toast({
          title: "Error",
          description: error.response.data?.message || "Failed to fetch applications",
          variant: "destructive",
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
        toast({
          title: "Network Error",
          description: "Could not connect to the server. Please check your connection.",
          variant: "destructive",
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDialog(true);
  };

  const handleAccept = async (applicationId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `http://localhost:5000/api/worker-applications/${applicationId}/accept`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Application accepted successfully!",
          variant: "default",
        });
        fetchApplications();
        setShowDialog(false);
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      toast({
        title: "Error",
        description: "Failed to accept application. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (applicationId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(
        `http://localhost:5000/api/worker-applications/${applicationId}/reject`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Application rejected successfully!",
          variant: "default",
        });
        fetchApplications();
        setShowDialog(false);
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: "Error",
        description: "Failed to reject application. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F6F7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004A57] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F7] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Worker Applications</h1>
          <Button onClick={() => navigate('/contractor-dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((application) => (
            <div key={application._id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{application.worker?.fullName}</h3>
                  <p className="text-gray-500 text-sm">{application.project?.title}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  application.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  application.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {application.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Skills:</span> {application.skills?.join(', ')}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Experience:</span> {application.experience}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Availability:</span> {application.availability}
                </p>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleViewDetails(application)}
                >
                  View Details
                </Button>
                {application.status === 'pending' && (
                  <>
                    <Button
                      variant="default"
                      onClick={() => handleAccept(application._id)}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(application._id)}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Application Details</DialogTitle>
            </DialogHeader>
            {selectedApplication && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Worker Information</h3>
                  <p className="text-sm text-gray-600">
                    Name: {selectedApplication.worker?.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Email: {selectedApplication.worker?.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    Phone: {selectedApplication.worker?.phoneNumber}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Project Details</h3>
                  <p className="text-sm text-gray-600">
                    Title: {selectedApplication.project?.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    Type: {selectedApplication.project?.type}
                  </p>
                  <p className="text-sm text-gray-600">
                    Location: {selectedApplication.project?.location}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Application Details</h3>
                  <p className="text-sm text-gray-600">
                    Skills: {selectedApplication.skills?.join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Experience: {selectedApplication.experience}
                  </p>
                  <p className="text-sm text-gray-600">
                    Availability: {selectedApplication.availability}
                  </p>
                  <p className="text-sm text-gray-600">
                    Applied On: {new Date(selectedApplication.applicationDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default WorkerApplications; 