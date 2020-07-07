const EURO_NUMBER_FORMAT = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2
});

export const formatEuros = (value: number) => EURO_NUMBER_FORMAT.format(value);
