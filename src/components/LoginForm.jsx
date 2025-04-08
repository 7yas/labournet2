import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const LoginForm = ({
  title,
  emailLabel = "Email Address",
  emailPlaceholder = "your@email.com",
  showRememberMe = true,
  showPasswordToggle = false,
  actionButtonText = "Sign In",
  alternateActionText = "Don't have an account?",
  alternateActionLink = "/signup",
  alternateActionLinkText = "Sign up now",
  socialLogins = ["google", "apple"],
  supportLink = false,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get('role');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!role) {
      toast.error("Role is required");
      return;
    }

    try {
      await login(email, password, role);
      toast.success("Successfully signed in");
      
      // Navigate to respective dashboard based on role
      if (role === 'professional') {
        navigate('/professional-dashboard');
      } else if (role === 'contractor') {
        navigate('/contractor-dashboard');
      } else if (role === 'worker') {
        navigate('/worker-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || "Failed to sign in");
    }
  };

  const handleSocialLogin = (provider) => {
    toast.info(`Redirecting to ${provider} login...`);
    setTimeout(() => {
      if (role === 'professional') {
        navigate('/professional-dashboard');
      } else if (role === 'contractor') {
        navigate('/contractor-dashboard');
      } else if (role === 'worker') {
        navigate('/worker-dashboard');
      }
    }, 1500);
  };

  return (
    <div className="w-full">
      <h2 className="text-[#121224] text-2xl font-bold mb-4">{title}</h2>
      <p className="text-[#717B9E] text-sm mb-6">
        Enter your credentials to access your account
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-[#121224]">
            {emailLabel}
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={emailPlaceholder}
            required
            className="w-full focus:border-[#FF4B55] hover:border-[#FF4B55] transition-colors"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label htmlFor="password" className="text-sm text-[#121224]">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-[#FF4B55] hover:underline"
            >
              {showPasswordToggle ? "Reset password" : "Forgot password?"}
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pr-10 focus:border-[#FF4B55] hover:border-[#FF4B55] transition-colors"
            />
            {showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            )}
          </div>
        </div>

        {showRememberMe && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={setRememberMe}
            />
            <label
              htmlFor="remember"
              className="text-sm text-[#121224]"
            >
              Remember me
            </label>
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-[#FF4B55] hover:bg-[#FF4B55]/90"
        >
          {actionButtonText}
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">
              {alternateActionText}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            to={`${alternateActionLink}?role=${role}`}
            className="flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            {alternateActionLinkText}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
