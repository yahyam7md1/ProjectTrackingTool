import React from "react";
import { Button } from "../../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";

const ClientLogin: React.FC = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Client Portal</CardTitle>
        <CardDescription style={{ color: "#606060" }}>Enter your email address to receive a login code.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <Button type="submit" className="w-full">
            Send Verification Code
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClientLogin;
