/**
 * Espacios Hub — i18n dictionary (es-CO default / en toggle).
 * Every UI string lives here. Leaf shape: { es: string; en: string }.
 */

export type Lang = 'es' | 'en';

export interface DictEntry {
  es: string;
  en: string;
}

export const dict = {
  app: {
    name: { es: 'ESPACIOS HUB', en: 'ESPACIOS HUB' },
    company: { es: 'Espacios Importados S.A.S.', en: 'Espacios Importados S.A.S.' },
    tagline: {
      es: 'Una sola entrada. Dos sistemas en perfecta sincronía.',
      en: 'One entry. Two systems in perfect sync.',
    },
    internalUse: { es: 'Uso interno — Espacios Importados S.A.S.', en: 'Internal use — Espacios Importados S.A.S.' },
  },

  nav: {
    dashboard: { es: 'Panel de Control', en: 'Dashboard' },
    tesoreria: { es: 'Tesorería', en: 'Treasury' },
    cartera: { es: 'Cartera', en: 'Receivables' },
    comex: { es: 'Comercio Exterior', en: 'Foreign Trade' },
    comisiones: { es: 'Comisiones', en: 'Commissions' },
    contabilidad: { es: 'Contabilidad', en: 'Accounting' },
    logistica: { es: 'Logística', en: 'Logistics' },
    sync: { es: 'Centro de Sincronización', en: 'Sync Center' },
    config: { es: 'Configuración', en: 'Settings' },
  },

  navGroup: {
    operacion: { es: 'OPERACIÓN', en: 'OPERATIONS' },
    sistema: { es: 'SISTEMA', en: 'SYSTEM' },
  },

  action: {
    syncNow: { es: 'Sincronizar ahora', en: 'Sync now' },
    syncAll: { es: 'Sincronizar todo', en: 'Sync all' },
    export: { es: 'Exportar', en: 'Export' },
    exportSummary: { es: 'Exportar resumen', en: 'Export summary' },
    filter: { es: 'Filtrar', en: 'Filter' },
    search: { es: 'Buscar', en: 'Search' },
    close: { es: 'Cerrar', en: 'Close' },
    cancel: { es: 'Cancelar', en: 'Cancel' },
    confirm: { es: 'Confirmar', en: 'Confirm' },
    save: { es: 'Guardar', en: 'Save' },
    sendWhatsApp: { es: 'Enviar por WhatsApp', en: 'Send via WhatsApp' },
    runNow: { es: 'Ejecutar ahora', en: 'Run now' },
    retry: { es: 'Reintentar', en: 'Retry' },
    viewAll: { es: 'Ver todo', en: 'View all' },
    viewDetail: { es: 'Ver detalle', en: 'View detail' },
    viewModule: { es: 'Ver módulo', en: 'View module' },
    back: { es: 'Volver', en: 'Back' },
    clear: { es: 'Limpiar', en: 'Clear' },
    apply: { es: 'Aplicar', en: 'Apply' },
    login: { es: 'Entrar', en: 'Sign in' },
    logout: { es: 'Cerrar sesión', en: 'Sign out' },
  },

  /* ---- Document / job / sync states ---- */
  status: {
    synced: { es: 'Sincronizado', en: 'Synced' },
    pending: { es: 'Pendiente', en: 'Pending' },
    error: { es: 'Error', en: 'Error' },
    diff: { es: 'Diferencia', en: 'Mismatch' },
    inProgress: { es: 'En curso', en: 'In progress' },
    sent: { es: 'Enviado', en: 'Sent' },
    completed: { es: 'Completado', en: 'Completed' },
    active: { es: 'Activo', en: 'Active' },
    paused: { es: 'En pausa', en: 'Paused' },
    calculated: { es: 'Calculada', en: 'Calculated' },
    paid: { es: 'Pagada', en: 'Paid' },
    voided: { es: 'Anulada', en: 'Voided' },
    dispatched: { es: 'Despachado', en: 'Dispatched' },
    notDispatched: { es: 'Sin despachar', en: 'Not dispatched' },
    applied: { es: 'Aplicado', en: 'Applied' },
    notApplied: { es: 'Por aplicar', en: 'Unapplied' },
    resolved: { es: 'Resuelto', en: 'Resolved' },
    unresolved: { es: 'Sin resolver', en: 'Unresolved' },
  },

  /* ---- Document types (documentos.tipo) ---- */
  docType: {
    egreso: { es: 'Egreso', en: 'Payment voucher' },
    recibo_caja: { es: 'Recibo de caja', en: 'Cash receipt' },
    compra: { es: 'Compra', en: 'Purchase' },
    factura: { es: 'Factura', en: 'Invoice' },
    causacion: { es: 'Causación', en: 'Accrual' },
    anticipo: { es: 'Anticipo', en: 'Advance payment' },
  },

  /* ---- Container lifecycle (contenedores.estado) ---- */
  contStatus: {
    en_transito: { es: 'En tránsito', en: 'In transit' },
    arribado: { es: 'Arribado', en: 'Arrived' },
    levante: { es: 'Levante', en: 'Customs release' },
    entregado: { es: 'Entregado', en: 'Delivered' },
  },

  /* ---- Commission rules (comisiones.regla) ---- */
  rule: {
    estandar: { es: 'Estándar', en: 'Standard' },
    contenedor_especial: { es: 'Contenedor especial', en: 'Special container' },
    facturacion_anticipada: { es: 'Facturación anticipada', en: 'Early invoicing' },
    demora_flete: { es: 'Demora de flete', en: 'Freight delay' },
  },

  sys: {
    siigo: { es: 'SIIGO', en: 'SIIGO' },
    hgi: { es: 'HGI', en: 'HGI' },
  },

  dir: {
    siigoToHgi: { es: 'SIIGO → HGI', en: 'SIIGO → HGI' },
    hgiToSiigo: { es: 'HGI → SIIGO', en: 'HGI → SIIGO' },
  },

  modules: {
    tesoreria: { es: 'Tesorería', en: 'Treasury' },
    cartera: { es: 'Cartera', en: 'Receivables' },
    comex: { es: 'Comercio Exterior', en: 'Foreign Trade' },
    comisiones: { es: 'Comisiones', en: 'Commissions' },
    contabilidad: { es: 'Contabilidad', en: 'Accounting' },
    logistica: { es: 'Logística', en: 'Logistics' },
  },

  /* ---- App shell ---- */
  shell: {
    searchPlaceholder: { es: 'Buscar documentos, contenedores, terceros…', en: 'Search documents, containers, contacts…' },
    engineActive: { es: 'Motor activo', en: 'Engine active' },
    enginePaused: { es: 'Motor en pausa', en: 'Engine paused' },
    lastHeartbeat: { es: 'Último pulso', en: 'Last heartbeat' },
    notifications: { es: 'Notificaciones', en: 'Notifications' },
    profile: { es: 'Perfil', en: 'Profile' },
    preferences: { es: 'Preferencias', en: 'Preferences' },
    userName: { es: 'Adriana Restrepo', en: 'Adriana Restrepo' },
    userRole: { es: 'Gerencia General', en: 'General Management' },
    breadcrumbRoot: { es: 'Espacios Hub', en: 'Espacios Hub' },
    systemsOk: { es: 'Sistemas conectados', en: 'Systems connected' },
  },

  /* ---- KPI labels ---- */
  kpi: {
    docsSyncedToday: { es: 'Documentos sincronizados hoy', en: 'Docs synced today' },
    pendingSyncs: { es: 'Sincronizaciones pendientes', en: 'Pending syncs' },
    mismatches: { es: 'Diferencias detectadas', en: 'Mismatches detected' },
    containersInTransit: { es: 'Contenedores en tránsito', en: 'Containers in transit' },
    vsYesterday: { es: 'vs ayer', en: 'vs yesterday' },
    arriveThisWeek: { es: 'arriban esta semana', en: 'arriving this week' },
  },

  /* ---- Dashboard ---- */
  dash: {
    title: { es: 'Panel de Control', en: 'Dashboard' },
    syncAll: { es: 'Sincronizar todo', en: 'Sync all' },
    exportSummary: { es: 'Exportar resumen', en: 'Export summary' },
    lastGlobalSync: { es: 'Última sincronización global', en: 'Last global sync' },
    confirmSyncTitle: { es: 'Sincronización global', en: 'Global sync' },
    confirmSyncBody: { es: 'Se ejecutarán 7 trabajos pendientes.', en: '7 pending jobs will run.' },
    runNow: { es: 'Ejecutar ahora', en: 'Run now' },
    syncing: { es: 'Sincronizando…', en: 'Syncing…' },
    syncDone: { es: 'Sincronización global completada', en: 'Global sync completed' },
    docsCount: { es: 'documentos', en: 'documents' },
    feedTitle: { es: 'Actividad de sincronización', en: 'Sync activity' },
    live: { es: 'EN VIVO', en: 'LIVE' },
    trendTitle: { es: 'Conciliación diaria — últimos 30 días', en: 'Daily reconciliation — last 30 days' },
    trendCaption: {
      es: 'Documentos conciliados vs. diferencias entre SIIGO y HGI',
      en: 'Reconciled documents vs. mismatches between SIIGO and HGI',
    },
    reconciled: { es: 'Conciliados', en: 'Reconciled' },
    differences: { es: 'Diferencias', en: 'Mismatches' },
    healthTitle: { es: 'Salud de sincronización por módulo', en: 'Sync health by module' },
    healthToday: { es: 'hoy', en: 'today' },
    jobs: { es: 'trabajos', en: 'jobs' },
    successRate: { es: '% éxito', en: '% success' },
    containersTitle: { es: 'Contenedores en tránsito', en: 'Containers in transit' },
    eta: { es: 'ETA', en: 'ETA' },
    units: { es: 'unds', en: 'units' },
    alertsNeedReview: { es: 'diferencias requieren revisión', en: 'mismatches need review' },
    noAlerts: { es: 'Sin diferencias pendientes', en: 'No pending mismatches' },
    reviewInSync: { es: 'Revisar en Centro de Sincronización', en: 'Review in Sync Center' },
    viewAllSync: { es: 'Ver todo en el Centro de Sincronización', en: 'View all in Sync Center' },
    emptyFeed: { es: 'Sin actividad aún hoy', en: 'No activity yet today' },
    dailyReconDone: { es: 'Conciliación diaria completada', en: 'Daily reconciliation completed' },
  },

  time: {
    justNow: { es: 'ahora mismo', en: 'just now' },
    lastSync: { es: 'Última sincronización', en: 'Last sync' },
    today: { es: 'Hoy', en: 'Today' },
    yesterday: { es: 'Ayer', en: 'Yesterday' },
  },

  common: {
    showing: { es: 'Mostrando', en: 'Showing' },
    of: { es: 'de', en: 'of' },
    results: { es: 'resultados', en: 'results' },
    noResults: { es: 'Sin resultados', en: 'No results' },
    emptyTitle: { es: 'Nada por aquí todavía', en: 'Nothing here yet' },
    emptyCaption: {
      es: 'Cuando haya datos disponibles aparecerán en esta vista.',
      en: 'Data will appear in this view once available.',
    },
    underConstruction: { es: 'Módulo en construcción', en: 'Module under construction' },
    underConstructionCaption: {
      es: 'Este módulo está en desarrollo. La integración de datos llegará pronto.',
      en: 'This module is being built. Data integration is coming soon.',
    },
    yes: { es: 'Sí', en: 'Yes' },
    no: { es: 'No', en: 'No' },
    date: { es: 'Fecha', en: 'Date' },
    amount: { es: 'Valor', en: 'Amount' },
    status: { es: 'Estado', en: 'Status' },
    module: { es: 'Módulo', en: 'Module' },
    description: { es: 'Descripción', en: 'Description' },
    tercero: { es: 'Tercero', en: 'Contact' },
    banco: { es: 'Banco', en: 'Bank' },
    document: { es: 'Documento', en: 'Document' },
    container: { es: 'Contenedor', en: 'Container' },
    all: { es: 'Todos', en: 'All' },
    columns: { es: 'Columnas', en: 'Columns' },
    previous: { es: 'Anterior', en: 'Previous' },
    next: { es: 'Siguiente', en: 'Next' },
    origin: { es: 'Origen', en: 'Origin' },
    destination: { es: 'Destino', en: 'Destination' },
    total: { es: 'Total', en: 'Total' },
  },

  /* ---- Tesorería ---- */
  teso: {
    caption: {
      es: 'Egresos registrados en SIIGO se migran automáticamente a HGI · 3 cuentas bancarias',
      en: 'Payments entered in SIIGO are auto-migrated to HGI · 3 bank accounts',
    },
    lastRun: { es: 'Última ejecución', en: 'Last run' },
    errors: { es: 'errores', en: 'errors' },
    docs: { es: 'docs', en: 'docs' },
    todayLower: { es: 'hoy', en: 'today' },
    currentAccount: { es: 'Cuenta corriente', en: 'Checking account' },
    egresosHoy: { es: 'egresos hoy', en: 'payments today' },
    pendientes: { es: 'pendientes', en: 'pending' },
    accountMapping: { es: 'Cuenta SIIGO → cuenta HGI', en: 'SIIGO account → HGI account' },
    searchPlaceholder: { es: 'Buscar por N° doc o tercero…', en: 'Search by doc # or third party…' },
    date7d: { es: 'Últimos 7 días', en: 'Last 7 days' },
    date30d: { es: 'Últimos 30 días', en: 'Last 30 days' },
    tableDoc: { es: 'N° Documento', en: 'Doc #' },
    tableConcept: { es: 'Concepto', en: 'Concept' },
    tableActions: { es: 'Acciones', en: 'Actions' },
    emptyEgresos: { es: 'No hay egresos en este rango', en: 'No payments in this range' },
    emptyEgresosCaption: {
      es: 'Prueba ajustando los filtros o el rango de fechas.',
      en: 'Try adjusting filters or the date range.',
    },
    retryConfirm: { es: '¿Reintentar sincronización de', en: 'Retry sync of' },
    retrying: { es: 'Reintentando…', en: 'Retrying…' },
    retryToast: { es: 'reenviado a la cola de sincronización', en: 're-queued for sync' },
    modalTitle: { es: 'Sincronizando egresos SIIGO → HGI', en: 'Syncing payments SIIGO → HGI' },
    modalDone: { es: 'Sincronización completa', en: 'Sync complete' },
    modalDocsMigrated: { es: 'documentos migrados', en: 'documents migrated' },
    syncToast: { es: 'Egresos sincronizados SIIGO → HGI', en: 'Payments synced SIIGO → HGI' },
    syncCausacionesToast: { es: 'Causaciones sincronizadas SIIGO → HGI', en: 'Accruals synced SIIGO → HGI' },
  },

  /* ---- Document detail drawer (shared Tesorería / Contabilidad) ---- */
  docDrawer: {
    summary: { es: 'Resumen', en: 'Summary' },
    nit: { es: 'NIT', en: 'Tax ID' },
    concept: { es: 'Concepto', en: 'Concept' },
    bankAccount: { es: 'Banco / cuenta', en: 'Bank / account' },
    taxes: { es: 'Impuestos', en: 'Taxes' },
    retention: { es: 'Retención', en: 'Withholding' },
    paymentMethod: { es: 'Medio de pago', en: 'Payment method' },
    paymentTransfer: { es: 'Transferencia', en: 'Bank transfer' },
    syncSection: { es: 'Sincronización', en: 'Synchronization' },
    createdIn: { es: 'creado en SIIGO el', en: 'created in SIIGO on' },
    createdSiigo: { es: 'Creado en SIIGO', en: 'Created in SIIGO' },
    detected: { es: 'Detectado por el motor', en: 'Detected by the engine' },
    publishedHgi: { es: 'Publicado en HGI', en: 'Posted to HGI' },
    publishedDiff: { es: 'Publicado en HGI con diferencia', en: 'Posted to HGI with mismatch' },
    pendingHgi: { es: 'En cola para publicar en HGI', en: 'Queued for HGI posting' },
    failedHgi: { es: 'Error al publicar en HGI', en: 'Failed posting to HGI' },
    entry: { es: 'asiento', en: 'entry' },
    compare: { es: 'Comparación SIIGO vs HGI', en: 'SIIGO vs HGI comparison' },
    account: { es: 'Cuenta', en: 'Account' },
    value: { es: 'Valor', en: 'Value' },
    retry: { es: 'Reintentar sincronización', en: 'Retry sync' },
    viewAudit: { es: 'Ver en auditoría', en: 'View in audit log' },
  },

  /* ---- Contabilidad ---- */
  conta: {
    caption: {
      es: 'Causaciones, sobrecostos, anticipos y conciliación fiscal diaria',
      en: 'Accruals, surcharges, advances and daily fiscal reconciliation',
    },
    chipCausaciones: { es: 'Causaciones sincronizadas hoy', en: 'Accruals synced today' },
    chipAdvances: { es: 'Anticipos vigentes', en: 'Active advances' },
    chipRealDebt: { es: 'Deuda real proveedores', en: 'Real supplier debt' },
    chipDiffs: { es: 'Diferencias del día', en: "Today's mismatches" },
    surcharge: { es: '% Sobrecosto', en: '% Surcharge' },
    realDebt: { es: 'Deuda real estimada', en: 'Estimated real debt' },
    bookedDebt: { es: 'Deuda registrada', en: 'Booked debt' },
    advances: { es: 'Anticipos a proveedores', en: 'Supplier advances' },
    fiscalRecon: { es: 'Conciliación fiscal diaria', en: 'Daily fiscal reconciliation' },
    runCross: { es: 'Ejecutar cruce', en: 'Run cross-check' },
    saveParam: { es: 'Guardar parámetro', en: 'Save parameter' },
    panelTitle: {
      es: 'Deuda real con proveedores — parámetro de sobrecosto',
      en: 'Real supplier debt — surcharge parameter',
    },
    panelCaption: {
      es: 'El sobrecosto (flete, seguros, nacionalización estimada) se aplica sobre la deuda registrada para mostrar la deuda real estimada.',
      en: 'Surcharge (freight, insurance, estimated nationalization) is applied over booked debt to show estimated real debt.',
    },
    lastAdjust: { es: 'Último ajuste', en: 'Last adjusted' },
    adjustBy: { es: 'por', en: 'by' },
    surchargeCol: { es: 'Sobrecosto', en: 'Surcharge' },
    supplierLine: { es: 'Proveedor / Línea', en: 'Supplier / Line' },
    reset: { es: 'Restablecer', en: 'Reset' },
    savedToast: { es: 'Parámetro de sobrecosto actualizado a', en: 'Surcharge parameter updated to' },
    causacionesTitle: { es: 'Causaciones', en: 'Accruals' },
    causacionesSync: { es: 'Sincronizar causaciones', en: 'Sync accruals' },
    causacionesMaster: { es: 'Master: SIIGO · cada 15 min', en: 'Master: SIIGO · every 15 min' },
    causacionesSearch: { es: 'Buscar tercero o doc…', en: 'Search contact or doc…' },
    taxesCol: { es: 'Impuestos', en: 'Taxes' },
    advancesCaption: {
      es: 'Cada anticipo se vincula a su línea/contenedor y se aplica automáticamente al llegar la factura',
      en: 'Each advance links to its line/container and auto-applies when the invoice arrives',
    },
    advanceCol: { es: 'Anticipo', en: 'Advance' },
    supplierCol: { es: 'Proveedor', en: 'Supplier' },
    lineContainerCol: { es: 'Línea / Contenedor', en: 'Line / Container' },
    wiredAtCol: { es: 'Fecha giro', en: 'Wire date' },
    wiredCol: { es: 'Valor girado', en: 'Wired amount' },
    appliedCol: { es: 'Aplicado', en: 'Applied' },
    stateVigente: { es: 'Vigente', en: 'Active' },
    statePartial: { es: 'Aplicado parcial', en: 'Partially applied' },
    stateFull: { es: 'Aplicado total', en: 'Fully applied' },
    autoApplied: { es: 'aplicado automáticamente a', en: 'auto-applied to' },
    bases: { es: 'Bases gravables', en: 'Taxable bases' },
    iva: { es: 'IVA', en: 'VAT' },
    retenciones: { es: 'Retenciones', en: 'Withholdings' },
    typeCol: { es: 'Tipo', en: 'Type' },
    causeCol: { es: 'Causa probable', en: 'Likely cause' },
    causeMissingHgi: { es: 'Documento faltante en HGI', en: 'Missing document in HGI' },
    causeRounding: { es: 'Redondeo', en: 'Rounding' },
    causeThirdParty: { es: 'Tercero distinto', en: 'Different contact' },
    fiscalFooter: {
      es: 'Cruce automático diario 06:00 — reemplaza la conciliación manual',
      en: 'Automatic daily cross-check 06:00 — replaces manual reconciliation',
    },
    fiscalEmpty: { es: 'Bases, IVA y Retenciones conciliados', en: 'Bases, VAT and withholdings reconciled' },
    scanning: { es: 'Ejecutando cruce…', en: 'Running cross-check…' },
    bucketBase: { es: 'Base', en: 'Base' },
    bucketIva: { es: 'IVA', en: 'VAT' },
    bucketRetencion: { es: 'Retención', en: 'Withholding' },
    siigoValue: { es: 'Valor SIIGO', en: 'SIIGO value' },
    hgiValue: { es: 'Valor HGI', en: 'HGI value' },
  },
} as const;

/* ===== Typed key machinery ===== */

type AnyEntry = { es: string; en: string };

type KeyOf<T> = {
  [K in keyof T & string]: T[K] extends AnyEntry ? K : `${K}.${KeyOf<T[K]>}`;
}[keyof T & string];

/** Dot-path key into `dict`, e.g. 'nav.dashboard' | 'status.synced' */
export type DictKey = KeyOf<typeof dict>;

/** Resolve a dot-path key to its dictionary entry. */
export function getEntry(key: DictKey): DictEntry {
  const parts = key.split('.');
  let node: unknown = dict;
  for (const part of parts) {
    node = (node as Record<string, unknown>)[part];
  }
  return node as DictEntry;
}

/**
 * StatusBadge-friendly label maps — status code → dictionary key.
 * Usage: `t(statusDocLabels[doc.estado])`
 */
export const statusDocLabels = {
  sincronizado: 'status.synced',
  pendiente: 'status.pending',
  diferencia: 'status.diff',
  error: 'status.error',
} as const satisfies Record<string, DictKey>;

export const statusContainerLabels = {
  en_transito: 'contStatus.en_transito',
  arribado: 'contStatus.arribado',
  levante: 'contStatus.levante',
  entregado: 'contStatus.entregado',
} as const satisfies Record<string, DictKey>;

export const statusJobLabels = {
  completado: 'status.completed',
  en_proceso: 'status.inProgress',
  error: 'status.error',
  pendiente: 'status.pending',
} as const satisfies Record<string, DictKey>;

export const statusComisionLabels = {
  calculada: 'status.calculated',
  pagada: 'status.paid',
  anulada: 'status.voided',
} as const satisfies Record<string, DictKey>;

export const ruleLabels = {
  estandar: 'rule.estandar',
  contenedor_especial: 'rule.contenedor_especial',
  facturacion_anticipada: 'rule.facturacion_anticipada',
  demora_flete: 'rule.demora_flete',
} as const satisfies Record<string, DictKey>;

export const docTypeLabels = {
  egreso: 'docType.egreso',
  recibo_caja: 'docType.recibo_caja',
  compra: 'docType.compra',
  factura: 'docType.factura',
  causacion: 'docType.causacion',
  anticipo: 'docType.anticipo',
} as const satisfies Record<string, DictKey>;

export const moduleLabels = {
  Tesoreria: 'modules.tesoreria',
  Cartera: 'modules.cartera',
  'Comercio Exterior': 'modules.comex',
  Comisiones: 'modules.comisiones',
  Contabilidad: 'modules.contabilidad',
  Logistica: 'modules.logistica',
} as const satisfies Record<string, DictKey>;
