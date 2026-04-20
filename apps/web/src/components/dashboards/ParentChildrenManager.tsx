'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, UserPlus, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

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
        await apiClient.post('/parents/me/children', payload);
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
      await apiClient.post('/parents/me/children/link', {
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
    <div className="mx-auto max-w-7xl space-y-8 p-6 sm:p-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-edvoura-navy">My Children</h1>
        <p className="mt-2 text-sm text-slate-600">
          Link each child profile, manage grade placement, and keep parent access accurate.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-600" />
              Linked Learner Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {initialChildren.length > 0 ? (
              <div className="space-y-3">
                {initialChildren.map((child) => (
                  <div key={child.userId} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{child.fullName ?? 'Unnamed Child'}</p>
                        <p className="text-xs text-slate-600">
                          {child.gradeLevelName} | {child.gradeBandName} | {child.relationship}
                        </p>
                        {child.schoolName ? (
                          <p className="text-xs text-slate-500">School: {child.schoolName}</p>
                        ) : null}
                      </div>
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                        {child.isPrimaryGuardian ? 'Primary Guardian' : 'Linked Guardian'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600">No child profiles linked yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-slate-600" />
              Add Children
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <select
              value={String(childrenCount)}
              onChange={(event) => updateChildrenCount(Number.parseInt(event.target.value, 10) || 1)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="1">1 child</option>
              <option value="2">2 children</option>
              <option value="3">3 children</option>
              <option value="4">4 children</option>
            </select>

            {childrenDrafts.map((child, index) => (
              <div key={`child-draft-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Child {index + 1}</p>
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
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <label className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
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
              variant="primary"
              className="w-full text-xs"
              isLoading={isSubmitting}
              onClick={submitChildrenBatch}
            >
              <PlusCircle className="mr-1 h-3.5 w-3.5" />
              Save Children
            </Button>
            {statusMessage ? <p className="text-xs text-slate-700">{statusMessage}</p> : null}

            <div className="border-t border-slate-200 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Link Existing Student Account
              </p>
              <input
                placeholder="Child existing email"
                value={linkForm.childEmail}
                onChange={(event) => setLinkForm((prev) => ({ ...prev, childEmail: event.target.value }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <select
                  value={linkForm.relationship}
                  onChange={(event) => setLinkForm((prev) => ({ ...prev, relationship: event.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="mother">Mother</option>
                  <option value="father">Father</option>
                  <option value="guardian">Guardian</option>
                  <option value="sibling">Sibling</option>
                  <option value="other">Other</option>
                </select>
                <label className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={linkForm.isPrimaryGuardian}
                    onChange={(event) =>
                      setLinkForm((prev) => ({ ...prev, isPrimaryGuardian: event.target.checked }))
                    }
                  />
                  Primary guardian
                </label>
              </div>
              <Button
                variant="outline"
                className="mt-2 w-full text-xs"
                isLoading={isLinking}
                onClick={linkExistingChild}
                disabled={!linkForm.childEmail.trim()}
              >
                Link Existing Child by Email
              </Button>
              {linkMessage ? <p className="mt-1 text-xs text-slate-700">{linkMessage}</p> : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
