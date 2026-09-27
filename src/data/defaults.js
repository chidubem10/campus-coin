export const DEFAULT_INCOME_CATEGORIES = ['Allowance', 'Part-time Job', 'Scholarship', 'Gift', 'Other Income'];

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Hostel/Rent',
  'Academics',
  'Subscriptions',
  'Entertainment',
  'Miscellaneous',
];

export function makeDefaultCategories() {
  const income = DEFAULT_INCOME_CATEGORIES.map((name, i) => ({
    id: `inc-default-${i}`,
    name,
    type: 'income',
    isDefault: true,
  }));
  const expense = DEFAULT_EXPENSE_CATEGORIES.map((name, i) => ({
    id: `exp-default-${i}`,
    name,
    type: 'expense',
    isDefault: true,
  }));
  return [...income, ...expense];
}

export const ACADEMIC_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Postgraduate'];
