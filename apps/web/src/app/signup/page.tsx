'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useActionState } from 'react';
import { signup } from './actions';
import {
  GraduationCap, Users, BookOpen, Settings,
  ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff,
  Sprout, Building2, Trophy, Video
} from 'lucide-react';

const roles = [
  { id: 'student', label: 'Student', desc: 'I want to learn and grow', icon: GraduationCap },
  { id: 'parent', label: 'Parent', desc: 'I want to manage my child\'s learning', icon: Users },
  { id: 'tutor', label: 'Tutor', desc: 'I want to teach and inspire', icon: BookOpen },
  { id: 'admin', label: 'Admin', desc: 'Platform administration', icon: Settings, disabled: true },
];

const gradeBands = [
  { id: '1-3', name: 'Explorer', grades: 'Grade 1–3', ages: 'Ages 6–9', icon: Sprout },
  { id: '4-6', name: 'Builder', grades: 'Grade 4–6', ages: 'Ages 9–12', icon: Building2 },
  { id: '7-12', name: 'Achiever', grades: 'Grade 7–12', ages: 'Ages 12–18', icon: Trophy },
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedBand, setSelectedBand] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [state, formAction, isPending] = useActionState(signup, null);

  const canProceedStep1 = selectedRole !== '' && selectedRole !== 'admin';
  const canProceedStep2 = formData.fullName && formData.email && formData.password && formData.password === formData.confirmPassword && formData.password.length >= 6;

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(score, 4);
  };

  const strengthColors = ['bg-error', 'bg-warning', 'bg-yellow', 'bg-success'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strength = passwordStrength();

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy relative flex-col items-center justify-center p-12 overflow-hidden">
        <div className="hero-grid-overlay absolute inset-0 pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-[300px] h-[300px] bg-yellow/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-md text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 bg-yellow rounded-lg flex items-center justify-center">
              <span className="text-navy font-heading font-extrabold text-xl leading-none">E</span>
            </div>
            <span className="text-white font-heading font-extrabold text-2xl tracking-tight">
              Edvoura<span className="text-yellow">.</span>
            </span>
          </Link>

          <h2 className="font-heading font-extrabold text-white text-3xl mb-4">
            Join Nigeria&apos;s Premier Learning Platform
          </h2>
          <p className="text-grey text-sm leading-relaxed mb-12">
            Thousands of students, parents, and tutors are already part of the Edvoura community. Start your journey today.
          </p>

          <div className="space-y-4 text-left">
            {[
              { icon: Video, text: 'Live 1-on-1 sessions via Google Meet' },
              { icon: CheckCircle2, text: 'Interactive quizzes, games, and assignments' },
              { icon: Users, text: 'Dedicated parent dashboards for full visibility' },
            ].map((point) => (
              <div key={point.text} className="flex items-center gap-3">
                <point.icon className="w-5 h-5 text-yellow shrink-0" />
                <span className="text-white/80 text-sm">{point.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-yellow rounded-lg flex items-center justify-center">
              <span className="text-navy font-heading font-extrabold text-lg leading-none">E</span>
            </div>
            <span className="text-navy font-heading font-extrabold text-xl tracking-tight">
              Edvoura<span className="text-yellow">.</span>
            </span>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s < step ? 'bg-success text-white' :
                  s === step ? 'bg-yellow text-navy' :
                  'bg-grey-light text-grey'
                }`}>
                  {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? 'bg-success' : 'bg-grey-light'}`} />}
              </React.Fragment>
            ))}
            <span className="ml-3 text-xs text-grey font-medium">Step {step} of 3</span>
          </div>

          {state?.error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error text-sm rounded-xl">
              {state.error}
            </div>
          )}

          {/* STEP 1: Choose Role */}
          {step === 1 && (
            <div className="animate-fade-up">
              <h1 className="font-heading font-extrabold text-navy text-2xl mb-2">Choose your role</h1>
              <p className="text-grey text-sm mb-8">How will you be using Edvoura?</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    disabled={role.disabled}
                    onClick={() => !role.disabled && setSelectedRole(role.id)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                      role.disabled
                        ? 'opacity-40 cursor-not-allowed border-grey-light bg-off-white'
                        : selectedRole === role.id
                        ? 'border-yellow bg-yellow/5 shadow-md'
                        : 'border-grey-light hover:border-navy-light bg-white'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
                      selectedRole === role.id ? 'bg-yellow/15' : 'bg-off-white'
                    }`}>
                      <role.icon className={`w-5 h-5 ${selectedRole === role.id ? 'text-yellow' : 'text-navy'}`} />
                    </div>
                    <p className="font-heading font-bold text-navy text-sm">{role.label}</p>
                    <p className="text-grey text-xs mt-0.5">{role.desc}</p>
                  </button>
                ))}
              </div>

              <button
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
                className="w-full bg-yellow hover:bg-yellow-light text-navy font-heading font-bold py-3.5 rounded-xl transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Details */}
          {step === 2 && (
            <div className="animate-fade-up">
              <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-xs text-grey hover:text-navy font-medium mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <h1 className="font-heading font-extrabold text-navy text-2xl mb-2">Your details</h1>
              <p className="text-grey text-sm mb-8">Create your Edvoura account.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all placeholder:text-grey"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Email address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all placeholder:text-grey"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all placeholder:text-grey pr-12"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-grey hover:text-navy">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i < strength ? strengthColors[strength - 1] : 'bg-grey-light'}`} />
                        ))}
                      </div>
                      <p className="text-[10px] text-grey mt-1 text-right font-medium">{strength > 0 ? strengthLabels[strength - 1] : ''}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-navy mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter your password"
                    className={`w-full px-4 py-3 rounded-xl border bg-off-white text-navy text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-grey ${
                      formData.confirmPassword && formData.confirmPassword !== formData.password
                        ? 'border-error focus:border-error focus:ring-error/20'
                        : 'border-grey-light focus:border-yellow focus:ring-yellow/20'
                    }`}
                  />
                  {formData.confirmPassword && formData.confirmPassword !== formData.password && (
                    <p className="text-[10px] text-error mt-1 font-medium">Passwords do not match</p>
                  )}
                </div>
              </div>

              <button
                disabled={!canProceedStep2}
                onClick={() => setStep(3)}
                className="w-full mt-8 bg-yellow hover:bg-yellow-light text-navy font-heading font-bold py-3.5 rounded-xl transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Personalise */}
          {step === 3 && (
            <div className="animate-fade-up">
              <button onClick={() => setStep(2)} className="flex items-center gap-1.5 text-xs text-grey hover:text-navy font-medium mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <h1 className="font-heading font-extrabold text-navy text-2xl mb-2">Personalise your experience</h1>
              <p className="text-grey text-sm mb-8">
                {selectedRole === 'student' && 'Select your grade band to get the right dashboard.'}
                {selectedRole === 'parent' && 'Tell us about your children.'}
                {selectedRole === 'tutor' && 'Tell us about your teaching experience.'}
              </p>

              <form action={formAction}>
                {/* Hidden fields to pass all data to server action */}
                <input type="hidden" name="role" value={selectedRole} />
                <input type="hidden" name="fullName" value={formData.fullName} />
                <input type="hidden" name="email" value={formData.email} />
                <input type="hidden" name="password" value={formData.password} />
                <input type="hidden" name="learnerBand" value={selectedBand} />

                {/* Student: Grade band selector */}
                {selectedRole === 'student' && (
                  <div className="space-y-4 mb-8">
                    {gradeBands.map((band) => (
                      <button
                        key={band.id}
                        type="button"
                        onClick={() => setSelectedBand(band.id)}
                        className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-center gap-5 ${
                          selectedBand === band.id
                            ? 'border-yellow bg-yellow/5 shadow-md'
                            : 'border-grey-light hover:border-navy-light bg-white'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          selectedBand === band.id ? 'bg-yellow/15' : 'bg-off-white'
                        }`}>
                          <band.icon className={`w-6 h-6 ${selectedBand === band.id ? 'text-yellow' : 'text-navy'}`} />
                        </div>
                        <div>
                          <p className="font-heading font-bold text-navy">{band.name}</p>
                          <p className="text-grey text-xs mt-0.5">{band.grades} • {band.ages}</p>
                        </div>
                        {selectedBand === band.id && (
                          <CheckCircle2 className="w-5 h-5 text-yellow ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Parent: Children info */}
                {selectedRole === 'parent' && (
                  <div className="space-y-5 mb-8">
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1.5">Number of children</label>
                      <select name="childrenCount" className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20">
                        <option value="1">1 child</option>
                        <option value="2">2 children</option>
                        <option value="3">3 children</option>
                        <option value="4">4+ children</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1.5">Child&apos;s name</label>
                      <input name="childName" type="text" placeholder="Enter child's name" className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all placeholder:text-grey" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1.5">Child&apos;s grade</label>
                      <select name="childGrade" className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20">
                        <option value="">Select grade</option>
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Tutor: Experience */}
                {selectedRole === 'tutor' && (
                  <div className="space-y-5 mb-8">
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1.5">Subjects you teach</label>
                      <input name="subjects" type="text" placeholder="e.g. Mathematics, Physics" className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all placeholder:text-grey" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1.5">Highest qualification</label>
                      <select name="qualification" className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20">
                        <option value="">Select qualification</option>
                        <option value="bsc">B.Sc / B.A</option>
                        <option value="msc">M.Sc / M.A</option>
                        <option value="phd">Ph.D</option>
                        <option value="pgde">PGDE</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1.5">Years of experience</label>
                      <input name="experience" type="number" min="0" placeholder="e.g. 5" className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all placeholder:text-grey" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1.5">Brief bio</label>
                      <textarea name="bio" rows={3} placeholder="Tell students and parents about yourself..." className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all placeholder:text-grey resize-none" />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPending || (selectedRole === 'student' && !selectedBand)}
                  className="w-full bg-yellow hover:bg-yellow-light text-navy font-heading font-bold py-3.5 rounded-xl transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? 'Creating account...' : 'Go to Dashboard →'}
                </button>
              </form>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-grey">
            Already have an account?{' '}
            <Link href="/login" className="text-yellow font-semibold hover:text-yellow-dim transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
