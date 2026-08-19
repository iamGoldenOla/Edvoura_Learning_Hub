/**
 * EDVOURA OFFLINE QUIZ CACHE & RECONNECT SYNC UTILITY
 */

export interface PendingAnswerSync {
  studentId: string;
  subject: string;
  topic: string;
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'edvoura_offline_pending_answers_v1';

export function savePendingAnswerOffline(item: PendingAnswerSync): void {
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY);
    const list: PendingAnswerSync[] = existingRaw ? JSON.parse(existingRaw) : [];
    list.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    console.log('[OFFLINE CACHE] Saved answer offline:', item);
  } catch (e) {
    console.error('[OFFLINE CACHE SAVE ERROR]', e);
  }
}

export async function syncPendingAnswersOnline(): Promise<{ syncedCount: number }> {
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEY);
    if (!existingRaw) return { syncedCount: 0 };
    const list: PendingAnswerSync[] = JSON.parse(existingRaw);

    if (list.length === 0) return { syncedCount: 0 };

    let syncedCount = 0;

    for (const item of list) {
      try {
        await fetch('/api/student/topic-mastery/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: item.studentId,
            subject: item.subject,
            topic: item.topic,
            isCorrect: item.isCorrect,
          }),
        });
        syncedCount++;
      } catch (err) {
        console.error('[SYNC RETRY ERROR]', err);
      }
    }

    // Clear queue after successful sync
    localStorage.removeItem(STORAGE_KEY);
    console.log(`[OFFLINE RECONNECT SYNC] Successfully synced ${syncedCount} queued answers.`);
    return { syncedCount };
  } catch (e) {
    console.error('[OFFLINE SYNC ERROR]', e);
    return { syncedCount: 0 };
  }
}
