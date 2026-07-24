const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../src/services/bills_seed.json');
const bills = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

console.log('--- DEEP SEARCH FOR 173539 ---');

const TARGET = 173539;

// Let's test combinations of:
// - months: ALL, '06-2026', '07-2026', '05-2026'
// - include/exclude Jenny
// - include/exclude Delivery
// - include/exclude Returns / subtract Returns / 0 Returns
// - include/exclude Exchanges / add exch_balance / 0 Exchanges / price vs exch_balance
// - payment_mode filters (Cash, Card, etc.)

const months = ['ALL', '06-2026', '07-2026', '05-2026'];
const bools = [true, false];

months.forEach(m => {
  bools.forEach(incJenny => {
    bools.forEach(incDelivery => {
      bools.forEach(subReturn => {
        bools.forEach(addExch => {
          let sum = 0;
          let count = 0;

          bills.forEach(b => {
            if (m !== 'ALL') {
              if (!b.date || !b.date.endsWith(`-${m}`)) return;
            }

            const isJenny = b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1;
            const isDelivery = b.delivery === true || b.delivery === 'true' || b.delivery === 1 || Number(b.delivery) === 1;
            const txType = b.transaction_type;
            const price = parseFloat(b.price || 0);
            const exchBal = parseFloat(b.exch_balance || 0);

            if (!incJenny && isJenny) return;
            if (!incDelivery && isDelivery) return;
            if (txType === 'Void') return;

            if (txType === 'Sale') {
              sum += price;
              count++;
            } else if (txType === 'Return') {
              if (subReturn) sum -= price;
            } else if (txType === 'Exchange') {
              if (addExch) sum += exchBal;
            }
          });

          if (Math.abs(sum - TARGET) < 100 || sum === TARGET) {
            console.log(`MATCH FOUND! Month: ${m}, Jenny: ${incJenny}, Delivery: ${incDelivery}, SubReturn: ${subReturn}, AddExch: ${addExch} => SUM: ${sum} (Count: ${count})`);
          }
        });
      });
    });
  });
});
