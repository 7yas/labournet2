import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { MapPin, Phone, Mail, Clock, DollarSign } from "lucide-react";

const WorkerProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("workerProfile");
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile(parsed);
    } else {
      navigate("/worker-portfolio");
    }
  }, [navigate]);

  const getInitials = () => {
    return profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : "W";
  };

  if (!profile) {
    return <div className="min-h-screen bg-[#F6F6F7] flex items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-[#F6F6F7]">
      <header className="bg-[#004A57] text-white py-3 px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6">
            <img src="/LabourNet_logo.png" alt="LabourNet Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-[#EEE] text-xl font-medium">LabourNet</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/worker-dashboard" className="hover:text-[#FF4B55]">Dashboard</Link>
          <Link to="/active-work" className="hover:text-[#FF4B55]">Active Work</Link>
          <Link to="/worker-profile" className="hover:text-[#FF4B55] text-[#FF4B55]">My Profile</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8 bg-gray-300">
            <AvatarImage src={profile.profileImage} alt={profile.fullName} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-[#FF4B55]">
                <AvatarImage src={profile.profileImage} alt={profile.fullName} />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{profile.fullName}</h1>
                <p className="text-gray-600 mb-3">{profile.availability || "Worker"}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-2">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{profile.experience} years experience</span>
                  </div>
                  {profile.hourlyRate && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>₹{profile.hourlyRate}/hour</span>
                    </div>
                  )}
                </div>
              </div>
              <Link to="/edit-worker-profile">
                <Button className="bg-[#FF4B55] text-white hover:bg-[#E43F49]">
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-2">About Me</h2>
            <p className="text-gray-600">{profile.bio}</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">Skills</h2>
            {profile.skills && profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <Badge key={index} className="bg-[#004A57] hover:bg-[#003540]">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No skills listed yet.</p>
            )}
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-[#004A57]" />
                <span>{profile.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#004A57]" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#004A57]" />
                <span>{profile.location}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Work History</h2>
            <p className="text-gray-600 mb-4">No work history recorded yet. Complete jobs to build your work history.</p>
            <Link to="/active-work">
              <Button className="w-full md:w-auto bg-[#004A57] hover:bg-[#003540]">
                Find Work
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkerProfile;