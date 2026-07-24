const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../src/services/bills_seed.json');

if (!fs.existsSync(seedPath)) {
  console.log('Seed file not found at:', seedPath);
  process.exit(1);
}

const bills = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

console.log('--- REVENUE & TRANSACTION COUNT AUDIT ---');
console.log('Total Raw Transactions in Database:', bills.length);

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

bills.forEach((b) => {
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
    // 0 on transaction count!
    totalReturnDeductions += price;
  } else if (txType === 'Exchange') {
    exchangeCount++;
    // 0 on transaction count!
    totalExchangeBalanceAdded += exchBal;
    if (isDelivery) deliverySalesRevenue += exchBal;
  }
});

const netRevenue = grossSalesRevenue + totalExchangeBalanceAdded - totalReturnDeductions;
const avgOrderValue = totalTransactionsCount > 0 ? Math.round(netRevenue / totalTransactionsCount) : 0;

console.log('\n--- TRANSACTION COUNT AUDIT ---');
console.log('Gross Sales Count (Add +1):', saleCount);
console.log('Exchange Count (Add 0):    ', exchangeCount);
console.log('Return Count (Add 0):      ', returnCount);
console.log('Void Count (Add 0):        ', voidCount);
console.log('Jenny Promoted Count (0):  ', jennyCount);
console.log('-------------------------------------------------------------');
console.log('TOTAL TRANSACTIONS COUNT:  ', totalTransactionsCount);

console.log('\n--- REVENUE FORMULA ---');
console.log('  (+) Gross Sales Revenue (incl. Delivery Sales): AED', grossSalesRevenue.toFixed(2));
console.log('  (+) Total Exchange Balance Added:              AED', totalExchangeBalanceAdded.toFixed(2));
console.log('  (-) Total Return Deductions:                  AED', totalReturnDeductions.toFixed(2));
console.log('  -------------------------------------------------------------');
console.log('  (=) NET REVENUE:                              AED', netRevenue.toFixed(2));
console.log('  (=) AVERAGE ORDER VALUE (AOV):                AED', avgOrderValue.toFixed(2));

console.log('\n✅ Audit Complete: Exchange & Return count = 0 on Transaction Count!');
