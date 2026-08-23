export function rankRelated<T>(
  current: T,
  candidates: T[],
  getTerms: (item: T) => string[],
  limit = 3
): T[] {
  const currentTerms = new Set(getTerms(current).map((term) => term.trim().toLowerCase()));

  return candidates
    .filter((candidate) => candidate !== current)
    .map((candidate, originalIndex) => {
      const overlap = getTerms(candidate).reduce(
        (score, term) => score + (currentTerms.has(term.trim().toLowerCase()) ? 1 : 0),
        0
      );
      return { candidate, overlap, originalIndex };
    })
    .sort((left, right) => right.overlap - left.overlap || left.originalIndex - right.originalIndex)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
