/**
 * Importar — Excel/CSV import + OCR scan extraction.
 * LIVE mode: persists to Supabase (importaciones / ocr_documentos / target tables).
 * DEMO mode: works locally with a notice (nothing persists).
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import {
  FileUp, FileSpreadsheet, ScanText, Loader2, CheckCircle2, AlertTriangle,
  Table2, History, BrainCircuit, FileText,
} from 'lucide-react';
import { useLanguage } from '@/i18n';
import PageHeader from '@/components/PageHeader';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { isLiveMode } from '@/lib/mode';

type Tab = 'excel' | 'ocr' | 'historial';

interface ParsedSheet { name: string; headers: string[]; rows: Record<string, string | number>[] }
interface OcrFields { fechas: string[]; montos: string[]; documentos: string[]; contenedores: string[]; nits: string[]; correos: string[] }
interface HistoryRow { id: string; tipo: string; archivo: string | null; filas?: number; created_at?: string; confianza?: number | null }

const TARGET_TABLES = ['terceros', 'contenedores', 'documentos'] as const;

export default function Importar() {
  const { t, formatDate } = useLanguage();
  const [tab, setTab] = useState<Tab>('excel');
  const live = isLiveMode();

  return (
    <div className="space-y-6">
      <PageHeader title={t('imp.title')} caption={t('imp.caption')} />
      {!live && (
        <div className="rounded-lg border px-4 py-2.5 text-[12px]"
          style={{ borderColor: 'rgba(245,158,11,0.4)', color: '#F59E0B', background: 'rgba(245,158,11,0.08)' }}>
          {t('imp.demoNotice')}
        </div>
      )}
      <div className="flex gap-1 border-b border-border-strong">
        {(['excel', 'ocr', 'historial'] as Tab[]).map((k) => (
          <button key={k} onClick={() => setTab(k)}
            className="flex items-center gap-2 border-b-2 px-4 py-2.5 text-[13px] font-medium transition-colors"
            style={{
              borderColor: tab === k ? 'var(--brand)' : 'transparent',
              color: tab === k ? 'var(--brand)' : 'var(--txt-muted)',
            }}>
            {k === 'excel' && <FileSpreadsheet className="size-4" />}
            {k === 'ocr' && <ScanText className="size-4" />}
            {k === 'historial' && <History className="size-4" />}
            {t(`imp.tab.${k}`)}
          </button>
        ))}
      </div>
      {tab === 'excel' && <ExcelTab live={live} />}
      {tab === 'ocr' && <OcrTab live={live} />}
      {tab === 'historial' && <HistoryTab live={live} formatDate={formatDate} />}
    </div>
  );
}

/* ───────────────────────────── EXCEL TAB ───────────────────────────── */
function ExcelTab({ live }: { live: boolean }) {
  const { t, formatNumber } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [sheet, setSheet] = useState<ParsedSheet | null>(null);
  const [target, setTarget] = useState<string>(TARGET_TABLES[0]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: number; err: number } | null>(null);
  const [fileName, setFileName] = useState('');

  const onFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setResult(null);
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, string | number>>(ws, { defval: '' });
    const headers = json.length ? Object.keys(json[0]) : [];
    setSheet({ name: wb.SheetNames[0], headers, rows: json });
  }, []);

  const doImport = useCallback(async () => {
    if (!sheet || !live) return;
    setBusy(true);
    const client = getSupabaseClient()!;
    let ok = 0, err = 0;
    for (const row of sheet.rows) {
      const { error } = await client.from(target).insert(row as never);
      if (error) err++; else ok++;
    }
    await client.from('importaciones').insert({
      tipo: 'excel', archivo: fileName, tabla_destino: target, filas: ok,
      resumen: { hoja: sheet.name, columnas: sheet.headers, errores: err },
    } as never);
    setResult({ ok, err });
    setBusy(false);
  }, [sheet, live, target, fileName]);

  return (
    <div className="space-y-5">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void onFile(f); }}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border-strong py-12 transition-colors hover:border-[var(--brand)]"
      >
        <FileSpreadsheet className="size-10" style={{ color: 'var(--brand)' }} />
        <p className="text-[14px] font-medium text-txt-primary">{t('imp.excel.drop')}</p>
        <p className="text-[12px] text-txt-muted">{t('imp.excel.formats')}</p>
        <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }} />
      </div>

      {sheet && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full px-3 py-1 text-[12px] font-medium"
              style={{ background: 'rgba(56,189,248,0.12)', color: 'var(--sync)' }}>
              {fileName} · {formatNumber(sheet.rows.length)} {t('imp.excel.rows')} · {sheet.headers.length} {t('imp.excel.cols')}
            </span>
            <select value={target} onChange={(e) => setTarget(e.target.value)}
              className="rounded-lg border border-border-strong bg-overlay px-3 py-1.5 text-[13px] text-txt-primary">
              {TARGET_TABLES.map((tb) => <option key={tb} value={tb}>{t(`imp.excel.target.${tb}`)}</option>)}
            </select>
            <button onClick={() => void doImport()} disabled={busy || !live}
              className="flex items-center gap-2 rounded-lg px-4 py-1.5 text-[13px] font-semibold text-[#041210] disabled:opacity-50"
              style={{ background: 'var(--brand)' }}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
              {busy ? t('imp.excel.importing') : t('imp.excel.import')}
            </button>
          </div>
          {result && (
            <div className="flex items-center gap-2 text-[13px]">
              {result.err === 0
                ? <><CheckCircle2 className="size-4" style={{ color: 'var(--brand)' }} /><span style={{ color: 'var(--brand)' }}>{result.ok} {t('imp.excel.okRows')}</span></>
                : <><AlertTriangle className="size-4 text-amber-400" /><span className="text-amber-400">{result.ok} ok · {result.err} {t('imp.excel.errRows')}</span></>}
            </div>
          )}
          <div className="overflow-auto rounded-xl border border-border-strong">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border-strong bg-overlay">
                  {sheet.headers.map((h) => <th key={h} className="px-3 py-2 text-left font-semibold text-txt-secondary">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {sheet.rows.slice(0, 8).map((r, i) => (
                  <tr key={i} className="border-b border-border-subtle">
                    {sheet.headers.map((h) => <td key={h} className="px-3 py-1.5 text-txt-primary">{String(r[h]).slice(0, 40)}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {sheet.rows.length > 8 && <p className="px-3 py-2 text-[11px] text-txt-muted">+{sheet.rows.length - 8} {t('imp.excel.more')}</p>}
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ───────────────────────────── OCR TAB ───────────────────────────── */
function OcrTab({ live }: { live: boolean }) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [fields, setFields] = useState<OcrFields | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [fileName, setFileName] = useState('');

  const extractFields = useCallback((txt: string): OcrFields => ({
    fechas: [...new Set(txt.match(/\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b/g) ?? [])].slice(0, 6),
    montos: [...new Set(txt.match(/[$€]?\s?\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{1,2})?\s?(?:COP|USD|HKD)?/gi) ?? [])].filter(m => /\d{3}/.test(m)).slice(0, 8),
    documentos: [...new Set(txt.match(/\b(?:RC|FV|OC|CA|E|BL|INV|FAC)[-–\s]?\d{3,}[-\w]*/gi) ?? [])].slice(0, 8),
    contenedores: [...new Set(txt.match(/\b[A-Z]{4}\s?\d{7}\b/g) ?? [])].slice(0, 4),
    nits: [...new Set(txt.match(/\b\d{8,10}[-\s]?\d\b/g) ?? [])].slice(0, 4),
    correos: [...new Set(txt.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? [])].slice(0, 4),
  }), []);

  const onFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setSaved(false); setText(''); setFields(null); setConfidence(null);
    const url = URL.createObjectURL(file);
    setImage(url);
    setBusy(true); setProgress(0);
    try {
      const res = await Tesseract.recognize(file, 'spa+eng', {
        logger: (m) => { if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100)); },
      });
      const txt = res.data.text;
      setText(txt);
      setFields(extractFields(txt));
      setConfidence(Math.round(res.data.confidence * 100) / 100);
      if (live) {
        const client = getSupabaseClient()!;
        await client.from('ocr_documentos').insert({
          archivo: file.name, motor: 'tesseract.js (spa+eng)', texto: txt,
          campos: extractFields(txt), confianza: res.data.confidence,
        } as never);
        setSaved(true);
      }
    } finally {
      setBusy(false);
    }
  }, [live, extractFields]);

  const fieldCards = useMemo(() => fields ? ([
    ['fechas', fields.fechas], ['montos', fields.montos], ['documentos', fields.documentos],
    ['contenedores', fields.contenedores], ['nits', fields.nits], ['correos', fields.correos],
  ] as const).filter(([, v]) => v.length > 0) : [], [fields]);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="space-y-4">
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void onFile(f); }}
          className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border-strong py-10 transition-colors hover:border-[var(--sync)]"
        >
          <ScanText className="size-10" style={{ color: 'var(--sync)' }} />
          <p className="text-[14px] font-medium text-txt-primary">{t('imp.ocr.drop')}</p>
          <p className="text-[12px] text-txt-muted">{t('imp.ocr.formats')}</p>
          <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f); }} />
        </div>
        {image && (
          <div className="overflow-hidden rounded-xl border border-border-strong">
            <img src={image} alt={fileName} className="max-h-72 w-full object-contain bg-black/40" />
          </div>
        )}
        {busy && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[13px] text-txt-secondary">
              <Loader2 className="size-4 animate-spin" style={{ color: 'var(--sync)' }} />
              {t('imp.ocr.reading')} {progress}%
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-overlay">
              <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--sync)' }} />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {confidence !== null && (
          <div className="flex flex-wrap items-center gap-2 text-[12px]">
            <span className="rounded-full px-3 py-1 font-medium" style={{ background: 'rgba(22,199,132,0.12)', color: 'var(--brand)' }}>
              <BrainCircuit className="mr-1 inline size-3.5" />{t('imp.ocr.confidence')}: {confidence}%
            </span>
            {saved && <span className="rounded-full px-3 py-1 font-medium" style={{ background: 'rgba(56,189,248,0.12)', color: 'var(--sync)' }}>
              <CheckCircle2 className="mr-1 inline size-3.5" />{t('imp.ocr.savedDb')}
            </span>}
          </div>
        )}
        {fieldCards.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2">
            {fieldCards.map(([k, vals]) => (
              <div key={k} className="rounded-xl border border-border-strong p-3">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-txt-muted">{t(`imp.ocr.field.${k}`)}</p>
                <div className="flex flex-wrap gap-1.5">
                  {vals.map((v) => (
                    <span key={v} className="rounded-md bg-overlay px-2 py-0.5 font-mono text-[11px] text-txt-primary">{v}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {text && (
          <div className="rounded-xl border border-border-strong">
            <div className="flex items-center gap-2 border-b border-border-strong px-3 py-2 text-[12px] font-semibold text-txt-secondary">
              <FileText className="size-4" />{t('imp.ocr.rawText')}
            </div>
            <pre className="max-h-64 overflow-auto whitespace-pre-wrap p-3 font-mono text-[11px] leading-relaxed text-txt-secondary">{text}</pre>
          </div>
        )}
        {!text && !busy && (
          <div className="flex h-full min-h-40 items-center justify-center rounded-xl border border-border-strong text-[13px] text-txt-muted">
            {t('imp.ocr.empty')}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────── HISTORY TAB ───────────────────────────── */
function HistoryTab({ live, formatDate }: { live: boolean; formatDate: (d: string) => string }) {
  const { t } = useLanguage();
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useMemo(() => {
    if (!live || loaded) return;
    void (async () => {
      const client = getSupabaseClient()!;
      const [{ data: imps }, { data: ocrs }] = await Promise.all([
        client.from('importaciones').select('*').order('created_at', { ascending: false }).limit(20),
        client.from('ocr_documentos').select('id, archivo, motor, confianza, created_at').order('created_at', { ascending: false }).limit(20),
      ]);
      const merged: HistoryRow[] = [
        ...(imps ?? []).map((r) => ({ id: r.id as string, tipo: 'excel', archivo: r.archivo as string, filas: r.filas as number, created_at: r.created_at as string })),
        ...(ocrs ?? []).map((r) => ({ id: r.id as string, tipo: 'ocr', archivo: r.archivo as string, confianza: r.confianza as number, created_at: r.created_at as string })),
      ].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
      setRows(merged);
      setLoaded(true);
    })();
  }, [live, loaded]);

  if (!live) return <p className="text-[13px] text-txt-muted">{t('imp.hist.demoEmpty')}</p>;
  return (
    <div className="overflow-hidden rounded-xl border border-border-strong">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-border-strong bg-overlay text-left">
            <th className="px-3 py-2 font-semibold text-txt-secondary">{t('imp.hist.type')}</th>
            <th className="px-3 py-2 font-semibold text-txt-secondary">{t('imp.hist.file')}</th>
            <th className="px-3 py-2 font-semibold text-txt-secondary">{t('imp.hist.detail')}</th>
            <th className="px-3 py-2 font-semibold text-txt-secondary">{t('imp.hist.date')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border-subtle">
              <td className="px-3 py-2">
                <span className="flex items-center gap-1.5" style={{ color: r.tipo === 'excel' ? 'var(--brand)' : 'var(--sync)' }}>
                  {r.tipo === 'excel' ? <Table2 className="size-3.5" /> : <ScanText className="size-3.5" />}
                  {r.tipo.toUpperCase()}
                </span>
              </td>
              <td className="px-3 py-2 text-txt-primary">{r.archivo}</td>
              <td className="px-3 py-2 text-txt-muted">{r.filas !== undefined ? `${r.filas} filas` : `${r.confianza ?? '—'}%`}</td>
              <td className="px-3 py-2 text-txt-muted">{r.created_at ? formatDate(r.created_at) : '—'}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4} className="px-3 py-8 text-center text-txt-muted">{t('imp.hist.empty')}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
