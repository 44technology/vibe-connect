import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
    'search': 'Search',
    'filter': 'Filter',
    'apply': 'Apply',
    'clear': 'Clear',
    'close': 'Close',
    
    // Settings
    'settings': 'Settings',
    'language': 'Language',
    'english': 'English',
    'spanish': 'Spanish',
    'account': 'Account',
    'privacy': 'Privacy & Security',
    'support': 'Support',
    'logout': 'Log Out',
    'deleteAccount': 'Delete Account',
    
    // Mentors
    'mentors': 'Mentors & Trainers',
    'mentorProfile': 'Mentor Profile',
    'viewClasses': 'View Classes',
    'message': 'Message',
    'about': 'About',
    'expertise': 'Areas of Expertise',
    'achievements': 'Achievements & Awards',
    'availableClasses': 'Available Classes',
    'noClasses': 'No classes available',
    'students': 'Students',
    'reviews': 'Reviews',
    'yearsExperience': 'Years Experience',
  },
  es: {
    // Common
    'loading': 'Cargando...',
    'error': 'Error',
    'success': 'Éxito',
    'cancel': 'Cancelar',
    'save': 'Guardar',
    'delete': 'Eliminar',
    'edit': 'Editar',
    'back': 'Atrás',
    'next': 'Siguiente',
    'previous': 'Anterior',
    'search': 'Buscar',
    'filter': 'Filtrar',
    'apply': 'Aplicar',
    'clear': 'Limpiar',
    'close': 'Cerrar',
    
    // Settings
    'settings': 'Configuración',
    'language': 'Idioma',
    'english': 'Inglés',
    'spanish': 'Español',
    'account': 'Cuenta',
    'privacy': 'Privacidad y Seguridad',
    'support': 'Soporte',
    'logout': 'Cerrar Sesión',
    'deleteAccount': 'Eliminar Cuenta',
    
    // Mentors
    'mentors': 'Mentores y Entrenadores',
    'mentorProfile': 'Perfil del Mentor',
    'viewClasses': 'Ver Clases',
    'message': 'Mensaje',
    'about': 'Acerca de',
    'expertise': 'Áreas de Especialización',
    'achievements': 'Logros y Premios',
    'availableClasses': 'Clases Disponibles',
    'noClasses': 'No hay clases disponibles',
    'students': 'Estudiantes',
    'reviews': 'Reseñas',
    'yearsExperience': 'Años de Experiencia',
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage or default to English
    const saved = localStorage.getItem('app_language');
    return (saved === 'es' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    // Save to localStorage when language changes
    localStorage.setItem('app_language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
