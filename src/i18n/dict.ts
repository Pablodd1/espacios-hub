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

  /* ---- Comisiones (rules engine) ---- */
  comi: {
    caption: {
      es: 'Motor de reglas con trazabilidad completa — lo que no encaja va a revisión, nunca se calcula mal en silencio',
      en: 'Rules engine with full traceability — non-matching items go to review, never silently miscalculated',
    },
    recalc: { es: 'Recalcular comisiones', en: 'Recalculate commissions' },
    recalculating: { es: 'Recalculando…', en: 'Recalculating…' },
    exportPayroll: { es: 'Exportar a nómina', en: 'Export to payroll' },
    exportToast: { es: 'Exportación de nómina lista', en: 'Payroll export ready' },
    toastRecalc: { es: 'Cálculo completado', en: 'Calculation completed' },
    vendors: { es: 'vendedores', en: 'salespeople' },
    exceptionsN: { es: 'excepciones', en: 'exceptions' },
    rules: { es: 'Reglas del motor', en: 'Engine rules' },
    rulesCaption: {
      es: 'Se evalúan en orden de prioridad — el primer criterio que coincide define la comisión',
      en: 'Evaluated in priority order — the first matching criterion sets the commission',
    },
    statApplies: { es: 'Aplica a', en: 'Applies to' },
    statOrders: { es: 'pedidos este mes', en: 'orders this month' },
    statHeld: { es: 'retenidas', en: 'held' },
    confirmOff: {
      es: 'Desactivar la regla afectará el cálculo actual',
      en: 'Disabling the rule will affect the current calculation',
    },
    desc: {
      contenedor_especial: {
        es: 'Comisión diferenciada parametrizada por contenedor (ej. TCLU-450982-3 al 3,5 %).',
        en: 'Per-container custom commission rate.',
      },
      facturacion_anticipada: {
        es: 'La comisión cuenta en el mes en que la venta es efectiva, no en la fecha de factura.',
        en: 'Commission counts in the month the sale is effective, not the invoice date.',
      },
      demora_flete: {
        es: 'Comisión retenida hasta confirmar despacho si el flete no fue asignado a tiempo.',
        en: "Commission held until dispatch is confirmed when freight wasn't assigned on time.",
      },
      estandar: {
        es: '2,5 % sobre venta neta para todo pedido sin excepciones.',
        en: '2.5% on net sale for orders with no exceptions.',
      },
    },
    period: {
      jun: { es: 'Jun', en: 'Jun' },
      jul: { es: 'Jul', en: 'Jul' },
      ago: { es: 'Ago', en: 'Aug' },
    },
    month: {
      junio: { es: 'junio', en: 'June' },
      julio: { es: 'julio', en: 'July' },
      agosto: { es: 'agosto', en: 'August' },
    },
    leaderboard: { es: 'Totales por vendedor', en: 'Totals per salesperson' },
    leaderboardCaption: {
      es: 'Comisiones calculadas con las reglas activas del motor',
      en: 'Commissions calculated with the engine’s active rules',
    },
    col: {
      rank: { es: '#', en: '#' },
      vendor: { es: 'Vendedor', en: 'Salesperson' },
      sales: { es: 'Ventas netas', en: 'Net sales' },
      base: { es: 'Comisión base', en: 'Base commission' },
      adjust: { es: 'Ajustes por reglas', en: 'Rule adjustments' },
      held: { es: 'Retenido (demora)', en: 'Held (freight delay)' },
      total: { es: 'Total a pagar', en: 'Total to pay' },
      detail: { es: 'Detalle', en: 'Detail' },
    },
    held: { es: 'Retenido', en: 'Held' },
    rulesApplied: { es: 'Reglas aplicadas', en: 'Rules applied' },
    drawerTitle: { es: 'Trazabilidad de comisiones', en: 'Commission traceability' },
    drawerOrders: { es: 'Pedidos que componen el total', en: 'Orders behind the total' },
    drawerFooter: { es: 'Exportable a nómina', en: 'Exportable to payroll' },
    drawerSale: { es: 'Venta neta', en: 'Net sale' },
    drawerPct: { es: '% comisión', en: '% commission' },
    drawerCommission: { es: 'Comisión', en: 'Commission' },
    emptyPeriod: { es: 'Sin comisiones en este período', en: 'No commissions in this period' },
    emptyPeriodCaption: {
      es: 'El motor aún no ha calculado comisiones para el mes seleccionado.',
      en: 'The engine has not calculated commissions for the selected month yet.',
    },
    chartTitle: { es: 'Comisiones por mes', en: 'Commissions by month' },
    chartCaption: { es: 'Total mensual apilado por vendedor', en: 'Monthly total stacked by salesperson' },
    exceptions: { es: 'Cola de excepciones', en: 'Exception queue' },
    exceptionsCaption: {
      es: 'Casos que el motor no puede decidir — requieren revisión humana',
      en: 'Cases the engine cannot decide — human review required',
    },
    excOrder: { es: 'Pedido', en: 'Order' },
    excClient: { es: 'Cliente', en: 'Customer' },
    excMotive: { es: 'Motivo', en: 'Reason' },
    excSuggested: { es: 'Regla sugerida', en: 'Suggested rule' },
    excDetected: { es: 'Detectado', en: 'Detected' },
    excActions: { es: 'Acciones', en: 'Actions' },
    motivo: {
      flete: { es: 'Flete sin asignar', en: 'Freight unassigned' },
      meses: { es: 'Pedido a caballo entre meses', en: 'Order spanning two months' },
      contenedor: { es: 'Contenedor sin regla parametrizada', en: 'Container without a parametrized rule' },
    },
    apply: { es: 'Aplicar regla', en: 'Apply rule' },
    exclude: { es: 'Excluir', en: 'Exclude' },
    confirmApply: {
      es: 'Aplicar la regla sugerida a este pedido',
      en: 'Apply the suggested rule to this order',
    },
    confirmExclude: {
      es: 'Excluir este pedido del cálculo de comisiones',
      en: 'Exclude this order from commission calculation',
    },
    resolvedWith: { es: 'resuelto con regla', en: 'resolved with rule' },
    excludedToast: { es: 'excluido del cálculo', en: 'excluded from calculation' },
    excEmpty: { es: 'Sin excepciones — motor al día', en: 'No exceptions — engine up to date' },
    excEmptyCaption: {
      es: 'Todos los casos fueron revisados. El motor sigue evaluando nuevos pedidos.',
      en: 'Every case has been reviewed. The engine keeps evaluating new orders.',
    },
  },

  /* ---- Centro de Sincronización ---- */
  sync: {
    caption: {
      es: 'Salud del motor, historial de trabajos, auditoría y conciliación entre módulos',
      en: 'Engine health, job history, audit trail and cross-module reconciliation',
    },
    engineOn: { es: 'Motor de sincronización activo', en: 'Sync engine running' },
    engineOff: { es: 'Motor en pausa', en: 'Engine paused' },
    lastBeat: { es: 'Último latido', en: 'Last heartbeat' },
    queue: { es: 'cola', en: 'queue' },
    jobsWord: { es: 'trabajos', en: 'jobs' },
    retriesOn: { es: 'reintentos automáticos activos', en: 'automatic retries on' },
    pausedNote: { es: 'los trabajos quedan en cola', en: 'jobs remain queued' },
    connected: { es: 'conectado', en: 'connected' },
    whatsappApi: { es: 'WhatsApp API', en: 'WhatsApp API' },
    pause: { es: 'Pausar motor', en: 'Pause engine' },
    resume: { es: 'Reanudar motor', en: 'Resume engine' },
    pauseTitle: { es: 'Pausar el motor de sincronización', en: 'Pause the sync engine' },
    pauseBody: {
      es: 'Los trabajos programados se detendrán. Los documentos quedarán en cola.',
      en: 'Scheduled jobs will stop. Documents will remain queued.',
    },
    pauseConfirm: { es: 'Sí, pausar el motor', en: 'Yes, pause engine' },
    pausedToast: {
      es: 'Motor pausado — los trabajos quedan en cola',
      en: 'Engine paused — jobs remain queued',
    },
    resumedToast: {
      es: 'Motor reanudado — procesando la cola',
      en: 'Engine resumed — processing the queue',
    },
    statsJobs24h: { es: 'Trabajos últimas 24 h', en: 'Jobs last 24 h' },
    statsSuccess: { es: 'Tasa de éxito', en: 'Success rate' },
    statsAvg: { es: 'Duración promedio', en: 'Avg duration' },
    statsRetries: { es: 'Reintentos hoy', en: 'Retries today' },
    jobs: { es: 'Historial de trabajos', en: 'Job history' },
    jobsCaption: {
      es: 'Todos los trabajos ejecutados por el motor, más recientes primero',
      en: 'Every job run by the engine, newest first',
    },
    autoRefresh: { es: 'Auto-actualizar 15 s', en: 'Auto-refresh 15 s' },
    searchJobs: { es: 'Buscar por ID o mensaje…', en: 'Search by ID or message…' },
    colJob: { es: 'Job ID', en: 'Job ID' },
    colFlow: { es: 'Flujo', en: 'Flow' },
    colType: { es: 'Tipo', en: 'Type' },
    colRecords: { es: 'Registros', en: 'Records' },
    colDuration: { es: 'Duración', en: 'Duration' },
    colTime: { es: 'Hora', en: 'Time' },
    colActions: { es: 'Acciones', en: 'Actions' },
    type: {
      egreso: { es: 'egreso', en: 'payment' },
      recibo: { es: 'recibo', en: 'receipt' },
      causacion: { es: 'causación', en: 'accrual' },
      compra: { es: 'compra', en: 'purchase' },
      contenedor: { es: 'contenedor', en: 'container' },
      conciliacion: { es: 'conciliación', en: 'reconciliation' },
      calculo: { es: 'cálculo', en: 'calculation' },
      otro: { es: 'general', en: 'general' },
    },
    enCola: { es: 'En cola', en: 'Queued' },
    retrying: { es: 'Reintentando', en: 'Retrying' },
    attempt: { es: 'intento', en: 'attempt' },
    retryTitle: { es: 'Reintentar trabajo', en: 'Retry job' },
    retryBody: {
      es: 'Se reintentará con la misma clave de idempotencia.',
      en: 'It will retry with the same idempotency key.',
    },
    retryOk: { es: 'completado tras reintento', en: 'completed after retry' },
    emptyJobs: { es: 'Sin trabajos para los filtros actuales', en: 'No jobs match the current filters' },
    drawerTitle: { es: 'Detalle del trabajo', en: 'Job detail' },
    payloadSiigo: { es: 'Payload SIIGO', en: 'SIIGO payload' },
    payloadHgi: { es: 'Resultado HGI', en: 'HGI result' },
    attempts: { es: 'Intentos', en: 'Attempts' },
    idempotency: { es: 'Clave de idempotencia', en: 'Idempotency key' },
    audit: { es: 'Registro de auditoría', en: 'Audit trail' },
    auditCaption: { es: 'Quién hizo qué, cuándo — inmutable', en: 'Who did what, when — immutable' },
    filterHumans: { es: 'Humanos', en: 'Humans' },
    filterEngine: { es: 'Motor', en: 'Engine' },
    viewChange: { es: 'ver cambio', en: 'view change' },
    actorEngine: { es: 'Motor', en: 'Engine' },
    actorAccountant: { es: 'Contador', en: 'Accountant' },
    actorCeo: { es: 'Juan David García', en: 'Juan David García' },
    auditSync: { es: 'sincronizó', en: 'synced' },
    auditUpdate: { es: 'actualizó', en: 'updated' },
    auditCreate: { es: 'creó', en: 'created' },
    auditExport: { es: 'exportó', en: 'exported' },
    matrix: { es: 'Panorama de conciliación', en: 'Reconciliation overview' },
    matrixCaption: { es: 'Documentos conciliados por módulo — hoy', en: 'Reconciled documents per module — today' },
    docsSiigo: { es: 'Docs SIIGO', en: 'SIIGO docs' },
    docsHgi: { es: 'Docs HGI', en: 'HGI docs' },
    review: { es: 'Revisar', en: 'Review' },
    internal: { es: 'cálculo interno', en: 'internal calculation' },
    schedule: { es: 'Programación de sincronizaciones', en: 'Sync schedules' },
    scheduleCaption: {
      es: 'Frecuencia por módulo — los cambios quedan en el registro de auditoría',
      en: 'Per-module frequency — changes are written to the audit trail',
    },
    every5: { es: 'cada 5 min', en: 'every 5 min' },
    every15: { es: 'cada 15 min', en: 'every 15 min' },
    every30: { es: 'cada 30 min', en: 'every 30 min' },
    every60: { es: 'cada 60 min', en: 'every 60 min' },
    daily: { es: 'diario', en: 'daily' },
    weeklyMon: { es: 'semanal · lunes', en: 'weekly · Mondays' },
    onDemand: { es: 'bajo demanda', en: 'on demand' },
    next: { es: 'próxima', en: 'next' },
    optIn: { es: 'requiere opt-in', en: 'requires opt-in' },
    schedCartera: { es: 'Cartera · recibos', en: 'Receivables · receipts' },
    schedCompras: { es: 'Compras', en: 'Purchases' },
    schedCausaciones: { es: 'Causaciones', en: 'Accruals' },
    schedRecon: { es: 'Conciliación fiscal', en: 'Fiscal reconciliation' },
    schedWhatsapp: { es: 'Estados de cuenta WhatsApp', en: 'WhatsApp statements' },
    colSchedule: { es: 'Programación', en: 'Schedule' },
    colNext: { es: 'Próxima ejecución', en: 'Next run' },
    scheduleEdit: { es: 'Editar programación', en: 'Edit schedule' },
    scheduleOf: { es: 'Programación de', en: 'Schedule for' },
    scheduleUpdated: { es: 'actualizada', en: 'updated' },
    interval: { es: 'Intervalo', en: 'Interval' },
    edit: { es: 'Editar', en: 'Edit' },
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
