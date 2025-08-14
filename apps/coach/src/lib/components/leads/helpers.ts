export const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
};

export const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-green-700/20 border-green-700';
  if (score >= 60) return 'bg-yellow-700/20 border-yellow-700';
  return 'bg-red-700/20 border-red-700';
};
