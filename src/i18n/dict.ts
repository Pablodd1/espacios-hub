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

  /* ---- Cartera (receivables) ---- */
  cart: {
    title: { es: 'Cartera', en: 'Receivables' },
    caption: {
      es: 'Recibos, estados de cuenta y cobro por WhatsApp — reconciliado a diario',
      en: 'Receipts, statements and WhatsApp collection — reconciled daily',
    },
    kpi: {
      total: { es: 'Cartera total', en: 'Total receivables' },
      vencida: { es: 'Vencida', en: 'Overdue' },
      recibosHoy: { es: 'Recibos hoy', en: 'Receipts today' },
      pendientesSync: { es: 'Pendientes de sync', en: 'Pending syncs' },
    },
    tab: {
      resumen: { es: 'Resumen', en: 'Overview' },
      receipts: { es: 'Recibos de caja', en: 'Cash receipts' },
      statements: { es: 'Estados de cuenta', en: 'Statements' },
      whatsapp: { es: 'Envío WhatsApp', en: 'WhatsApp send' },
      recon: { es: 'Reconciliación', en: 'Reconciliation' },
    },
    aging: {
      title: { es: 'Antigüedad de cartera', en: 'Receivables aging' },
      corriente: { es: 'Corriente', en: 'Current' },
      d1a30: { es: '1–30 días', en: '1–30 days' },
      d31a60: { es: '31–60 días', en: '31–60 days' },
      d61a90: { es: '61–90 días', en: '61–90 days' },
      d90plus: { es: '+90 días', en: '+90 days' },
      caption: { es: 'Saldos abiertos por antigüedad', en: 'Open balances by age' },
    },
    debtors: {
      title: { es: 'Mayores saldos pendientes', en: 'Largest open balances' },
      alDia: { es: 'Al día', en: 'Up to date' },
      diasVencido: { es: '+{n} días', en: '+{n} days' },
    },
    receipts: {
      searchPh: { es: 'Buscar recibo o cliente…', en: 'Search receipt or client…' },
      syncCta: { es: 'Sincronizar recibos', en: 'Sync receipts' },
      syncing: { es: 'Sincronizando…', en: 'Syncing…' },
      syncDone: { es: 'Recibos sincronizados', en: 'Receipts synced' },
      colRecibo: { es: 'N° Recibo', en: 'Receipt #' },
      colCliente: { es: 'Cliente', en: 'Client' },
      colBanco: { es: 'Banco destino', en: 'Destination bank' },
      colSiigo: { es: 'SIIGO', en: 'SIIGO' },
      colHgi: { es: 'HGI', en: 'HGI' },
      colAcciones: { es: 'Acciones', en: 'Actions' },
      rangeHoy: { es: 'Hoy', en: 'Today' },
      range7d: { es: '7 días', en: '7 days' },
      rangeTodos: { es: 'Todos', en: 'All' },
      emptyTitle: { es: 'Sin recibos para este filtro', en: 'No receipts for this filter' },
      emptyCaption: {
        es: 'Ajusta la búsqueda, el estado o el rango de fechas.',
        en: 'Adjust the search, status or date range.',
      },
      docsCount: { es: 'recibos', en: 'receipts' },
    },
    drawer: {
      resumen: { es: 'Resumen', en: 'Summary' },
      timeline: { es: 'Timeline de sincronización', en: 'Sync timeline' },
      compare: { es: 'Comparación SIIGO vs HGI', en: 'SIIGO vs HGI comparison' },
      cliente: { es: 'Cliente', en: 'Client' },
      nit: { es: 'NIT', en: 'NIT' },
      banco: { es: 'Banco destino', en: 'Destination bank' },
      notas: { es: 'Notas', en: 'Notes' },
      stepCreated: { es: 'Creado en SIIGO', en: 'Created in SIIGO' },
      stepJob: { es: 'Job de sincronización', en: 'Sync job' },
      stepHgi: { es: 'Confirmado en HGI', en: 'Confirmed in HGI' },
      noJob: { es: 'Sin job asociado', en: 'No linked job' },
      deltaVs: { es: 'Δ vs SIIGO', en: 'Δ vs SIIGO' },
      fieldValor: { es: 'Valor', en: 'Amount' },
      fieldFecha: { es: 'Fecha', en: 'Date' },
      fieldTercero: { es: 'Tercero', en: 'Contact' },
      fieldEstado: { es: 'Estado', en: 'Status' },
    },
    stmt: {
      selectorTitle: { es: 'Clientes', en: 'Clients' },
      searchPh: { es: 'Buscar cliente…', en: 'Search client…' },
      docTitle: { es: 'Estado de cuenta de cartera', en: 'Accounts receivable statement' },
      corte: { es: 'Corte: {fecha}', en: 'Cut-off: {fecha}' },
      colFactura: { es: 'Factura', en: 'Invoice' },
      colVence: { es: 'Vence', en: 'Due' },
      colAbonos: { es: 'Abonos', en: 'Payments' },
      colSaldo: { es: 'Saldo', en: 'Balance' },
      totalSaldo: { es: 'Saldo total', en: 'Total balance' },
      anticipo: {
        es: 'Anticipo disponible: {valor} (aplicable)',
        en: 'Available advance: {valor} (applicable)',
      },
      downloadPdf: { es: 'Descargar PDF', en: 'Download PDF' },
      noFacturas: { es: 'Sin facturas abiertas', en: 'No open invoices' },
    },
    wa: {
      audience: { es: 'Destinatarios', en: 'Recipients' },
      fVencido: { es: 'Con saldo vencido', en: 'With overdue balance' },
      fTodos: { es: 'Todos con saldo', en: 'All with balance' },
      fZona: { es: 'Zona: Medellín', en: 'Zone: Medellín' },
      selectAll: { es: 'Seleccionar todos ({n})', en: 'Select all ({n})' },
      footer: {
        es: '{n} clientes seleccionados · saldo total {saldo}',
        en: '{n} clients selected · total balance {saldo}',
      },
      emptyAudience: { es: 'Ningún cliente coincide con el filtro', en: 'No clients match this filter' },
      message: { es: 'Mensaje', en: 'Message' },
      templateDefault: {
        es: 'Hola {{cliente}}, le compartimos su estado de cartera con Espacios Importados al {{fecha_corte}}.\n\nSaldo pendiente: {{saldo}}\nFacturas abiertas: {{num_facturas}}\n\nAdjuntamos el detalle en PDF. Cualquier inquietud, estamos atentos. 💬',
        en: 'Hello {{cliente}}, here is your receivables statement with Espacios Importados as of {{fecha_corte}}.\n\nOpen balance: {{saldo}}\nOpen invoices: {{num_facturas}}\n\nWe attach the PDF detail. Any questions, we are here. 💬',
      },
      attachPdf: { es: 'Adjuntar PDF del estado de cuenta', en: 'Attach statement PDF' },
      onlyVencidos: { es: 'Solo saldos vencidos', en: 'Overdue balances only' },
      send: { es: 'Enviar a {n} clientes', en: 'Send to {n} clients' },
      sending: { es: 'Enviando… {k}/{n}', en: 'Sending… {k}/{n}' },
      confirmTitle: { es: 'Confirmar envío masivo', en: 'Confirm bulk send' },
      confirmBody: {
        es: 'Se enviarán {n} mensajes vía WhatsApp Business API.',
        en: '{n} messages will be sent via WhatsApp Business API.',
      },
      confirmCta: { es: 'Enviar ahora', en: 'Send now' },
      sentDone: { es: 'Envío completado', en: 'Send completed' },
      typing: { es: 'escribiendo…', en: 'typing…' },
      qTitle: { es: 'Cola de envío', en: 'Send queue' },
      qEnCola: { es: 'En cola', en: 'Queued' },
      qEnviando: { es: 'Enviando…', en: 'Sending…' },
      qEntregado: { es: 'Entregado ✓✓', en: 'Delivered ✓✓' },
      qFallido: { es: 'Fallido', en: 'Failed' },
      compliance: {
        es: 'Envíos vía WhatsApp Business API con opt-in registrado · Uso interno',
        en: 'Sent via WhatsApp Business API with registered opt-in · Internal use',
      },
      previewFrom: { es: 'Vista previa en vivo', en: 'Live preview' },
      noRecipients: { es: 'Selecciona al menos un destinatario', en: 'Select at least one recipient' },
    },
    recon: {
      run: { es: 'Ejecutar conciliación', en: 'Run reconciliation' },
      running: { es: 'Conciliando…', en: 'Reconciling…' },
      anticipos: { es: 'Anticipos', en: 'Advances' },
      partidas: { es: 'Partidas por identificar', en: 'Unidentified items' },
      cartera: { es: 'Cartera', en: 'Receivables' },
      diff: { es: 'Diferencia', en: 'Difference' },
      matched: { es: 'Conciliado', en: 'Matched' },
      diffsTitle: { es: 'Diferencias detectadas', en: 'Detected differences' },
      colValorSiigo: { es: 'Valor SIIGO', en: 'SIIGO amount' },
      colValorHgi: { es: 'Valor HGI', en: 'HGI amount' },
      colCausa: { es: 'Causa probable', en: 'Likely cause' },
      colAccion: { es: 'Acción', en: 'Action' },
      causaSinCruzar: { es: 'Recibo sin cruzar', en: 'Unmatched receipt' },
      causaNoMapeado: { es: 'Tercero no mapeado', en: 'Unmapped contact' },
      causaRedondeo: { es: 'Redondeo', en: 'Rounding' },
      resolve: { es: 'Resolver', en: 'Resolve' },
      suggestedTitle: { es: 'Vínculo sugerido', en: 'Suggested match' },
      suggestedBody: {
        es: '¿Vincular {rc} con {fv}? Mismo tercero · misma fecha ({fecha}).',
        en: 'Link {rc} with {fv}? Same contact · same date ({fecha}).',
      },
      confirm: { es: 'Vincular', en: 'Link' },
      reject: { es: 'Descartar', en: 'Dismiss' },
      linkedToast: { es: 'Partida vinculada y conciliada', en: 'Item linked and reconciled' },
      emptyTitle: { es: 'Sin diferencias — cartera conciliada', en: 'No differences — receivables reconciled' },
      emptyCaption: {
        es: 'Los tres bloques coinciden entre SIIGO y HGI.',
        en: 'All three buckets match between SIIGO and HGI.',
      },
    },
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
