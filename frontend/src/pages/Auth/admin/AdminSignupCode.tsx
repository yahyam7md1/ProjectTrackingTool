import React from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";

const AdminSignupCode: React.FC = () => {
  // Use the useSearchParams hook to get the email from the URL
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "your email";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verify Your Account</CardTitle>
        <CardDescription style={{ color: "#606060" }}>
          We sent a verification code to {email}. Enter it below to activate your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div>
            <Label htmlFor="verificationCode">Verification Code</Label>
            <Input 
              id="verificationCode" 
              name="verificationCode" 
              type="text" 
              required 
              className="tracking-[widest] text-center text-lg"
              maxLength={6}
              placeholder="•••••••"
            />
          </div>
          <Button type="submit" className="w-full">
            Verify Account
          </Button>
          <div className="text-center">
            <Button type="button" variant="ghost" className="mt-2">
              Resend Code
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminSignupCode;
