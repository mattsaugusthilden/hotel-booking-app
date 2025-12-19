import { en } from '../translations/en';
import { sv } from '../translations/sv';

const translations = {
  en,
  sv,
};

export const getTranslation = (language, key) => {
  return translations[language]?.[key] || key;
};

// Translate hotel description based on language
export const translateHotelDescription = (description, city, language) => {
  if (language === 'sv') {
    return `Lyxigt 5-stjärnigt hotell i hjärtat av ${city}, med världsklass bekvämligheter och exceptionell service. Upplev det bästa inom europeisk gästfrihet.`;
  }
  // Default to English (original description)
  return description;
};

export default translations;

