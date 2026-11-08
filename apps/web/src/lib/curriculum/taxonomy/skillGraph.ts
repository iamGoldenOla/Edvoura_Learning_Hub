import topicsRaw from './data/topics.json';
import depsRaw from './data/dependencies.json';

export interface TaxonomyTopic {
  id: string;
  type: string;
  subject: string;
  domain: string;
  name: string;
  description: string;
  ageRangeStart: number;
  ageRangeEnd: number;
  centrality?: number;
  evidence: string[];
  assessmentPrompt?: string;
  standards?: string[];
}

export interface TaxonomyDependency {
  topicId: string;
  prerequisiteId: string;
  strength: 'hard' | 'soft' | string;
  reason: string;
}

export interface TopicEdgeDetail {
  topic: TaxonomyTopic;
  strength: 'hard' | 'soft' | string;
  reason: string;
}

// In-memory indexed structures for O(1) graph traversal
const topicsList: TaxonomyTopic[] = (topicsRaw as any).topics || [];
const depsList: TaxonomyDependency[] = (depsRaw as any).dependencies || [];

const topicMap = new Map<string, TaxonomyTopic>();
const prereqMap = new Map<string, TaxonomyDependency[]>();
const nextMap = new Map<string, TaxonomyDependency[]>();
const subjectDomainsMap = new Map<string, Set<string>>();

// Build graph indices once
topicsList.forEach((topic) => {
  topicMap.set(topic.id, topic);

  if (!subjectDomainsMap.has(topic.subject)) {
    subjectDomainsMap.set(topic.subject, new Set<string>());
  }
  if (topic.domain) {
    subjectDomainsMap.get(topic.subject)!.add(topic.domain);
  }
});

depsList.forEach((dep) => {
  // Topic depends on prerequisite
  if (!prereqMap.has(dep.topicId)) {
    prereqMap.set(dep.topicId, []);
  }
  prereqMap.get(dep.topicId)!.push(dep);

  // Prerequisite unlocks topic
  if (!nextMap.has(dep.prerequisiteId)) {
    nextMap.set(dep.prerequisiteId, []);
  }
  nextMap.get(dep.prerequisiteId)!.push(dep);
});

/**
 * Get all subjects available in the taxonomy
 */
export function getAllSubjects(): string[] {
  return Array.from(subjectDomainsMap.keys()).sort();
}

/**
 * Get all domains for a given subject
 */
export function getDomainsForSubject(subject: string): string[] {
  const domains = subjectDomainsMap.get(subject);
  return domains ? Array.from(domains).sort() : [];
}

/**
 * Search and filter topics with multi-attribute query support
 */
export function getTopics(filters?: {
  subject?: string;
  domain?: string;
  age?: number;
  query?: string;
  limit?: number;
}): TaxonomyTopic[] {
  let results = topicsList;

  if (filters?.subject && filters.subject !== 'All') {
    results = results.filter((t) => t.subject.toLowerCase() === filters.subject!.toLowerCase());
  }

  if (filters?.domain && filters.domain !== 'All') {
    results = results.filter((t) => t.domain.toLowerCase() === filters.domain!.toLowerCase());
  }

  if (filters?.age) {
    const age = filters.age;
    results = results.filter((t) => t.ageRangeStart <= age && t.ageRangeEnd >= age);
  }

  if (filters?.query && filters.query.trim()) {
    const q = filters.query.trim().toLowerCase();
    results = results.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.domain.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.standards && t.standards.some((s) => s.toLowerCase().includes(q)))
    );
  }

  if (filters?.limit && filters.limit > 0) {
    return results.slice(0, filters.limit);
  }

  return results;
}

/**
 * Retrieve a specific topic by its unique ID
 */
export function getTopicById(id: string): TaxonomyTopic | undefined {
  return topicMap.get(id);
}

/**
 * Get prerequisites that must be mastered BEFORE learning this topic
 */
export function getTopicPrerequisites(topicId: string): TopicEdgeDetail[] {
  const edges = prereqMap.get(topicId) || [];
  return edges
    .map((edge) => {
      const topic = topicMap.get(edge.prerequisiteId);
      if (!topic) return null;
      return {
        topic,
        strength: edge.strength,
        reason: edge.reason,
      };
    })
    .filter(Boolean) as TopicEdgeDetail[];
}

/**
 * Get advanced topics UNLOCKED after mastering this topic
 */
export function getTopicNextSteps(topicId: string): TopicEdgeDetail[] {
  const edges = nextMap.get(topicId) || [];
  return edges
    .map((edge) => {
      const topic = topicMap.get(edge.topicId);
      if (!topic) return null;
      return {
        topic,
        strength: edge.strength,
        reason: edge.reason,
      };
    })
    .filter(Boolean) as TopicEdgeDetail[];
}

/**
 * Retrieve a full skill node with connected graph tree
 */
export function getTopicSkillNode(topicId: string) {
  const topic = getTopicById(topicId);
  if (!topic) return null;

  return {
    topic,
    prerequisites: getTopicPrerequisites(topicId),
    nextSteps: getTopicNextSteps(topicId),
  };
}

/**
 * Diagnostic assessment generator: returns a topic with verification criteria and question
 */
export function getTopicDiagnostic(topicId: string) {
  const topic = getTopicById(topicId);
  if (!topic) return null;

  return {
    topicId: topic.id,
    topicName: topic.name,
    subject: topic.subject,
    domain: topic.domain,
    ageBand: `${topic.ageRangeStart}-${topic.ageRangeEnd} years`,
    assessmentPrompt: topic.assessmentPrompt || `Can you demonstrate understanding of ${topic.name}?`,
    evidenceCriteria: topic.evidence || [],
    prerequisitesCount: (prereqMap.get(topicId) || []).length,
    unlockedCount: (nextMap.get(topicId) || []).length,
  };
}
