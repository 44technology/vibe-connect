import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    projects: 'Projects',
    employees: 'Team',
    schedule: 'Schedule',
    settings: 'Settings',
    archive: 'Archive',
    
    // Projects
    newProject: 'New Project',
    projectTitle: 'Project Title',
    description: 'Description',
    category: 'Category',
    startDate: 'Start Date',
    deadline: 'Deadline',
    assignTo: 'Assign To',
    progress: 'Progress',
    steps: 'Steps',
    addStep: 'Add Step',
    stepName: 'Step Name',
    addEmployee: 'Add Employee',
    
    // Status
    pending: 'Pending',
    in_progress: 'In Progress',
    finished: 'Finished',
    active: 'Active',
    archived: 'Archived',
    
    // Team
    name: 'Name',
    position: 'Position',
    email: 'Email',
    phone: 'Phone',
    
    // Schedule
    myTasks: 'My Tasks',
    assignedTasks: 'Assigned Tasks',
    dueToday: 'Due Today',
    upcoming: 'Upcoming',
    overdue: 'Overdue',
    
    // Actions
    add: 'Add',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    assign: 'Assign',
    update: 'Update',
    
    // User roles
    client: 'Client',
    manager: 'Manager',
    
    // Categories
    residential: 'Residential',
    commercial: 'Commercial',
    renovation: 'Renovation',
    infrastructure: 'Infrastructure',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    noData: 'No data available',
    
    // Language
    language: 'Language',
    english: 'English',
    spanish: 'Spanish',
  },
  es: {
    // Navigation
    projects: 'Proyectos',
    employees: 'Equipo',
    schedule: 'Horario',
    settings: 'Configuración',
    archive: 'Archivo',
    
    // Projects
    newProject: 'Nuevo Proyecto',
    projectTitle: 'Título del Proyecto',
    description: 'Descripción',
    category: 'Categoría',
    startDate: 'Fecha de Inicio',
    deadline: 'Fecha Límite',
    assignTo: 'Asignar a',
    progress: 'Progreso',
    steps: 'Pasos',
    addStep: 'Agregar Paso',
    stepName: 'Nombre del Paso',
    addEmployee: 'Agregar Empleado',
    
    // Status
    pending: 'Pendiente',
    in_progress: 'En Progreso',
    finished: 'Terminado',
    active: 'Activo',
    archived: 'Archivado',
    
    // Team
    name: 'Nombre',
    position: 'Posición',
    email: 'Correo',
    phone: 'Teléfono',
    
    // Schedule
    myTasks: 'Mis Tareas',
    assignedTasks: 'Tareas Asignadas',
    dueToday: 'Vence Hoy',
    upcoming: 'Próximas',
    overdue: 'Vencidas',
    
    // Actions
    add: 'Agregar',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    assign: 'Asignar',
    update: 'Actualizar',
    
    // User roles
    client: 'Cliente',
    manager: 'Gerente',
    
    // Categories
    residential: 'Residencial',
    commercial: 'Comercial',
    renovation: 'Renovación',
    infrastructure: 'Infraestructura',
    
    // Common
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    noData: 'No hay datos disponibles',
    
    // Language
    language: 'Idioma',
    english: 'Inglés',
    spanish: 'Español',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
        setLanguage(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    }
  };

  const handleSetLanguage = async (lang: Language) => {
    setLanguage(lang);
    try {
      await AsyncStorage.setItem('language', lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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