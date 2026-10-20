'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  FileText,
  ShoppingCart,
  Truck,
  Receipt,
  Plus,
  Upload,
  Download,
  Eye,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Calendar,
  ChevronRight,
  X,
  Trash2,
  Edit3,
  FolderTree,
  Database,
  Copy,
  Check,
  RefreshCw,
  FileCheck,
  Briefcase,
  Layers,
  SlidersHorizontal
} from 'lucide-react';

// ============================================================================
// CONSTANTES DE NEGOCIO: MÓDULOS, 7 ESTADOS Y ENTIDADES DEL ESTADO
// ============================================================================

const MODULOS = [
  {
    id: 'resumen',
    nombre: 'Panel Resumen',
    nombreCorto: 'Resumen',
    icono: Layers,
    descripcion: 'Control de órdenes por entregar, entregas sin facturar y facturas pendientes de cobro'
  },
  {
    id: 'cotizacion',
    nombre: 'Cotizaciones',
    nombreCorto: 'Cotizaciones',
    prefijo: 'COT',
    icono: FileText,
    descripcion: 'Solicitudes de cotización y estudios de mercado enviados a entidades'
  },
  {
    id: 'orden_compra',
    nombre: 'Órdenes de Compra (OC / OS)',
    nombreCorto: 'Órdenes (OC/OS)',
    prefijo: 'OC',
    icono: ShoppingCart,
    descripcion: 'Órdenes de Compra y Servicio notificadas vía SEACE / correo institucional'
  },
  {
    id: 'guia_remision',
    nombre: 'Guías de Remisión',
    nombreCorto: 'Guías',
    prefijo: 'EG01',
    icono: Truck,
    descripcion: 'Sustento de internamiento y entrega en almacén con sello de recepción'
  },
  {
    id: 'factura',
    nombre: 'Facturas Electrónicas',
    nombreCorto: 'Facturas',
    prefijo: 'F001',
    icono: Receipt,
    descripcion: 'Comprobantes emitidos en seguimiento de devengado, giro y abono en cuenta'
  },
  {
    id: 'arquitectura',
    nombre: 'Código & Supabase',
    nombreCorto: 'Setup & SQL',
    icono: Database,
    descripcion: 'Estructura de carpetas Next.js, variables .env.local y script SQL de Supabase'
  }
];

const ESTADOS = [
  {
    valor: 'Cotizado / Registrado',
    paso: 1,
    colorBadge: 'bg-slate-100 text-slate-800 border-slate-300',
    colorDot: 'bg-slate-500',
    colorBarra: 'bg-slate-500',
    etapa: 'Inicial'
  },
  {
    valor: 'Notificado (Orden emitida)',
    paso: 2,
    colorBadge: 'bg-sky-50 text-sky-800 border-sky-200',
    colorDot: 'bg-sky-500',
    colorBarra: 'bg-sky-500',
    etapa: 'Por atender'
  },
  {
    valor: 'En procedimiento / En proceso',
    paso: 3,
    colorBadge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    colorDot: 'bg-indigo-500',
    colorBarra: 'bg-indigo-500',
    etapa: 'En ejecución'
  },
  {
    valor: 'Entregado (con o sin guía)',
    paso: 4,
    colorBadge: 'bg-teal-50 text-teal-800 border-teal-200',
    colorDot: 'bg-teal-500',
    colorBarra: 'bg-teal-500',
    etapa: 'Internado'
  },
  {
    valor: 'Entregado pero no facturado',
    paso: 5,
    colorBadge: 'bg-amber-50 text-amber-900 border-amber-300',
    colorDot: 'bg-amber-500',
    colorBarra: 'bg-amber-500',
    etapa: 'Falta facturar'
  },
  {
    valor: 'Facturado y pendiente de pago (Por cobrar)',
    paso: 6,
    colorBadge: 'bg-orange-50 text-orange-900 border-orange-300',
    colorDot: 'bg-orange-500',
    colorBarra: 'bg-orange-500',
    etapa: 'Por cobrar'
  },
  {
    valor: 'Pagado / Concluido',
    paso: 7,
    colorBadge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    colorDot: 'bg-emerald-500',
    colorBarra: 'bg-emerald-600',
    etapa: 'Concluido'
  }
];

const ENTIDADES_CATALOGO = [
  {
    sigla: 'MML',
    nombre: 'Municipalidad Metropolitana de Lima',
    ruc: '20131380951',
    color: 'bg-blue-50 text-blue-800 border-blue-200'
  },
  {
    sigla: 'PRODUCE',
    nombre: 'Ministerio de la Producción',
    ruc: '20504794637',
    color: 'bg-rose-50 text-rose-800 border-rose-200'
  },
  {
    sigla: 'SBS',
    nombre: 'Superintendencia de Banca, Seguros y AFP',
    ruc: '20131370564',
    color: 'bg-purple-50 text-purple-800 border-purple-200'
  },
  {
    sigla: 'Chilca',
    nombre: 'Municipalidad Distrital de Chilca',
    ruc: '20162292376',
    color: 'bg-teal-50 text-teal-800 border-teal-200'
  }
];

// Generador de PDF real en memoria (válido para previsualizar en iframe o descargar en PC/Celular)
function createSamplePdfDataUri(doc) {
  const cleanText = (str) =>
    String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[()\\]/g, '');

  const lines = [
    'DOCUMENTO DE CONTRATACION CON EL ESTADO',
    '------------------------------------------------------------',
    `Documento : ${cleanText(doc.numero)}`,
    `Tipo      : ${cleanText(doc.tipo.toUpperCase())}`,
    `Entidad   : ${cleanText(doc.entidad)}`,
    `Concepto  : ${cleanText(doc.descripcion).slice(0, 65)}`,
    `Monto     : S/ ${Number(doc.monto || 0).toFixed(2)}`,
    `Fecha     : ${cleanText(doc.fecha_emision)}`,
    `Estado    : ${cleanText(doc.estado)}`,
    `SIAF/Ref  : ${cleanText(doc.siaf_expediente || 'SIAF-2026-ACTIVO')}`,
    '------------------------------------------------------------',
    'Constancia digital almacenada en Supabase Storage (Bucket PDF).'
  ];

  let textOps = 'BT\n/F1 12 Tf\n50 750 Td\n18 TL\n';
  lines.forEach((line, idx) => {
    if (idx === 0) {
      textOps += `(${line}) Tj\n`;
    } else {
      textOps += `T* (${line}) Tj\n`;
    }
  });
  textOps += 'ET';

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${textOps.length} >>\nstream\n${textOps}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((obj) => {
    offsets.push(pdf.length);
    pdf += obj;
  });
  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  return 'data:application/pdf;base64,' + btoa(pdf);
}

const REGISTROS_INICIALES = [
  {
    id: 'reg-001',
    tipo: 'factura',
    numero: 'F001-000418',
    entidad: 'MML',
    descripcion: 'Adquisición de tóners y suministros de impresión para Gerencia de Administración',
    siaf_expediente: 'SIAF-2026-009412',
    orden_vinculada: 'OC-2026-00512',
    monto: 18450.0,
    fecha_emision: '2026-10-04',
    fecha_compromiso: '2026-10-25',
    estado: 'Facturado y pendiente de pago (Por cobrar)',
    archivo_pdf_nombre: 'Factura_F001-000418_MML.pdf',
    observaciones: 'Con conformidad de almacén central MML; en espera de fase Girado en SIAF.'
  },
  {
    id: 'reg-002',
    tipo: 'factura',
    numero: 'F001-000423',
    entidad: 'PRODUCE',
    descripcion: 'Suministro de equipos de protección personal y chalecos institucionales',
    siaf_expediente: 'SIAF-2026-011820',
    orden_vinculada: 'OC-2026-00689',
    monto: 32900.0,
    fecha_emision: '2026-10-10',
    fecha_compromiso: '2026-10-28',
    estado: 'Facturado y pendiente de pago (Por cobrar)',
    archivo_pdf_nombre: 'Factura_F001-000423_PRODUCE.pdf',
    observaciones: 'Expediente en Tesorería de PRODUCE con CCI validado.'
  },
  {
    id: 'reg-003',
    tipo: 'orden_compra',
    numero: 'OC-2026-00814',
    entidad: 'SBS',
    descripcion: 'Provisión de papel bond 80g A4 y material de archivo institucional',
    siaf_expediente: 'EXP-SBS-2026-441',
    orden_vinculada: 'COT-2026-0190',
    monto: 14200.5,
    fecha_emision: '2026-10-14',
    fecha_compromiso: '2026-10-23',
    estado: 'Notificado (Orden emitida)',
    archivo_pdf_nombre: 'OC_2026_00814_SBS_Firmada.pdf',
    observaciones: 'Plazo de entrega: 7 días calendario en sede San Isidro.'
  },
  {
    id: 'reg-004',
    tipo: 'orden_compra',
    numero: 'OC-2026-00831',
    entidad: 'Chilca',
    descripcion: 'Adquisición de herramientas y kits de mantenimiento para áreas verdes',
    siaf_expediente: 'SIAF-2026-003190',
    orden_vinculada: 'COT-2026-0204',
    monto: 24680.0,
    fecha_emision: '2026-10-15',
    fecha_compromiso: '2026-10-24',
    estado: 'En procedimiento / En proceso',
    archivo_pdf_nombre: 'OC_2026_00831_MunChilca.pdf',
    observaciones: 'Mercadería en preparación de despacho para almacén municipal de Chilca.'
  },
  {
    id: 'reg-005',
    tipo: 'guia_remision',
    numero: 'EG01-000319',
    entidad: 'MML',
    descripcion: 'Entrega total de mobiliario ergonómico de oficina (45 sillas giratorias)',
    siaf_expediente: 'SIAF-2026-009880',
    orden_vinculada: 'OC-2026-00740',
    monto: 29700.0,
    fecha_emision: '2026-10-16',
    fecha_compromiso: '2026-10-21',
    estado: 'Entregado pero no facturado',
    archivo_pdf_nombre: 'Guia_EG01-000319_Sellada_MML.pdf',
    observaciones: 'Guía sellada por almacén MML; falta emitir Factura Electrónica.'
  },
  {
    id: 'reg-006',
    tipo: 'guia_remision',
    numero: 'EG01-000312',
    entidad: 'PRODUCE',
    descripcion: 'Internamiento de equipos de cómputo portátiles y accesorios',
    siaf_expediente: 'SIAF-2026-011820',
    orden_vinculada: 'OC-2026-00689',
    monto: 32900.0,
    fecha_emision: '2026-10-08',
    fecha_compromiso: '2026-10-09',
    estado: 'Entregado (con o sin guía)',
    archivo_pdf_nombre: 'Guia_EG01-000312_PRODUCE.pdf',
    observaciones: 'Conformidad firmada por OTI PRODUCE.'
  },
  {
    id: 'reg-007',
    tipo: 'cotizacion',
    numero: 'COT-2026-0245',
    entidad: 'SBS',
    descripcion: 'Cotización de luminarias LED industriales y tableros eléctricos',
    siaf_expediente: 'SOL-SBS-2026-892',
    orden_vinculada: '-',
    monto: 19850.0,
    fecha_emision: '2026-10-18',
    fecha_compromiso: '2026-10-26',
    estado: 'Cotizado / Registrado',
    archivo_pdf_nombre: 'Cotizacion_COT-2026-0245_SBS.pdf',
    observaciones: 'Enviada por mesa de partes virtual; en evaluación de indagación de mercado.'
  },
  {
    id: 'reg-008',
    tipo: 'factura',
    numero: 'F001-000399',
    entidad: 'Chilca',
    descripcion: 'Suministro de materiales eléctricos para alumbrado de parques zonales',
    siaf_expediente: 'SIAF-2026-002710',
    orden_vinculada: 'OC-2026-00490',
    monto: 15600.0,
    fecha_emision: '2026-09-22',
    fecha_compromiso: '2026-10-05',
    estado: 'Pagado / Concluido',
    archivo_pdf_nombre: 'Factura_F001-000399_Cancelada.pdf',
    observaciones: 'Abonado en cuenta corriente CCI Banco de la Nación / BCP.'
  }
];

// ============================================================================
// SNIPPETS DE CÓDIGO Y CONFIGURACIÓN PARA EL TAB "CÓDIGO & SUPABASE"
// ============================================================================

const ESTRUCTURA_CARPETAS_TXT = `gestion-contrataciones-estado/
├── .env.local                  # Variables de entorno privadas de Supabase
├── package.json                # Next.js 14, @supabase/supabase-js, lucide-react, tailwindcss
├── next.config.mjs             # Configuración de Next.js App Router
├── tailwind.config.ts          # Configuración de estilos y responsive design
├── supabase/
│   └── schema.sql              # Tabla contrataciones_documentos, RLS y Bucket PDF
└── src/
    ├── types/
    │   └── contrataciones.ts   # Tipado de los 4 módulos y los 7 estados oficiales
    ├── lib/
    │   └── supabase.ts         # Cliente Supabase + función uploadDocumentoPdf()
    └── app/
        ├── globals.css         # Estilos base Tailwind CSS
        ├── layout.tsx          # Layout principal en español
        └── page.tsx            # Aplicación completa con los 4 módulos, filtros y visor PDF`;

const SUPABASE_URL_DEFAULT = 'https://giscopvcchycdvwcffub.supabase.co';
const SUPABASE_ANON_KEY_DEFAULT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpc2NvcHZjY2h5Y2R2d2NmZnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1MTEwNzEsImV4cCI6MjEwODA4NzA3MX0.PTD84nde14l3DzPKdtbA5J2ohgiLSTwzjb8eu8J4lTE';
const SUPABASE_BUCKET_DEFAULT = 'documentos-contrataciones';

const ENV_LOCAL_TXT = `# Archivo: .env.local (Ya configurado con tus credenciales reales de Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://giscopvcchycdvwcffub.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdpc2NvcHZjY2h5Y2R2d2NmZnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1MTEwNzEsImV4cCI6MjEwODA4NzA3MX0.PTD84nde14l3DzPKdtbA5J2ohgiLSTwzjb8eu8J4lTE
NEXT_PUBLIC_STORAGE_BUCKET=documentos-contrataciones`;

const SQL_SUPABASE_TXT = `-- Ejecutar en Supabase Dashboard -> SQL Editor -> New Query
create extension if not exists "uuid-ossp";

create table if not exists public.contrataciones_documentos (
  id uuid primary key default uuid_generate_v4(),
  tipo text not null check (tipo in ('cotizacion', 'orden_compra', 'guia_remision', 'factura')),
  numero text not null,
  entidad text not null,
  descripcion text not null,
  siaf_expediente text,
  orden_vinculada text,
  monto numeric(12, 2) not null default 0.00,
  fecha_emision date not null default current_date,
  fecha_compromiso date,
  estado text not null default 'Cotizado / Registrado' check (
    estado in (
      'Cotizado / Registrado',
      'Notificado (Orden emitida)',
      'En procedimiento / En proceso',
      'Entregado (con o sin guía)',
      'Entregado pero no facturado',
      'Facturado y pendiente de pago (Por cobrar)',
      'Pagado / Concluido'
    )
  ),
  archivo_pdf_nombre text,
  archivo_pdf_path text,
  archivo_pdf_url text,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Crear Bucket en Supabase Storage para los PDFs (OC firmadas, guías, facturas)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documentos-contrataciones', 'documentos-contrataciones', true, 15728640, array['application/pdf'])
on conflict (id) do nothing;

-- Políticas de acceso a Storage y Tabla
alter table public.contrataciones_documentos enable row level security;
create policy "Acceso total app privada" on public.contrataciones_documentos for all using (true) with check (true);
create policy "Lectura PDFs" on storage.objects for select using (bucket_id = 'documentos-contrataciones');
create policy "Subida PDFs" on storage.objects for insert with check (bucket_id = 'documentos-contrataciones');`;

const SUPABASE_CLIENT_TXT = `// Archivo: src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || 'documentos-contrataciones';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function subirArchivoPdf(file: File, registroId: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = \`registros/\${registroId}/\${Date.now()}_\${safeName}\`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, { contentType: 'application/pdf', upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return { nombre: file.name, path: filePath, url: data.publicUrl };
}

// Funciones CRUD hacia PostgreSQL en Supabase:
export async function listarDocumentos() {
  const { data, error } = await supabase
    .from('contrataciones_documentos')
    .select('*')
    .order('fecha_emision', { ascending: false });
  if (error) throw error;
  return data;
}

export async function actualizarEstadoDocumento(id: string, nuevoEstado: string) {
  const { error } = await supabase
    .from('contrataciones_documentos')
    .update({ estado: nuevoEstado })
    .eq('id', id);
  if (error) throw error;
}`;

// ============================================================================
// COMPONENTE PRINCIPAL DE LA APLICACIÓN
// ============================================================================

export default function App() {
  const [registros, setRegistros] = useState(() =>
    REGISTROS_INICIALES.map((r) => ({
      ...r,
      archivo_pdf_url: createSamplePdfDataUri(r)
    }))
  );

  const [pestanaActiva, setPestanaActiva] = useState('resumen');
  const [filtroAlertaRapida, setFiltroAlertaRapida] = useState('todos');
  const [filtroEntidad, setFiltroEntidad] = useState('TODAS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');

  // Modal de Crear / Editar Registro
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicionId, setModoEdicionId] = useState(null);
  const [formTipo, setFormTipo] = useState('orden_compra');
  const [formNumero, setFormNumero] = useState('');
  const [formEntidad, setFormEntidad] = useState('MML');
  const [formOtraEntidad, setFormOtraEntidad] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formSiaf, setFormSiaf] = useState('');
  const [formOrdenVinculada, setFormOrdenVinculada] = useState('');
  const [formMonto, setFormMonto] = useState('');
  const [formFechaEmision, setFormFechaEmision] = useState('2026-10-20');
  const [formFechaCompromiso, setFormFechaCompromiso] = useState('2026-10-30');
  const [formEstado, setFormEstado] = useState('Cotizado / Registrado');
  const [formObservaciones, setFormObservaciones] = useState('');
  const [formArchivoNombre, setFormArchivoNombre] = useState('');
  const [formArchivoUrl, setFormArchivoUrl] = useState('');

  // Modal de Visualización de PDF (PC y Celular)
  const [pdfEnVista, setPdfEnVista] = useState(null);

  // Modal de Confirmación de Eliminación
  const [registroPorEliminar, setRegistroPorEliminar] = useState(null);

  // Notificación Toast y Estado de Conexión en Vivo a Supabase
  const [toastMsg, setToastMsg] = useState(null);
  const [codigoCopiado, setCodigoCopiado] = useState('');
  const [estadoNube, setEstadoNube] = useState('conectando'); // 'conectado' | 'falta_sql' | 'local' | 'conectando'
  const [sincronizando, setSincronizando] = useState(false);

  // Referencia de input file para adjuntar rápido desde cualquier fila
  const fileInputFilaRef = useRef(null);
  const [idFilaSubiendoPdf, setIdFilaSubiendoPdf] = useState(null);

  // Helper para llamadas REST a tu proyecto Supabase (giscopvcchycdvwcffub)
  const supabaseHeaders = {
    apikey: SUPABASE_ANON_KEY_DEFAULT,
    Authorization: `Bearer ${SUPABASE_ANON_KEY_DEFAULT}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };

  const cargarDesdeSupabase = async (mostrarAviso = false) => {
    setSincronizando(true);
    try {
      const res = await fetch(
        `https://giscopvcchycdvwcffub.supabase.co/rest/v1/contrataciones_documentos?select=*&order=created_at.desc`,
        { headers: supabaseHeaders }
      );
      if (res.ok) {
        const data = await res.json();
        setEstadoNube('conectado');
        if (Array.isArray(data) && data.length > 0) {
          const normalizados = data.map((d) => ({
            ...d,
            monto: Number(d.monto || 0),
            archivo_pdf_url: d.archivo_pdf_url || createSamplePdfDataUri(d)
          }));
          setRegistros(normalizados);
          if (mostrarAviso) {
            mostrarToast('Datos sincronizados en vivo desde tu Supabase');
          }
        } else if (Array.isArray(data) && data.length === 0) {
          // Sembrar los registros iniciales en la tabla de Supabase para que ya queden en la nube
          const semilla = REGISTROS_INICIALES.map((r) => ({
            tipo: r.tipo,
            numero: r.numero,
            entidad: r.entidad,
            descripcion: r.descripcion,
            siaf_expediente: r.siaf_expediente,
            orden_vinculada: r.orden_vinculada,
            monto: r.monto,
            fecha_emision: r.fecha_emision,
            fecha_compromiso: r.fecha_compromiso,
            estado: r.estado,
            archivo_pdf_nombre: r.archivo_pdf_nombre,
            archivo_pdf_url: createSamplePdfDataUri(r),
            observaciones: r.observaciones
          }));
          const seedRes = await fetch(
            `https://giscopvcchycdvwcffub.supabase.co/rest/v1/contrataciones_documentos`,
            {
              method: 'POST',
              headers: supabaseHeaders,
              body: JSON.stringify(semilla)
            }
          );
          if (seedRes.ok) {
            const insertados = await seedRes.json();
            if (Array.isArray(insertados) && insertados.length > 0) {
              setRegistros(insertados);
            }
          }
        }
        setSincronizando(false);
        return;
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (res.status === 404 || errJson.code === '42P01' || errJson.code === 'PGRST205') {
          setEstadoNube('falta_sql');
        } else {
          setEstadoNube('local');
        }
      }
    } catch (err) {
      setEstadoNube('local');
    }

    // Fallback a localStorage si aún no se corrió el script SQL
    try {
      const guardado = localStorage.getItem('sigce_contrataciones_v1');
      if (guardado) {
        const parsed = JSON.parse(guardado);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRegistros(parsed);
        }
      }
    } catch (e) {
      // Ignorar errores de almacenamiento local
    }
    setSincronizando(false);
  };

  const subirPdfASupabaseStorage = async (file, identificador) => {
    try {
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `registros/${identificador}/${Date.now()}_${cleanName}`;
      const uploadUrl = `https://giscopvcchycdvwcffub.supabase.co/storage/v1/object/${SUPABASE_BUCKET_DEFAULT}/${path}`;
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY_DEFAULT,
          Authorization: `Bearer ${SUPABASE_ANON_KEY_DEFAULT}`,
          'Content-Type': 'application/pdf',
          'x-upsert': 'true'
        },
        body: file
      });
      if (res.ok) {
        return `https://giscopvcchycdvwcffub.supabase.co/storage/v1/object/public/${SUPABASE_BUCKET_DEFAULT}/${path}`;
      }
    } catch (e) {
      // Si el bucket aún no fue creado con el SQL, usar Base64 Data URL de respaldo
    }
    return null;
  };

  // Cargar desde Supabase (o localStorage) al iniciar
  useEffect(() => {
    cargarDesdeSupabase(false);
  }, []);

  // Guardar en localStorage cuando cambian los registros
  useEffect(() => {
    try {
      localStorage.setItem('sigce_contrataciones_v1', JSON.stringify(registros));
    } catch (err) {
      // Ignorar errores de cuota
    }
  }, [registros]);

  const mostrarToast = (texto, tipo = 'exito') => {
    setToastMsg({ texto, tipo });
    setTimeout(() => {
      setToastMsg(null);
    }, 3400);
  };

  // ============================================================================
  // MÉTRICAS Y ALERTAS DEL PANEL RESUMEN
  // ============================================================================

  const metricas = useMemo(() => {
    const facturasPorCobrar = registros.filter(
      (r) => r.estado === 'Facturado y pendiente de pago (Por cobrar)'
    );
    const ordenesPorEntregar = registros.filter(
      (r) =>
        r.tipo === 'orden_compra' &&
        (r.estado === 'Notificado (Orden emitida)' ||
          r.estado === 'En procedimiento / En proceso')
    );
    const entregadosSinFacturar = registros.filter(
      (r) =>
        r.estado === 'Entregado pero no facturado' ||
        r.estado === 'Entregado (con o sin guía)'
    );
    const pagadosConcluidos = registros.filter(
      (r) => r.estado === 'Pagado / Concluido'
    );

    const montoPorCobrar = facturasPorCobrar.reduce(
      (acc, item) => acc + Number(item.monto || 0),
      0
    );
    const montoPorEntregar = ordenesPorEntregar.reduce(
      (acc, item) => acc + Number(item.monto || 0),
      0
    );
    const montoSinFacturar = entregadosSinFacturar.reduce(
      (acc, item) => acc + Number(item.monto || 0),
      0
    );
    const montoCobrado = pagadosConcluidos.reduce(
      (acc, item) => acc + Number(item.monto || 0),
      0
    );

    return {
      facturasPorCobrar,
      ordenesPorEntregar,
      entregadosSinFacturar,
      pagadosConcluidos,
      montoPorCobrar,
      montoPorEntregar,
      montoSinFacturar,
      montoCobrado
    };
  }, [registros]);

  // ============================================================================
  // FILTRADO DE REGISTROS SEGÚN PESTAÑA, ALERTA RÁPIDA, ENTIDAD Y BÚSQUEDA
  // ============================================================================

  const registrosFiltrados = useMemo(() => {
    return registros.filter((reg) => {
      // 1. Filtro por pestaña principal
      if (
        pestanaActiva !== 'resumen' &&
        pestanaActiva !== 'arquitectura' &&
        reg.tipo !== pestanaActiva
      ) {
        return false;
      }

      // 2. Filtro de Alerta Rápida (en el Panel Resumen o vista general)
      if (filtroAlertaRapida === 'facturas_pendientes') {
        if (reg.estado !== 'Facturado y pendiente de pago (Por cobrar)') {
          return false;
        }
      } else if (filtroAlertaRapida === 'ordenes_por_entregar') {
        const faltaEntregar =
          reg.tipo === 'orden_compra' &&
          (reg.estado === 'Notificado (Orden emitida)' ||
            reg.estado === 'En procedimiento / En proceso');
        if (!faltaEntregar) return false;
      } else if (filtroAlertaRapida === 'entregados_sin_facturar') {
        const sinFacturar =
          reg.estado === 'Entregado pero no facturado' ||
          reg.estado === 'Entregado (con o sin guía)';
        if (!sinFacturar) return false;
      }

      // 3. Filtro por Entidad
      if (filtroEntidad !== 'TODAS' && reg.entidad !== filtroEntidad) {
        return false;
      }

      // 4. Filtro por Estado específico
      if (filtroEstado !== 'TODOS' && reg.estado !== filtroEstado) {
        return false;
      }

      // 5. Búsqueda por texto (número, entidad, descripción, SIAF, OC vinculada)
      if (busqueda.trim() !== '') {
        const q = busqueda.toLowerCase();
        const coincide =
          reg.numero.toLowerCase().includes(q) ||
          reg.entidad.toLowerCase().includes(q) ||
          reg.descripcion.toLowerCase().includes(q) ||
          (reg.siaf_expediente || '').toLowerCase().includes(q) ||
          (reg.orden_vinculada || '').toLowerCase().includes(q);
        if (!coincide) return false;
      }

      return true;
    });
  }, [
    registros,
    pestanaActiva,
    filtroAlertaRapida,
    filtroEntidad,
    filtroEstado,
    busqueda
  ]);

  // ============================================================================
  // ACCIONES CRUD Y MANEJO DE PDFs
  // ============================================================================

  const abrirModalNuevo = (tipoPreseleccionado) => {
    const tipoInicial =
      tipoPreseleccionado &&
      ['cotizacion', 'orden_compra', 'guia_remision', 'factura'].includes(
        tipoPreseleccionado
      )
        ? tipoPreseleccionado
        : pestanaActiva !== 'resumen' && pestanaActiva !== 'arquitectura'
        ? pestanaActiva
        : 'orden_compra';

    const prefijos = {
      cotizacion: 'COT-2026-',
      orden_compra: 'OC-2026-',
      guia_remision: 'EG01-000',
      factura: 'F001-000'
    };

    const estadoSugerido = {
      cotizacion: 'Cotizado / Registrado',
      orden_compra: 'Notificado (Orden emitida)',
      guia_remision: 'Entregado (con o sin guía)',
      factura: 'Facturado y pendiente de pago (Por cobrar)'
    };

    setModoEdicionId(null);
    setFormTipo(tipoInicial);
    setFormNumero(
      `${prefijos[tipoInicial]}${Math.floor(450 + Math.random() * 500)}`
    );
    setFormEntidad('MML');
    setFormOtraEntidad('');
    setFormDescripcion('');
    setFormSiaf('SIAF-2026-');
    setFormOrdenVinculada('');
    setFormMonto('');
    setFormFechaEmision('2026-10-20');
    setFormFechaCompromiso('2026-10-30');
    setFormEstado(estadoSugerido[tipoInicial]);
    setFormObservaciones('');
    setFormArchivoNombre('');
    setFormArchivoUrl('');
    setModalAbierto(true);
  };

  const abrirModalEditar = (reg) => {
    const esEntidadCatalogo = ENTIDADES_CATALOGO.some(
      (e) => e.sigla === reg.entidad
    );
    setModoEdicionId(reg.id);
    setFormTipo(reg.tipo);
    setFormNumero(reg.numero);
    setFormEntidad(esEntidadCatalogo ? reg.entidad : 'OTRA');
    setFormOtraEntidad(esEntidadCatalogo ? '' : reg.entidad);
    setFormDescripcion(reg.descripcion);
    setFormSiaf(reg.siaf_expediente || '');
    setFormOrdenVinculada(reg.orden_vinculada || '');
    setFormMonto(String(reg.monto));
    setFormFechaEmision(reg.fecha_emision || '2026-10-20');
    setFormFechaCompromiso(reg.fecha_compromiso || '');
    setFormEstado(reg.estado);
    setFormObservaciones(reg.observaciones || '');
    setFormArchivoNombre(reg.archivo_pdf_nombre || '');
    setFormArchivoUrl(reg.archivo_pdf_url || '');
    setModalAbierto(true);
  };

  const cambiarEstadoRapido = async (id, nuevoEstado) => {
    setRegistros((prev) =>
      prev.map((reg) => (reg.id === id ? { ...reg, estado: nuevoEstado } : reg))
    );
    mostrarToast(`Estado actualizado a: "${nuevoEstado}"`);
    if (estadoNube === 'conectado') {
      try {
        await fetch(
          `https://giscopvcchycdvwcffub.supabase.co/rest/v1/contrataciones_documentos?id=eq.${encodeURIComponent(id)}`,
          {
            method: 'PATCH',
            headers: supabaseHeaders,
            body: JSON.stringify({ estado: nuevoEstado })
          }
        );
      } catch (e) {
        // Guardado en local de respaldo
      }
    }
  };

  const avanzarSiguienteEstado = (reg) => {
    const idxActual = ESTADOS.findIndex((e) => e.valor === reg.estado);
    if (idxActual >= 0 && idxActual < ESTADOS.length - 1) {
      const siguiente = ESTADOS[idxActual + 1].valor;
      cambiarEstadoRapido(reg.id, siguiente);
    }
  };

  const manejarSubidaPdfFormulario = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const publicUrl = await subirPdfASupabaseStorage(
      file,
      formNumero || 'documento'
    );
    if (publicUrl) {
      setFormArchivoNombre(file.name);
      setFormArchivoUrl(publicUrl);
      mostrarToast(`PDF "${file.name}" subido a Supabase Storage`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormArchivoNombre(file.name);
      setFormArchivoUrl(String(reader.result));
      mostrarToast(`PDF "${file.name}" cargado y listo para guardar`);
    };
    reader.readAsDataURL(file);
  };

  const activarSubidaPdfEnFila = (idRegistro) => {
    setIdFilaSubiendoPdf(idRegistro);
    if (fileInputFilaRef.current) {
      fileInputFilaRef.current.value = '';
      fileInputFilaRef.current.click();
    }
  };

  const manejarSubidaPdfEnFila = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !idFilaSubiendoPdf) return;
    const targetId = idFilaSubiendoPdf;
    setIdFilaSubiendoPdf(null);

    const publicUrl = await subirPdfASupabaseStorage(file, targetId);
    const aplicarUrl = async (finalUrl) => {
      setRegistros((prev) =>
        prev.map((reg) =>
          reg.id === targetId
            ? {
                ...reg,
                archivo_pdf_nombre: file.name,
                archivo_pdf_url: finalUrl
              }
            : reg
        )
      );
      if (estadoNube === 'conectado') {
        try {
          await fetch(
            `https://giscopvcchycdvwcffub.supabase.co/rest/v1/contrataciones_documentos?id=eq.${encodeURIComponent(targetId)}`,
            {
              method: 'PATCH',
              headers: supabaseHeaders,
              body: JSON.stringify({
                archivo_pdf_nombre: file.name,
                archivo_pdf_url: finalUrl
              })
            }
          );
        } catch (err) {
          // Respaldo local
        }
      }
      mostrarToast(`PDF "${file.name}" guardado correctamente`);
    };

    if (publicUrl) {
      await aplicarUrl(publicUrl);
    } else {
      const reader = new FileReader();
      reader.onload = () => aplicarUrl(String(reader.result));
      reader.readAsDataURL(file);
    }
  };

  const guardarRegistro = async (e) => {
    e.preventDefault();
    const entidadFinal =
      formEntidad === 'OTRA'
        ? formOtraEntidad.trim() || 'Entidad Pública'
        : formEntidad;

    const baseDoc = {
      tipo: formTipo,
      numero: formNumero.trim() || 'DOC-2026-001',
      entidad: entidadFinal,
      descripcion:
        formDescripcion.trim() || 'Contratación de bienes / servicios con el Estado',
      siaf_expediente: formSiaf.trim() || '-',
      orden_vinculada: formOrdenVinculada.trim() || '-',
      monto: parseFloat(formMonto) || 0,
      fecha_emision: formFechaEmision,
      fecha_compromiso: formFechaCompromiso || null,
      estado: formEstado,
      observaciones: formObservaciones.trim()
    };

    const nombrePdf =
      formArchivoNombre || `${baseDoc.numero.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    const urlPdf = formArchivoUrl || createSamplePdfDataUri(baseDoc);

    const payloadSupabase = {
      ...baseDoc,
      archivo_pdf_nombre: nombrePdf,
      archivo_pdf_url: urlPdf
    };

    if (modoEdicionId) {
      const docActualizado = { id: modoEdicionId, ...payloadSupabase };
      setRegistros((prev) =>
        prev.map((r) => (r.id === modoEdicionId ? docActualizado : r))
      );
      if (estadoNube === 'conectado') {
        try {
          await fetch(
            `https://giscopvcchycdvwcffub.supabase.co/rest/v1/contrataciones_documentos?id=eq.${encodeURIComponent(modoEdicionId)}`,
            {
              method: 'PATCH',
              headers: supabaseHeaders,
              body: JSON.stringify(payloadSupabase)
            }
          );
        } catch (err) {
          // Respaldo local
        }
      }
      mostrarToast(`Registro ${docActualizado.numero} actualizado`);
    } else {
      let docInsertado = { id: `reg-${Date.now()}`, ...payloadSupabase };
      if (estadoNube === 'conectado') {
        try {
          const res = await fetch(
            `https://giscopvcchycdvwcffub.supabase.co/rest/v1/contrataciones_documentos`,
            {
              method: 'POST',
              headers: supabaseHeaders,
              body: JSON.stringify(payloadSupabase)
            }
          );
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data[0]) {
              docInsertado = data[0];
            }
          }
        } catch (err) {
          // Respaldo local
        }
      }
      setRegistros((prev) => [docInsertado, ...prev]);
      mostrarToast(`Nuevo registro ${docInsertado.numero} guardado`);
    }

    setModalAbierto(false);
  };

  const confirmarEliminacion = async () => {
    if (!registroPorEliminar) return;
    const idEliminar = registroPorEliminar.id;
    const num = registroPorEliminar.numero;
    setRegistros((prev) => prev.filter((r) => r.id !== idEliminar));
    setRegistroPorEliminar(null);
    if (estadoNube === 'conectado') {
      try {
        await fetch(
          `https://giscopvcchycdvwcffub.supabase.co/rest/v1/contrataciones_documentos?id=eq.${encodeURIComponent(idEliminar)}`,
          {
            method: 'DELETE',
            headers: supabaseHeaders
          }
        );
      } catch (err) {
        // Respaldo local
      }
    }
    mostrarToast(`Registro ${num} eliminado`, 'alerta');
  };

  const copiarTexto = (texto, etiqueta) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto);
      } else {
        const ta = document.createElement('textarea');
        ta.value = texto;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCodigoCopiado(etiqueta);
      mostrarToast(`${etiqueta} copiado al portapapeles`);
      setTimeout(() => setCodigoCopiado(''), 2500);
    } catch (err) {
      mostrarToast('No se pudo copiar automáticamente', 'alerta');
    }
  };

  // Helpers de formato
  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(Number(valor || 0));
  };

  const obtenerInfoEstado = (estadoStr) => {
    return (
      ESTADOS.find((e) => e.valor === estadoStr) || {
        valor: estadoStr,
        paso: 1,
        colorBadge: 'bg-slate-100 text-slate-800 border-slate-300',
        colorDot: 'bg-slate-400',
        colorBarra: 'bg-slate-500',
        etapa: 'Registrado'
      }
    );
  };

  const obtenerInfoTipo = (tipoId) => {
    const mapa = {
      cotizacion: {
        etiqueta: 'Cotización',
        clase: 'bg-violet-50 text-violet-800 border-violet-200',
        icono: FileText
      },
      orden_compra: {
        etiqueta: 'Orden OC/OS',
        clase: 'bg-blue-50 text-blue-800 border-blue-200',
        icono: ShoppingCart
      },
      guia_remision: {
        etiqueta: 'Guía Remisión',
        clase: 'bg-teal-50 text-teal-800 border-teal-200',
        icono: Truck
      },
      factura: {
        etiqueta: 'Factura',
        clase: 'bg-amber-50 text-amber-900 border-amber-200',
        icono: Receipt
      }
    };
    return mapa[tipoId] || mapa.orden_compra;
  };

  const obtenerClaseEntidad = (entidadNombre) => {
    const encontrada = ENTIDADES_CATALOGO.find((e) => e.sigla === entidadNombre);
    return encontrada
      ? encontrada.color
      : 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Input oculto para subir PDF desde cualquier fila */}
      <input
        ref={fileInputFilaRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={manejarSubidaPdfEnFila}
      />

      {/* Notificación Toast flotante */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border bg-slate-900 text-white border-slate-700 text-sm font-medium transition-all">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg.texto}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CABECERA SUPERIOR PRIVADA                                            */}
      {/* ==================================================================== */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  SIGCE Perú
                </h1>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Next.js + Supabase
                </span>
                <button
                  type="button"
                  onClick={() => cargarDesdeSupabase(true)}
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 transition ${
                    estadoNube === 'conectado'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : estadoNube === 'falta_sql'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  }`}
                  title="Haz clic para sincronizar con tu proyecto Supabase (giscopvcchycdvwcffub)"
                >
                  <RefreshCw className={`w-3 h-3 ${sincronizando ? 'animate-spin' : ''}`} />
                  <span>
                    {estadoNube === 'conectado'
                      ? 'Nube Supabase Activa'
                      : estadoNube === 'falta_sql'
                      ? 'Falta ejecutar SQL en Supabase'
                      : 'Sincronizar Supabase'}
                  </span>
                </button>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Gestión Privada de Contrataciones con el Estado • MML, PRODUCE, SBS, Chilca
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setPestanaActiva('arquitectura')}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Database className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">Configuración Supabase</span>
              <span className="md:hidden">SQL / .env</span>
            </button>

            <button
              type="button"
              onClick={() => abrirModalNuevo()}
              className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Añadir nuevo registro</span>
            </button>
          </div>
        </div>

        {/* Barra de Navegación por Módulos (Pestañas Responsivas) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <nav className="flex items-center gap-1 border-t border-slate-800/80 pt-1">
            {MODULOS.map((mod) => {
              const Icono = mod.icono;
              const activo = pestanaActiva === mod.id;
              const conteo =
                mod.id === 'resumen'
                  ? registros.length
                  : mod.id === 'arquitectura'
                  ? null
                  : registros.filter((r) => r.tipo === mod.id).length;

              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => {
                    setPestanaActiva(mod.id);
                    if (mod.id !== 'resumen') {
                      setFiltroAlertaRapida('todos');
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition ${
                    activo
                      ? 'border-emerald-400 text-white bg-slate-800/70 rounded-t-lg'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 rounded-t-lg'
                  }`}
                >
                  <Icono
                    className={`w-4 h-4 ${
                      activo ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  />
                  <span className="hidden sm:inline">{mod.nombre}</span>
                  <span className="sm:hidden">{mod.nombreCorto}</span>
                  {conteo !== null && (
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
                        activo
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {conteo}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* CONTENIDO PRINCIPAL                                                  */}
      {/* ==================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {pestanaActiva === 'arquitectura' ? (
          /* ================================================================ */
          /* VISTA DE ARQUITECTURA, ESTRUCTURA DE CARPETAS Y SUPABASE SETUP   */
          /* ================================================================ */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <FolderTree className="w-3.5 h-3.5" />
                    Documentación Técnica Full Stack
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    Estructura de Carpetas, Variables de Entorno (.env.local) y SQL de Supabase
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Todo el proyecto Next.js (App Router) también ha sido empaquetado en el archivo ZIP adjunto listo para descomprimir y ejecutar con <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">npm run dev</code>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPestanaActiva('resumen')}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition"
                >
                  Volver al Tablero Operativo
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
                {/* 1. Estructura de Carpetas */}
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 flex flex-col">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      1. Estructura de Carpetas (Next.js App Router)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copiarTexto(
                          ESTRUCTURA_CARPETAS_TXT,
                          'Estructura de carpetas'
                        )
                      }
                      className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1"
                    >
                      {codigoCopiado === 'Estructura de carpetas' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copiar</span>
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                    {ESTRUCTURA_CARPETAS_TXT}
                  </pre>
                </div>

                {/* 2. Variables de Entorno (.env.local) */}
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                      <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
                        2. Variables de Entorno (.env.local)
                      </span>
                      <button
                        type="button"
                        onClick={() => copiarTexto(ENV_LOCAL_TXT, '.env.local')}
                        className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1"
                      >
                        {codigoCopiado === '.env.local' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>Copiar</span>
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                      {ENV_LOCAL_TXT}
                    </pre>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <p className="font-semibold text-white">
                      Pasos en tu panel de Supabase:
                    </p>
                    <p>
                      1. Ve a <span className="text-sky-300">Project Settings → API</span> y copia <code className="text-emerald-300">Project URL</code> y <code className="text-emerald-300">anon public key</code>.
                    </p>
                    <p>
                      2. Ejecuta el script SQL inferior en <span className="text-sky-300">SQL Editor</span> para crear la tabla y el bucket <code className="text-emerald-300">documentos-contrataciones</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Script SQL de Supabase */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 mt-5">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                    3. Script SQL Completo (Tabla + 7 Estados + Bucket Storage para PDFs)
                  </span>
                  <button
                    type="button"
                    onClick={() => copiarTexto(SQL_SUPABASE_TXT, 'Script SQL Supabase')}
                    className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1"
                  >
                    {codigoCopiado === 'Script SQL Supabase' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copiar SQL</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-80">
                  {SQL_SUPABASE_TXT}
                </pre>
              </div>

              {/* 4. Cliente Supabase y Subida de PDFs */}
              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 mt-5">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                    4. Cliente Supabase + Storage Helper (src/lib/supabase.ts)
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      copiarTexto(SUPABASE_CLIENT_TXT, 'Cliente Supabase')
                    }
                    className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1"
                  >
                    {codigoCopiado === 'Cliente Supabase' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>Copiar TS</span>
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                  {SUPABASE_CLIENT_TXT}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* ============================================================== */}
            {/* TARJETAS RESUMEN INTERACTIVAS (FILTROS RÁPIDOS DE PENDIENTES)  */}
            {/* ============================================================== */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Facturas pendientes de pago */}
              <button
                type="button"
                onClick={() => {
                  setPestanaActiva('resumen');
                  setFiltroAlertaRapida(
                    filtroAlertaRapida === 'facturas_pendientes'
                      ? 'todos'
                      : 'facturas_pendientes'
                  );
                }}
                className={`text-left p-4 rounded-2xl border transition shadow-sm flex flex-col justify-between ${
                  filtroAlertaRapida === 'facturas_pendientes'
                    ? 'bg-orange-50/90 border-orange-400 ring-2 ring-orange-400/30'
                    : 'bg-white border-slate-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full">
                    Facturas por Cobrar
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-slate-900">
                    {formatearMoneda(metricas.montoPorCobrar)}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 flex items-center justify-between">
                    <span>
                      <strong>{metricas.facturasPorCobrar.length}</strong> factura(s) pendiente(s) de pago
                    </span>
                    <span className="text-orange-700 font-semibold underline">
                      {filtroAlertaRapida === 'facturas_pendientes'
                        ? 'Ver todas'
                        : 'Filtrar'}
                    </span>
                  </p>
                </div>
              </button>

              {/* Card 2: Órdenes que faltan entregar */}
              <button
                type="button"
                onClick={() => {
                  setPestanaActiva('resumen');
                  setFiltroAlertaRapida(
                    filtroAlertaRapida === 'ordenes_por_entregar'
                      ? 'todos'
                      : 'ordenes_por_entregar'
                  );
                }}
                className={`text-left p-4 rounded-2xl border transition shadow-sm flex flex-col justify-between ${
                  filtroAlertaRapida === 'ordenes_por_entregar'
                    ? 'bg-sky-50/90 border-sky-400 ring-2 ring-sky-400/30'
                    : 'bg-white border-slate-200 hover:border-sky-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full">
                    Órdenes por Entregar
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-slate-900">
                    {formatearMoneda(metricas.montoPorEntregar)}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 flex items-center justify-between">
                    <span>
                      <strong>{metricas.ordenesPorEntregar.length}</strong> OC/OS en atención
                    </span>
                    <span className="text-sky-700 font-semibold underline">
                      {filtroAlertaRapida === 'ordenes_por_entregar'
                        ? 'Ver todas'
                        : 'Filtrar'}
                    </span>
                  </p>
                </div>
              </button>

              {/* Card 3: Entregados pendientes de facturar */}
              <button
                type="button"
                onClick={() => {
                  setPestanaActiva('resumen');
                  setFiltroAlertaRapida(
                    filtroAlertaRapida === 'entregados_sin_facturar'
                      ? 'todos'
                      : 'entregados_sin_facturar'
                  );
                }}
                className={`text-left p-4 rounded-2xl border transition shadow-sm flex flex-col justify-between ${
                  filtroAlertaRapida === 'entregados_sin_facturar'
                    ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/30'
                    : 'bg-white border-slate-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    Entregado sin Facturar
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-slate-900">
                    {formatearMoneda(metricas.montoSinFacturar)}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 flex items-center justify-between">
                    <span>
                      <strong>{metricas.entregadosSinFacturar.length}</strong> entrega(s) por facturar
                    </span>
                    <span className="text-amber-800 font-semibold underline">
                      {filtroAlertaRapida === 'entregados_sin_facturar'
                        ? 'Ver todas'
                        : 'Filtrar'}
                    </span>
                  </p>
                </div>
              </button>

              {/* Card 4: Pagado / Concluido */}
              <button
                type="button"
                onClick={() => {
                  setFiltroAlertaRapida('todos');
                  setFiltroEstado(
                    filtroEstado === 'Pagado / Concluido'
                      ? 'TODOS'
                      : 'Pagado / Concluido'
                  );
                }}
                className={`text-left p-4 rounded-2xl border transition shadow-sm flex flex-col justify-between ${
                  filtroEstado === 'Pagado / Concluido'
                    ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-400/30'
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Pagado / Concluido
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-slate-900">
                    {formatearMoneda(metricas.montoCobrado)}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 flex items-center justify-between">
                    <span>
                      <strong>{metricas.pagadosConcluidos.length}</strong> expediente(s) cobrado(s)
                    </span>
                    <span className="text-emerald-700 font-semibold underline">
                      {filtroEstado === 'Pagado / Concluido'
                        ? 'Ver todos'
                        : 'Filtrar'}
                    </span>
                  </p>
                </div>
              </button>
            </section>

            {/* ============================================================== */}
            {/* LEYENDA INTERACTIVA DE LOS 7 ESTADOS DEL PROCESO               */}
            {/* ============================================================== */}
            <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Flujo de Estados del Proceso (Clic para filtrar por etapa)
                  </h2>
                </div>
                {(filtroEstado !== 'TODOS' ||
                  filtroAlertaRapida !== 'todos' ||
                  filtroEntidad !== 'TODAS' ||
                  busqueda !== '') && (
                  <button
                    type="button"
                    onClick={() => {
                      setFiltroEstado('TODOS');
                      setFiltroAlertaRapida('todos');
                      setFiltroEntidad('TODAS');
                      setBusqueda('');
                    }}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Limpiar todos los filtros</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {ESTADOS.map((est) => {
                  const cantidad = registros.filter(
                    (r) =>
                      (pestanaActiva === 'resumen' || r.tipo === pestanaActiva) &&
                      r.estado === est.valor
                  ).length;
                  const activo = filtroEstado === est.valor;

                  return (
                    <button
                      key={est.valor}
                      type="button"
                      onClick={() =>
                        setFiltroEstado(activo ? 'TODOS' : est.valor)
                      }
                      className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                        activo
                          ? `${est.colorBadge} ring-2 ring-slate-900/15 font-semibold`
                          : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Paso {est.paso}/7
                        </span>
                        <span className="text-xs font-bold px-1.5 py-0.2 rounded-full bg-white border border-slate-200 text-slate-800">
                          {cantidad}
                        </span>
                      </div>
                      <p className="text-xs font-medium leading-snug mt-1.5 line-clamp-2">
                        {est.valor}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ============================================================== */}
            {/* BARRA DE HERRAMIENTAS: BÚSQUEDA, ENTIDADES Y FILTROS           */}
            {/* ============================================================== */}
            <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Buscador */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por número (OC, Factura, Guía, Cotización), entidad, SIAF o concepto..."
                    className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                  {busqueda && (
                    <button
                      type="button"
                      onClick={() => setBusqueda('')}
                      aria-label="Limpiar búsqueda"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filtros rápidos por Entidad Estatal */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    Entidad:
                  </span>
                  {['TODAS', 'MML', 'PRODUCE', 'SBS', 'Chilca'].map((ent) => (
                    <button
                      key={ent}
                      type="button"
                      onClick={() => setFiltroEntidad(ent)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        filtroEntidad === ent
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ent}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botones de filtro rápido para el Resumen de Pendientes */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" />
                    Vista rápida:
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiltroAlertaRapida('todos')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      filtroAlertaRapida === 'todos'
                        ? 'bg-slate-200 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Todos los registros
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFiltroAlertaRapida(
                        filtroAlertaRapida === 'facturas_pendientes'
                          ? 'todos'
                          : 'facturas_pendientes'
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                      filtroAlertaRapida === 'facturas_pendientes'
                        ? 'bg-orange-600 text-white font-semibold'
                        : 'bg-orange-50 text-orange-800 hover:bg-orange-100'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Facturas pendientes de pago ({metricas.facturasPorCobrar.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFiltroAlertaRapida(
                        filtroAlertaRapida === 'ordenes_por_entregar'
                          ? 'todos'
                          : 'ordenes_por_entregar'
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                      filtroAlertaRapida === 'ordenes_por_entregar'
                        ? 'bg-sky-600 text-white font-semibold'
                        : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Órdenes que faltan entregar ({metricas.ordenesPorEntregar.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFiltroAlertaRapida(
                        filtroAlertaRapida === 'entregados_sin_facturar'
                          ? 'todos'
                          : 'entregados_sin_facturar'
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                      filtroAlertaRapida === 'entregados_sin_facturar'
                        ? 'bg-amber-600 text-white font-semibold'
                        : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Entregados sin facturar ({metricas.entregadosSinFacturar.length})</span>
                  </button>
                </div>

                <span className="text-xs text-slate-500">
                  Mostrando <strong>{registrosFiltrados.length}</strong> de{' '}
                  {registros.length} documentos
                </span>
              </div>
            </section>

            {/* ============================================================== */}
            {/* LISTADO / TABLA DE DOCUMENTOS (RESPONSIVE: TABLA PC + CARDS MÓVIL) */}
            {/* ============================================================== */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {registrosFiltrados.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">
                    No se encontraron documentos con los filtros actuales
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Puedes limpiar los filtros activos o registrar una nueva Cotización, Orden de Compra, Guía de Remisión o Factura.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFiltroAlertaRapida('todos');
                        setFiltroEntidad('TODAS');
                        setFiltroEstado('TODOS');
                        setBusqueda('');
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Restablecer filtros
                    </button>
                    <button
                      type="button"
                      onClick={() => abrirModalNuevo()}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                    >
                      + Añadir registro
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Tabla en Escritorio (lg+) */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="py-3.5 px-4">Documento / Tipo</th>
                          <th className="py-3.5 px-4">Entidad</th>
                          <th className="py-3.5 px-4">Concepto / Referencia</th>
                          <th className="py-3.5 px-4 text-right">Monto (S/)</th>
                          <th className="py-3.5 px-4">Fechas</th>
                          <th className="py-3.5 px-4">Estado del Proceso (Cambio Rápido)</th>
                          <th className="py-3.5 px-4">Adjunto PDF</th>
                          <th className="py-3.5 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-sm">
                        {registrosFiltrados.map((reg) => {
                          const infoTipo = obtenerInfoTipo(reg.tipo);
                          const infoEst = obtenerInfoEstado(reg.estado);
                          const IconoTipo = infoTipo.icono;
                          const porcentajePaso = Math.round(
                            (infoEst.paso / 7) * 100
                          );

                          return (
                            <tr
                              key={reg.id}
                              className="hover:bg-slate-50/80 transition group"
                            >
                              {/* Documento y Tipo */}
                              <td className="py-3.5 px-4 align-top">
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{reg.numero}</span>
                                </div>
                                <span
                                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border mt-1 ${infoTipo.clase}`}
                                >
                                  <IconoTipo className="w-3 h-3" />
                                  {infoTipo.etiqueta}
                                </span>
                              </td>

                              {/* Entidad */}
                              <td className="py-3.5 px-4 align-top">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${obtenerClaseEntidad(
                                    reg.entidad
                                  )}`}
                                >
                                  <Building2 className="w-3 h-3" />
                                  {reg.entidad}
                                </span>
                                {reg.siaf_expediente &&
                                  reg.siaf_expediente !== '-' && (
                                    <p className="text-[11px] text-slate-500 mt-1 font-mono">
                                      {reg.siaf_expediente}
                                    </p>
                                  )}
                              </td>

                              {/* Concepto y Orden vinculada */}
                              <td className="py-3.5 px-4 align-top max-w-xs">
                                <p className="text-xs font-medium text-slate-800 line-clamp-2">
                                  {reg.descripcion}
                                </p>
                                {reg.orden_vinculada &&
                                  reg.orden_vinculada !== '-' && (
                                    <p className="text-[11px] text-slate-500 mt-1">
                                      Vínculo:{' '}
                                      <strong className="text-slate-700">
                                        {reg.orden_vinculada}
                                      </strong>
                                    </p>
                                  )}
                                {reg.observaciones && (
                                  <p className="text-[11px] text-slate-400 italic mt-0.5 line-clamp-1">
                                    {reg.observaciones}
                                  </p>
                                )}
                              </td>

                              {/* Monto */}
                              <td className="py-3.5 px-4 align-top text-right font-bold text-slate-900 whitespace-nowrap">
                                {formatearMoneda(reg.monto)}
                              </td>

                              {/* Fechas */}
                              <td className="py-3.5 px-4 align-top whitespace-nowrap text-xs text-slate-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Emisión: {reg.fecha_emision}</span>
                                </div>
                                {reg.fecha_compromiso && (
                                  <p className="text-[11px] text-slate-500 mt-1 pl-4">
                                    Vence/Entrega: {reg.fecha_compromiso}
                                  </p>
                                )}
                              </td>

                              {/* Selector Rápido de Estado + Barra de Progreso */}
                              <td className="py-3.5 px-4 align-top min-w-[250px]">
                                <div className="flex items-center gap-1.5">
                                  <select
                                    aria-label={`Cambiar estado de ${reg.numero}`}
                                    value={reg.estado}
                                    onChange={(e) =>
                                      cambiarEstadoRapido(reg.id, e.target.value)
                                    }
                                    className={`w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900/15 ${infoEst.colorBadge}`}
                                  >
                                    {ESTADOS.map((est) => (
                                      <option key={est.valor} value={est.valor}>
                                        {est.paso}. {est.valor}
                                      </option>
                                    ))}
                                  </select>
                                  {infoEst.paso < 7 && (
                                    <button
                                      type="button"
                                      onClick={() => avanzarSiguienteEstado(reg)}
                                      title="Avanzar al siguiente paso"
                                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shrink-0"
                                    >
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${infoEst.colorBarra}`}
                                      style={{ width: `${porcentajePaso}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-semibold text-slate-500">
                                    {infoEst.paso}/7
                                  </span>
                                </div>
                              </td>

                              {/* Archivo PDF Adjunto (Ver / Descargar / Subir) */}
                              <td className="py-3.5 px-4 align-top">
                                <div className="flex flex-col gap-1.5">
                                  {reg.archivo_pdf_url ? (
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => setPdfEnVista(reg)}
                                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1 transition"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>Ver PDF</span>
                                      </button>
                                      <a
                                        href={reg.archivo_pdf_url}
                                        download={
                                          reg.archivo_pdf_nombre ||
                                          `${reg.numero}.pdf`
                                        }
                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                                        title="Descargar PDF"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          activarSubidaPdfEnFila(reg.id)
                                        }
                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                                        title="Reemplazar PDF"
                                      >
                                        <Upload className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        activarSubidaPdfEnFila(reg.id)
                                      }
                                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-dashed border-slate-300 flex items-center gap-1.5"
                                    >
                                      <Upload className="w-3.5 h-3.5" />
                                      <span>Subir PDF</span>
                                    </button>
                                  )}
                                  <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                                    {reg.archivo_pdf_nombre || 'Sin archivo'}
                                  </span>
                                </div>
                              </td>

                              {/* Acciones Editar / Eliminar */}
                              <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => abrirModalEditar(reg)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
                                    title="Editar registro"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRegistroPorEliminar(reg)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                    title="Eliminar registro"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Tarjetas Responsivas para Celular y Tablet (< lg) */}
                  <div className="lg:hidden divide-y divide-slate-200">
                    {registrosFiltrados.map((reg) => {
                      const infoTipo = obtenerInfoTipo(reg.tipo);
                      const infoEst = obtenerInfoEstado(reg.estado);
                      const IconoTipo = infoTipo.icono;
                      const porcentajePaso = Math.round((infoEst.paso / 7) * 100);

                      return (
                        <div key={reg.id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-bold text-base text-slate-900">
                                  {reg.numero}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${infoTipo.clase}`}
                                >
                                  <IconoTipo className="w-3 h-3" />
                                  {infoTipo.etiqueta}
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold border ${obtenerClaseEntidad(
                                    reg.entidad
                                  )}`}
                                >
                                  {reg.entidad}
                                </span>
                              </div>
                              <p className="text-xs text-slate-700 mt-1.5 font-medium">
                                {reg.descripcion}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <p className="text-base font-bold text-slate-900">
                                {formatearMoneda(reg.monto)}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {reg.fecha_emision}
                              </p>
                            </div>
                          </div>

                          {/* Estado Rápido en Móvil */}
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 space-y-2">
                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                              <span>ESTADO ACTUAL (PASO {infoEst.paso} DE 7)</span>
                              {reg.orden_vinculada &&
                                reg.orden_vinculada !== '-' && (
                                  <span>Ref: {reg.orden_vinculada}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <select
                                aria-label={`Estado móvil de ${reg.numero}`}
                                value={reg.estado}
                                onChange={(e) =>
                                  cambiarEstadoRapido(reg.id, e.target.value)
                                }
                                className={`w-full text-xs font-semibold px-2.5 py-2 rounded-lg border ${infoEst.colorBadge}`}
                              >
                                {ESTADOS.map((est) => (
                                  <option key={est.valor} value={est.valor}>
                                    {est.paso}. {est.valor}
                                  </option>
                                ))}
                              </select>
                              {infoEst.paso < 7 && (
                                <button
                                  type="button"
                                  onClick={() => avanzarSiguienteEstado(reg)}
                                  className="px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 shrink-0"
                                >
                                  Sig. →
                                </button>
                              )}
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${infoEst.colorBarra}`}
                                style={{ width: `${porcentajePaso}%` }}
                              />
                            </div>
                          </div>

                          {/* Botones de PDF y Acciones en Móvil */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPdfEnVista(reg)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver PDF</span>
                              </button>
                              <a
                                href={reg.archivo_pdf_url}
                                download={
                                  reg.archivo_pdf_nombre || `${reg.numero}.pdf`
                                }
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Descargar</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => activarSubidaPdfEnFila(reg.id)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => abrirModalEditar(reg)}
                                className="p-1.5 rounded-lg text-slate-600 bg-slate-100"
                                aria-label="Editar"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setRegistroPorEliminar(reg)}
                                className="p-1.5 rounded-lg text-rose-600 bg-rose-50"
                                aria-label="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </section>
          </>
        )}
      </main>

      {/* ==================================================================== */}
      {/* MODAL PARA AÑADIR O EDITAR REGISTRO                                  */}
      {/* ==================================================================== */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full overflow-hidden my-8">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {modoEdicionId
                    ? 'Editar Registro de Contratación'
                    : 'Añadir Nuevo Registro'}
                </h3>
                <p className="text-xs text-slate-400">
                  Completa los datos del documento y vincula su archivo PDF de respaldo
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarRegistro} className="p-5 space-y-4">
              {/* Selector de Tipo de Documento */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  1. Tipo de Documento
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'cotizacion', label: 'Cotización', pref: 'COT-2026-' },
                    { id: 'orden_compra', label: 'Orden (OC/OS)', pref: 'OC-2026-' },
                    { id: 'guia_remision', label: 'Guía Remisión', pref: 'EG01-000' },
                    { id: 'factura', label: 'Factura', pref: 'F001-000' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setFormTipo(t.id);
                        if (!modoEdicionId) {
                          setFormNumero(
                            `${t.pref}${Math.floor(450 + Math.random() * 500)}`
                          );
                        }
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        formTipo === t.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Número, Entidad y Monto */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNumero}
                    onChange={(e) => setFormNumero(e.target.value)}
                    placeholder="Ej. OC-2026-00890"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Entidad del Estado *
                  </label>
                  <select
                    value={formEntidad}
                    onChange={(e) => setFormEntidad(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    {ENTIDADES_CATALOGO.map((ent) => (
                      <option key={ent.sigla} value={ent.sigla}>
                        {ent.sigla} — {ent.nombre}
                      </option>
                    ))}
                    <option value="OTRA">Otra Entidad Pública...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monto Total (S/) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formMonto}
                    onChange={(e) => setFormMonto(e.target.value)}
                    placeholder="Ej. 18500.00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  />
                </div>
              </div>

              {formEntidad === 'OTRA' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre o Sigla de la Entidad Pública *
                  </label>
                  <input
                    type="text"
                    required
                    value={formOtraEntidad}
                    onChange={(e) => setFormOtraEntidad(e.target.value)}
                    placeholder="Ej. MINSA, SUNAT, Municipalidad de Miraflores..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              )}

              {/* Descripción / Concepto */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción o Concepto de la Contratación *
                </label>
                <input
                  type="text"
                  required
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  placeholder="Ej. Adquisición de suministros informáticos / Servicio de mantenimiento..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              {/* Estado del Documento */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  2. Estado Actual del Documento
                </label>
                <select
                  value={formEstado}
                  onChange={(e) => setFormEstado(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-slate-50"
                >
                  {ESTADOS.map((est) => (
                    <option key={est.valor} value={est.valor}>
                      Paso {est.paso}/7 — {est.valor}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fechas y Vínculos SIAF / OC */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha Emisión *
                  </label>
                  <input
                    type="date"
                    required
                    value={formFechaEmision}
                    onChange={(e) => setFormFechaEmision(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha Entrega/Venc.
                  </label>
                  <input
                    type="date"
                    value={formFechaCompromiso}
                    onChange={(e) => setFormFechaCompromiso(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    N° SIAF / Exp.
                  </label>
                  <input
                    type="text"
                    value={formSiaf}
                    onChange={(e) => setFormSiaf(e.target.value)}
                    placeholder="SIAF-2026-..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    OC / Doc. Vinculado
                  </label>
                  <input
                    type="text"
                    value={formOrdenVinculada}
                    onChange={(e) => setFormOrdenVinculada(e.target.value)}
                    placeholder="Ej. OC-2026-00512"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Subida de Archivo PDF Adjunto */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Adjuntar PDF (OC firmada, Guía sellada o Factura)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {formArchivoNombre
                        ? `Archivo seleccionado: ${formArchivoNombre}`
                        : 'Almacena en Supabase Storage y permite verlo desde PC o celular'}
                    </p>
                  </div>
                </div>
                <label className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 cursor-pointer transition">
                  <span>Seleccionar PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={manejarSubidaPdfFormulario}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observaciones de Seguimiento (Opcional)
                </label>
                <input
                  type="text"
                  value={formObservaciones}
                  onChange={(e) => setFormObservaciones(e.target.value)}
                  placeholder="Ej. Entregado en almacén central; pendiente acta de conformidad..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              {/* Botones del Modal */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xs"
                >
                  {modoEdicionId ? 'Guardar Cambios' : 'Guardar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL VISOR DE PDF INTEGRADO (PC Y CELULAR)                          */}
      {/* ==================================================================== */}
      {pdfEnVista && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold leading-tight">
                    {pdfEnVista.archivo_pdf_nombre || `${pdfEnVista.numero}.pdf`}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {pdfEnVista.entidad} • {pdfEnVista.numero} •{' '}
                    {formatearMoneda(pdfEnVista.monto)} • {pdfEnVista.estado}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={pdfEnVista.archivo_pdf_url}
                  download={
                    pdfEnVista.archivo_pdf_nombre || `${pdfEnVista.numero}.pdf`
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPdfEnVista(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Resumen superior del documento + Iframe PDF */}
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <span>
                <strong>Concepto:</strong> {pdfEnVista.descripcion}
              </span>
              <span>
                <strong>SIAF / Exp:</strong> {pdfEnVista.siaf_expediente || '-'}
              </span>
            </div>

            <div className="flex-1 bg-slate-800 relative">
              <iframe
                title={`Visor PDF ${pdfEnVista.numero}`}
                src={pdfEnVista.archivo_pdf_url}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL DE CONFIRMACIÓN PARA ELIMINAR REGISTRO                         */}
      {/* ==================================================================== */}
      {registroPorEliminar && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  ¿Eliminar documento {registroPorEliminar.numero}?
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Se eliminará el registro de <strong>{registroPorEliminar.entidad}</strong> por{' '}
                  <strong>{formatearMoneda(registroPorEliminar.monto)}</strong> y su vínculo PDF.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRegistroPorEliminar(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminacion}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
