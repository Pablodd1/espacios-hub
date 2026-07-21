import type { DictKey } from '@/i18n';
import type { ContenedorEstado } from '@/lib/types';

/** 4-stage container lifecycle order (en tránsito → arribado → levante → entregado). */
export const LIFECYCLE_ORDER: ContenedorEstado[] = ['en_transito', 'arribado', 'levante', 'entregado'];

/** Stage → i18n label key (comex.*). */
export const STAGE_LABEL_KEYS: Record<ContenedorEstado, DictKey> = {
  en_transito: 'comex.stage.transit',
  arribado: 'comex.stage.arrived',
  levante: 'comex.stage.levante',
  entregado: 'comex.stage.delivered',
};
