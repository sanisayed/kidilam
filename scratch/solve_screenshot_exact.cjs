const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../src/services/bills_seed.json');
const bills = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

console.log('--- EXACT MATCHING FOR SCREENSHOT DATA ---');

// Screenshot exact values:
// Jenny Sales count: 32
// Returns count: 10
// Exchanges count: 14
// Transactions count: 128
// Total Revenue: 173,539

// Let's check how many total records would be in a dataset with 32 Jenny + 10 Returns + 14 Exchanges + 128 Sales:
// Total = 128 + 32 + 10 + 14 = 184 bills!

console.log('Target Dataset Specs:');
console.log('  Sales = 128');
console.log('  Jenny = 32');
console.log('  Returns = 10');
console.log('  Exchanges = 14');
console.log('  Total Bills = 184');

// Let's check if taking a slice of bills_seed.json or filtering by a date range produces 128 sales and 173,539 revenue!

for (let i = 0; i < bills.length; i++) {
  for (let j = i + 100; j <= bills.length; j++) {
    const slice = bills.slice(i, j);
    let s = 0, r = 0, e = 0, jCount = 0;
    let rev = 0;

    slice.forEach(b => {
      const isJenny = b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1;
      const isDelivery = b.delivery === true || b.delivery === 'true' || b.delivery === 1 || Number(b.delivery) === 1;
      const txType = b.transaction_type;
      const price = parseFloat(b.price || 0);
      const exchBal = parseFloat(b.exch_balance || 0);

      if (isJenny) jCount++;
      if (txType === 'Return') r++;
      if (txType === 'Exchange') e++;
      if (txType === 'Sale') s++;

      // Revenue (No Jenny, No Delivery)
      if (!isJenny && !isDelivery && txType !== 'Void') {
        if (txType === 'Sale') rev += price;
        else if (txType === 'Return') rev -= price;
        else if (txType === 'Exchange') rev += exchBal;
      }
    });

    if (r === 10 && e === 14 && jCount === 32) {
      console.log(`MATCH FOUND IN SLICE [${i}..${j}]! Sales: ${s}, Returns: ${r}, Exchanges: ${e}, Jenny: ${jCount}, Revenue: ${rev}`);
    } else if (Math.abs(rev - 173539) < 100) {
      console.log(`CLOSE REVENUE MATCH IN SLICE [${i}..${j}]! Sales: ${s}, Returns: ${r}, Exchanges: ${e}, Jenny: ${jCount}, Revenue: ${rev}`);
    }
  }
}
