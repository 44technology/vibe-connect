import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

type Language = 'en' | 'es';

interface Translations {
  [key: string]: {
    en: string;
    es: string;
  };
}

const translations: Translations = {
  home: { en: 'Home', es: 'Inicio' },
  scanner: { en: 'Scanner', es: 'Escáner' },
  assistant: { en: 'AI Assistant', es: 'Asistente IA' },
  profile: { en: 'Profile', es: 'Perfil' },
  signIn: { en: 'Sign In', es: 'Iniciar Sesión' },
  signUp: { en: 'Sign Up', es: 'Registrarse' },
  signOut: { en: 'Sign Out', es: 'Cerrar Sesión' },
  email: { en: 'Email', es: 'Correo' },
  password: { en: 'Password', es: 'Contraseña' },
  fullName: { en: 'Full Name', es: 'Nombre Completo' },
  language: { en: 'Language', es: 'Idioma' },
  english: { en: 'English', es: 'Inglés' },
  spanish: { en: 'Spanish', es: 'Español' },
  welcome: { en: 'Welcome', es: 'Bienvenido' },
  recentReceipts: { en: 'Recent Receipts', es: 'Recibos Recientes' },
  scanReceipt: { en: 'Scan Receipt', es: 'Escanear Recibo' },
  uploadReceipt: { en: 'Upload Receipt', es: 'Subir Recibo' },
  priceComparison: { en: 'Price Comparison', es: 'Comparación de Precios' },
  shoppingHistory: { en: 'Shopping History', es: 'Historial de Compras' },
  recommendations: { en: 'Recommendations', es: 'Recomendaciones' },
  searchProduct: { en: 'Search Product', es: 'Buscar Producto' },
  takePhoto: { en: 'Take Photo', es: 'Tomar Foto' },
  whereToShop: { en: 'Where to Shop', es: 'Dónde Comprar' },
  bestPrices: { en: 'Best Prices', es: 'Mejores Precios' },
  yourPatterns: { en: 'Your Shopping Patterns', es: 'Tus Patrones de Compra' },
  save: { en: 'Save', es: 'Guardar' },
  cancel: { en: 'Cancel', es: 'Cancelar' },
  total: { en: 'Total', es: 'Total' },
  store: { en: 'Store', es: 'Tienda' },
  product: { en: 'Product', es: 'Producto' },
  price: { en: 'Price', es: 'Precio' },
  date: { en: 'Date', es: 'Fecha' },
  noReceipts: { en: 'No receipts yet', es: 'No hay recibos aún' },
  startScanning: { en: 'Start scanning receipts to track prices', es: 'Comienza a escanear recibos para rastrear precios' },
  aiRecommendation: { en: 'AI Recommendation', es: 'Recomendación IA' },
  loading: { en: 'Loading...', es: 'Cargando...' },
  error: { en: 'Error', es: 'Error' },
  success: { en: 'Success', es: 'Éxito' },
  updateProfile: { en: 'Update Profile', es: 'Actualizar Perfil' },
  camera: { en: 'Camera', es: 'Cámara' },
  gallery: { en: 'Gallery', es: 'Galería' },
  cameraPermission: { en: 'Camera permission required', es: 'Permiso de cámara requerido' },
  grantPermission: { en: 'Grant Permission', es: 'Conceder Permiso' },
  info: { en: 'Info', es: 'Información' },
  success: { en: 'Success', es: 'Éxito' },
  error: { en: 'Error', es: 'Error' },
  favorites: { en: 'Favorites', es: 'Favoritos' },
  priceAlerts: { en: 'Price Alerts', es: 'Alertas de Precio' },
  addToFavorites: { en: 'Add to Favorites', es: 'Agregar a Favoritos' },
  removeFromFavorites: { en: 'Remove from Favorites', es: 'Quitar de Favoritos' },
  priceDrop: { en: 'Price Drop!', es: '¡Bajada de Precio!' },
  lowestPrice: { en: 'Lowest Price', es: 'Precio Más Bajo' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const { profile, updateProfile } = useAuth();

  useEffect(() => {
    if (profile?.preferred_language) {
      setLanguageState(profile.preferred_language);
    }
  }, [profile]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    if (profile) {
      await updateProfile({ preferred_language: lang });
    }
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
