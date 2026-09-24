/**
 * Lightweight in-app toast utility
 */
export const toast = {
  success: (message: string) => {
    if (typeof window !== 'undefined') {
      console.log(`[TOAST SUCCESS] ${message}`);
      // Show simple non-blocking alert banner or notification if needed
      const banner = document.createElement('div');
      banner.className = 'fixed bottom-4 right-4 z-50 bg-green-400 text-black border-4 border-black px-6 py-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-lg transition-all animate-bounce';
      banner.innerText = message;
      document.body.appendChild(banner);
      setTimeout(() => banner.remove(), 3000);
    }
  },
  error: (message: string) => {
    if (typeof window !== 'undefined') {
      console.error(`[TOAST ERROR] ${message}`);
      const banner = document.createElement('div');
      banner.className = 'fixed bottom-4 right-4 z-50 bg-red-400 text-black border-4 border-black px-6 py-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-lg transition-all';
      banner.innerText = message;
      document.body.appendChild(banner);
      setTimeout(() => banner.remove(), 4000);
    }
  },
};
