import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface SocialPostRequest {
  topic?: string;
  targetRegion?: 'uzbekistan' | 'russia' | 'japan' | 'china' | 'south-korea' | 'canada' | 'uae' | 'uk' | 'nigeria' | 'global';
  platform?: 'telegram' | 'whatsapp' | 'facebook' | 'linkedin' | 'twitter' | 'all';
}

const TEMPLATES: Record<string, Record<string, string>> = {
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

  japan: {
    linkedin: `Expat and returnee (Kikokushijo) families in Tokyo and Yokohama often face intense academic pressure and crowded Juku schedules.

Edvoura Learning Hub delivers a personalized, calm alternative: 1-on-1 online tutoring aligned to Cambridge Primary, IB PYP, and Singapore Math starting from just $20 per session.

Scheduled to Japan Standard Time (JST) after-school hours with patient international educators:
https://edvouralearninghub.com/online-tutoring-japan

#TokyoExpats #InternationalSchoolsTokyo #Kikokushijo #ASIJ #BST #Edvoura`,

    facebook: `Tokyo & Yokohama Parents: Save 60% compared to local private tutoring agencies. 

Edvoura connects international school and bilingual students (ASIJ, BST, St. Mary's, Seisen) with certified 1-on-1 educators in Singapore Math, Phonics, and IB PYP from $20/session. 

Explore our primary programs:
https://edvouralearninghub.com/online-tutoring-japan`,
  },

  canada: {
    facebook: `Canadian Parents (Ontario & BC): Tired of paying $65–$80/hr for agency tutoring? 

Edvoura provides dedicated 1-on-1 online educators aligned with the Ontario & British Columbia curriculum for just $20/session. 

✅ Foundational Singapore Math & Word Problems
✅ Reading Fluency & EQAO Readiness
✅ Scheduled in Canadian Eastern, Central, and Pacific time zones

Book a free consultation today:
https://edvouralearninghub.com/online-tutoring-canada`,

    whatsapp: `🇨🇦 *Canadian Parents: Affordable 1-on-1 Online Tutoring from $20/session!*

Support your child with Ontario & BC curriculum-aligned math and literacy coaching:
• Singapore Math & problem-solving heuristics
• Phonics, reading comprehension & grammar
• Flexible after-school & weekend schedules

Details and booking:
https://edvouralearninghub.com/online-tutoring-canada`,
  },

  uae: {
    linkedin: `Private tutoring in Dubai and Abu Dhabi often reaches upwards of 350 AED ($95+) per hour. 

Edvoura Learning Hub delivers world-class 1-on-1 coaching for British National Curriculum, Cambridge Primary, and IB students across the UAE starting at just $20 (~74 AED) per session.

Scheduled to Gulf Standard Time (GST):
https://edvouralearninghub.com/online-tutoring-uae

#DubaiMums #DubaiParents #AbuDhabiSchools #BritishCurriculumUAE #Edvoura`,
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

    const regionKey = TEMPLATES[region] ? region : 'global';
    const regionTemplates = TEMPLATES[regionKey] || TEMPLATES.global;

    const responsePosts: Record<string, string> = {};

    if (platform === 'all') {
      Object.assign(responsePosts, regionTemplates);
      if (regionKey !== 'global') {
        Object.assign(responsePosts, TEMPLATES.global);
      }
    } else if (regionTemplates[platform]) {
      responsePosts[platform] = regionTemplates[platform];
    } else if (TEMPLATES.global[platform]) {
      responsePosts[platform] = TEMPLATES.global[platform];
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
