const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../src/services/bills_seed.json');

if (!fs.existsSync(seedPath)) {
  console.log('Seed file not found at:', seedPath);
  process.exit(1);
}

const bills = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

console.log('--- JULY 2026 AUDIT & REPORT ---');

// Filter July bills (date format: DD-07-2026 or month === '07-2026' or date.includes('-07-2026'))
const julyBills = bills.filter(b => {
  if (!b.date) return false;
  const parts = b.date.split('-');
  return parts[1] === '07' && parts[2] === '2026';
});

console.log('Total July 2026 Raw Transactions in Database:', julyBills.length);

let grossSalesRevenue = 0;
let deliverySalesRevenue = 0;
let totalReturnDeductions = 0;
let totalExchangeBalanceAdded = 0;
let jennyRevenueExcluded = 0;

let saleCount = 0;
let exchangeCount = 0;
let returnCount = 0;
let voidCount = 0;
let jennyCount = 0;

let totalTransactionsCount = 0;

julyBills.forEach((b) => {
  const isJenny = b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1;
  const isDelivery = b.delivery === true || b.delivery === 'true' || b.delivery === 1 || Number(b.delivery) === 1;
  const txType = b.transaction_type;
  const price = parseFloat(b.price || 0);
  const exchBal = parseFloat(b.exch_balance || 0);

  if (isJenny) {
    jennyCount++;
    jennyRevenueExcluded += (txType === 'Exchange' ? exchBal : (txType === 'Return' ? -price : price));
    return; // Exclude Jenny from Net Revenue & Transaction Count
  }

  if (txType === 'Void') {
    voidCount++;
    return; // 0 on transaction count
  }

  if (txType === 'Sale') {
    saleCount++;
    totalTransactionsCount += 1; // +1 ONLY for Sale transactions!
    grossSalesRevenue += price;
    if (isDelivery) deliverySalesRevenue += price;
  } else if (txType === 'Return') {
    returnCount++;
    totalReturnDeductions += price;
  } else if (txType === 'Exchange') {
    exchangeCount++;
    totalExchangeBalanceAdded += exchBal;
    if (isDelivery) deliverySalesRevenue += exchBal;
  }
});

const netRevenue = grossSalesRevenue + totalExchangeBalanceAdded - totalReturnDeductions;
const avgOrderValue = totalTransactionsCount > 0 ? Math.round(netRevenue / totalTransactionsCount) : 0;

console.log('\n--- JULY 2026 TRANSACTION COUNT BREAKDOWN ---');
console.log('July Gross Sales Count (Add +1):', saleCount);
console.log('July Exchange Count (Add 0):    ', exchangeCount);
console.log('July Return Count (Add 0):      ', returnCount);
console.log('July Void Count (Add 0):        ', voidCount);
console.log('July Jenny Promoted Count (0):  ', jennyCount);
console.log('-------------------------------------------------------------');
console.log('JULY TOTAL TRANSACTIONS COUNT:  ', totalTransactionsCount);

console.log('\n--- JULY 2026 REVENUE FORMULA ---');
console.log('  (+) Gross Sales Revenue (incl. Delivery Sales): AED', grossSalesRevenue.toFixed(2));
console.log('  (+) Total Exchange Balance Added:              AED', totalExchangeBalanceAdded.toFixed(2));
console.log('  (-) Total Return Deductions:                  AED', totalReturnDeductions.toFixed(2));
console.log('  -------------------------------------------------------------');
console.log('  (=) JULY NET REVENUE:                         AED', netRevenue.toFixed(2));
console.log('  (=) JULY AVERAGE ORDER VALUE (AOV):           AED', avgOrderValue.toFixed(2));

console.log('\n--- JULY DETAILED AUDIT NOTES ---');
console.log('  • July Delivery-Flagged Sales Included:        AED', deliverySalesRevenue.toFixed(2));
console.log('  • July Jenny Promoted Revenue Excluded:        AED', jennyRevenueExcluded.toFixed(2));
