export interface NdcLookupResult {
  productNdc: string;
  brandName: string;
  genericName: string;
  labelerName: string;
  dosageForm: string;
  route: string[];
  marketingCategory: string;
  source: 'openFDA NDC Directory';
  sourceUpdatedAt: string;
  disclaimer: string;
}

interface OpenFdaNdcProduct {
  product_ndc?: string;
  brand_name?: string;
  generic_name?: string;
  labeler_name?: string;
  dosage_form?: string;
  route?: string[];
  marketing_category?: string;
  listing_expiration_date?: string;
}

interface OpenFdaResponse {
  results?: OpenFdaNdcProduct[];
}

const NDC_API_URL = 'https://api.fda.gov/drug/ndc.json';
const REQUEST_TIMEOUT_MS = 8_000;

/**
 * Looks up an NDC product through the FDA's public NDC Directory. This source
 * describes submitted drug listings; it is not a substitute for an Orange Book
 * therapeutic-equivalence determination or clinical advice.
 */
export async function lookupNdc(ndc: string, apiKey = ''): Promise<NdcLookupResult | null> {
  const normalizedNdc = ndc.replace(/[^0-9-]/g, '');
  const query = new URLSearchParams({
    search: `product_ndc:"${normalizedNdc}"`,
    limit: '1',
  });
  if (apiKey) query.set('api_key', apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${NDC_API_URL}?${query}`, { signal: controller.signal });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`openFDA request failed with ${response.status}`);

    const payload = (await response.json()) as OpenFdaResponse;
    const product = payload.results?.[0];
    if (!product?.product_ndc) return null;

    return {
      productNdc: product.product_ndc,
      brandName: product.brand_name || '',
      genericName: product.generic_name || '',
      labelerName: product.labeler_name || '',
      dosageForm: product.dosage_form || '',
      route: product.route || [],
      marketingCategory: product.marketing_category || '',
      source: 'openFDA NDC Directory',
      sourceUpdatedAt: product.listing_expiration_date || '',
      disclaimer: 'NDC Directory records are submitted by labelers and do not establish FDA therapeutic equivalence or provide medical advice.',
    };
  } finally {
    clearTimeout(timeout);
  }
}
