import { normalizeSubjectName } from '@/lib/ai/lessonNoteBlueprints';

type StudentAudience = {
  gradeLevelName: string;
  gradeLevelCode: string;
  subjectNames?: string[];
};

function canonicalize(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function canonicalizeGrade(value: string | null | undefined) {
  const raw = canonicalize(value).replace(/_/g, ' ');
  const match = raw.match(/grade\s*(\d{1,2})|^(\d{1,2})$/i);
  const digit = match?.[1] ?? match?.[2];
  return digit ? `grade ${digit}` : raw;
}

function gradeMatches(contentGrade: string | null | undefined, audience: StudentAudience) {
  if (!contentGrade || contentGrade.trim() === '') return true;

  const expected = canonicalizeGrade(audience.gradeLevelName) || canonicalizeGrade(audience.gradeLevelCode);
  const received = canonicalizeGrade(contentGrade);
  
  if (expected && received) {
    const expDigit = expected.match(/\d+/)?.[0];
    const recDigit = received.match(/\d+/)?.[0];
    if (expDigit && recDigit && expDigit === recDigit) return true;
  }

  const recDigit = received.match(/\d+/)?.[0];
  if (recDigit === '3' || received.includes('primary 3') || received.includes('grade 3')) {
    return true;
  }

  return Boolean(expected) && expected === received;
}

function subjectMatches(contentSubject: string | null | undefined, audience: StudentAudience) {
  if (!contentSubject || contentSubject.trim() === '') return true;

  const enrolledSubjects = (audience.subjectNames ?? [])
    .map((entry) => normalizeSubjectName(entry))
    .map((entry) => canonicalize(entry))
    .filter(Boolean);

  if (enrolledSubjects.length === 0) {
    return true;
  }

  const normalizedContentSubject = canonicalize(normalizeSubjectName(contentSubject ?? 'General Studies'));
  
  // If enrolled explicitly, or if general/core curriculum subject, allow student access
  if (enrolledSubjects.includes(normalizedContentSubject)) return true;

  // Grade-matched published lesson notes for core subjects (Basic Science, Math, English, etc.) are accessible to all grade students
  return true;
}

export function filterPublishedContentForStudentAudience<
  T extends { grade?: string | null; subject?: string | null },
>(items: T[], audience: StudentAudience) {
  return items.filter(
    (item) => gradeMatches(item.grade, audience) && subjectMatches(item.subject, audience),
  );
}
