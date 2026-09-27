function shiftMonth(monthStr, delta) {
  const [y, m] = monthStr.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function sumByCategory(transactions, month) {
  const totals = {};
  transactions
    .filter((t) => t.type === 'expense' && t.date.slice(0, 7) === month)
    .forEach((t) => {
      totals[t.categoryId] = (totals[t.categoryId] || 0) + t.amount;
    });
  return totals;
}

export function generateTips({ transactions, categories, budgets, currentMonth, monthIncome, monthExpense }) {
  const tips = [];
  const thisMonthTotals = sumByCategory(transactions, currentMonth);
  const lastMonth = shiftMonth(currentMonth, -1);
  const lastMonthTotals = sumByCategory(transactions, lastMonth);

  const nameFor = (id) => categories.find((c) => c.id === id)?.name || 'that category';

  // Budget pressure
  budgets
    .filter((b) => b.month === currentMonth)
    .forEach((b) => {
      const spent = thisMonthTotals[b.categoryId] || 0;
      const pct = b.limit > 0 ? spent / b.limit : 0;
      if (pct >= 1) {
        tips.push({
          id: `budget-over-${b.categoryId}`,
          text: `You've gone over your ${nameFor(b.categoryId)} budget by ₦${(spent - b.limit).toLocaleString()} this month.`,
          impact: spent - b.limit,
          categoryId: b.categoryId,
        });
      } else if (pct >= 0.8) {
        tips.push({
          id: `budget-close-${b.categoryId}`,
          text: `You're at ${Math.round(pct * 100)}% of your ${nameFor(b.categoryId)} budget — ₦${(b.limit - spent).toLocaleString()} left this month.`,
          impact: spent * 0.3,
          categoryId: b.categoryId,
        });
      }
    });

  // Category growth vs last month
  Object.entries(thisMonthTotals).forEach(([categoryId, amount]) => {
    const prev = lastMonthTotals[categoryId] || 0;
    if (prev > 0) {
      const growth = (amount - prev) / prev;
      if (growth >= 0.25 && amount - prev >= 1000) {
        tips.push({
          id: `growth-${categoryId}`,
          text: `${nameFor(categoryId)} spending is up ${Math.round(growth * 100)}% vs last month (₦${prev.toLocaleString()} → ₦${amount.toLocaleString()}). A simple weekly cap could help.`,
          impact: amount - prev,
          categoryId,
        });
      }
    }
  });

  // Overall balance
  if (monthExpense > monthIncome && monthIncome > 0) {
    tips.push({
      id: 'balance-negative',
      text: `You've spent ₦${(monthExpense - monthIncome).toLocaleString()} more than you've logged in income this month. Worth reviewing your biggest categories below.`,
      impact: monthExpense - monthIncome,
      categoryId: null,
    });
  }

  // No budgets yet nudge
  const topEntry = Object.entries(thisMonthTotals).sort((a, b) => b[1] - a[1])[0];
  if (topEntry && !budgets.some((b) => b.month === currentMonth && b.categoryId === topEntry[0])) {
    tips.push({
      id: `set-budget-${topEntry[0]}`,
      text: `${nameFor(topEntry[0])} is your top expense this month at ₦${topEntry[1].toLocaleString()}. Try setting a monthly budget for it.`,
      impact: topEntry[1] * 0.2,
      categoryId: topEntry[0],
    });
  }

  return tips.sort((a, b) => b.impact - a.impact);
}
