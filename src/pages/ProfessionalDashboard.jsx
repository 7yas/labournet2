import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "../components/ui/dialog";
import PostProjectForm from "../components/PostProjectForm";
import { motion } from "framer-motion";
import Footer from "../components/layout/Footer";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { useToast } from "../components/ui/use-toast";
import { Briefcase, Calendar, MapPin, Clock } from "lucide-react";
import ProfessionalNavbar from "../components/layout/ProfessionalNavbar";

const ProfessionalDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [isPostJobDialogOpen, setPostJobDialogOpen] = useState(false);
  const [isContactDialogOpen, setContactDialogOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    projectType: "Commercial",
    location: "",
    timeline: "",
    hourlyRate: "",
    description: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [activeFilter, setActiveFilter] = useState("All Projects");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get("/projects");
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError("Failed to fetch projects");
        toast({
          title: "Error",
          description: "Failed to fetch projects. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchProjects();
    }
  }, [authLoading, toast]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (formData) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "Please log in to post a project",
          variant: "destructive",
        });
        return;
      }

      const projectData = {
        ...formData,
        status: "active",
        postedBy: user._id,
        postedByRole: "Builder",
        employmentType: "Contract",
        timeline: formData.timeline,
        hourlyRate: formData.hourlyRate,
        expiresAfter: "30",
        company: user.businessName || "Your Company",
        postedDate: new Date().toISOString()
      };

      await api.post("/projects", projectData);
      
      // Fetch updated projects list immediately after posting
      const response = await api.get("/projects");
      setProjects(response.data);
      
      setPostJobDialogOpen(false);
      setFormData({
        title: "",
        projectType: "Commercial",
        location: "",
        timeline: "",
        hourlyRate: "",
        description: "",
      });
      
      toast({
        title: "Success",
        description: "Project posted successfully",
      });
    } catch (error) {
      console.error("Error creating project:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to post project",
        variant: "destructive",
      });
    }
  };

  const handleApplyNow = async (projectId) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please login to apply for projects",
          variant: "destructive",
        });
        return;
      }

      const project = projects.find((p) => p._id === projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      const applicationData = {
        project: projectId,
        contractor: user._id,
        status: "pending",
        coverLetter: `I am interested in working on your project "${project.title}". I have ${user.yearsOfExperience} years of experience in ${user.businessType}. My business name is ${user.businessName} and I am licensed (License #: ${user.licenseNumber}).`,
        expectedRate: 35,
        contractorDetails: {
          businessName: user.businessName,
          businessType: user.businessType,
          yearsOfExperience: user.yearsOfExperience,
          licenseNumber: user.licenseNumber,
          insuranceInfo: user.insuranceInfo,
          projectTypes: user.projectTypes,
          address: user.address,
          phoneNumber: user.phoneNumber,
          email: user.email,
        },
      };

      await api.post("/applications", applicationData);
      
      toast({
        title: "Success",
        description: "Your application has been submitted successfully",
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  const openPostJobDialog = () => setPostJobDialogOpen(true);
  const closePostJobDialog = () => setPostJobDialogOpen(false);

  const openContactDialog = () => setContactDialogOpen(true);
  const closeContactDialog = () => setContactDialogOpen(false);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <ProfessionalNavbar />
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to access the dashboard</h1>
            <Link to="/login" className="text-blue-500 hover:underline">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Filter projects based on search, category, and status
  const filteredProjects = projects.filter(project => {
    const isPostedByUser = project.postedBy === user._id; // Filter projects posted by the logged-in user
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || project.projectType === selectedCategory;
    const matchesStatus = activeFilter === "All Projects" || 
                         (activeFilter === "Active" && project.status === "active") || 
                         (activeFilter === "Completed" && project.status === "completed");
    return isPostedByUser && matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search term:", searchTerm);
    console.log("Selected category:", selectedCategory);
  };

  return (
    <div className="min-h-screen bg-[#F6F6F7] flex flex-col">
      <ProfessionalNavbar />

      <main className="container mx-auto py-8 px-4 flex-grow">
        <div className="flex justify-between items-center mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl font-bold text-[#121224]">My Projects</h1>
            <p className="text-[#717B9E]">Manage your posted construction projects</p>
          </motion.div>

          {projects.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-[#FF4B55] text-white px-6 py-3 rounded hover:bg-[#E43F49] transition-colors"
                >
                  Post New Project
                </motion.button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogTitle>Post Your Project</DialogTitle>
                <DialogDescription>
                  Fill out the form below to create a new project.
                </DialogDescription>
                <div className="max-h-[calc(90vh-120px)] overflow-y-auto pr-2">
                  <PostProjectForm onProjectPosted={(newProject) => {
                    setProjects(prevProjects => [newProject, ...prevProjects]);
                  }} />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search Bar */}
        <motion.form 
          className="flex gap-4 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onSubmit={handleSearch}
        >
          <div className="flex-grow">
            <input 
              type="text" 
              placeholder="Search your projects..." 
              className="w-full p-3 border border-gray-300 rounded hover:border-[#FF4B55] focus:border-[#FF4B55] focus:outline-none transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select 
              className="p-3 border border-gray-300 rounded hover:border-[#FF4B55] focus:border-[#FF4B55] focus:outline-none transition-colors"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option>All Categories</option>
              <option>Residential</option>
              <option>Commercial</option>
              <option>Industrial</option>
            </select>
          </div>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <button 
              type="submit"
              className="bg-[#FF4B55] text-white px-6 py-3 rounded hover:bg-[#E43F49] transition-colors"
            >
              Search
            </button>
          </motion.div>
        </motion.form>

        {/* Filter Tags */}
        <motion.div 
          className="flex gap-2 mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <span 
            className={`px-3 py-1 rounded-full text-sm cursor-pointer ${activeFilter === "All Projects" ? "bg-[#004A57] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            onClick={() => setActiveFilter("All Projects")}
          >
            All Projects
          </span>
          <span 
            className={`px-3 py-1 rounded-full text-sm cursor-pointer ${activeFilter === "Active" ? "bg-[#004A57] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            onClick={() => setActiveFilter("Active")}
          >
            Active
          </span>
          <span 
            className={`px-3 py-1 rounded-full text-sm cursor-pointer ${activeFilter === "Completed" ? "bg-[#004A57] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            onClick={() => setActiveFilter("Completed")}
          >
            Completed
          </span>
        </motion.div>

        {/* Project Listings */}
        <div className="space-y-4">
          {filteredProjects && filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <motion.div 
                key={project._id || index}
                className="bg-white p-6 rounded-lg shadow-sm hover:border-[#FF4B55] border border-transparent transition-colors cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
              >
                <div className="flex justify-between mb-3">
                  <h2 className="text-lg font-semibold text-[#121224]">{project.title}</h2>
                  <span className="text-[#FF4B55] font-bold">
                    ${project.hourlyRate?.min}-${project.hourlyRate?.max}/hr
                  </span>
                </div>
                <p className="text-[#717B9E] mb-4">{project.jobDescription?.substring(0, 150)}...</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{project.projectType}</span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{project.location}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      project.status === 'active' ? 'bg-green-100 text-green-700' :
                      project.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                      project.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {project.status === 'active' ? 'Active' :
                       project.status === 'completed' ? 'Completed' :
                       project.status === 'cancelled' ? 'Cancelled' : 'Posted'}
                    </span>
                  </div>
                  <Link to={`/project-detail-view/${project._id}`} className="text-[#FF4B55] font-medium text-sm hover:underline">View Details →</Link>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div 
              className="bg-white p-8 rounded-lg shadow-sm text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-4">You haven't posted any projects yet. Create your first project to get started!</p>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="bg-[#FF4B55] text-white px-4 py-2 rounded hover:bg-[#E43F49] transition-colors">
                    Post Your First Project
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                  <DialogTitle>Post Your Project</DialogTitle>
                  <DialogDescription>
                    Fill out the form below to create a new project.
                  </DialogDescription>
                  <div className="max-h-[calc(90vh-120px)] overflow-y-auto pr-2">
                    <PostProjectForm />
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          )}
        </div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <div>
            <p className="text-2xl font-bold text-[#121224]">
              {projects.filter(project => project.status === 'active' || !project.status).length}
            </p>
            <p className="text-[#717B9E]">Active Projects</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#121224]">
              {projects.reduce((acc, project) => acc + (project.applicantsCount || 0), 0)}
            </p>
            <p className="text-[#717B9E]">Applications Received</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#121224]">
              {projects.filter(project => project.status === 'completed').length}
            </p>
            <p className="text-[#717B9E]">Completed Projects</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#121224]">4.8/5</p>
            <p className="text-[#717B9E]">Average Rating</p>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProfessionalDashboard;
