import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProjectProvider } from "./components/PostProjectForm";
import { JobProvider } from "./contexts/JobContext";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "./contexts/LanguageContext";

// Removed: import SmoothScroll from './components/SmoothScroll';

import Index from "./pages/Index";
import JobDetails from "./pages/JobDetails";
import Journey from "./pages/Journey";
import Login from './pages/Login';
import SignUp from "./pages/SignUp";
import NotFound from './pages/NotFound';
import OurStory from "./pages/OurStory";
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerProfile from "./pages/WorkerProfile";
import ActiveWork from "./pages/ActiveWork";
import JobInfo from './pages/JobInfo';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import ContractorDashboard from "./pages/ContractorDashboard";
import ContractorJobPosting from "./pages/ContractorJobPosting";
import ProfessionalProfile from './pages/ProfessionalProfile';
import ProjectDetails from './pages/ProjectDetails';
import ProjectView from "./pages/ProjectView";
import ProfessionalMessages from "./pages/ProfessionalMessages";
import ProjectDetailView from "./pages/ProjectDetailView";
import Workers from "./pages/Workers";
import AppointWorkers from './pages/AppointWorkers';
import Analytics from './pages/Analytics';
import EditWorkerProfile from "./pages/EditWorkerProfile";
import EditProfessionalProfile from "./pages/EditProfessionalProfile";
import EditContractorProfile from "./pages/EditContractorProfile";
import PostProjectForm from './components/PostProjectForm';
import WorkerApplications from './pages/WorkerApplications';

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <ProjectProvider>
          <JobProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {/* Removed <SmoothScroll> wrapper */}
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/journey" element={<Journey />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/worker-dashboard" element={<WorkerDashboard />} />
                  <Route path="/worker-profile" element={<WorkerProfile />} />
                  <Route path="/active-work" element={<ActiveWork />} />
                  <Route path="/job-detail/:id" element={<JobInfo />} />
                  <Route path="/job-info/:id" element={<JobInfo />} />
                  <Route path="/professional-dashboard" element={<ProfessionalDashboard />} />
                  <Route path="/professional-profile" element={<ProfessionalProfile />} />
                  <Route path="/project-details/:id" element={<ProjectDetails />} />
                  <Route path="/project-view/:id" element={<ProjectView />} />
                  <Route path="/professional-messages" element={<ProfessionalMessages />} />
                  <Route path="/contractor-dashboard" element={<ContractorDashboard />} />
                  <Route path="/contractor-job-posting" element={<ContractorJobPosting />} />
                  <Route path="/project-detail-view/:id" element={<ProjectDetailView />} />
                  <Route path="/workers" element={<Workers />} />
                  <Route path="/appoint-workers" element={<AppointWorkers />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/edit-worker-profile" element={<EditWorkerProfile />} />
                  <Route path="/edit-professional-profile" element={<EditProfessionalProfile />} />
                  <Route path="/edit-contractor-profile" element={<EditContractorProfile />} />
                  <Route path="/Our-story" element={<OurStory />} />
                  <Route path="/job-details/:jobId" element={<JobDetails />} />
                  <Route
                    path="/post-project"
                    element={
                      <ProtectedRoute>
                        <PostProjectForm />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/worker-applications" element={<WorkerApplications />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              {/* Removed </SmoothScroll> */}
            </TooltipProvider>
          </JobProvider>
        </ProjectProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

