import assert from 'node:assert/strict';
import test from 'node:test';
import { getAllDrugs, getDrugById, getStockStatus, searchDrugs } from '../server/services/dataService';

test('drug catalog returns typed seeded profiles', () => {
  const drugs = getAllDrugs();
  assert.ok(drugs.length > 0);
  assert.ok(drugs.every((drug) => drug.id && drug.genericName && drug.ndc));
});

test('drug search matches generic, brand, and therapeutic class terms', () => {
  assert.ok(searchDrugs('atorvastatin').some((drug) => drug.genericName.toLowerCase().includes('atorvastatin')));
  assert.ok(searchDrugs('lipitor').some((drug) => drug.brandName.toLowerCase().includes('lipitor')));
  assert.ok(searchDrugs('cardio').length > 0);
});

test('stock status is returned for a known pharmacy and drug', () => {
  const drug = getAllDrugs()[0];
  const pharmacy = drug.pharmacies[0];
  const stock = getStockStatus(pharmacy.id, drug.id);
  assert.ok(stock);
  assert.equal(stock.pharmacyId, pharmacy.id);
  assert.equal(stock.drugId, drug.id);
  assert.equal(typeof stock.count, 'number');
});

test('unknown drug profile is not returned', () => {
  assert.equal(getDrugById('does-not-exist'), undefined);
});
