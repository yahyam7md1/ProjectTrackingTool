import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import apiService from "../../../api/apiService";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

const AdminSignup: React.FC = () => {
  // Initialize navigate hook for redirection
  const navigate = useNavigate();
  
  // Define form data type
  type FormDataType = {
    firstName: string;
    lastName: string;
    email: string;
    confirmEmail: string;
    password: string;
    confirmPassword: string;
  };

  // Form data state with restoration from session storage
  const [formData, setFormData] = useState<FormDataType>(() => {
    // Try to get saved form data from session storage
    try {
      const savedData = sessionStorage.getItem('adminSignupData');
      return savedData ? JSON.parse(savedData) : {
        firstName: "",
        lastName: "",
        email: "",
        confirmEmail: "",
        password: "",
        confirmPassword: ""
      };
    } catch (e) {
      return {
        firstName: "",
        lastName: "",
        email: "",
        confirmEmail: "",
        password: "",
        confirmPassword: ""
      };
    }
  });
  
  // Validate form data on component mount
  useEffect(() => {
    // Only validate if we have data to validate (restored from session storage)
    if (formData.password) {
      setPasswordStrength(validatePasswordStrength(formData.password));
    }
    
    if (formData.password && formData.confirmPassword) {
      setPasswordsMatch(formData.password === formData.confirmPassword);
    }
    
    if (formData.email && formData.confirmEmail) {
      setEmailsMatch(formData.email === formData.confirmEmail);
    }
  }, []);
  
  // UI state variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [emailsMatch, setEmailsMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState({
    isValid: true,
    message: ""
  });
  
  // Validation functions
  const validatePasswordStrength = (password: string) => {
    const minLength = 8;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    if (password.length < minLength) {
      return {
        isValid: false,
        message: "Password must be at least 8 characters long"
      };
    }
    
    if (!hasLetter) {
      return {
        isValid: false,
        message: "Password must contain at least one letter"
      };
    }
    
    if (!hasNumber) {
      return {
        isValid: false,
        message: "Password must contain at least one number"
      };
    }
    
    return {
      isValid: true,
      message: ""
    };
  };
  
  const validatePasswordMatch = () => {
    return formData.password === formData.confirmPassword || formData.confirmPassword === "";
  };
  
  const validateEmailMatch = () => {
    return formData.email === formData.confirmEmail || formData.confirmEmail === "";
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Use functional update to ensure we're working with the latest state
    setFormData((prevData: FormDataType) => {
      const updatedData = {
        ...prevData,
        [name]: value
      };
      
      // Immediately validate using the updated data
      if (name === 'password') {
        setPasswordStrength(validatePasswordStrength(value));
        // Also update password match when password changes
        setPasswordsMatch(value === updatedData.confirmPassword || updatedData.confirmPassword === "");
      } else if (name === 'confirmPassword') {
        setPasswordsMatch(updatedData.password === value || value === "");
      } else if (name === 'email') {
        setEmailsMatch(value === updatedData.confirmEmail || updatedData.confirmEmail === "");
      } else if (name === 'confirmEmail') {
        setEmailsMatch(updatedData.email === value || value === "");
      }
      
      // Save to sessionStorage for persistence (more appropriate than localStorage for sensitive info)
      try {
        sessionStorage.setItem('adminSignupData', JSON.stringify(updatedData));
      } catch (e) {
        // Handle storage errors silently
        console.error('Error saving form data to session storage:', e);
      }
      
      return updatedData;
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const strength = validatePasswordStrength(formData.password);
    const passwordsValid = validatePasswordMatch();
    const emailsValid = validateEmailMatch();
    
    setPasswordStrength(strength);
    setPasswordsMatch(passwordsValid);
    setEmailsMatch(emailsValid);
    
    // Check if all validations pass
    if (!strength.isValid || !passwordsValid || !emailsValid) {
      setError("Please fix the errors before submitting");
      return;
    }
    
    setLoading(true);
    setError(""); // Clear previous errors
    
    try {
      // We only send the data the backend expects (without confirmation fields)
      const submissionData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      };
      
      // Make API call to create admin account
      await apiService.post('/auth/admin/signup', submissionData);
      
      // On successful signup, redirect to verification page with email as query parameter
      navigate(`/admin/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      // Handle error
      console.error("Signup error:", err);
      setError(
        err.response?.data?.message || 
        "Failed to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Admin Account</CardTitle>
        <CardDescription style={{ color: "#606060"}}>Enter your details to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input 
              id="firstName" 
              name="firstName" 
              type="text" 
              value={formData.firstName}
              onChange={handleChange}
              required 
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input 
              id="lastName" 
              name="lastName" 
              type="text" 
              value={formData.lastName}
              onChange={handleChange}
              required 
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="confirmEmail">Confirm Email</Label>
            <Input 
              id="confirmEmail" 
              name="confirmEmail" 
              type="email" 
              value={formData.confirmEmail}
              onChange={handleChange}
              placeholder="Confirm your email"
              required 
            />
            {formData.confirmEmail !== "" && (
              emailsMatch ? (
                <p className="text-green-500 text-xs mt-1 flex items-center">
                  <CheckCircle2 size={12} className="mr-1" /> Emails match
                </p>
              ) : (
                <p className="text-red-500 text-xs mt-1">Emails do not match</p>
              )
            )}
          </div>
          
          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters with letters and numbers"
                required 
              />
              <button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
                style={{ border: 'none', background: 'none' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {!passwordStrength.isValid && formData.password !== "" && (
              <p className="text-red-500 text-xs mt-1">{passwordStrength.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required 
              />
              <button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
                style={{ border: 'none', background: 'none' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.confirmPassword !== "" && (
              passwordsMatch ? (
                <p className="text-green-500 text-xs mt-1 flex items-center">
                  <CheckCircle2 size={12} className="mr-1" /> Passwords match
                </p>
              ) : (
                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
              )
            )}
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <Button type="submit" className="w-full" loading={loading}>
            Sign Up
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminSignup;
