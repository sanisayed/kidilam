const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../src/services/bills_seed.json');
const bills = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

console.log('--- FULL IN-STORE vs DELIVERY vs JENNY BREAKDOWN ---');

function analyzeDataset(label, filterFn) {
  const dataset = bills.filter(filterFn);
  
  let inStoreRev = 0;
  let inStoreCount = 0;

  let deliveryRev = 0;
  let deliveryCount = 0;

  let jennyRev = 0;
  let jennyCount = 0;

  let returnDeduction = 0;
  let returnCount = 0;

  let exchBalance = 0;
  let exchCount = 0;

  let voidCount = 0;

  dataset.forEach(b => {
    const isJenny = b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1;
    const isDelivery = b.delivery === true || b.delivery === 'true' || b.delivery === 1 || Number(b.delivery) === 1;
    const txType = b.transaction_type;
    const price = parseFloat(b.price || 0);
    const exchBal = parseFloat(b.exch_balance || 0);

    if (isJenny) {
      jennyCount++;
      jennyRev += (txType === 'Exchange' ? exchBal : price);
      return;
    }

    if (txType === 'Void') {
      voidCount++;
      return;
    }

    if (txType === 'Return') {
      returnCount++;
      returnDeduction += price;
      return;
    }

    if (txType === 'Exchange') {
      exchCount++;
      exchBalance += exchBal;
      if (isDelivery) {
        deliveryCount++;
        deliveryRev += exchBal;
      } else {
        inStoreCount++;
        inStoreRev += exchBal;
      }
      return;
    }

    if (txType === 'Sale') {
      if (isDelivery) {
        deliveryCount++;
        deliveryRev += price;
      } else {
        inStoreCount++;
        inStoreRev += price;
      }
    }
  });

  const netRevenue = inStoreRev + deliveryRev - returnDeduction;

  console.log(`\n=============================================================`);
  console.log(`📌 ${label} (Total Raw Records: ${dataset.length})`);
  console.log(`=============================================================`);
  console.log(`🏬 In-Store Sales:              AED ${inStoreRev.toFixed(2)} (${inStoreCount} Sales)`);
  console.log(`🚚 Delivery-Flagged Sales:       AED ${deliveryRev.toFixed(2)} (${deliveryCount} Sales)`);
  console.log(`-------------------------------------------------------------`);
  console.log(`(+) Total Sales Revenue:        AED ${(inStoreRev + deliveryRev).toFixed(2)} (${inStoreCount + deliveryCount} Sales)`);
  console.log(`(-) Return Deductions:          AED ${returnDeduction.toFixed(2)} (${returnCount} Returns)`);
  console.log(`=============================================================`);
  console.log(`💰 NET REVENUE TOTAL:            AED ${netRevenue.toFixed(2)} (${inStoreCount + deliveryCount} Sales Count)`);
  console.log(`⚡ Jenny Promoted (EXCLUDED):    AED ${jennyRev.toFixed(2)} (${jennyCount} Invoices)`);
  console.log(`=============================================================\n`);
}

analyzeDataset('JULY 2026', b => b.date && b.date.endsWith('-07-2026'));
analyzeDataset('ALL TIME', b => true);
