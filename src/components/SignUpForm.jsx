import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Label } from "../components/ui/label";

const SignUpForm = ({
  title,
  emailLabel = "Email Address",
  emailPlaceholder = "your@email.com",
  showPasswordToggle = false,
  actionButtonText = "Sign Up",
  alternateActionText = "Already have an account?",
  alternateActionLink = "/login",
  alternateActionLinkText = "Login",
  socialLogins = ["google", "apple"],
  supportLink = false,
  redirectPath = "/",
  role
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(
    role === 'contractor' ? {
      businessName: '',
      businessLicense: '',
      businessType: '',
      yearsOfExperience: '',
      licenseNumber: '',
      insuranceInfo: '',
      projectTypes: '',
      phoneNumber: '',
      address: '',
      teamSize: ''
    } : role === 'worker' ? {
      yearsOfExperience: '',
      skills: '',
      certifications: '',
      hourlyRate: '',
      availability: '',
      description: '',
      phoneNumber: '',
      address: ''
    } : {
      businessName: '',
      businessLicense: '',
      yearsOfExperience: '',
      licenseNumber: '',
      insuranceInfo: '',
      phoneNumber: '',
      address: ''
    }
  );
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!agreeTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    // Debug: Log the form data
    console.log('Submitting form data:', {
      email,
      password,
      fullName,
      role,
      ...formData
    });

    try {
      // Map the role to what the server expects
      const serverRole = role === 'professional' ? 'builder' : role;
      
      let requestBody = {
        email,
        password,
        fullName,
        role: serverRole,
        ...formData
      };

      // Format data based on role
      if (role === 'worker') {
        requestBody = {
          ...requestBody,
          yearsOfExperience: Number(formData.yearsOfExperience),
          hourlyRate: Number(formData.hourlyRate),
          skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
          certifications: formData.certifications.split(',').map(cert => cert.trim()).filter(cert => cert),
          address: formData.address.trim(),
          availability: formData.availability.trim(),
          description: formData.description.trim(),
          phoneNumber: formData.phoneNumber.trim()
        };
      } else if (role === 'professional') {
        requestBody = {
          ...requestBody,
          yearsOfExperience: Number(formData.yearsOfExperience),
          businessName: formData.businessName.trim(),
          businessLicense: formData.businessLicense.trim(),
          licenseNumber: formData.licenseNumber.trim(),
          insuranceInfo: formData.insuranceInfo.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          address: formData.address.trim()
        };
      } else if (role === 'contractor') {
        requestBody = {
          ...requestBody,
          yearsOfExperience: Number(formData.yearsOfExperience),
          businessName: formData.businessName.trim(),
          businessLicense: formData.businessLicense.trim(),
          businessType: formData.businessType.trim(),
          licenseNumber: formData.licenseNumber.trim(),
          insuranceInfo: formData.insuranceInfo.trim(),
          projectTypes: formData.projectTypes.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          address: formData.address.trim(),
          teamSize: Number(formData.teamSize)
        };
      }

      // Create profile directly with the auth endpoint
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      // Store user data in localStorage for simple session management
      localStorage.setItem('userData', JSON.stringify({
        ...data.user,
        isAuthenticated: true
      }));

      toast.success(data.message || "Account created successfully");
      
      // Navigate to respective dashboard based on role
      if (role === 'professional') {
        navigate('/professional-dashboard');
      } else if (role === 'contractor') {
        navigate('/contractor-dashboard');
      } else if (role === 'worker') {
        navigate('/worker-dashboard');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.message || "Failed to create account");
    }
  };

  const handleSocialSignUp = (provider) => {
    toast.info(`Signing up with ${provider}...`);
    setTimeout(() => {
      const userData = {
        email: `user@${provider}.com`,
        fullName: "Social User",
        role,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem("userData", JSON.stringify(userData));
      navigate(redirectPath);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <Label htmlFor="email">{emailLabel}</Label>
          <Input
            id="email"
                name="email"
            type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder={emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
            required
                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
          />
        </div>
            <div>
              <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
                  name="password"
              type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {showPasswordToggle && (
              <button
                type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
              </button>
            )}
          </div>
        </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
                name="confirmPassword"
            type="password"
                required
                className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

            {/* Role-specific fields */}
            {role === 'contractor' && (
              <>
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your business name"
                    value={formData.businessName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="businessLicense">Business License</Label>
                  <Input
                    id="businessLicense"
                    name="businessLicense"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your business license number"
                    value={formData.businessLicense}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Input
                    id="businessType"
                    name="businessType"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your business type"
                    value={formData.businessType}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    type="number"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter years of experience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your license number"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="insuranceInfo">Insurance Information</Label>
                  <Input
                    id="insuranceInfo"
                    name="insuranceInfo"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your insurance information"
                    value={formData.insuranceInfo}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="projectTypes">Project Types</Label>
                  <Input
                    id="projectTypes"
                    name="projectTypes"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter project types you handle"
                    value={formData.projectTypes}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="teamSize">Team Size</Label>
                  <Input
                    id="teamSize"
                    name="teamSize"
                    type="number"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your team size"
                    value={formData.teamSize}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {role === 'worker' && (
              <>
                <div>
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    type="number"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter years of experience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    name="skills"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your skills (e.g., Carpentry, Plumbing, Electrical)"
                    value={formData.skills}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                  <Input
                    id="certifications"
                    name="certifications"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your certifications (e.g., OSHA, First Aid)"
                    value={formData.certifications}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                  <Input
                    id="hourlyRate"
                    name="hourlyRate"
                    type="number"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your hourly rate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Input
                    id="availability"
                    name="availability"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your availability"
                    value={formData.availability}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter a brief description about yourself"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            {role === 'professional' && (
              <>
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your business name"
                    value={formData.businessName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="businessLicense">Business License</Label>
                  <Input
                    id="businessLicense"
                    name="businessLicense"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your business license number"
                    value={formData.businessLicense}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    type="number"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter years of experience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="licenseNumber">License Number</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your license number"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="insuranceInfo">Insurance Information</Label>
                  <Input
                    id="insuranceInfo"
                    name="insuranceInfo"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your insurance information"
                    value={formData.insuranceInfo}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your phone number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    required
                    className="relative block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
          <Checkbox
            id="terms"
            checked={agreeTerms}
                onCheckedChange={setAgreeTerms}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
          />
          <label
            htmlFor="terms"
                className="ml-2 block text-sm text-gray-900"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Terms and Conditions
                </a>
          </label>
            </div>
        </div>

          <div>
            <Button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
          {actionButtonText}
        </Button>
          </div>
      </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500">
                {alternateActionText}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link
              to={alternateActionLink}
              className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              {alternateActionLinkText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
