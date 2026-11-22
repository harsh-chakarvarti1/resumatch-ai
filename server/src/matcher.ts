const STOP_WORDS = new Set([
  'and', 'the', 'for', 'with', 'you', 'that', 'are', 'this', 'from', 'will',
  'have', 'your', 'our', 'work', 'team', 'experience', 'years', 'skills',
  'ability', 'strong', 'knowledge', 'using', 'role', 'candidate', 'must',
  'including', 'plus', 'preferred', 'required', 'requirements', 'responsibilities',
  'about', 'who', 'what', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again',
  'further', 'then', 'once', 'here', 'there', 'their', 'they', 'them', 'these',
  'those', 'being', 'been', 'having', 'does', 'did', 'doing', 'would', 'should',
  'could', 'ought', 'build', 'building', 'develop', 'developing', 'software',
  'engineering', 'engineer', 'developer', 'application', 'applications', 'system',
  'systems', 'web', 'data', 'code', 'design', 'solutions', 'support', 'working'
]);

const TECH_MULTI_WORDS = [
  'react.js', 'next.js', 'node.js', 'vue.js', 'tailwind css', 'rest api',
  'graphql', 'ci/cd', 'machine learning', 'system design', 'unit testing',
  'aws', 'gcp', 'azure', 'docker', 'kubernetes', 'postgresql', 'mongodb',
  'typescript', 'javascript', 'python', 'java', 'go', 'rust', 'hono', 'express'
];

export interface MatchResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}

function normalizeAndExtract(text: string): Set<string> {
  const lower = text.toLowerCase();
  const extracted = new Set<string>();

  for (const term of TECH_MULTI_WORDS) {
    if (lower.includes(term)) {
      extracted.add(term);
    }
  }

  const tokens = lower.match(/[a-z0-9+#.]{2,}/g) || [];
  for (const token of tokens) {
    const clean = token.replace(/^\.+|\.+$/g, '');
    if (clean.length >= 2 && !STOP_WORDS.has(clean) && !/^\d+$/.test(clean)) {
      extracted.add(clean);
    }
  }

  return extracted;
}

export function analyzeResume(resumeText: string, jobDescription: string): MatchResult {
  const resumeTokens = normalizeAndExtract(resumeText);
  const jdTokens = normalizeAndExtract(jobDescription);

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  jdTokens.forEach((keyword) => {
    if (resumeTokens.has(keyword)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });

  const sortByTechPriority = (a: string, b: string) => {
    const aTech = TECH_MULTI_WORDS.includes(a) ? 0 : 1;
    const bTech = TECH_MULTI_WORDS.includes(b) ? 0 : 1;
    return aTech - bTech;
  };

  matchedKeywords.sort(sortByTechPriority);
  missingKeywords.sort(sortByTechPriority);

  const total = jdTokens.size;
  const score = total === 0 ? 0 : Math.min(100, Math.round((matchedKeywords.length / total) * 100));

  return {
    score,
    matchedKeywords: matchedKeywords.slice(0, 25),
    missingKeywords: missingKeywords.slice(0, 20),
  };
}
