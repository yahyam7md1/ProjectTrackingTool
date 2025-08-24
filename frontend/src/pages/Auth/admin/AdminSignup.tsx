import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import apiService from "../../../api/apiService";

const AdminSignup: React.FC = () => {
  // Initialize navigate hook for redirection
  const navigate = useNavigate();
  
  // Form data state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  });
  
  // UI state variables
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors
    
    try {
      // Make API call to create admin account
      await apiService.post('/auth/admin/signup', formData);
      
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
              required 
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              name="password" 
              type="password" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
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
