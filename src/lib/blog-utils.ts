export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const autoCategorize = (tags: string[]): string => {
  const normalizedTags = tags.map(t => t.toLowerCase());
  
  if (normalizedTags.some(t => ['ai', 'machine learning', 'deep learning', 'nlp', 'llm', 'artificial intelligence'].includes(t))) {
    return 'Artificial Intelligence';
  }
  if (normalizedTags.some(t => ['react', 'vue', 'angular', 'css', 'html', 'frontend', 'ui', 'ux'].includes(t))) {
    return 'Frontend';
  }
  if (normalizedTags.some(t => ['node', 'python', 'django', 'express', 'backend', 'api', 'database', 'sql'].includes(t))) {
    return 'Backend';
  }
  if (normalizedTags.some(t => ['devops', 'docker', 'kubernetes', 'aws', 'cloud', 'ci/cd'].includes(t))) {
    return 'DevOps';
  }
  
  return 'Software Engineering'; // fallback
};

export const estimateReadTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};
