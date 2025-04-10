import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "../ui/navigation-menu";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const ContractorNavbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isOpen, setIsOpen] = useState(false);
  const [contractorDetails, setContractorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchContractorDetails = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        const token = localStorage.getItem('authToken');
        
        if (!userData?._id || !token) {
          console.log('No contractor ID or token found');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/profiles/contractor/${userData._id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch contractor details');
        }

        const data = await response.json();
        setContractorDetails(data);
      } catch (error) {
        console.error('Error fetching contractor details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContractorDetails();
  }, []);

  const renderContractorDetails = () => {
    if (loading) return <div className="p-4 text-center">Loading...</div>;
    if (!contractorDetails) return <div className="p-4 text-center">No details available</div>;

    return (
      <div className="space-y-3">
        <div className="font-semibold text-lg">{contractorDetails.fullName}</div>
        <div className="text-sm text-gray-600 space-y-1">
          <div><span className="font-medium">Business Name:</span> {contractorDetails.businessName}</div>
          <div><span className="font-medium">Email:</span> {contractorDetails.email}</div>
          <div><span className="font-medium">Phone:</span> {contractorDetails.phoneNumber}</div>
          <div><span className="font-medium">License Number:</span> {contractorDetails.licenseNumber}</div>
          <div><span className="font-medium">Business Type:</span> {contractorDetails.businessType}</div>
          <div><span className="font-medium">Years of Experience:</span> {contractorDetails.yearsOfExperience}</div>
          <div><span className="font-medium">Insurance Info:</span> {contractorDetails.insuranceInfo}</div>
          <div><span className="font-medium">Project Types:</span> {contractorDetails.projectTypes}</div>
          <div><span className="font-medium">Address:</span> {contractorDetails.address}</div>
        </div>
      </div>
    );
  };
  
  return (
    <header className="bg-[#004A57] text-white py-3 px-6 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-6 h-6">
          <img src="/LabourNet_logo.png" alt="LabourNet Logo" className="w-full h-full object-contain" />
        </div>
        <span className="text-[#EEE] text-xl font-medium">LabourNet</span>
      </Link>
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList className="flex gap-6">
          {[
            { path: "/contractor-dashboard", label: "Dashboard" },
            { path: "/contractor-job-posting", label: "Jobs" },
            { path: "/workers", label: "Workers" },
            { path: "/analytics", label: "Analytics" },
          ].map(({ path, label }) => (
            <NavigationMenuItem key={path}>
              <Link 
                to={path}
                className={cn(
                  "text-white hover:text-[#FF4B55] transition-colors",
                  currentPath === path && "text-[#FF4B55]"
                )}
              >
                {label}
              </Link>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-4">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none">
            <Avatar className="h-8 w-8 bg-gray-300 cursor-pointer hover:ring-2 hover:ring-[#FF4B55] transition-all duration-300">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="text-white hover:text-[#FF4B55] transition-colors">
              {contractorDetails?.fullName || 'Contractor'}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-96 bg-white text-gray-800 p-4 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto">
            {renderContractorDetails()}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default ContractorNavbar; 