const PAST_EVENT_KEYWORDS = [
  'date of birth', 'birth date', 'birthday', 'dob',
  'date of admission', 'admission date', 'joining date', 'date of joining',
  'enrollment date', 'enrolment date', 'hire date', 'date of appointment',
  'date of issue', 'issue date', 'purchase date', 'order date',
  'invoice date', 'transaction date', 'payment date', 'registration date',
  'date of receipt', 'incident date', 'accident date', 'complaint date',
  'date of marriage', 'anniversary', 'date of death', 'date of discharge',
  'discharge date', 'operation date', 'diagnosis date', 'signature date',
  'first visit', 'visit date', 'test date', 'exam date',
  'date of passing', 'passing date', 'result date',
];

const normalize = (label) => (label || '').toLowerCase().trim();

export const isPastEventDateField = (label) => {
  const normalized = normalize(label);
  return PAST_EVENT_KEYWORDS.some((kw) => normalized.includes(kw));
};

export const todayISO = () => new Date().toISOString().split('T')[0];