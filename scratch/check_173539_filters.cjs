const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../src/services/bills_seed.json');
const bills = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

console.log('--- TESTING ALL POSITIONS FOR 173539 ---');

// Test June In-Store Sales Only (excluding delivery flagged bills)
let juneInStoreOnly = 0;
let juneInStoreOnlyNet = 0;

bills.forEach(b => {
  if (!b.date || !b.date.endsWith('-06-2026')) return;
  const isJenny = b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1;
  const isDelivery = b.delivery === true || b.delivery === 'true' || b.delivery === 1 || Number(b.delivery) === 1;
  const txType = b.transaction_type;
  const price = parseFloat(b.price || 0);
  const exchBal = parseFloat(b.exch_balance || 0);

  if (isJenny) return;
  if (txType === 'Void') return;

  if (!isDelivery) {
    if (txType === 'Sale') {
      juneInStoreOnly += price;
      juneInStoreOnlyNet += price;
    } else if (txType === 'Return') {
      juneInStoreOnlyNet -= price;
    } else if (txType === 'Exchange') {
      juneInStoreOnly += exchBal;
      juneInStoreOnlyNet += exchBal;
    }
  }
});

console.log('June In-Store Sales Only (No Jenny, No Delivery):', juneInStoreOnly);
console.log('June In-Store Sales Only Net (No Jenny, No Delivery):', juneInStoreOnlyNet);

// Test All-Time In-Store Sales Only (excluding delivery flagged bills)
let allTimeInStoreOnly = 0;
let allTimeInStoreOnlyNet = 0;

bills.forEach(b => {
  const isJenny = b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1;
  const isDelivery = b.delivery === true || b.delivery === 'true' || b.delivery === 1 || Number(b.delivery) === 1;
  const txType = b.transaction_type;
  const price = parseFloat(b.price || 0);
  const exchBal = parseFloat(b.exch_balance || 0);

  if (isJenny) return;
  if (txType === 'Void') return;

  if (!isDelivery) {
    if (txType === 'Sale') {
      allTimeInStoreOnly += price;
      allTimeInStoreOnlyNet += price;
    } else if (txType === 'Return') {
      allTimeInStoreOnlyNet -= price;
    } else if (txType === 'Exchange') {
      allTimeInStoreOnly += exchBal;
      allTimeInStoreOnlyNet += exchBal;
    }
  }
});

console.log('All-Time In-Store Sales Only (No Jenny, No Delivery):', allTimeInStoreOnly);
console.log('All-Time In-Store Sales Only Net (No Jenny, No Delivery):', allTimeInStoreOnlyNet);
