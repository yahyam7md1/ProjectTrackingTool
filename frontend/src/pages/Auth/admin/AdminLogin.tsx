import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import apiService from "../../../api/apiService";
import { useAuth } from "../../../context/AuthContext";

const AdminLogin: React.FC = () => {
  // Navigation and Auth hooks
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  // UI state
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
      // Make API call to login
      const response = await apiService.post('/auth/admin/login', formData);
      
      // On successful login, store token and redirect
      login(response.data.token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      // Handle error
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || 
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Admin Sign In</CardTitle>
        <CardDescription style={{ color: "#606060"}}>Enter your credentials to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
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
          {/* Submit button moved inside the form for proper form submission */}
          <div className="hidden">
            <Button type="submit">Hidden Submit</Button>
          </div>
        </form>
      </CardContent>
      
      {/* Display error message if there is one */}
      {error && (
        <div className="px-6 pb-2">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
      
      <CardFooter className="flex justify-between items-center">
        <a href="#" className="text-sm text-primary-600 hover:underline">
          Forgot your password?
        </a>
        <Button 
          type="button" 
          onClick={() => document.querySelector('form')?.requestSubmit()}
          loading={loading}
        >
          Sign In
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminLogin;
