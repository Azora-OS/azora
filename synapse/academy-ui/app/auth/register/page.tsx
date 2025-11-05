/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.
*/

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Loader2, GraduationCap, BookOpen } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ServiceHeader } from '@/components/branding/ServiceHeader';
import { toast } from 'sonner';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    institutionType: 'ASU' as 'ASU' | 'EDU',
    program: '',
    grade: '',
    password: '',
    confirmPassword: '',
    idNumber: '',
    country: 'South Africa',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (formData.institutionType === 'ASU' && !formData.program) {
      toast.error('Please select a program');
      return;
    }

    if (formData.institutionType === 'EDU' && !formData.grade) {
      toast.error('Please select a grade');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/institutional/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          institutionType: formData.institutionType === 'ASU' ? 'UNIVERSITY' : 'K12',
          program: formData.institutionType === 'ASU' ? formData.program : undefined,
          grade: formData.institutionType === 'EDU' ? parseInt(formData.grade) : undefined,
          password: formData.password,
          idNumber: formData.idNumber || undefined,
          country: formData.country,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      toast.success('Registration successful!', {
        description: result.message,
      });

      // Store student info
      if (result.studentNumber) {
        localStorage.setItem('studentNumber', result.studentNumber);
        localStorage.setItem('studentEmail', result.email);
      }

      router.push('/auth/login');
    } catch (error: any) {
      toast.error('Registration failed', {
        description: error.message || 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950 dark:via-violet-950 dark:to-indigo-950">
      <ServiceHeader servicePath="synapse/academy-ui" />

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="relative h-16 w-48">
                    <Image
                      src="/branding/services/azora-education-logo.svg"
                      alt="Azora Academy"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                <CardTitle className="text-2xl">Create Your Student Account</CardTitle>
                <CardDescription>
                  Get your student number and @ac.azora.world or @edu.azora.world email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Institution Type */}
                  <div className="space-y-2">
                    <Label htmlFor="institutionType">Institution Type</Label>
                    <Select
                      value={formData.institutionType}
                      onValueChange={(value) => setFormData({ ...formData, institutionType: value as 'ASU' | 'EDU' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select institution type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ASU">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            <span>University (@ac.azora.world)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="EDU">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            <span>K-12 Education (@edu.azora.world)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      required
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Program (University) or Grade (K-12) */}
                  {formData.institutionType === 'ASU' ? (
                    <div className="space-y-2">
                      <Label htmlFor="program">Program</Label>
                      <Select
                        value={formData.program}
                        onValueChange={(value) => setFormData({ ...formData, program: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your program" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BSc Computer Science">BSc Computer Science</SelectItem>
                          <SelectItem value="BSc Data Science">BSc Data Science</SelectItem>
                          <SelectItem value="BSc Artificial Intelligence">BSc Artificial Intelligence</SelectItem>
                          <SelectItem value="BSc Software Engineering">BSc Software Engineering</SelectItem>
                          <SelectItem value="BSc Information Systems">BSc Information Systems</SelectItem>
                          <SelectItem value="BSc Cybersecurity">BSc Cybersecurity</SelectItem>
                          <SelectItem value="BCom Business Administration">BCom Business Administration</SelectItem>
                          <SelectItem value="BA Education">BA Education</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="grade">Grade</Label>
                      <Select
                        value={formData.grade}
                        onValueChange={(value) => setFormData({ ...formData, grade: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                            <SelectItem key={grade} value={grade.toString()}>
                              Grade {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* ID Number (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number (Optional, for verification)</Label>
                    <Input
                      id="idNumber"
                      type="text"
                      placeholder="South African ID or passport number"
                      value={formData.idNumber}
                      onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    />
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="At least 8 characters"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-10"
                          required
                          minLength={8}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>What you'll receive:</strong>
                    </p>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc list-inside">
                      <li>Unique student number (e.g., {formData.institutionType === 'ASU' ? 'ASU2025001234' : 'EDU2025001234'})</li>
                      <li>Student email ({formData.institutionType === 'ASU' ? '@ac.azora.world' : '@edu.azora.world'})</li>
                      <li>Access to all courses and resources</li>
                      <li>Academic credentials and certificates</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Student Account
                      </>
                    )}
                  </Button>

                  <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <a
                      href="/auth/login"
                      className="text-purple-600 hover:underline dark:text-purple-400 font-medium"
                    >
                      Sign in
                    </a>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
