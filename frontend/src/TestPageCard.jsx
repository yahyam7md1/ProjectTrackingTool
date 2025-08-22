import React from 'react'
import { Card } from './components/ui/Card'
import { Button } from './components/ui/Button'
import Label from './components/ui/Label'
import Input from './components/ui/Input'

const TestPageCard = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <Card.Header>
          <Card.Title>Sign in to your account</Card.Title>
          <Card.Description>Enter your email and password to continue</Card.Description>
        </Card.Header>

        <Card.Content>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <Label>Email</Label>
              <Input className="mt-1" type="email" placeholder="you@company.com" />
            </div>
            <div>
              <Label>Password</Label>
              <Input className="mt-1" type="password" placeholder="••••••••" />
            </div>
          </form>
        </Card.Content>

        <Card.Footer>
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">Forgot your password?</div>
            <Button>Sign in</Button>
          </div>
        </Card.Footer>
      </Card>
    </div>
  )
}

export default TestPageCard
