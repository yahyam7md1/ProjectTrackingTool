import React from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";

const VerificationCodeClient: React.FC = () => {
  // Use the useSearchParams hook to get the email from the URL
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "your email";

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Check Your Email</CardTitle>
        <CardDescription style={{ color: "#606060"}}>
          If you are a vaild client, you will receive a 6-digit code to {email}. The code expires in 10 minutes.
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
            Verify & Sign In
          </Button>
          <div className="text-center">
            <Button type="button" variant="ghost" className="mt-2">
              Didn't get a code? <span style={{ color: "#713ABE" }}>Resend</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VerificationCodeClient;
