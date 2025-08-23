import React from "react";
import { Button } from "../../../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Label from "../../../components/ui/Label";

const AdminLogin: React.FC = () => {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Admin Sign In</CardTitle>
        <CardDescription style={{ color: "#606060"}}>Enter your credentials to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <a href="#" className="text-sm text-primary-600 hover:underline">
          Forgot your password?
        </a>
        <Button type="submit">
          Sign In
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdminLogin;
