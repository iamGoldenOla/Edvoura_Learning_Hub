export interface StampItem {
  id: string;
  type: 'star' | 'perfect' | 'check' | 'redo' | 'thumbs_up';
  label: string;
  x: number;
  y: number;
  awardedBy: string;
  timestamp: number;
}

export const STAMP_PRESETS = [
  { type: 'star', label: '⭐ Brilliant Work!', bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-900', sound: 'success' },
  { type: 'perfect', label: '💯 100% Accurate', bg: 'bg-emerald-100', border: 'border-emerald-500', text: 'text-emerald-900', sound: 'complete' },
  { type: 'check', label: '🔍 Check Your Calculation', bg: 'bg-sky-100', border: 'border-sky-500', text: 'text-sky-900', sound: 'click' },
  { type: 'redo', label: '📝 Revise Step 2', bg: 'bg-rose-100', border: 'border-rose-500', text: 'text-rose-900', sound: 'pop' },
  { type: 'thumbs_up', label: '👍 Almost There!', bg: 'bg-indigo-100', border: 'border-indigo-500', text: 'text-indigo-900', sound: 'coin' },
] as const;
