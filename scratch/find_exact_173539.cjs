const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '../src/services/bills_seed.json');
const bills = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

console.log('--- FINDING EXACT 173,539 SUM ---');

const TARGET = 173539;

// Let's check June 2026 bills
const juneBills = bills.filter(b => b.date && b.date.endsWith('-06-2026'));
console.log('June bills total count:', juneBills.length);

let juneSalesNet = 0;
let juneSalesGross = 0;
let juneNoJennyNoDelivery = 0;

juneBills.forEach(b => {
  const isJenny = b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1;
  const isDelivery = b.delivery === true || b.delivery === 'true' || b.delivery === 1 || Number(b.delivery) === 1;
  const txType = b.transaction_type;
  const price = parseFloat(b.price || 0);
  const exchBal = parseFloat(b.exch_balance || 0);

  if (txType === 'Void') return;

  if (!isJenny) {
    if (txType === 'Sale') {
      juneSalesGross += price;
      if (!isDelivery) juneNoJennyNoDelivery += price;
    } else if (txType === 'Return') {
      juneSalesNet -= price;
      if (!isDelivery) juneNoJennyNoDelivery -= price;
    } else if (txType === 'Exchange') {
      juneSalesGross += exchBal;
      juneSalesNet += exchBal;
      if (!isDelivery) juneNoJennyNoDelivery += exchBal;
    }
  }
});

console.log('June Gross Sales (No Jenny, Incl Delivery):', juneSalesGross);
console.log('June Net Sales (No Jenny, Incl Delivery):', juneSalesGross + juneSalesNet);
console.log('June No Jenny No Delivery:', juneNoJennyNoDelivery);

// Check subset sums or month combinations
const monthGroups = {};
bills.forEach(b => {
  if (!b.date) return;
  const parts = b.date.split('-');
  if (parts.length < 3) return;
  const m = `${parts[1]}-${parts[2]}`;
  if (!monthGroups[m]) monthGroups[m] = [];
  monthGroups[m].push(b);
});

Object.keys(monthGroups).forEach(m => {
  const list = monthGroups[m];
  let sumSale = 0;
  let sumNet = 0;
  let sumNoJenny = 0;
  let sumNoJennyWithDelivery = 0;

  list.forEach(b => {
    const isJenny = b.jenny === true || b.jenny === 'true' || b.jenny === 1 || Number(b.jenny) === 1;
    const isDelivery = b.delivery === true || b.delivery === 'true' || b.delivery === 1 || Number(b.delivery) === 1;
    const txType = b.transaction_type;
    const price = parseFloat(b.price || 0);
    const exchBal = parseFloat(b.exch_balance || 0);

    if (txType === 'Void') return;

    if (!isJenny) {
      if (txType === 'Sale') {
        sumNoJennyWithDelivery += price;
        if (!isDelivery) sumNoJenny += price;
      } else if (txType === 'Return') {
        sumNoJennyWithDelivery -= price;
        if (!isDelivery) sumNoJenny -= price;
      } else if (txType === 'Exchange') {
        sumNoJennyWithDelivery += exchBal;
        if (!isDelivery) sumNoJenny += exchBal;
      }
    }
  });

  console.log(`Month ${m} -> NoJennyWithDelivery Net: ${sumNoJennyWithDelivery}, NoJennyNoDelivery Net: ${sumNoJenny}`);
});
