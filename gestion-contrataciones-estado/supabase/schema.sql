-- ============================================================================
-- ESQUEMA SQL PARA SUPABASE: GESTIÓN DE CONTRATACIONES CON EL ESTADO
-- Ejecuta este script en el "SQL Editor" de tu panel de Supabase
-- ============================================================================

-- 1. Crear extensión para UUIDs
create extension if not exists "uuid-ossp";

-- 2. Crear tabla principal de documentos / contrataciones
create table if not exists public.contrataciones_documentos (
  id uuid primary key default uuid_generate_v4(),
  tipo text not null check (tipo in ('cotizacion', 'orden_compra', 'guia_remision', 'factura')),
  numero text not null,
  entidad text not null,
  ruc_entidad text,
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

-- 3. Índices para acelerar filtros por tipo, estado y entidad
create index if not exists idx_contrataciones_tipo on public.contrataciones_documentos(tipo);
create index if not exists idx_contrataciones_estado on public.contrataciones_documentos(estado);
create index if not exists idx_contrataciones_entidad on public.contrataciones_documentos(entidad);
create index if not exists idx_contrataciones_fecha on public.contrataciones_documentos(fecha_emision desc);

-- 4. Trigger para actualizar updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_contrataciones_updated_at on public.contrataciones_documentos;
create trigger set_contrataciones_updated_at
before update on public.contrataciones_documentos
for each row execute function public.handle_updated_at();

-- 5. Configurar Row Level Security (RLS)
alter table public.contrataciones_documentos enable row level security;

create policy "Permitir acceso completo a usuarios autenticados o app privada"
  on public.contrataciones_documentos
  for all
  using (true)
  with check (true);

-- 6. Crear Bucket de Storage para PDFs (OC firmadas, Guías, Facturas, Cotizaciones)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documentos-contrataciones',
  'documentos-contrataciones',
  true,
  15728640, -- Límite de 15 MB por PDF
  array['application/pdf']
)
on conflict (id) do nothing;

-- 7. Políticas de Storage para subir, visualizar y descargar PDFs
create policy "Permitir lectura de PDFs"
  on storage.objects for select
  using (bucket_id = 'documentos-contrataciones');

create policy "Permitir subida de PDFs"
  on storage.objects for insert
  with check (bucket_id = 'documentos-contrataciones');

create policy "Permitir actualización de PDFs"
  on storage.objects for update
  using (bucket_id = 'documentos-contrataciones');

create policy "Permitir eliminación de PDFs"
  on storage.objects for delete
  using (bucket_id = 'documentos-contrataciones');
