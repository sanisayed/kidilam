const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../src/services/bills_seed.json');
const bills = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

console.log('--- ALL MONTHS & PANELS REVENUE BREAKDOWN ---');

function getRevenueForMonth(monthFilter) {
  let salesSum = 0;
  let exchSum = 0;
  let returnSum = 0;
  let salesCount = 0;
  let jennyCount = 0;
  let deliveryCount = 0;

  bills.forEach(b => {
    if (monthFilter !== 'ALL') {
      if (!b.date || !b.date.endsWith(`-${monthFilter}`)) return;
    }

    const isJenny = b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1;
    const isDelivery = b.delivery === true || b.delivery === 'true' || b.delivery === 1 || Number(b.delivery) === 1;
    const txType = b.transaction_type;
    const price = parseFloat(b.price || 0);
    const exchBal = parseFloat(b.exch_balance || 0);

    if (isJenny) {
      jennyCount++;
      return; // Exclude Jenny
    }

    if (txType === 'Void') return;

    if (isDelivery) deliveryCount++;

    if (txType === 'Sale') {
      salesCount++;
      salesSum += price;
    } else if (txType === 'Return') {
      returnSum += price;
    } else if (txType === 'Exchange') {
      exchSum += exchBal;
    }
  });

  const netRevenue = salesSum + exchSum - returnSum;
  return { monthFilter, salesCount, salesSum, exchSum, returnSum, netRevenue, jennyCount, deliveryCount };
}

console.log('ALL TIME:', getRevenueForMonth('ALL'));
console.log('JULY 2026 (07-2026):', getRevenueForMonth('07-2026'));
console.log('JUNE 2026 (06-2026):', getRevenueForMonth('06-2026'));
console.log('MAY 2026 (05-2026):', getRevenueForMonth('05-2026'));
