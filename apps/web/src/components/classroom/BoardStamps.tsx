export interface StampItem {
  id: string;
  type: string;
  label: string;
  emoji?: string;
  x: number;
  y: number;
  awardedBy: string;
  timestamp: number;
}

export const STAMP_PRESETS = [
  { type: 'star', label: '⭐ Brilliant Work!', emoji: '⭐', bg: 'bg-amber-100', border: 'border-amber-500', text: 'text-amber-900', sound: 'success' },
  { type: 'perfect', label: '💯 100% Accurate', emoji: '💯', bg: 'bg-emerald-100', border: 'border-emerald-500', text: 'text-emerald-900', sound: 'complete' },
  { type: 'superstar', label: '🔥 Superstar Answer!', emoji: '🔥', bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-900', sound: 'success' },
  { type: 'proud', label: '👏 Proud of You!', emoji: '👏', bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-900', sound: 'complete' },
  { type: 'idea', label: '💡 Great Thinking!', emoji: '💡', bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-900', sound: 'click' },
  { type: 'effort', label: '🌟 Outstanding Effort!', emoji: '🌟', bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-900', sound: 'success' },
  { type: 'spot_on', label: '🎯 Spot On!', emoji: '🎯', bg: 'bg-teal-100', border: 'border-teal-500', text: 'text-teal-900', sound: 'complete' },
  { type: 'check', label: '🔍 Check Your Calculation', emoji: '🔍', bg: 'bg-sky-100', border: 'border-sky-500', text: 'text-sky-900', sound: 'click' },
  { type: 'redo', label: '📝 Revise Step 2', emoji: '📝', bg: 'bg-rose-100', border: 'border-rose-500', text: 'text-rose-900', sound: 'pop' },
  { type: 'try_again', label: '✍️ Try Again - You Can Do It!', emoji: '✍️', bg: 'bg-pink-100', border: 'border-pink-500', text: 'text-pink-900', sound: 'pop' },
  { type: 'thumbs_up', label: '👍 Almost There!', emoji: '👍', bg: 'bg-indigo-100', border: 'border-indigo-500', text: 'text-indigo-900', sound: 'coin' },
  { type: 'trophy', label: '🏆 Math Champion!', emoji: '🏆', bg: 'bg-yellow-200', border: 'border-yellow-600', text: 'text-yellow-950', sound: 'success' },
] as const;

export const EMOJI_PRESETS = [
  '⭐', '🌟', '🏆', '🥇', '🎯', '🚀', '💯', '👏',
  '❤️', '💡', '🦄', '👑', '✨', '🧠', '📚', '🎨',
  '🌈', '🥳', '👍', '🙌', '🎈', '🐱', '🐶', '🍕',
] as const;
