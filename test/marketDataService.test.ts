import assert from 'node:assert/strict';
import test from 'node:test';
import { getAllDrugs } from '../server/services/dataService';
import { fetchPartnerPrices, verifyStock } from '../server/services/marketDataService';

test('unconfigured stock adapter returns explicitly labeled seeded fallback', async () => {
  const drug = getAllDrugs()[0];
  const result = await verifyStock(drug.pharmacies[0], drug.id);
  assert.equal(result.source, 'seeded');
  assert.equal(result.drugId, drug.id);
  assert.ok(result.fetchedAt.length > 0);
});

test('unconfigured pricing adapter does not claim partner data', async () => {
  const result = await fetchPartnerPrices(getAllDrugs()[0].id);
  assert.equal(result.source, 'seeded');
  assert.deepEqual(result.prices, []);
});
