const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../src/services/bills_seed.json');
const bills = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

console.log('--- SOLVING SCREENSHOT METRICS ---');
console.log('Target Metrics from Screenshot:');
console.log('  - TOTAL REVENUE: 173,539');
console.log('  - TRANSACTIONS: 128');
console.log('  - AVG ORDER VALUE: 1,356');
console.log('  - RETURNS: 10');
console.log('  - EXCHANGES: 14');
console.log('  - JENNY SALES: 32');

// Let's check filtered logic in Sales History Panel
// In Sales History Panel:
// selectedMonth defaults to 'LATEST' or 'ALL' or a specific month.
// Let's test all possible month selections, date range filters, and search queries!

const months = ['ALL', 'LATEST', '06-2026', '07-2026', '05-2026'];
const typeFilters = ['ALL', 'Sale', 'Exchange', 'Return'];

// Also let's check if there are other bills files or if `billsList` is filtered by default
months.forEach(m => {
  let filtered = bills.filter(b => {
    if (m === 'ALL') return true;
    if (!b.date) return false;
    return b.date.endsWith(`-${m}`);
  });

  // Calculate breakdown for this filtered set
  let sales = 0;
  let returns = 0;
  let exchanges = 0;
  let voids = 0;
  let jennys = 0;
  let totalRev = 0;
  let totalTx = 0;

  filtered.forEach(b => {
    const isJenny = b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1;
    const isDelivery = b.delivery === true || b.delivery === 'true' || b.delivery === 1 || Number(b.delivery) === 1;
    const txType = b.transaction_type;
    const price = parseFloat(b.price || 0);
    const exchBal = parseFloat(b.exch_balance || 0);

    if (txType === 'Void') voids++;
    else if (txType === 'Return') {
      returns++;
    } else if (txType === 'Exchange') {
      exchanges++;
    } else {
      sales++;
    }

    if (isJenny) {
      jennys++;
    }

    // Check old revenue formula (when Delivery was EXCLUDED and Returns were SUBTRACTED)
    if (!isJenny && !isDelivery && txType !== 'Void') {
      if (txType === 'Sale') {
        totalRev += price;
        totalTx += 1;
      } else if (txType === 'Return') {
        totalRev -= price;
      } else if (txType === 'Exchange') {
        totalRev += exchBal;
      }
    }
  });

  console.log(`\nMonth: ${m} -> Filtered Count: ${filtered.length}`);
  console.log(`  Sales: ${sales}, Returns: ${returns}, Exchanges: ${exchanges}, Jenny: ${jennys}`);
  console.log(`  Old Revenue (No Delivery, No Jenny, Sub Return): AED ${totalRev}`);
  console.log(`  Old Transactions Count: ${totalTx}`);
  console.log(`  Old AOV: ${totalTx > 0 ? Math.round(totalRev / totalTx) : 0}`);
});
