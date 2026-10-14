export const SITE = {
  name: 'VizaExpress',
  url: 'https://vizaexpress.com',
  supportEmail: 'hello@vizaexpress.pl',
};

// Prices in PLN. Must match PRICES in the backend (routes/payments.js).
export const PLANS = [
  { id: 'express', price: 599 },
  { id: 'smart', price: 1299, popular: true },
  { id: 'concierge', price: 2499 },
];

export const PLAN_PRICES = Object.fromEntries(PLANS.map((p) => [p.id, p.price]));

export const DOCUMENT_TYPES = [
  { type: 'passport', required: true },
  { type: 'photo', required: true },
  { type: 'residence_proof', required: true },
  { type: 'insurance', required: true },
  { type: 'work_contract', required: false },
  { type: 'application_form', required: false },
];

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN', locale: 'en-GB' },
  { code: 'pl', label: 'Polski', short: 'PL', locale: 'pl-PL' },
  { code: 'uk', label: 'Українська', short: 'UK', locale: 'uk-UA' },
  { code: 'tr', label: 'Türkçe', short: 'TR', locale: 'tr-TR' },
  { code: 'ru', label: 'Русский', short: 'RU', locale: 'ru-RU' },
];
