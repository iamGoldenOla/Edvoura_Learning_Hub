'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signup } from './actions';
import {
  GraduationCap, Users, BookOpen, Settings,
  ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff,
  Video
} from 'lucide-react';
import { UniqueCodeVerificationGate } from '@/components/ui/UniqueCodeVerificationGate';

const roles = [
  { id: 'student', label: 'Student', desc: 'I want to learn and grow', icon: GraduationCap },
  { id: 'parent', label: 'Parent', desc: 'I want to manage my child\'s learning', icon: Users },
  { id: 'tutor', label: 'Tutor', desc: 'I want to teach and inspire', icon: BookOpen },
  { id: 'admin', label: 'Admin', desc: 'Platform administration', icon: Settings, disabled: true },
];

const studentGrades = Array.from({ length: 12 }, (_, i) => i + 1);

type ParentChildDraft = {
  fullName: string;
  grade: string;
  email: string;
};

const createEmptyParentChild = (): ParentChildDraft => ({
  fullName: '',
  grade: '',
  email: '',
});

function SignupPageContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '';
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [parentChildrenCount, setParentChildrenCount] = useState(1);
  const [parentChildren, setParentChildren] = useState<ParentChildDraft[]>([createEmptyParentChild()]);
  const [existingChildLinks, setExistingChildLinks] = useState<string[]>(['']);
  const [tutorType, setTutorType] = useState<'class_teacher' | 'subject_teacher' | 'both'>('class_teacher');
  const [tutorGrade, setTutorGrade] = useState<string>('grade_1');
  const [tutorSubjects, setTutorSubjects] = useState<string>('Mathematics, English Studies');
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

  const updateParentChildrenCount = (nextCount: number) => {
    const safeCount = Math.min(4, Math.max(1, nextCount));
    setParentChildrenCount(safeCount);
    setParentChildren((previous) => {
      if (previous.length === safeCount) return previous;
      if (previous.length > safeCount) return previous.slice(0, safeCount);
      return [...previous, ...Array.from({ length: safeCount - previous.length }, () => createEmptyParentChild())];
    });
  };

  return (
    <div className="min-h-screen flex">
      {state?.pendingVerification && state.uniqueCode ? (
        <UniqueCodeVerificationGate
          fullName={state.fullName || formData.fullName || 'New Member'}
          email={state.email || formData.email}
          role={selectedRole || state.role || 'student'}
          uniqueCode={state.uniqueCode}
          onVerified={() => {
            window.location.href = state.redirectTo || '/dash';
          }}
        />
      ) : null}

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
                {selectedRole === 'student' && 'Select your class grade to tailor your student dashboard automatically.'}
                {selectedRole === 'parent' && 'Tell us about your children.'}
                {selectedRole === 'tutor' && 'Tell us about your teaching experience.'}
              </p>

              <form action={formAction}>
                {/* Hidden fields to pass all data to server action */}
                <input type="hidden" name="role" value={selectedRole} />
                <input type="hidden" name="fullName" value={formData.fullName} />
                <input type="hidden" name="email" value={formData.email} />
                <input type="hidden" name="password" value={formData.password} />
                <input type="hidden" name="learnerBand" value="" />
                <input type="hidden" name="selectedGrade" value={selectedGrade} />
                <input type="hidden" name="parentChildrenJson" value={JSON.stringify(parentChildren)} />
                <input type="hidden" name="parentExistingChildEmailsJson" value={JSON.stringify(existingChildLinks)} />
                <input type="hidden" name="childName" value={parentChildren[0]?.fullName ?? ''} />
                <input type="hidden" name="childGrade" value={parentChildren[0]?.grade ?? ''} />
                <input type="hidden" name="tutorType" value={tutorType} />
                <input type="hidden" name="tutorGrade" value={tutorGrade} />
                <input type="hidden" name="tutorSubjects" value={tutorSubjects} />
                <input type="hidden" name="redirectTo" value={next} />

                {/* Student: Grade selector */}
                {selectedRole === 'student' && (
                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-navy mb-1.5">Student Grade</label>
                    <select
                      name="grade"
                      value={selectedGrade}
                      onChange={(event) => setSelectedGrade(event.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
                    >
                      <option value="">Select grade</option>
                      {studentGrades.map((grade) => (
                        <option key={grade} value={String(grade)}>
                          Grade {grade}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-grey">
                      Grades 1-3 = Explorer, 4-6 = Builder, 7-12 = Achiever.
                    </p>
                  </div>
                )}

                {/* Parent: Children info */}
                {selectedRole === 'parent' && (
                  <div className="space-y-5 mb-8">
                    <div>
                      <label className="block text-sm font-semibold text-navy mb-1.5">Number of children</label>
                      <select
                        name="childrenCount"
                        value={String(parentChildrenCount)}
                        onChange={(event) => updateParentChildrenCount(Number.parseInt(event.target.value, 10) || 1)}
                        className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
                      >
                        <option value="1">1 child</option>
                        <option value="2">2 children</option>
                        <option value="3">3 children</option>
                        <option value="4">4 children</option>
                      </select>
                    </div>
                    {parentChildren.map((child, index) => (
                      <div key={`child-${index}`} className="rounded-xl border border-grey-light p-4 bg-off-white/60 space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-grey">Child {index + 1}</p>
                        <div>
                          <label className="block text-sm font-semibold text-navy mb-1.5">Child&apos;s name</label>
                          <input
                            type="text"
                            value={child.fullName}
                            onChange={(event) =>
                              setParentChildren((previous) =>
                                previous.map((entry, entryIndex) =>
                                  entryIndex === index ? { ...entry, fullName: event.target.value } : entry,
                                ),
                              )
                            }
                            placeholder="Enter child's name"
                            className="w-full px-4 py-3 rounded-xl border border-grey-light bg-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all placeholder:text-grey"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-navy mb-1.5">Child&apos;s grade</label>
                          <select
                            value={child.grade}
                            onChange={(event) =>
                              setParentChildren((previous) =>
                                previous.map((entry, entryIndex) =>
                                  entryIndex === index ? { ...entry, grade: event.target.value } : entry,
                                ),
                              )
                            }
                            className="w-full px-4 py-3 rounded-xl border border-grey-light bg-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
                          >
                            <option value="">Select grade</option>
                            {Array.from({ length: 12 }, (_, i) => (
                              <option key={i + 1} value={String(i + 1)}>
                                Grade {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-navy mb-1.5">
                            Child&apos;s existing account email (optional)
                          </label>
                          <input
                            type="email"
                            value={child.email}
                            onChange={(event) =>
                              setParentChildren((previous) =>
                                previous.map((entry, entryIndex) =>
                                  entryIndex === index ? { ...entry, email: event.target.value } : entry,
                                ),
                              )
                            }
                            placeholder="child@example.com"
                            className="w-full px-4 py-3 rounded-xl border border-grey-light bg-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all placeholder:text-grey"
                          />
                        </div>
                      </div>
                    ))}

                    <div className="rounded-xl border border-grey-light p-4 bg-off-white/40 space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-grey">
                        Link Existing Child Account (Optional)
                      </p>
                      <p className="text-xs text-grey">
                        If your child already has a student account, add their email here so your parent account can link on first login.
                      </p>
                      {existingChildLinks.map((email, index) => (
                        <input
                          key={`existing-child-${index}`}
                          type="email"
                          value={email}
                          onChange={(event) =>
                            setExistingChildLinks((prev) =>
                              prev.map((entry, entryIndex) =>
                                entryIndex === index ? event.target.value : entry,
                              ),
                            )
                          }
                          placeholder={`Existing child email ${index + 1}`}
                          className="w-full px-4 py-3 rounded-xl border border-grey-light bg-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all placeholder:text-grey"
                        />
                      ))}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExistingChildLinks((prev) => (prev.length >= 4 ? prev : [...prev, '']))
                          }
                          className="rounded-lg border border-grey-light px-3 py-2 text-xs font-semibold text-navy hover:bg-white"
                        >
                          Add Another Email
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setExistingChildLinks((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
                          }
                          className="rounded-lg border border-grey-light px-3 py-2 text-xs font-semibold text-grey hover:bg-white"
                        >
                          Remove Last
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tutor: Experience & Teaching Role */}
                {selectedRole === 'tutor' && (
                  <div className="space-y-5 mb-8">
                    <div className="p-4 rounded-xl border border-navy/20 bg-yellow/10 space-y-3">
                      <label className="block text-sm font-bold text-navy">Teacher Assignment Role</label>
                      <p className="text-xs text-grey">Specifies which lesson notes & curriculum subjects you have authorization to manage.</p>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'class_teacher', label: 'Class Teacher', desc: 'Grade Level Only' },
                          { id: 'subject_teacher', label: 'Subject Teacher', desc: 'Specific Subjects' },
                          { id: 'both', label: 'Both Roles', desc: 'Grade & Subject' },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setTutorType(item.id as any)}
                            className={`p-2.5 rounded-lg border text-center transition-all ${
                              tutorType === item.id
                                ? 'border-yellow bg-yellow font-bold text-navy shadow-sm'
                                : 'border-grey-light bg-white text-navy hover:border-navy-light'
                            }`}
                          >
                            <div className="text-xs">{item.label}</div>
                            <div className="text-[9px] opacity-75 font-normal">{item.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {(tutorType === 'class_teacher' || tutorType === 'both') && (
                      <div>
                        <label className="block text-sm font-semibold text-navy mb-1.5">Assigned Class Grade</label>
                        <select
                          value={tutorGrade}
                          onChange={(e) => setTutorGrade(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20"
                        >
                          <option value="grade_1">Primary 1 (Grade 1)</option>
                          <option value="grade_2">Primary 2 (Grade 2)</option>
                          <option value="grade_3">Primary 3 (Grade 3)</option>
                          <option value="grade_4">Primary 4 (Grade 4)</option>
                          <option value="grade_5">Primary 5 (Grade 5)</option>
                          <option value="grade_6">Primary 6 (Grade 6)</option>
                          <option value="grade_7">JSS 1 (Grade 7)</option>
                          <option value="grade_8">JSS 2 (Grade 8)</option>
                          <option value="grade_9">JSS 3 (Grade 9)</option>
                          <option value="grade_10">SS 1 (Grade 10)</option>
                          <option value="grade_11">SS 2 (Grade 11)</option>
                          <option value="grade_12">SS 3 (Grade 12)</option>
                        </select>
                      </div>
                    )}

                    {(tutorType === 'subject_teacher' || tutorType === 'both') && (
                      <div>
                        <label className="block text-sm font-semibold text-navy mb-1.5">Assigned Subject(s)</label>
                        <input
                          type="text"
                          value={tutorSubjects}
                          onChange={(e) => setTutorSubjects(e.target.value)}
                          placeholder="e.g. Mathematics, Physics, Chemistry, English"
                          className="w-full px-4 py-3 rounded-xl border border-grey-light bg-off-white text-navy text-sm focus:outline-none focus:border-yellow focus:ring-2 focus:ring-yellow/20 transition-all placeholder:text-grey"
                        />
                        <p className="text-[10px] text-grey mt-1">Separate multiple subjects with commas (e.g. Chemistry, Physics, Further Mathematics)</p>
                      </div>
                    )}

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
                  disabled={isPending || (selectedRole === 'student' && !selectedGrade)}
                  className="w-full bg-yellow hover:bg-yellow-light text-navy font-heading font-bold py-3.5 rounded-xl transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPending ? 'Saving account...' : 'Save and Go to Dashboard ->'}
                </button>
              </form>
            </div>
          )}

          <p className="mt-8 text-center text-sm text-grey">
            Already have an account?{' '}
            <Link href={next ? `/login?next=${encodeURIComponent(next)}` : '/login'} className="text-yellow font-semibold hover:text-yellow-dim transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SignupPageContent />
    </Suspense>
  );
}
