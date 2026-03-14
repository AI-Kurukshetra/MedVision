type PublicSupabaseConfig = {
  anonKey: string;
  url: string;
};

function requireEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getPublicSupabaseConfig(): PublicSupabaseConfig {
  return {
    anonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    url: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  };
}

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}
