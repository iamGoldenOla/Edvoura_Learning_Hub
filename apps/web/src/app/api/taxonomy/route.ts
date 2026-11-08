import { NextRequest, NextResponse } from 'next/server';
import {
  getAllSubjects,
  getDomainsForSubject,
  getTopics,
  getTopicSkillNode,
  getTopicDiagnostic,
} from '@/lib/curriculum/taxonomy/skillGraph';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // 1. Single Topic Deep-Dive / Skill Node Query
    const topicId = searchParams.get('topicId');
    if (topicId) {
      const node = getTopicSkillNode(topicId);
      if (!node) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: node,
      });
    }

    // 2. Diagnostic Assessment Prompt Query
    const diagnosticId = searchParams.get('diagnostic');
    if (diagnosticId) {
      const diagnostic = getTopicDiagnostic(diagnosticId);
      if (!diagnostic) {
        return NextResponse.json({ error: 'Diagnostic topic not found' }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: diagnostic,
      });
    }

    // 3. Subjects & Domains Catalog Query
    const listSubjects = searchParams.get('subjects');
    if (listSubjects === 'true') {
      const subjects = getAllSubjects();
      const catalog = subjects.map((subj) => ({
        subject: subj,
        domains: getDomainsForSubject(subj),
      }));
      return NextResponse.json({
        success: true,
        data: catalog,
      });
    }

    // 4. Filtered Topics Query
    const subject = searchParams.get('subject') || undefined;
    const domain = searchParams.get('domain') || undefined;
    const ageParam = searchParams.get('age');
    const age = ageParam ? parseInt(ageParam, 10) : undefined;
    const query = searchParams.get('q') || searchParams.get('query') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;

    const topics = getTopics({
      subject,
      domain,
      age: isNaN(age as number) ? undefined : age,
      query,
      limit,
    });

    return NextResponse.json({
      success: true,
      totalCount: topics.length,
      data: topics,
    });
  } catch (err: any) {
    console.error('[TAXONOMY API ERROR]', err);
    return NextResponse.json(
      { error: 'Failed to retrieve skill taxonomy data' },
      { status: 500 }
    );
  }
}
