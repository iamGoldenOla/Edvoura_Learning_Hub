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
  const expected = canonicalizeGrade(audience.gradeLevelName) || canonicalizeGrade(audience.gradeLevelCode);
  const received = canonicalizeGrade(contentGrade);
  return Boolean(expected) && expected === received;
}

function subjectMatches(contentSubject: string | null | undefined, audience: StudentAudience) {
  const enrolledSubjects = (audience.subjectNames ?? [])
    .map((entry) => normalizeSubjectName(entry))
    .map((entry) => canonicalize(entry))
    .filter(Boolean);

  if (enrolledSubjects.length === 0) {
    return true;
  }

  const normalizedContentSubject = canonicalize(normalizeSubjectName(contentSubject ?? 'General Studies'));
  return enrolledSubjects.includes(normalizedContentSubject);
}

export function filterPublishedContentForStudentAudience<
  T extends { grade?: string | null; subject?: string | null },
>(items: T[], audience: StudentAudience) {
  return items.filter(
    (item) => gradeMatches(item.grade, audience) && subjectMatches(item.subject, audience),
  );
}
