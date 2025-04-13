import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { PageHeader } from "../components/PageHeader";
import RoleCard from "../components/RoleCard";
import { Button } from "../components/ui/button";

const Journey = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  
  const checkIcon = "https://cdn.builder.io/api/v1/image/assets/TEMP/70b17f95af25fb1ca7f0dae89feda5083f69926b14013c5a2773d4964e3d6a6f?apiKey=c295e679d9414a73a1381f5a8a56ab87&";
  
  const roles = [
    {
      id: "worker",
      title: "Construction Worker",
      icon: "public/lovable-uploads/90d991c9-8176-439c-bad5-165655fabe79.png",
      description: "Join our network of skilled construction workers and find regular employment opportunities across various projects.",
      features: [
        { icon: checkIcon, text: "Access to daily and weekly job opportunities" },
        { icon: checkIcon, text: "Competitive pay rates" },
        { icon: checkIcon, text: "Skills development and training" },
        { icon: checkIcon, text: "Safety equipment and guidelines" },
      ],
    },
    {
      id: "professional",
      title: "Professional Builder",
      icon: "public/lovable-uploads/f1cebe40-9e7f-4534-9c92-38664e054dd0.png",
      description: "For licensed professionals in electrical, plumbing, carpentry and other specialized trades. Connect with clients and projects directly.",
      features: [
        { icon: checkIcon, text: "Showcase your certifications and portfolio" },
        { icon: checkIcon, text: "Connect with contractors and clients" },
        { icon: checkIcon, text: "Manage your availability and bookings" },
        { icon: checkIcon, text: "Get paid securely through our platform" },
      ],
    },
    {
      id: "contractor",
      title: "Contractor",
      icon: "public/lovable-uploads/fdbb3d24-072b-479b-9feb-e014ec588c22.png",
      description: "Streamline your project management and find the right workers for each job. Build reliable teams for your construction projects.",
      features: [
        { icon: checkIcon, text: "Post jobs and find qualified workers quickly" },
        { icon: checkIcon, text: "Verify worker qualifications and experience" },
        { icon: checkIcon, text: "Manage payments and documentation" },
        { icon: checkIcon, text: "Track project progress and team performance" },
      ],
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleCreateProfile = () => {
    if (selectedRole) {
      navigate(`/signup?role=${selectedRole}`);
    } else {
      alert("Please select a role first");
    }
  };

  const handleLogin = () => {
    if (selectedRole) {
      window.location.href = `http://localhost:8080/login?role=${selectedRole}`;
    } else {
      alert("Please select a role first");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-[#EDEEF1] px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <PageHeader 
            title="Start Your Journey with LabourNet" 
            subtitle="Choose the role that best fits your needs and begin your construction career journey today"
          />
          <div className="mt-16 grid md:grid-cols-3 gap-8 max-md:grid-cols-1">
            {roles.map((role) => (
              <div
                key={role.id}
                className="cursor-pointer"
                onClick={() => handleRoleSelect(role.id)}
              >
                <div 
                  className={`transition-all duration-200 ${
                    selectedRole === role.id 
                      ? "ring-2 ring-[#FF4B55] transform scale-[1.02]" 
                      : "hover:shadow-lg"
                  }`}
                >
                  <RoleCard 
                    title={role.title}
                    icon={role.icon}
                    description={role.description}
                    features={role.features}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <p className="text-[rgba(113,123,158,1)] text-lg mb-8">
              Ready to take the next step? Create your profile and start exploring opportunities.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                variant="primary" 
                size="lg"
                onClick={handleCreateProfile}
              >
                Sign Up
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleLogin}
                className="transition-colors duration-200 bg-[rgb(0,53,63)] text-white hover:bg-[rgb(0,100,120)] hover:text-white"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Journey;
