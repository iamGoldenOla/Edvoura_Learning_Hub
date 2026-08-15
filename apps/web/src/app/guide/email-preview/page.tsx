import { generateParentWelcomeEmailHtml, generateParentFollowUp1Html, generateParentFollowUp2Html } from '@/lib/emailTemplates';
import Link from 'next/link';
import { EmailDispatcherButton } from '@/components/marketing/EmailDispatcherButton';

export default async function PublicEmailPreviewPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const template = typeof searchParams.template === 'string' ? searchParams.template : 'welcome';
  const device = typeof searchParams.device === 'string' ? searchParams.device : 'desktop';

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

  const iframeWidth = device === 'mobile' ? 'max-w-[390px]' : 'max-w-[640px]';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 sm:p-8 flex flex-col items-center">
      
      {/* Inspector Bar */}
      <div className="w-full max-w-5xl bg-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-700 pb-4">
          <div>
            <span className="px-2.5 py-0.5 bg-yellow-400 text-slate-950 font-extrabold rounded text-[10px] uppercase tracking-wider">
              EMAIL DISPATCH CENTER
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">Edvoura Parent Email Center</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Preview parent email notifications and test instant dispatch to any inbox address.
            </p>
          </div>

          {/* Template Tabs */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/guide/email-preview?template=welcome&device=${device}`}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                template === 'welcome' ? 'bg-yellow-400 text-slate-950 shadow' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              1. Welcome Email (Day 0)
            </Link>
            <Link
              href={`/guide/email-preview?template=followup1&device=${device}`}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                template === 'followup1' ? 'bg-yellow-400 text-slate-950 shadow' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              2. Follow-Up #1 (Day 2)
            </Link>
            <Link
              href={`/guide/email-preview?template=followup2&device=${device}`}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                template === 'followup2' ? 'bg-yellow-400 text-slate-950 shadow' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              3. Follow-Up #2 (Day 5)
            </Link>
          </div>
        </div>

        {/* Email Dispatcher Control */}
        <EmailDispatcherButton defaultEmail="jediark4poesy@gmail.com" templateType={template as 'welcome' | 'followup1' | 'followup2'} />

        {/* Device Switcher */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div>
            Viewing Template: <strong className="text-white uppercase">{template}</strong>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase font-semibold">Simulate Viewport:</span>
            <Link
              href={`/guide/email-preview?template=${template}&device=desktop`}
              className={`px-3 py-1 rounded text-[11px] font-bold ${
                device === 'desktop' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              💻 Desktop
            </Link>
            <Link
              href={`/guide/email-preview?template=${template}&device=mobile`}
              className={`px-3 py-1 rounded text-[11px] font-bold ${
                device === 'mobile' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'
              }`}
            >
              📱 Mobile
            </Link>
          </div>
        </div>
      </div>

      {/* Frame Container */}
      <div className={`w-full ${iframeWidth} transition-all duration-300 bg-slate-950 p-2 rounded-3xl border-4 border-slate-800 shadow-2xl`}>
        <iframe
          srcDoc={htmlContent}
          title="Parent Email Preview"
          className="w-full h-[720px] rounded-2xl bg-white border-none shadow-inner"
        />
      </div>

    </div>
  );
}
