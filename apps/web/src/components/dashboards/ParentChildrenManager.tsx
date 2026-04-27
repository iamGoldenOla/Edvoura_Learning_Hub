'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, UserPlus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { addChildAction, linkExistingChildAction } from '@/app/dash/parent/actions';

type ParentChild = {
  userId: string;
  fullName: string | null;
  email?: string | null;
  relationship: string;
  isPrimaryGuardian?: boolean;
  gradeLevelCode: string;
  gradeLevelName: string;
  gradeBandCode: string;
  gradeBandName: string;
  schoolName: string | null;
};

const gradeOptions = Array.from({ length: 12 }, (_, index) => {
  const level = index + 1;
  return { value: `grade_${level}`, label: `Grade ${level}` };
});

type ChildDraft = {
  fullName: string;
  email: string;
  gradeLevelCode: string;
  schoolName: string;
  academicGoalNotes: string;
  relationship: string;
  isPrimaryGuardian: boolean;
};

const createChildDraft = (isPrimaryGuardian: boolean): ChildDraft => ({
  fullName: '',
  email: '',
  gradeLevelCode: 'grade_7',
  schoolName: '',
  academicGoalNotes: '',
  relationship: 'guardian',
  isPrimaryGuardian,
});

export default function ParentChildrenManager({ initialChildren }: { initialChildren: ParentChild[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [linkMessage, setLinkMessage] = useState('');
  const [childrenCount, setChildrenCount] = useState(1);
  const [childrenDrafts, setChildrenDrafts] = useState<ChildDraft[]>([createChildDraft(true)]);
  const [linkForm, setLinkForm] = useState({
    childEmail: '',
    relationship: 'guardian',
    isPrimaryGuardian: false,
  });

  const updateChildrenCount = (nextCount: number) => {
    const safeCount = Math.min(4, Math.max(1, nextCount));
    setChildrenCount(safeCount);
    setChildrenDrafts((previous) => {
      if (previous.length === safeCount) return previous;
      if (previous.length > safeCount) return previous.slice(0, safeCount);
      const next = [...previous];
      while (next.length < safeCount) {
        next.push(createChildDraft(next.length === 0));
      }
      return next;
    });
  };

  const submitChildrenBatch = async () => {
    setStatusMessage('');
    setIsSubmitting(true);
    try {
      const payloads = childrenDrafts
        .map((child) => ({
          fullName: child.fullName.trim(),
          email: child.email.trim() || undefined,
          gradeLevelCode: child.gradeLevelCode,
          schoolName: child.schoolName.trim() || undefined,
          academicGoalNotes: child.academicGoalNotes.trim() || undefined,
          relationship: child.relationship,
          isPrimaryGuardian: child.isPrimaryGuardian,
        }))
        .filter((child) => child.fullName.length > 0);

      if (payloads.length === 0) {
        throw new Error('Enter at least one child name before saving.');
      }

      for (const payload of payloads) {
        await addChildAction(payload);
      }

      setStatusMessage(
        payloads.length === 1 ? 'Child added successfully.' : `${payloads.length} children added successfully.`,
      );
      setChildrenCount(1);
      setChildrenDrafts([createChildDraft(true)]);
      router.refresh();
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Unable to add children right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkExistingChild = async () => {
    setLinkMessage('');
    setIsLinking(true);
    try {
      await linkExistingChildAction({
        childEmail: linkForm.childEmail.trim(),
        relationship: linkForm.relationship,
        isPrimaryGuardian: linkForm.isPrimaryGuardian,
      });

      setLinkMessage('Existing child linked successfully.');
      setLinkForm({
        childEmail: '',
        relationship: 'guardian',
        isPrimaryGuardian: false,
      });
      router.refresh();
    } catch (error) {
      setLinkMessage(error instanceof Error ? error.message : 'Unable to link child right now.');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1680px] space-y-10 p-6 sm:p-8 pb-24">
      <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
        <div className="p-8 border-b-[4px] border-dark bg-yellow/20">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[0.92] text-dark">
            My Children
          </h1>
          <p className="mt-4 text-sm md:text-base font-bold text-dark/70 max-w-xl">
            Link each child profile, manage grade placement, and keep parent access accurate.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Linked Learner Profiles */}
        <div className="lg:col-span-2 border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-sky-100 flex items-center gap-3">
            <Users className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Linked Learner Profiles</h2>
          </div>
          <div className="p-6 sm:p-8">
            {initialChildren.length > 0 ? (
              <div className="space-y-4">
                {initialChildren.map((child) => (
                  <div key={child.userId} className="rounded-2xl border-[3px] border-dark bg-off-white p-5 shadow-[4px_4px_0px_#060E1C] flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#060E1C]">
                    <div>
                      <p className="text-xl font-black text-dark">{child.fullName ?? 'Unnamed Child'}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60 mt-1">
                        {child.gradeLevelName} | {child.gradeBandName} | {child.relationship}
                      </p>
                      {child.schoolName ? (
                        <p className="text-sm font-bold text-dark/70 mt-2">School: {child.schoolName}</p>
                      ) : null}
                    </div>
                    <span className="inline-flex items-center rounded-xl border-[2px] border-dark bg-blue-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-blue-900 shadow-[2px_2px_0px_#060E1C]">
                      {child.isPrimaryGuardian ? 'Primary Guardian' : 'Linked Guardian'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border-[3px] border-dashed border-dark/20 bg-slate-50 p-8 text-center text-sm font-bold text-dark/60">
                No child profiles linked yet.
              </div>
            )}
          </div>
        </div>

        {/* Add Children */}
        <div className="border-[4px] border-dark rounded-[28px] bg-white shadow-[10px_10px_0px_#060E1C] overflow-hidden">
          <div className="p-6 border-b-[4px] border-dark bg-emerald-100 flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-dark" />
            <h2 className="text-2xl font-black text-dark tracking-tight">Add Children</h2>
          </div>
          <div className="p-6 sm:p-8 space-y-6">
            <select
              value={String(childrenCount)}
              onChange={(event) => updateChildrenCount(Number.parseInt(event.target.value, 10) || 1)}
              className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-black text-dark outline-none focus:border-emerald-400 focus:ring-0 transition-all shadow-[4px_4px_0px_#060E1C]"
            >
              <option value="1">1 child</option>
              <option value="2">2 children</option>
              <option value="3">3 children</option>
              <option value="4">4 children</option>
            </select>

            {childrenDrafts.map((child, index) => (
              <div key={`child-draft-${index}`} className="rounded-2xl border-[3px] border-dark bg-off-white p-5 space-y-4 shadow-[4px_4px_0px_#060E1C]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">Child {index + 1}</p>
                <input
                  placeholder="Child full name"
                  value={child.fullName}
                  onChange={(event) =>
                    setChildrenDrafts((previous) =>
                      previous.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, fullName: event.target.value } : entry,
                      ),
                    )
                  }
                  className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-emerald-400"
                />
                <input
                  placeholder="Child email (optional)"
                  value={child.email}
                  onChange={(event) =>
                    setChildrenDrafts((previous) =>
                      previous.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, email: event.target.value } : entry,
                      ),
                    )
                  }
                  className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-emerald-400"
                />
                <select
                  value={child.gradeLevelCode}
                  onChange={(event) =>
                    setChildrenDrafts((previous) =>
                      previous.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, gradeLevelCode: event.target.value } : entry,
                      ),
                    )
                  }
                  className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-emerald-400"
                >
                  {gradeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={child.relationship}
                  onChange={(event) =>
                    setChildrenDrafts((previous) =>
                      previous.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, relationship: event.target.value } : entry,
                      ),
                    )
                  }
                  className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-emerald-400"
                >
                  <option value="mother">Mother</option>
                  <option value="father">Father</option>
                  <option value="guardian">Guardian</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
                <input
                  placeholder="School name (optional)"
                  value={child.schoolName}
                  onChange={(event) =>
                    setChildrenDrafts((previous) =>
                      previous.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, schoolName: event.target.value } : entry,
                      ),
                    )
                  }
                  className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-emerald-400"
                />
                <textarea
                  rows={2}
                  placeholder="Academic goals (optional)"
                  value={child.academicGoalNotes}
                  onChange={(event) =>
                    setChildrenDrafts((previous) =>
                      previous.map((entry, entryIndex) =>
                        entryIndex === index ? { ...entry, academicGoalNotes: event.target.value } : entry,
                      ),
                    )
                  }
                  className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-emerald-400"
                />
                <label className="flex items-center gap-3 rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark cursor-pointer transition-all hover:bg-slate-50">
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded-md border-[2px] border-dark text-emerald-500 focus:ring-emerald-500"
                    checked={child.isPrimaryGuardian}
                    onChange={(event) =>
                      setChildrenDrafts((previous) =>
                        previous.map((entry, entryIndex) =>
                          entryIndex === index
                            ? { ...entry, isPrimaryGuardian: event.target.checked }
                            : entry,
                        ),
                      )
                    }
                  />
                  Primary guardian for this child
                </label>
              </div>
            ))}

            <Button
              className="w-full bg-emerald-400 border-[3px] border-dark !text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 h-auto text-base"
              disabled={isSubmitting}
              onClick={submitChildrenBatch}
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              {isSubmitting ? 'Saving...' : 'Save Children'}
            </Button>
            {statusMessage ? <div className="rounded-xl border-[3px] border-dark bg-blue-100 p-4 text-sm font-black !text-dark shadow-[4px_4px_0px_#060E1C]">{statusMessage}</div> : null}

            <div className="border-t-[4px] border-dark/10 pt-6 space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dark/60">
                Link Existing Student Account
              </p>
              <input
                placeholder="Child existing email"
                value={linkForm.childEmail}
                onChange={(event) => setLinkForm((prev) => ({ ...prev, childEmail: event.target.value }))}
                className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-blue-400"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={linkForm.relationship}
                  onChange={(event) => setLinkForm((prev) => ({ ...prev, relationship: event.target.value }))}
                  className="w-full rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark outline-none focus:border-blue-400"
                >
                  <option value="mother">Mother</option>
                  <option value="father">Father</option>
                  <option value="guardian">Guardian</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
                <label className="flex items-center gap-3 rounded-xl border-[3px] border-dark bg-white px-4 py-3 text-sm font-bold text-dark cursor-pointer transition-all hover:bg-slate-50">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[2px] border-dark text-blue-500 focus:ring-blue-500"
                    checked={linkForm.isPrimaryGuardian}
                    onChange={(event) =>
                      setLinkForm((prev) => ({ ...prev, isPrimaryGuardian: event.target.checked }))
                    }
                  />
                  Primary
                </label>
              </div>
              <Button
                className="w-full bg-white border-[3px] border-dark !text-dark font-black rounded-xl shadow-[4px_4px_0px_#060E1C] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:scale-95 px-6 py-4 h-auto text-base"
                disabled={isLinking || !linkForm.childEmail.trim()}
                onClick={linkExistingChild}
              >
                {isLinking ? 'Linking...' : 'Link Existing Child by Email'}
              </Button>
              {linkMessage ? <div className="rounded-xl border-[3px] border-dark bg-emerald-100 p-4 text-sm font-black !text-dark shadow-[4px_4px_0px_#060E1C]">{linkMessage}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
