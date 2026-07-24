const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../src/services/bills_seed.json');
const bills = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

console.log('--- SEARCHING FOR 173,539 IN BILLS DATABASE ---');

let var1_noDelivery_noJenny = 0;
let var1_noDelivery_noJenny_net = 0;
let var1_count = 0;
let var2_noDelivery_withJenny = 0;
let var3_withDelivery_noJenny = 0;

const monthsMap = {};

bills.forEach(b => {
  const isJenny = b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1;
  const isDelivery = b.delivery === true || b.delivery === 'true' || b.delivery === 1 || Number(b.delivery) === 1;
  const txType = b.transaction_type;
  const price = parseFloat(b.price || 0);
  const exchBal = parseFloat(b.exch_balance || 0);

  if (b.date) {
    const parts = b.date.split('-');
    if (parts.length === 3) {
      const monthKey = `${parts[1]}-${parts[2]}`;
      if (!monthsMap[monthKey]) monthsMap[monthKey] = { total: 0, noDeliveryNoJenny: 0, raw: 0 };
      monthsMap[monthKey].raw += price;
      if (!isJenny && !isDelivery && txType !== 'Void' && txType !== 'Return') {
        monthsMap[monthKey].noDeliveryNoJenny += price;
      }
    }
  }

  // Var 1: Exclude Delivery & Exclude Jenny
  if (!isJenny && !isDelivery && txType !== 'Void') {
    var1_count++;
    if (txType === 'Sale') {
      var1_noDelivery_noJenny += price;
      var1_noDelivery_noJenny_net += price;
    } else if (txType === 'Return') {
      var1_noDelivery_noJenny_net -= price;
    } else if (txType === 'Exchange') {
      var1_noDelivery_noJenny += Math.max(0, exchBal);
      var1_noDelivery_noJenny_net += exchBal;
    }
  }

  if (!isDelivery && txType !== 'Void') {
    if (txType === 'Sale') var2_noDelivery_withJenny += price;
  }

  if (!isJenny && txType !== 'Void') {
    if (txType === 'Sale') var3_withDelivery_noJenny += price;
  }
});

console.log('Var 1 (EXCLUDING Delivery AND EXCLUDING Jenny) Total Sales:', var1_noDelivery_noJenny);
console.log('Var 1 Net (No Delivery, No Jenny, Return Deducted, Exch Added):', var1_noDelivery_noJenny_net);
console.log('Var 2 (EXCLUDING Delivery, INCLUDING Jenny):', var2_noDelivery_withJenny);
console.log('Var 3 (INCLUDING Delivery, EXCLUDING Jenny):', var3_withDelivery_noJenny);

console.log('\n--- MONTHLY BREAKDOWNS IN SEED DATA ---');
console.dir(monthsMap, { depth: null });
