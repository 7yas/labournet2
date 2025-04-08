import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useToast } from "../hooks/use-toast";
import { motion } from "framer-motion";
import { MapPin, Clock, DollarSign, Briefcase, Users, Calendar } from "lucide-react";
import { useJobContext } from "../contexts/JobContext";

const PostJobForm = ({ onSubmit }) => {
  const { toast } = useToast();
  const { addJob } = useJobContext();
  
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    projectType: "Commercial",
    timeline: "",
    hourlyRate: "",
    description: "",
    workersNeeded: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const projectTypeOptions = [
    "Commercial", "Residential", "Industrial", "Infrastructure",
    "Renovation", "Maintenance", "New Construction", "Demolition"
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProjectTypeSelect = (type) => {
    setFormData((prev) => ({
      ...prev,
      projectType: type
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.location || !formData.projectType || !formData.hourlyRate) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Call parent's onSubmit function with form data
    onSubmit(formData);
  };

  return (
    <motion.div 
      className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm max-h-[80vh] overflow-y-auto"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div 
          className="bg-gray-50 p-6 rounded-lg mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold mb-4">Project Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="title">Project Title *</Label>
              <div className="relative mt-1">
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Commercial Building Construction"
                  className="pl-10"
                  required
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location *</Label>
              <div className="relative mt-1">
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai, Maharashtra"
                  className="pl-10"
                  required
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <Label>Project Type *</Label>
            <div className="grid grid-cols-3 gap-2 mt-1 sm:grid-cols-4">
              {projectTypeOptions.map(type => (
                <div 
                  key={type}
                  onClick={() => handleProjectTypeSelect(type)}
                  className={`p-2 border rounded-md cursor-pointer text-center text-sm ${
                    formData.projectType === type
                      ? "bg-[#004A57] text-white border-[#004A57]" 
                      : "border-gray-300 hover:border-[#FF4B55]"
                  }`}
                >
                  {type}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="workersNeeded">Number of Workers Needed</Label>
              <div className="relative mt-1">
                <Input
                  id="workersNeeded"
                  name="workersNeeded"
                  type="number"
                  min="1"
                  value={formData.workersNeeded}
                  onChange={handleChange}
                  className="pl-10"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="hourlyRate">Hourly Rate *</Label>
              <div className="relative mt-1">
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  placeholder="e.g. 500-1000"
                  className="pl-10"
                  required
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <div className="relative mt-1">
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="pl-10"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative mt-1">
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="pl-10"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <Label htmlFor="description">Project Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the project details, requirements, and expectations..."
              className="mt-1"
              rows="4"
              required
            />
          </div>
        </motion.div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-[#004A57] hover:bg-[#003A47]">
            Post Project
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default PostJobForm;
