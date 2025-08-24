import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import apiService from "../../../api/apiService";

const ClientLogin: React.FC = () => {
  // Initialize navigate hook for redirection
  const navigate = useNavigate();
  
  // State management
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors
    
    try {
      // Make API call to request verification code
      await apiService.post('/auth/client/request-code', { email });
      
      // On success, navigate to verification page with email as query parameter
      navigate(`/client/verify?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      // Handle error
      console.error("Request code error:", err);
      setError(
        err.response?.data?.message || 
        "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Client Portal</CardTitle>
        <CardDescription style={{ color: "#606060" }}>Enter your email address to receive a login code.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              value={email}
              onChange={handleEmailChange}
              required 
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <Button type="submit" className="w-full" loading={loading}>
            Send Verification Code
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientLogin;
