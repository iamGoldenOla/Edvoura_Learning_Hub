import { generateParentWelcomeEmailHtml, generateParentFollowUp1Html, generateParentFollowUp2Html } from '@/lib/emailTemplates';
import Link from 'next/link';

export default async function EmailPreviewPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const template = typeof searchParams.template === 'string' ? searchParams.template : 'welcome';

  let htmlContent = generateParentWelcomeEmailHtml({
    parentName: 'Sarah Jenkins',
    parentEmail: 'sarah.jenkins@example.com',
    topic: 'Book Free Introductory Session',
  });

  if (template === 'followup1') {
    htmlContent = generateParentFollowUp1Html({
      parentName: 'Sarah Jenkins',
      parentEmail: 'sarah.jenkins@example.com',
    });
  } else if (template === 'followup2') {
    htmlContent = generateParentFollowUp2Html({
      parentName: 'Sarah Jenkins',
      parentEmail: 'sarah.jenkins@example.com',
    });
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-[1680px] space-y-6 p-4 sm:p-8 pb-24">
      {/* Navigation Header */}
      <div className="border-[4px] border-dark rounded-[28px] bg-white p-6 shadow-[10px_10px_0px_#060E1C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 bg-yellow text-dark border-[2px] border-dark rounded-full text-[10px] font-black uppercase tracking-widest">
            Brand Email Template Inspector
          </span>
          <h1 className="text-3xl font-black text-dark mt-1">Edvoura Email Templates &amp; Automated Sequence</h1>
          <p className="text-xs font-bold text-dark/70">Preview the exact HTML emails delivered to prospective parents.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dash/admin/email-preview?template=welcome"
            className={`px-4 py-2 rounded-xl border-[2.5px] border-dark text-xs font-black uppercase tracking-wider transition-all ${
              template === 'welcome' ? 'bg-dark text-white shadow-[3px_3px_0px_#F5C518]' : 'bg-white text-dark hover:bg-slate-100'
            }`}
          >
            1. Welcome Email (Day 0)
          </Link>
          <Link
            href="/dash/admin/email-preview?template=followup1"
            className={`px-4 py-2 rounded-xl border-[2.5px] border-dark text-xs font-black uppercase tracking-wider transition-all ${
              template === 'followup1' ? 'bg-dark text-white shadow-[3px_3px_0px_#F5C518]' : 'bg-white text-dark hover:bg-slate-100'
            }`}
          >
            2. Follow-Up #1 (Day 2 Nudge)
          </Link>
          <Link
            href="/dash/admin/email-preview?template=followup2"
            className={`px-4 py-2 rounded-xl border-[2.5px] border-dark text-xs font-black uppercase tracking-wider transition-all ${
              template === 'followup2' ? 'bg-dark text-white shadow-[3px_3px_0px_#F5C518]' : 'bg-white text-dark hover:bg-slate-100'
            }`}
          >
            3. Follow-Up #2 (Day 5 Nudge)
          </Link>
        </div>
      </div>

      {/* HTML Render Iframe Container */}
      <div className="border-[4px] border-dark rounded-[28px] bg-white p-4 shadow-[12px_12px_0px_#060E1C]">
        <div className="p-3 bg-slate-100 border-[2px] border-dark rounded-xl mb-4 flex items-center justify-between text-xs font-bold text-dark">
          <span>Viewing: <strong className="uppercase font-black text-dark">{template}</strong> Template</span>
          <span>Recipient: sarah.jenkins@example.com</span>
        </div>
        
        <iframe
          srcDoc={htmlContent}
          title="Email HTML Preview"
          className="w-full h-[750px] rounded-2xl border-[3px] border-dark bg-white shadow-[inset_0px_0px_10px_rgba(0,0,0,0.05)]"
        />
      </div>
    </div>
  );
}
