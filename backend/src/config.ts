import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  // Gemini AI
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: 'gemini-2.5-flash',
  openFdaApiKey: process.env.OPENFDA_API_KEY || '',

  // Optional partner adapters. Expected paths are GET /stock and GET /prices;
  // server-side bearer keys are never sent to the browser.
  pharmacyStockProviderUrl: process.env.PHARMACY_STOCK_PROVIDER_URL || '',
  pharmacyStockProviderKey: process.env.PHARMACY_STOCK_PROVIDER_KEY || '',
  pricingProviderUrl: process.env.PRICING_PROVIDER_URL || '',
  pricingProviderKey: process.env.PRICING_PROVIDER_KEY || '',

  // Generic OIDC provider. Auth is intentionally unavailable until all values
  // are configured; no development identity or health data is fabricated.
  oidcIssuer: process.env.OIDC_ISSUER || '',
  oidcClientId: process.env.OIDC_CLIENT_ID || '',
  oidcClientSecret: process.env.OIDC_CLIENT_SECRET || '',
  oidcRedirectUri: process.env.OIDC_REDIRECT_URI || 'http://localhost:3001/api/auth/callback',

  // App
  appUrl: process.env.APP_URL || `http://localhost:3000`,

  // Cors
  corsOrigins: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.APP_URL || '',
  ].filter(Boolean),
};

export const isGeminiConfigured = (): boolean => {
  return config.geminiApiKey.length > 0 && config.geminiApiKey !== 'MY_GEMINI_API_KEY';
};
