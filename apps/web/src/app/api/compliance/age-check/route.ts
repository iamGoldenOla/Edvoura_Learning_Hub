import { NextRequest, NextResponse } from 'next/server';

const REGIONAL_AGE_THRESHOLDS: Record<string, { threshold: number; framework: string }> = {
  US: { threshold: 13, framework: 'COPPA (Rule 16 CFR Part 312)' },
  UK: { threshold: 13, framework: 'UK GDPR & Age Appropriate Design Code' },
  NG: { threshold: 13, framework: 'NDPR / NITDA Guidelines' },
  IN: { threshold: 18, framework: 'Digital Personal Data Protection (DPDP) Act' },
  EG: { threshold: 13, framework: 'Egyptian Personal Data Protection Law (Law 151/2020)' },
  BR: { threshold: 12, framework: 'LGPD Minors Protection Rules' },
  AU: { threshold: 13, framework: 'Australian Privacy Principles (APP)' },
  GLOBAL: { threshold: 13, framework: 'International Minors Data Standard' },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { age, regionCode = 'NG' } = body;

    if (age === undefined || age === null) {
      return NextResponse.json({ error: 'Missing age parameter' }, { status: 400 });
    }

    const uppercaseRegion = String(regionCode).toUpperCase();
    const regionRule = REGIONAL_AGE_THRESHOLDS[uppercaseRegion] || REGIONAL_AGE_THRESHOLDS.GLOBAL;

    const numericAge = parseInt(String(age), 10);
    const requiresParentalConsent = numericAge < regionRule.threshold;

    return NextResponse.json({
      success: true,
      age: numericAge,
      regionCode: uppercaseRegion,
      requiresParentalConsent,
      thresholdAge: regionRule.threshold,
      legalFramework: regionRule.framework,
      disclaimer: 'ENGINEERING API ONLY: Formal legal sign-off from a qualified privacy attorney is required prior to public launch in each target jurisdiction.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Internal server error' }, { status: 500 });
  }
}
