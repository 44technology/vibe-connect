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
    
    // Delete Modal
    deleteConfirmTitle: 'Are you sure you want to delete?',
    deleteConfirmMessage: 'Are you sure you want to delete this item? This action cannot be undone.',
    deleteConfirmStep: 'Are you sure you want to delete this step? This action cannot be undone.',
    deleteConfirmDailyLog: 'Are you sure you want to delete this daily record? This action cannot be undone.',
    deleteConfirmSchedule: 'Are you sure you want to delete this schedule? This action cannot be undone.',
    deleteConfirmClient: 'Are you sure you want to delete this client? This action cannot be undone.',
    deleteConfirmItem: 'Are you sure you want to delete this item? This action cannot be undone.',
    deleteButton: 'Delete',
    cancelButton: 'Cancel',
    
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
    
    // Common UI
    select: 'Select',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    close: 'Close',
    submit: 'Submit',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    
    // Projects
    createProject: 'Create Project',
    projectAddress: 'Project Address',
    totalBudget: 'Total Budget',
    client: 'Client',
    selectClient: 'Select Client',
    active: 'Active',
    completed: 'Completed',
    noProjects: 'No projects available',
    createNewProject: 'Create New Project',
    projectCreated: 'Project created successfully',
    projectDeleted: 'Project deleted successfully',
    deleteProject: 'Delete Project',
    areYouSure: 'Are you sure?',
    
    // HR
    hrDashboard: 'HR Dashboard',
    weeklyTimeClock: 'Weekly Time Clock Summary',
    approachingOvertime: 'Approaching Overtime (Clocked In)',
    requiredApprovals: 'Required Approvals',
    overtimeByDepartment: 'Overtime by Department',
    week: 'Week',
    currentWeek: 'Current Week',
    selectWeek: 'Select Week',
    
    // Clients
    clients: 'Clients',
    addClient: 'Add Client',
    clientName: 'Client Name',
    clientEmail: 'Client Email',
    clientPhone: 'Client Phone',
    clientAdded: 'Client added successfully',
    clientDeleted: 'Client deleted successfully',
    deleteClient: 'Delete Client',
    batchDelete: 'Batch Delete',
    selectAll: 'Select All',
    clearSelection: 'Clear Selection',
    exportCSV: 'Export CSV',
    
    // Reports
    reports: 'Reports',
    projectCompletionAnalytics: 'Project completion analytics',
    selectYear: 'Select Year',
    completedProjects: 'Completed Projects',
    totalRevenue: 'Total Revenue',
    grossProfit: 'Gross Profit',
    monthlyBreakdown: 'Monthly Breakdown',
    loadingReports: 'Loading reports...',
    
    // Settings
    appSettings: 'App Settings',
    notifications: 'Notifications',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    logout: 'Logout',
    about: 'About',
    version: 'Version',
    
    // Project Approval
    projectApproval: 'Project Approval',
    pendingApproval: 'Pending Approval',
    materialRequests: 'Material Requests',
    changeOrders: 'Change Orders',
    approve: 'Approve',
    reject: 'Reject',
    rejectionReason: 'Rejection Reason',
    enterRejectionReason: 'Enter rejection reason',
    approveItem: 'Approve Item',
    rejectItem: 'Reject Item',
    batchApprove: 'Batch Approve',
    batchReject: 'Batch Reject',
    
    // Change Order
    changeOrder: 'Change Order',
    newChangeOrderRequest: 'New Change Order Request',
    requestedDate: 'Requested Date',
    addWorkTitle: 'Add work title',
    workTitle: 'Work Title',
    
    // Daily Logs
    dailyLogs: 'Daily Logs',
    addDailyLog: 'Add Daily Log',
    editDailyLog: 'Edit Daily Log',
    date: 'Date',
    workCompleted: 'Work Completed',
    materialsUsed: 'Materials Used',
    equipmentUsed: 'Equipment Used',
    issuesEncountered: 'Issues Encountered',
    notes: 'Notes',
    weather: 'Weather',
    condition: 'Condition',
    logAdded: 'Daily log added successfully',
    logUpdated: 'Daily log updated successfully',
    logDeleted: 'Daily log deleted successfully',
    
    // Time Clock
    timeClock: 'Time Clock',
    clockIn: 'Clock In',
    clockOut: 'Clock Out',
    totalHours: 'Total Hours',
    weeklySummary: 'Weekly Summary',
    
    // Team
    team: 'Team',
    ourTeam: 'Our Team',
    subcontractors: 'Subcontractors',
    vendors: 'Vendors',
    
    // Schedule
    schedule: 'Schedule',
    addSchedule: 'Add Schedule',
    projectSchedule: 'Project Schedule',
    
    // Documents
    documents: 'Documents',
    uploadDocument: 'Upload Document',
    
    // Materials
    materials: 'Materials',
    materialRequest: 'Material Request',
    requestMaterials: 'Request Materials',
    
    // Status messages
    loading: 'Loading...',
    noDataAvailable: 'No data available',
    errorOccurred: 'An error occurred',
    success: 'Success',
    error: 'Error',
    saved: 'Saved',
    deleted: 'Deleted',
    updated: 'Updated',
    
    // Validation
    required: 'Required',
    invalidEmail: 'Invalid email',
    invalidPhone: 'Invalid phone number',
    
    // Access
    accessDenied: 'Access Denied',
    noAccess: 'You do not have access to this page',
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
    
    // Delete Modal
    deleteConfirmTitle: '¿Estás seguro de que quieres eliminar?',
    deleteConfirmMessage: '¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.',
    deleteConfirmStep: '¿Estás seguro de que quieres eliminar este paso? Esta acción no se puede deshacer.',
    deleteConfirmDailyLog: '¿Estás seguro de que quieres eliminar este registro diario? Esta acción no se puede deshacer.',
    deleteConfirmSchedule: '¿Estás seguro de que quieres eliminar este horario? Esta acción no se puede deshacer.',
    deleteConfirmClient: '¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer.',
    deleteConfirmItem: '¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.',
    deleteButton: 'Eliminar',
    cancelButton: 'Cancelar',
    
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
    
    // Common UI
    select: 'Seleccionar',
    search: 'Buscar',
    filter: 'Filtrar',
    export: 'Exportar',
    close: 'Cerrar',
    submit: 'Enviar',
    confirm: 'Confirmar',
    yes: 'Sí',
    no: 'No',
    ok: 'OK',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    
    // Projects
    createProject: 'Crear Proyecto',
    projectAddress: 'Dirección del Proyecto',
    totalBudget: 'Presupuesto Total',
    client: 'Cliente',
    selectClient: 'Seleccionar Cliente',
    active: 'Activo',
    completed: 'Completado',
    noProjects: 'No hay proyectos disponibles',
    createNewProject: 'Crear Nuevo Proyecto',
    projectCreated: 'Proyecto creado exitosamente',
    projectDeleted: 'Proyecto eliminado exitosamente',
    deleteProject: 'Eliminar Proyecto',
    areYouSure: '¿Estás seguro?',
    
    // HR
    hrDashboard: 'Panel de HR',
    weeklyTimeClock: 'Resumen Semanal de Reloj',
    approachingOvertime: 'Acercándose a Horas Extra (Marcado)',
    requiredApprovals: 'Aprobaciones Requeridas',
    overtimeByDepartment: 'Horas Extra por Departamento',
    week: 'Semana',
    currentWeek: 'Semana Actual',
    selectWeek: 'Seleccionar Semana',
    
    // Clients
    clients: 'Clientes',
    addClient: 'Agregar Cliente',
    clientName: 'Nombre del Cliente',
    clientEmail: 'Correo del Cliente',
    clientPhone: 'Teléfono del Cliente',
    clientAdded: 'Cliente agregado exitosamente',
    clientDeleted: 'Cliente eliminado exitosamente',
    deleteClient: 'Eliminar Cliente',
    batchDelete: 'Eliminar en Lote',
    selectAll: 'Seleccionar Todo',
    clearSelection: 'Limpiar Selección',
    exportCSV: 'Exportar CSV',
    
    // Reports
    reports: 'Reportes',
    projectCompletionAnalytics: 'Analítica de finalización de proyectos',
    selectYear: 'Seleccionar Año',
    completedProjects: 'Proyectos Completados',
    totalRevenue: 'Ingresos Totales',
    grossProfit: 'Ganancia Bruta',
    monthlyBreakdown: 'Desglose Mensual',
    loadingReports: 'Cargando reportes...',
    
    // Settings
    appSettings: 'Configuración de la App',
    notifications: 'Notificaciones',
    privacyPolicy: 'Política de Privacidad',
    termsOfService: 'Términos de Servicio',
    logout: 'Cerrar Sesión',
    about: 'Acerca de',
    version: 'Versión',
    
    // Project Approval
    projectApproval: 'Aprobación de Proyectos',
    pendingApproval: 'Aprobación Pendiente',
    materialRequests: 'Solicitudes de Materiales',
    changeOrders: 'Órdenes de Cambio',
    approve: 'Aprobar',
    reject: 'Rechazar',
    rejectionReason: 'Razón del Rechazo',
    enterRejectionReason: 'Ingresar razón del rechazo',
    approveItem: 'Aprobar Elemento',
    rejectItem: 'Rechazar Elemento',
    batchApprove: 'Aprobar en Lote',
    batchReject: 'Rechazar en Lote',
    
    // Change Order
    changeOrder: 'Orden de Cambio',
    newChangeOrderRequest: 'Nueva Solicitud de Orden de Cambio',
    requestedDate: 'Fecha Solicitada',
    addWorkTitle: 'Agregar título de trabajo',
    workTitle: 'Título del Trabajo',
    
    // Daily Logs
    dailyLogs: 'Registros Diarios',
    addDailyLog: 'Agregar Registro Diario',
    editDailyLog: 'Editar Registro Diario',
    date: 'Fecha',
    workCompleted: 'Trabajo Completado',
    materialsUsed: 'Materiales Usados',
    equipmentUsed: 'Equipo Usado',
    issuesEncountered: 'Problemas Encontrados',
    notes: 'Notas',
    weather: 'Clima',
    condition: 'Condición',
    logAdded: 'Registro diario agregado exitosamente',
    logUpdated: 'Registro diario actualizado exitosamente',
    logDeleted: 'Registro diario eliminado exitosamente',
    
    // Time Clock
    timeClock: 'Reloj de Tiempo',
    clockIn: 'Marcar Entrada',
    clockOut: 'Marcar Salida',
    totalHours: 'Horas Totales',
    weeklySummary: 'Resumen Semanal',
    
    // Team
    team: 'Equipo',
    ourTeam: 'Nuestro Equipo',
    subcontractors: 'Subcontratistas',
    vendors: 'Proveedores',
    
    // Schedule
    schedule: 'Horario',
    addSchedule: 'Agregar Horario',
    projectSchedule: 'Horario del Proyecto',
    
    // Documents
    documents: 'Documentos',
    uploadDocument: 'Subir Documento',
    
    // Materials
    materials: 'Materiales',
    materialRequest: 'Solicitud de Materiales',
    requestMaterials: 'Solicitar Materiales',
    
    // Status messages
    loading: 'Cargando...',
    noDataAvailable: 'No hay datos disponibles',
    errorOccurred: 'Ocurrió un error',
    success: 'Éxito',
    error: 'Error',
    saved: 'Guardado',
    deleted: 'Eliminado',
    updated: 'Actualizado',
    
    // Validation
    required: 'Requerido',
    invalidEmail: 'Correo inválido',
    invalidPhone: 'Número de teléfono inválido',
    
    // Access
    accessDenied: 'Acceso Denegado',
    noAccess: 'No tienes acceso a esta página',
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