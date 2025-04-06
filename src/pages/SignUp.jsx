import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import LoginLayout from "../components/layout/LoginLayout";
import SignUpForm from "../components/SignUpForm";

const SignUp = () => {
  const location = useLocation();
  const role = new URLSearchParams(location.search).get("role");

  // Redirect to worker signup if no role specified
  if (!role) {
    return <Navigate to="/signup?role=worker" replace />;
  }

  // Role-specific content
  const getRoleContent = () => {
    switch (role) {
      case "worker":
        return {
          title: "Join as a Skilled Worker",
          subtitle: "Create your profile, showcase your skills, and connect with top contractors in your area.",
          stats: {
            stat1: { value: "2,500+", label: "Active Job Listings" },
            stat2: { value: "500+", label: "Verified Contractors" },
          },
          formTitle: "Sign Up",
          redirectPath: "/worker-portfolio"
        };
      case "professional":
        return {
          title: "Join as a Professional Builder",
          subtitle: "Create your professional profile, showcase your services, and connect with clients.",
          stats: {
            stat1: { value: "1,200+", label: "Active Projects" },
            stat2: { value: "85%", label: "Booking Rate" },
          },
          formTitle: "Professional Sign Up",
          redirectPath: "/professional-portfolio"
        };
      case "contractor":
        return {
          title: "Join as a Contractor",
          subtitle: "Create your business profile, post projects, and find skilled workers for your construction needs.",
          stats: {
            stat1: { value: "10,000+", label: "Verified Workers" },
            stat2: { value: "95%", label: "Project Success Rate" },
          },
          testimonial: {
            quote: "LabourNet has transformed how we hire skilled workers. Exceptional talent pool.",
            author: "John Smith",
            position: "ABC Construction",
          },
          formTitle: "Contractor Sign Up",
          emailLabel: "Business Email",
          emailPlaceholder: "company@business.com",
          showPasswordToggle: true,
          actionButtonText: "Create Account",
          alternateActionText: "Already have a contractor account?",
          alternateActionLinkText: "Login",
          supportLink: true,
          redirectPath: "/contractor-portfolio"
        };
      default:
        return null;
    }
  };

  const content = getRoleContent();
  if (!content) {
    return <Navigate to="/signup?role=worker" replace />;
  }

  return (
    <LoginLayout
      title={content.title}
      subtitle={content.subtitle}
      stat1={content.stats?.stat1}
      stat2={content.stats?.stat2}
      testimonial={content.testimonial}
    >
      <SignUpForm
        title={content.formTitle || "Sign Up"}
        emailLabel={content.emailLabel}
        emailPlaceholder={content.emailPlaceholder}
        showPasswordToggle={content.showPasswordToggle}
        actionButtonText={content.actionButtonText || "Create Account"}
        alternateActionText={content.alternateActionText || "Already have an account?"}
        alternateActionLinkText={content.alternateActionLinkText || "Login"}
        alternateActionLink={`/login?role=${role}`}
        socialLogins={content.socialLogins}
        supportLink={content.supportLink}
        redirectPath={content.redirectPath}
        role={role}
      />
    </LoginLayout>
  );
};

export default SignUp;
