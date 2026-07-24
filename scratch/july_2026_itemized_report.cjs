const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../src/services/bills_seed.json');
const bills = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

console.log('--- ITEMIZED JULY 2026 SALES REPORT ---');

const julyBills = bills.filter(b => {
  if (!b.date) return false;
  const parts = b.date.split('-');
  return parts[1] === '07' && parts[2] === '2026';
});

let includedSum = 0;
let jennyExcludedSum = 0;
let includedCount = 0;
let jennyCount = 0;

console.log(`Found ${julyBills.length} total invoices in July 2026:\n`);

julyBills.forEach((b, i) => {
  const isJenny = b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1;
  const isDelivery = b.delivery === true || b.delivery === 'true' || b.delivery === 1 || Number(b.delivery) === 1;
  const price = parseFloat(b.price || 0);
  const exchBal = parseFloat(b.exch_balance || 0);
  const txType = b.transaction_type;

  let val = price;
  if (txType === 'Exchange') val = exchBal;
  if (txType === 'Return') val = -price;

  let statusStr = 'INCLUDED IN JULY REVENUE';
  if (isJenny) {
    statusStr = 'EXCLUDED (Jenny Sale)';
    jennyExcludedSum += val;
    jennyCount++;
  } else if (txType === 'Void') {
    statusStr = 'EXCLUDED (Void)';
  } else {
    includedSum += val;
    includedCount++;
  }

  console.log(`${i+1}. Date: ${b.date} | Invoice #: ${b.bill_no || b.id} | Customer: ${b.customer_name || 'Walk-in'} | Type: ${txType} | Price: AED ${price} | Jenny: ${isJenny ? 'YES' : 'NO'} | Delivery: ${isDelivery ? 'YES' : 'NO'} => [${statusStr}]`);
});

console.log('\n=============================================================');
console.log(`TOTAL JULY 2026 NET REVENUE: AED ${includedSum.toFixed(2)} (${includedCount} Included Sales)`);
console.log(`TOTAL JENNY REVENUE EXCLUDED: AED ${jennyExcludedSum.toFixed(2)} (${jennyCount} Jenny Sales)`);
console.log('=============================================================');
