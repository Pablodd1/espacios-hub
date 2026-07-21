import type { Banco } from '@/lib/types';

/**
 * Display metadata for the three company bank accounts.
 * The seed schema (`Banco`) carries only id/nombre/sistema_origen; account
 * masks, balances, 7-day sparklines and the SIIGO↔HGI ledger mapping are
 * presentation constants required by tesoreria.md §[B].
 */
export interface BankDisplayMeta {
  /** Masked account number, e.g. `****4521`. */
  mask: string;
  /** Current balance in COP. */
  saldo: number;
  /** 7-day balance sparkline (billions of COP — shape only). */
  spark: number[];
  /** SIIGO ledger account code. */
  siigoCuenta: string;
  /** HGI ledger account code. */
  hgiCuenta: string;
}

export const BANK_META: Record<string, BankDisplayMeta> = {
  'ban-001': {
    mask: '****4521',
    saldo: 4_820_500_000,
    spark: [4.61, 4.68, 4.55, 4.72, 4.79, 4.74, 4.82],
    siigoCuenta: '1110-0501',
    hgiCuenta: '1105-0101',
  },
  'ban-002': {
    mask: '****7832',
    saldo: 1_912_300_000,
    spark: [1.98, 1.94, 1.99, 1.9, 1.93, 1.89, 1.91],
    siigoCuenta: '1110-0502',
    hgiCuenta: '1105-0102',
  },
  'ban-003': {
    mask: '****2210',
    saldo: 6_540_800_000,
    spark: [6.32, 6.41, 6.5, 6.44, 6.58, 6.49, 6.54],
    siigoCuenta: '1110-0503',
    hgiCuenta: '1105-0103',
  },
};

const FALLBACK: BankDisplayMeta = {
  mask: '****0000',
  saldo: 0,
  spark: [0, 0, 0, 0, 0, 0, 0],
  siigoCuenta: '1110-0000',
  hgiCuenta: '1105-0000',
};

export function getBankMeta(banco: Banco | null | undefined): BankDisplayMeta {
  return (banco && BANK_META[banco.id]) || FALLBACK;
}
