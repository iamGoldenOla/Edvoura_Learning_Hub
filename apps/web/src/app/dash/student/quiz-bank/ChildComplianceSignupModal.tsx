'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Trash2, CheckCircle2, Lock } from 'lucide-react';

interface ChildComplianceSignupModalProps {
  studentId: string;
  onConsentComplete?: () => void;
}

export default function ChildComplianceSignupModal({
  studentId,
  onConsentComplete,
}: ChildComplianceSignupModalProps) {
  const [age, setAge] = useState<number | ''>(10);
  const [regionCode, setRegionCode] = useState('NG');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [checkedConsent, setCheckedConsent] = useState(false);

  const [checkingAge, setCheckingAge] = useState(false);
  const [checkResult, setCheckResult] = useState<any>(null);
  const [consentStatus, setConsentStatus] = useState<'idle' | 'required' | 'completed'>('idle');

  // Deletion Flow state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionFeedback, setDeletionFeedback] = useState('');

  const handleCheckAge = async () => {
    if (age === '' || Number(age) < 1) return;
    setCheckingAge(true);
    try {
      const res = await fetch('/api/compliance/age-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ age: Number(age), regionCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setCheckResult(data);
        if (data.requiresParentalConsent) {
          setConsentStatus('required');
        } else {
          setConsentStatus('completed');
          if (onConsentComplete) onConsentComplete();
        }
      }
    } catch (e) {
      console.error('Age check error:', e);
    } finally {
      setCheckingAge(false);
    }
  };

  const handleSubmitConsent = async () => {
    if (!guardianEmail || !checkedConsent) return;
    try {
      const res = await fetch('/api/compliance/parental-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          guardianEmail,
          consentType: 'parental',
          regionCode,
        }),
      });
      if (res.ok) {
        setConsentStatus('completed');
        if (onConsentComplete) onConsentComplete();
      }
    } catch (e) {
      console.error('Submit consent error:', e);
    }
  };

  const handleDeleteChildData = async () => {
    if (confirmText !== 'DELETE_MY_CHILD_DATA') return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/compliance/delete-child-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          guardianEmail,
          confirmationText: confirmText,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDeletionFeedback('✅ Data deleted permanently and audited in data_processing_log.');
        setShowDeleteModal(false);
      } else {
        setDeletionFeedback(`Failed: ${data.error}`);
      }
    } catch (e) {
      setDeletionFeedback('Error deleting child data.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border-[3px] border-dark bg-white p-5 shadow-[5px_5px_0px_#060E1C] space-y-4">
      <div className="flex items-center justify-between border-b border-dark/10 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h3 className="text-sm font-black text-dark uppercase tracking-wider">
            Minors' Data Compliance Check
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="text-[10px] font-black uppercase text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete Child Data</span>
        </button>
      </div>

      {deletionFeedback ? (
        <div className="p-3 rounded-xl border border-dark bg-rose-50 text-xs font-bold text-rose-900">
          {deletionFeedback}
        </div>
      ) : null}

      {/* Legal Sign-Off Warning Banner */}
      <div className="p-3 rounded-xl border-[2px] border-amber-600 bg-amber-50 text-amber-950 text-[11px] font-bold space-y-1">
        <div className="flex items-center gap-1.5 font-black uppercase text-amber-900">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-700" />
          <span>Legal Sign-off Warning</span>
        </div>
        <p className="text-[10px] leading-tight text-amber-900/90">
          Engineering infrastructure only. Formal legal review from a qualified privacy lawyer is required before opening public signups in each jurisdiction.
        </p>
      </div>

      {/* Step 1: Regional Age Branching */}
      {consentStatus === 'idle' ? (
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-[10px] font-black uppercase text-dark/60">Select Region:</label>
            <select
              value={regionCode}
              onChange={(e) => setRegionCode(e.target.value)}
              className="w-full mt-1 p-2 rounded-xl border-[2px] border-dark text-xs font-bold bg-white"
            >
              <option value="NG">🇳🇬 Nigeria (NDPR - Under 13)</option>
              <option value="US">🇺🇸 United States (COPPA - Under 13)</option>
              <option value="UK">🇬🇧 United Kingdom (UK GDPR - Under 13)</option>
              <option value="IN">🇮🇳 India (DPDP Act - Under 18)</option>
              <option value="EG">🇪🇬 Egypt (Data Protection Law - Under 13)</option>
              <option value="GLOBAL">🌐 Universal Standard (Under 13)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-dark/60">Student Stated Age:</label>
            <input
              type="number"
              min="4"
              max="18"
              value={age}
              onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
              className="w-full mt-1 p-2 rounded-xl border-[2px] border-dark text-xs font-bold bg-white"
            />
          </div>

          <button
            type="button"
            disabled={checkingAge}
            onClick={handleCheckAge}
            className="w-full py-2.5 rounded-xl border-[2px] border-dark bg-yellow font-black text-xs uppercase text-dark shadow-[2px_2px_0px_#060E1C] hover:bg-yellow-400 cursor-pointer"
          >
            {checkingAge ? 'Checking Age Threshold...' : 'Verify Regional Consent Requirement'}
          </button>
        </div>
      ) : null}

      {/* Step 2: Parental Consent Needed */}
      {consentStatus === 'required' ? (
        <div className="space-y-3 pt-1">
          <div className="p-3 rounded-xl border border-dark bg-purple-50 text-xs font-semibold text-purple-950">
            <span className="font-black text-purple-900 block mb-1">
              🔒 Parental Consent Required ({checkResult?.legalFramework})
            </span>
            Students under {checkResult?.thresholdAge} in {checkResult?.regionCode} require verifiable parental consent before storing personal learning data.
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-dark/60">Parent / Guardian Email:</label>
            <input
              type="email"
              placeholder="parent@example.com"
              value={guardianEmail}
              onChange={(e) => setGuardianEmail(e.target.value)}
              className="w-full mt-1 p-2 rounded-xl border-[2px] border-dark text-xs font-bold bg-white"
            />
          </div>

          <label className="flex items-start gap-2 text-xs font-bold text-dark/80 cursor-pointer">
            <input
              type="checkbox"
              checked={checkedConsent}
              onChange={(e) => setCheckedConsent(e.target.checked)}
              className="mt-0.5"
            />
            <span>I confirm I am the parent/guardian and grant consent for my child's educational data processing.</span>
          </label>

          <button
            type="button"
            disabled={!guardianEmail || !checkedConsent}
            onClick={handleSubmitConsent}
            className="w-full py-2.5 rounded-xl border-[2px] border-dark bg-emerald-400 font-black text-xs uppercase text-dark shadow-[2px_2px_0px_#060E1C] disabled:opacity-40 cursor-pointer"
          >
            Record Verifiable Parental Consent
          </button>
        </div>
      ) : null}

      {/* Step 3: Consent Completed */}
      {consentStatus === 'completed' ? (
        <div className="p-3 rounded-xl border border-dark bg-emerald-100 text-emerald-950 text-xs font-black flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <span>Regional Minors' Data Compliance Verified</span>
          </div>
          <button type="button" onClick={() => setConsentStatus('idle')} className="text-dark/60 text-[10px] underline">Change</button>
        </div>
      ) : null}

      {/* Delete Child Data Modal */}
      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border-[4px] border-dark bg-white p-6 shadow-[8px_8px_0px_#060E1C] space-y-4">
            <h4 className="text-base font-black text-rose-900 uppercase">Delete Child's Data</h4>
            <p className="text-xs font-bold text-dark/70">
              This will hard purge all stored quiz history, consent logs, and flags for student ID <code className="bg-gray-100 px-1 font-mono">{studentId}</code>.
            </p>

            <div>
              <label className="text-[10px] font-black uppercase text-dark/60">
                Type "DELETE_MY_CHILD_DATA" to confirm:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full mt-1 p-2 rounded-xl border-[2px] border-dark text-xs font-bold"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2 border-[2px] border-dark rounded-xl text-xs font-black uppercase bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmText !== 'DELETE_MY_CHILD_DATA' || isDeleting}
                onClick={handleDeleteChildData}
                className="flex-1 py-2 border-[2px] border-dark rounded-xl text-xs font-black uppercase bg-rose-300 text-rose-950 shadow-[2px_2px_0px_#060E1C] disabled:opacity-40"
              >
                {isDeleting ? 'Deleting...' : 'Permanent Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
