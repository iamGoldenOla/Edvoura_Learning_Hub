/**
 * EDVOURA CURRICULUM WEEKLY PAGE MAP REGISTRY
 * Maps subject note IDs and grade levels to their exact weekly page boundaries.
 */

export interface WeeklyPageBoundary {
  weeks: Record<number, number>; // weekNumber -> endPage (1-indexed)
  avgPagesPerWeek?: number;
}

export const SUBJECT_WEEKLY_PAGE_REGISTRY: Record<string, WeeklyPageBoundary> = {
  // Primary 1 Basic Science & Tech (Total ~89 Pages)
  p1_basic_science: {
    weeks: {
      1: 6,   // Week 1: Pages 1-6
      2: 12,  // Week 2: Pages 7-12
      3: 18,  // Week 3: Pages 13-18
      4: 24,  // Week 4: Pages 19-24
      5: 30,  // Week 5: Pages 25-30
      6: 36,  // Week 6: Pages 31-36 (Mid-Term)
      12: 55, // Week 12: End of 1st Term
      24: 75, // Week 24: End of 2nd Term
      36: 89, // Week 36: End of 3rd Term
    },
    avgPagesPerWeek: 6,
  },

  // Primary 1 Mathematics
  p1_mathematics: {
    weeks: {
      1: 7,   // Week 1: Pages 1-7
      2: 14,  // Week 2: Pages 8-14
      3: 21,  // Week 3: Pages 15-21
      6: 40,
      12: 60,
      36: 95,
    },
    avgPagesPerWeek: 7,
  },

  // Primary 1 English Language
  p1_english: {
    weeks: {
      1: 6,   // Week 1: Pages 1-6
      2: 12,  // Week 2: Pages 7-12
      3: 18,  // Week 3: Pages 13-18
      6: 36,
      12: 58,
      36: 90,
    },
    avgPagesPerWeek: 6,
  },
};

/**
 * Calculates the exact end page number for a given subject and unlocked week.
 */
export function getEndPageForSubjectWeek(subjectId: string | null, unlockedWeek: number, totalPages: number): number {
  if (unlockedWeek >= 36) return totalPages;

  const registry = subjectId ? SUBJECT_WEEKLY_PAGE_REGISTRY[subjectId] : null;

  if (registry) {
    if (registry.weeks[unlockedWeek]) {
      return Math.min(registry.weeks[unlockedWeek], totalPages);
    }
    const avg = registry.avgPagesPerWeek || 6;
    return Math.min(Math.ceil(unlockedWeek * avg), totalPages);
  }

  // Smart dynamic fallback based on total page density
  const dynamicAvgPages = Math.max(4, Math.floor(totalPages / 14));
  return Math.min(Math.ceil(unlockedWeek * dynamicAvgPages), totalPages);
}
