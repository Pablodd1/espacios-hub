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

  /* ---- Comercio Exterior (comex.*) ---- */
  comex: {
    title: { es: 'Comercio Exterior', en: 'Foreign Trade' },
    caption: {
      es: 'Registro único de contenedores — una entrada alimenta HGI, Power BI e IA',
      en: 'Single container registry — one entry feeds HGI, Power BI and AI',
    },
    new: { es: 'Nuevo contenedor', en: 'New container' },
    importExcel: { es: 'Importar Excel', en: 'Import Excel' },
    heroOverline: { es: 'Rutas activas', en: 'Active routes' },
    heroInTransit: { es: 'en tránsito', en: 'in transit' },
    heroArrivedWeek: { es: 'arribados esta semana', en: 'arrived this week' },
    heroDeliveredQtr: { es: 'entregados este trimestre', en: 'delivered this quarter' },
    stage: {
      transit: { es: 'En tránsito', en: 'In transit' },
      arrived: { es: 'Arribado', en: 'Arrived' },
      levante: { es: 'Levante', en: 'Customs clearance' },
      delivered: { es: 'Entregado', en: 'Delivered' },
    },
    search: { es: 'Buscar contenedor, BL o producto…', en: 'Search container, BL or product…' },
    colContainer: { es: 'Contenedor', en: 'Container' },
    colBl: { es: 'BL', en: 'BL' },
    colRoute: { es: 'Ruta', en: 'Route' },
    colProduct: { es: 'Producto', en: 'Product' },
    colQty: { es: 'Cantidad', en: 'Qty' },
    colEta: { es: 'ETA', en: 'ETA' },
    colStage: { es: 'Etapa', en: 'Stage' },
    distributed: { es: 'Distribuido a', en: 'Distributed to' },
    colActions: { es: 'Acciones', en: 'Actions' },
    emptyStage: { es: 'Sin contenedores en este estado', en: 'No containers in this state' },
    emptyStageCaption: {
      es: 'Prueba con otro filtro o registra un nuevo contenedor.',
      en: 'Try another filter or register a new container.',
    },
    register: { es: 'Registrar y distribuir', en: 'Register & distribute' },
    modalCaption: {
      es: 'Una sola entrada — se distribuirá a HGI, Power BI e IA automáticamente.',
      en: 'One entry — automatically distributed to HGI, Power BI and AI.',
    },
    formNumero: { es: 'N° contenedor', en: 'Container no.' },
    formNumeroPlaceholder: { es: 'XXXX-000000-0', en: 'XXXX-000000-0' },
    formBl: { es: 'BL', en: 'BL' },
    formOrigen: { es: 'Puerto origen', en: 'Origin port' },
    formDestino: { es: 'Puerto destino', en: 'Destination port' },
    formProducto: { es: 'Producto', en: 'Product' },
    formCodigo: { es: 'Código', en: 'Code' },
    formCantidad: { es: 'Cantidad', en: 'Quantity' },
    formZarpe: { es: 'Fecha zarpe', en: 'Departure date' },
    formEta: { es: 'ETA', en: 'ETA' },
    portOther: { es: 'Otro', en: 'Other' },
    stepSaving: { es: 'Guardando…', en: 'Saving…' },
    stepHgi: { es: 'Distribuyendo a HGI…', en: 'Distributing to HGI…' },
    stepPbi: { es: 'Actualizando Power BI…', en: 'Updating Power BI…' },
    stepIa: { es: 'Indexando en IA…', en: 'Indexing in AI…' },
    registerSuccess: {
      es: 'Contenedor {num} registrado y distribuido ✓',
      en: 'Container {num} registered and distributed ✓',
    },
    drawerEta: { es: 'ETA {date}', en: 'ETA {date}' },
    timelineZarpe: { es: 'Zarpe', en: 'Departure' },
    timelineArribo: { es: 'Arribo', en: 'Arrival' },
    timelineLevanteEntrega: { es: 'Levante / Entrega', en: 'Clearance / Delivery' },
    transitDay: { es: 'Pacífico, día {d} de {total}', en: 'Pacific, day {d} of {total}' },
    lastPosition: { es: 'Última posición: {pos}', en: 'Last position: {pos}' },
    daysLeft: { es: 'Faltan {d} días', en: '{d} days left' },
    arrivedOn: { es: 'Arribado el {date}', en: 'Arrived on {date}' },
    registry: { es: 'Registro único', en: 'Single registry' },
    carrier: { es: 'Naviera', en: 'Carrier' },
    customsAgent: { es: 'Agente de aduanas', en: 'Customs agent' },
    distAuto: { es: 'Distribución automática', en: 'Automatic distribution' },
    distHgi: { es: 'Archivo plano generado', en: 'Flat file generated' },
    distPbi: { es: 'Dataset actualizado', en: 'Dataset updated' },
    distIa: { es: 'Indexado', en: 'Indexed' },
    aiAssistant: { es: 'Asistente IA', en: 'AI Assistant' },
    distPending: { es: 'Pendiente de distribución', en: 'Pending distribution' },
    linkedDocs: { es: 'Documentos vinculados', en: 'Linked documents' },
    supplierInvoice: { es: 'Factura proveedor', en: 'Supplier invoice' },
    noLinkedDocs: { es: 'Sin documentos vinculados aún', en: 'No linked documents yet' },
    viewAudit: { es: 'Ver historial en auditoría', en: 'View audit history' },
    updateStage: { es: 'Actualizar etapa', en: 'Update stage' },
    advanceTo: { es: 'Avanzar a «{stage}»', en: 'Advance to "{stage}"' },
    stageUpdated: { es: 'Etapa actualizada a «{stage}»', en: 'Stage updated to "{stage}"' },
    vesselEta: { es: 'ETA {date}', en: 'ETA {date}' },
    qtyUnits: { es: '{n} unds', en: '{n} units' },
    importQueued: { es: 'Importación programada — te avisaremos al terminar', en: 'Import scheduled — we will notify you when done' },
  },

  /* ---- Logística (logi.*) ---- */
  logi: {
    title: { es: 'Logística', en: 'Logistics' },
    caption: {
      es: 'Torre de control: compras, cumplidos y brechas entre sistema y piso de bodega',
      en: 'Control tower: purchases, receipts and gaps between system and warehouse floor',
    },
    kpiCompras: { es: 'Compras sincronizadas hoy', en: 'Purchases synced today' },
    kpiNovedad: { es: 'Cumplidos con novedad', en: 'Receipts with issues' },
    gap1: { es: 'Ingresados no recibidos', en: 'Entered not received' },
    gap1Caption: {
      es: 'Registrados en el sistema, sin llegada física confirmada (cruce con estados de contenedores)',
      en: 'Entered in the system, no confirmed physical arrival (cross-checked with container states)',
    },
    gap2: { es: 'Facturados no despachados', en: 'Invoiced not dispatched' },
    gap2Caption: {
      es: 'Facturas emitidas cuya mercancía aún no sale de bodega — lista de seguimiento para inventarios',
      en: "Issued invoices whose goods haven't left the warehouse — follow-up list for inventory",
    },
    daysShort: { es: '{d} d', en: '{d} d' },
    viewContainer: { es: 'Ver contenedor', en: 'View container' },
    createDispatch: { es: 'Crear despacho', en: 'Create dispatch' },
    gap1Footer: {
      es: '{n} órdenes · {total} en tránsito operativo',
      en: '{n} orders · {total} in operational transit',
    },
    gap2Footer: {
      es: '{n} facturas · {total} retenidas en bodega',
      en: '{n} invoices · {total} held in warehouse',
    },
    noContainer: { es: 'Sin contenedor', en: 'No container' },
    recheck: { es: 'Volver a cruzar datos', en: 'Re-run cross-check' },
    recheckDone: { es: 'Cruce actualizado — sin cambios', en: 'Cross-check updated — no changes' },
    motivoFlete: { es: 'Flete sin asignar', en: 'Unassigned freight' },
    motivoCumplido: { es: 'Esperando cumplido', en: 'Waiting for receipt' },
    noGaps: { es: 'Sin brechas — sistema y bodega alineados ✔', en: 'No gaps — system and warehouse aligned ✔' },
    compras: { es: 'Compras', en: 'Purchases' },
    comprasCaption: {
      es: 'Una entrada → inventario y costos en ambos sistemas',
      en: 'One entry → inventory and costs in both systems',
    },
    syncPurchases: { es: 'Sincronizar compras', en: 'Sync purchases' },
    purchasesSynced: { es: 'Compras sincronizadas en ambos sistemas', en: 'Purchases synced in both systems' },
    colCompra: { es: 'N° Compra', en: 'Purchase no.' },
    colProveedor: { es: 'Proveedor', en: 'Supplier' },
    colItems: { es: 'Ítems', en: 'Items' },
    unmapped: { es: 'Sin mapear', en: 'Unmapped' },
    receipts: { es: 'Cumplidos de contenedores', en: 'Container delivery receipts' },
    receiptsCaption: {
      es: 'Cumplido digital con checklist y novedades — la contabilidad ve cumplidos verificados automáticamente',
      en: 'Digital receipt with checklist and issues — accounting sees verified receipts automatically',
    },
    colCumplido: { es: 'Cumplido', en: 'Receipt' },
    colFechaRecibo: { es: 'Fecha recibo', en: 'Receipt date' },
    colChecklist: { es: 'Checklist', en: 'Checklist' },
    novelty: { es: 'Novedad', en: 'Issue' },
    colEstadoContable: { es: 'Estado contable', en: 'Accounting status' },
    novNone: { es: 'Sin novedad', en: 'No issues' },
    novShort: { es: 'Faltante {n} unds', en: '{n} units short' },
    novDamage: { es: 'Avería empaque', en: 'Packaging damage' },
    novPrice: { es: 'Precio diferente', en: 'Price mismatch' },
    postedBoth: { es: 'Posteado en ambos sistemas', en: 'Posted in both systems' },
    attachments: { es: 'Adjuntos', en: 'Attachments' },
    pipeline: { es: 'Relación de despachos', en: 'Dispatch relation report' },
    pipelineCaption: {
      es: 'Base del análisis de fletes y de la regla de demora en comisiones',
      en: 'Basis for freight analysis and the commission delay rule',
    },
    colChain: {
      es: 'Despacho → Pedido → Factura → Flete → Zona',
      en: 'Dispatch → Order → Invoice → Freight → Zone',
    },
    colCliente: { es: 'Cliente', en: 'Customer' },
    colFechaDespacho: { es: 'Fecha despacho', en: 'Dispatch date' },
    unassigned: { es: 'sin asignar', en: 'unassigned' },
    inWarehouse: { es: 'En bodega', en: 'In warehouse' },
    fleteLabel: { es: 'Flete {pct}', en: 'Freight {pct}' },
    zonaLabel: { es: 'Zona: {zona}', en: 'Zone: {zona}' },
    dispatchCreated: { es: 'Despacho creado para {ref}', en: 'Dispatch created for {ref}' },
    compraSummary: { es: 'Resumen', en: 'Summary' },
    compraTimeline: { es: 'Trazabilidad', en: 'Timeline' },
    compraCompare: { es: 'Comparación SIIGO vs HGI', en: 'SIIGO vs HGI comparison' },
    compraStepEntered: { es: 'Ingresada en SIIGO', en: 'Entered in SIIGO' },
    compraStepValidated: { es: 'Validada', en: 'Validated' },
    compraStepSynced: { es: 'Sincronizada a HGI', en: 'Synced to HGI' },
    compraStepPending: { es: 'Sincronización pendiente', en: 'Sync pending' },
    fieldBase: { es: 'Base gravable', en: 'Taxable base' },
    fieldIva: { es: 'IVA', en: 'VAT' },
    fieldValor: { es: 'Valor total', en: 'Total amount' },
    matchOk: { es: 'Coincide', en: 'Matches' },
    exportQueued: { es: 'Exportación generada — descarga lista', en: 'Export generated — download ready' },
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
