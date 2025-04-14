import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Upload } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

// Create a context to share project data across components
export const ProjectContext = React.createContext({
  projects: [],
  addProject: () => {},
  removeProject: () => {},
});

export const useProjectContext = () => React.useContext(ProjectContext);

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);

  const addProject = (project) => {
    setProjects((prev) => [...prev, project]);
  };

  const removeProject = (id) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, removeProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

const PostProjectForm = ({ onProjectPosted }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Fix duplicate `hourlyRate` and remove unnecessary fields
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    employmentType: "",
    hourlyRate: "",
    jobDescription: "",
    requirements: "",
    company: "Bharati Construction Ltd",
    projectType: "Commercial",
    timeline: "3 months",
    expiresAfter: "30",
    postedDate: new Date().toISOString(),
    status: "active",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check if user is authenticated using the useAuth hook
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to post a project.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Validate form
    const requiredFields = ["title", "location", "projectType", "hourlyRate", "employmentType"];
    const missingFields = requiredFields.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: `Please fill in the following fields: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Format the project data according to the Project model
      const projectData = {
        title: formData.title,
        location: formData.location,
        employmentType: formData.employmentType,
        hourlyRate: formData.hourlyRate,
        jobDescription: formData.jobDescription,
        requirements: formData.requirements || '',
        company: formData.company,
        projectType: formData.projectType,
        timeline: formData.timeline,
        expiresAfter: formData.expiresAfter,
        postedDate: new Date().toISOString(),
        status: 'active',
        postedBy: user._id, // Use user._id from useAuth hook
        postedByRole: 'Builder' // Set the role to Builder
      };

      console.log('Sending project data:', projectData);

      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` // Add authorization header
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to post project');
      }

      const savedProject = await response.json();
      console.log('Project saved successfully:', savedProject);

      // Clear form fields
      setFormData({
        title: "",
        location: "",
        employmentType: "",
        hourlyRate: "",
        jobDescription: "",
        requirements: "",
        company: "Bharati Construction Ltd",
        projectType: "Commercial",
        timeline: "3 months",
        expiresAfter: "30",
        postedDate: new Date().toISOString(),
        status: "active",
      });

      toast({
        title: "Success",
        description: "Project posted successfully!",
      });

      // Call the callback with the new project
      if (onProjectPosted) {
        onProjectPosted(savedProject);
      }

      // Close the dialog
      navigate('/professional-dashboard');
    } catch (error) {
      console.error('Error posting project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to post project",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants for enhanced animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100 
      }
    }
  };

  return (
    <motion.div
      className="p-6 max-h-[80vh] overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <h2 className="text-2xl font-bold mb-2 text-[#FF4B55]">
        {t("project.postNew") || "Post New Project"}
      </h2>
      <p className="text-gray-500 mb-8">
        {t("project.fillDetails") || "Fill in the details to post your new construction project"}
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <motion.div
          className="bg-gray-50 p-6 rounded-lg border-l-4 border-[#FF4B55] shadow-sm"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h3 variants={itemVariants} className="text-lg font-semibold mb-4">
            {t("project.basicInfo") || "Basic Information"}
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <motion.div variants={itemVariants}>
              <Label htmlFor="title">{t("project.jobTitle") || "Job Title"}</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Site Engineer"
                className="mt-1"
                required
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Label htmlFor="location">{t("project.location") || "Location"}</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Mumbai, Maharashtra"
                className="mt-1"
                required
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="projectType">{t("project.projectType")}</Label>
              <select
                id="projectType"
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF4B55]"
                required
              >
                <option value="Commercial">Commercial</option>
                <option value="Residential">Residential</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>
            <div>
              <Label htmlFor="employmentType">{t("project.employmentType")}</Label>
              <select
                id="employmentType"
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF4B55]"
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="hourlyRate">{t("project.hourlyRate")}</Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                placeholder="e.g. ₹25,000-35,000"
                className="mt-1"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <Label htmlFor="jobDescription">{t("project.jobDescription")}</Label>
            <textarea
              id="jobDescription"
              name="jobDescription"
              value={formData.jobDescription}
              onChange={handleChange}
              placeholder="Describe the project details..."
              className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF4B55]"
              rows="4"
              required
            />
          </div>
        </motion.div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/professional-dashboard")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#FF4B55] text-white hover:bg-[#E43F49]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post Job"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default PostProjectForm;