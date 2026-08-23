export function githubDisplayPath(url: string): string {
  try {
    const segments = new URL(url).pathname.split('/').filter(Boolean);
    return segments[0] ? `/${segments[0]}` : '/username';
  } catch {
    return '/username';
  }
}

export function linkedinDisplayPath(url: string): string {
  try {
    const segments = new URL(url).pathname.split('/').filter(Boolean);
    const profileIndex = segments.indexOf('in');
    if (profileIndex >= 0 && segments[profileIndex + 1]) {
      return `/in/${segments[profileIndex + 1]}`;
    }
    return segments[0] ? `/${segments.join('/')}` : '/in/username';
  } catch {
    return '/in/username';
  }
}
