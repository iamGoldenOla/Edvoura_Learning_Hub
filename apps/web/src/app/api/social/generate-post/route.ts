import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SocialPostRequest {
  topic?: string;
  targetRegion?: 'uzbekistan' | 'russia' | 'uk' | 'nigeria' | 'global';
  platform?: 'telegram' | 'whatsapp' | 'facebook' | 'linkedin' | 'twitter' | 'all';
}

const TEMPLATES = {
  uzbekistan: {
    telegram: `🇺🇿 *Tashkent & Samarkand Parents: 1-on-1 Online Tutoring from $20/session!*

Is your child preparing for Cambridge Primary Checkpoint, struggling with tricky math word problems, or aiming for native English reading fluency?

At *Edvoura Learning Hub*, we connect students across Uzbekistan with certified, patient international educators:
✨ Cambridge Primary & Lower Secondary curriculum
🍕 Visual Math: Singapore bar modeling & visual fractions
📖 English Phonics & Pronunciation coaching
⏰ Scheduled conveniently in Uzbekistan Time (UZT / UTC+5)
💵 Transparent pricing: Just $20 per focused 1-on-1 session!

👉 Book your child's free trial lesson today:
https://edvouralearninghub.com/online-tutoring-uzbekistan

#TashkentEducation #UzbekistanSchools #CambridgePrimary #OnlineTutoring #Edvoura`,

    linkedin: `Central Asia is experiencing a transformative boom in English-medium and Cambridge International education. 

At Edvoura Learning Hub, we're proud to support families across Tashkent, Samarkand, and the wider CIS corridor with elite, accessible 1-on-1 online tutoring starting from $20 per session.

Our specialized primary educators focus on:
• Cambridge Primary Checkpoint Mathematics and English
• Singapore Math heuristic problem-solving
• Systematic Phonics decoding for bilingual learners

Explore how our interactive classrooms empower young scholars across Uzbekistan:
https://edvouralearninghub.com/online-tutoring-uzbekistan

#InternationalEducation #Tashkent #CentralAsia #EdTech #CambridgeCurriculum #Edvoura`,

    whatsapp: `🌟 *Looking for a patient, certified online tutor for your child in Uzbekistan?*

Edvoura provides 1-on-1 online tutoring for primary and secondary students in Tashkent:
✅ Cambridge Primary & Singapore Math
✅ English Phonics, Reading & Writing
✅ Focused 1-hour sessions starting at just $20
✅ Scheduled to your afternoon & weekend hours (UZT)

Learn more and schedule a free session:
https://edvouralearninghub.com/online-tutoring-uzbekistan`,
  },

  global: {
    facebook: `Struggling with evening homework tears or confusing math worksheets? 

Edvoura connects your child with a dedicated, certified educator for structured 1-on-1 coaching starting at just $20/session. 

No rote memorization—just patient, visual explanations that make concepts click. 
✅ Grades 1 to 6 Primary Focus
✅ Singapore Math, Phonics & Homework Coaching
✅ Transparent hourly rates with zero hidden fees

Check out our primary programs and book a trial today:
https://edvouralearninghub.com/services`,

    twitter: `Help your child master math and reading without the stress. 

🧠 Visual Singapore bar modeling
📚 Systematic phonics & fluency
🎯 Focused 1-hour coaching from $20/session

Certified 1-on-1 educators worldwide:
https://edvouralearninghub.com/pricing #EdTech #Parenting #Homeschool #OnlineTutoring`,
  },
};

export async function POST(req: NextRequest) {
  try {
    const body: SocialPostRequest = await req.json().catch(() => ({}));
    const region = body.targetRegion || 'uzbekistan';
    const platform = body.platform || 'all';

    const regionTemplates = TEMPLATES[region === 'uzbekistan' ? 'uzbekistan' : 'global'];

    const responsePosts: Record<string, string> = {};

    if (platform === 'all') {
      Object.assign(responsePosts, TEMPLATES.uzbekistan);
      Object.assign(responsePosts, TEMPLATES.global);
    } else if (platform === 'telegram') {
      responsePosts.telegram = TEMPLATES.uzbekistan.telegram;
    } else if (platform === 'whatsapp') {
      responsePosts.whatsapp = TEMPLATES.uzbekistan.whatsapp;
    } else if (platform === 'linkedin') {
      responsePosts.linkedin = TEMPLATES.uzbekistan.linkedin;
    } else if (platform === 'facebook') {
      responsePosts.facebook = TEMPLATES.global.facebook;
    } else if (platform === 'twitter') {
      responsePosts.twitter = TEMPLATES.global.twitter;
    }

    return NextResponse.json({
      success: true,
      targetRegion: region,
      platform,
      posts: responsePosts,
      syndicationTips: [
        'Telegram channels and discussion groups are the #1 community channel in Uzbekistan and Central Asia.',
        'WhatsApp broadcast lists and status updates are the primary organic sharing channel for diaspora parents in the UK, Nigeria, and North America.',
        'LinkedIn articles targeting expat parents and international school teachers in Tashkent generate high-trust corporate referrals.',
      ],
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: 'Failed to generate social syndicate copy', detail: error?.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
