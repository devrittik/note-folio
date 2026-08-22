// Astro/Vite loads local `.env` values into import.meta.env, while deployed Node
// runtimes commonly provide process.env. Server modules use this one reader so
// both environments behave consistently. This module must never be imported by
// browser code.
if (!import.meta.env.SSR) {
  throw new Error('Attempted to load server-only environment access in a browser bundle.');
}

const astroEnv = import.meta.env as Record<string, string | undefined>;

export function readServerEnv(name: string): string | undefined {
  const value = astroEnv[name] ?? process.env[name];
  const normalized = value?.trim();
  return normalized || undefined;
}

export function getContactEnvironmentStatus() {
  return {
    databaseConfigured: Boolean(readServerEnv('MONGODB_URI')),
    brevoConfigured: Boolean(
      readServerEnv('BREVO_API_KEY') &&
      (readServerEnv('LEAD_NOTIFY_EMAIL') || readServerEnv('ADMIN_EMAIL')) &&
      (readServerEnv('BREVO_SENDER_EMAIL') || readServerEnv('LEAD_NOTIFY_EMAIL') || readServerEnv('ADMIN_EMAIL'))
    )
  };
}
