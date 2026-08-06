const vercelProductionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (vercelProductionHost ? `https://${vercelProductionHost}` : "https://papawheels.vercel.app")
);
