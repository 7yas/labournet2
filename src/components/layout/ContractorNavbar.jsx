import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "../ui/navigation-menu";
import { cn } from "../../lib/utils";

const ContractorNavbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
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
        <Link to="/contractor-profile">
          <Avatar className="h-8 w-8 bg-gray-300 cursor-pointer hover:ring-2 hover:ring-[#FF4B55] transition-all duration-300">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>C</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
};

export default ContractorNavbar; 