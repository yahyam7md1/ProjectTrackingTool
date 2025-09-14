import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";
import AlertDialog from "../../../components/ui/AlertDialog";
import apiService from "../../../api/apiService";
import { useAuth } from "../../../context/AuthContext";

const AdminSignupCode: React.FC = () => {
  // Navigation and Auth hooks
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Get email from URL query parameter
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  
  // State management
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0); // Cooldown timer in seconds
  const [successDialog, setSuccessDialog] = useState({
    isOpen: false,
    message: ""
  });
  
  // Handle input change
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Clear previous errors
    
    try {
      // Make API call to verify account
      const response = await apiService.post('/auth/admin/verify-account', {
        email,
        code: verificationCode
      });
      
      // On successful verification, login and redirect
      login(response.data.token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      // Handle error
      console.error("Verification error:", err);
      setError(
        err.response?.data?.message || 
        "Invalid or expired verification code."
      );
    } finally {
      setLoading(false);
    }
  };
  
  // Setup cooldown timer
  useEffect(() => {
    // If cooldown is active, start countdown
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      
      // Clear timeout when component unmounts or cooldown changes
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);
  
  // Handle resend code
  const handleResendCode = async () => {
    if (!email) {
      setError("Email address is missing. Please go back to the signup page.");
      return;
    }
    
    // Don't proceed if cooldown is active
    if (resendCooldown > 0) {
      return;
    }
    
    setLoading(true);
    try {
      await apiService.post('/auth/admin/resend-code', { email });
      // Show success message
      setError(""); // Clear errors
      setSuccessDialog({
        isOpen: true,
        message: "A new verification code has been sent to your email."
      });
      // Start the cooldown timer (60 seconds)
      setResendCooldown(60);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        "Failed to resend code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AlertDialog
        isOpen={successDialog.isOpen}
        onClose={() => setSuccessDialog({ ...successDialog, isOpen: false })}
        title="Success"
        description={successDialog.message}
        actionLabel="OK"
        variant="success"
      />
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Your Account</CardTitle>
          <CardDescription style={{ color: "#606060" }}>
            We sent a verification code to {email}. Enter it below to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="verificationCode">Verification Code</Label>
            <Input 
              id="verificationCode" 
              name="verificationCode" 
              type="text" 
              value={verificationCode}
              onChange={handleCodeChange}
              required 
              className="tracking-[widest] text-center text-lg"
              maxLength={6}
              placeholder="•••••••"
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <Button type="submit" className="w-full" loading={loading}>
            Verify Account
          </Button>
          <div className="text-center">
            <Button 
              type="button" 
              variant="ghost" 
              className="mt-2" 
              onClick={handleResendCode}
              disabled={loading || resendCooldown > 0}
            >
              {resendCooldown > 0 
                ? `Wait ${resendCooldown}s before resending`
                : <>Didn't get a code? <span style={{ color: "#713ABE" }}>Resend</span></>
              }
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </>
  );
};

export default AdminSignupCode;
