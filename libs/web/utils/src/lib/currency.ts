export const formatCurrency = (cents = 0, currency = 'USD', locale = 'en-US') => {
  const dollars = cents / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(dollars);
}
