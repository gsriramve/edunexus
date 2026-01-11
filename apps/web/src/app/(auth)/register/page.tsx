'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, GraduationCap, Check } from 'lucide-react';

const passwordRequirements = [
  { id: 'length', label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { id: 'uppercase', label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'lowercase', label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { id: 'number', label: 'One number', test: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const passwordValid = passwordRequirements.every((req) => req.test(password));
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordValid) {
      setError('Please meet all password requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(email, password, name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="rounded-full bg-primary/10 p-3">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-white">Create an account</CardTitle>
        <CardDescription className="text-slate-400">
          Enter your details to get started
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-md">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-200">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
            {password.length > 0 && (
              <div className="mt-2 space-y-1">
                {passwordRequirements.map((req) => (
                  <div
                    key={req.id}
                    className={`flex items-center gap-2 text-xs ${
                      req.test(password) ? 'text-green-400' : 'text-slate-400'
                    }`}
                  >
                    <Check className={`h-3 w-3 ${req.test(password) ? 'opacity-100' : 'opacity-30'}`} />
                    {req.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-slate-200">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
            {confirmPassword.length > 0 && (
              <div className={`flex items-center gap-2 text-xs ${passwordsMatch ? 'text-green-400' : 'text-red-400'}`}>
                {passwordsMatch ? (
                  <>
                    <Check className="h-3 w-3" />
                    Passwords match
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    Passwords do not match
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !passwordValid || !passwordsMatch}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>

          <p className="text-sm text-slate-400 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
