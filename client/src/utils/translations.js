import { en } from '../translations/en';
import { sv } from '../translations/sv';

const translations = {
  en,
  sv,
};

export const getTranslation = (language, key) => {
  return translations[language]?.[key] || key;
};

export default translations;

