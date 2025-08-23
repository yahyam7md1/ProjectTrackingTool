import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/Card.tsx';
import { Button } from './components/ui/Button.tsx';
import Label from './components/ui/Label.tsx';
import Input from './components/ui/Input.tsx';

interface TestPageCardProps {
  // You can add props here if needed in the future
}

const TestPageCard: React.FC<TestPageCardProps> = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>Enter your email and password to continue</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={(e: React.FormEvent) => e.preventDefault()}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input className="mt-1" type="email" id="email" placeholder="you@company.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input className="mt-1" type="password" id="password" placeholder="••••••••" />
            </div>
          </form>
        </CardContent>

        <CardFooter>
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">Forgot your password?</div>
            <Button>Sign in</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TestPageCard;
