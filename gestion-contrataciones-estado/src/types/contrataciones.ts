export type TipoDocumento =
  | 'cotizacion'
  | 'orden_compra'
  | 'guia_remision'
  | 'factura';

export type EstadoContratacion =
  | 'Cotizado / Registrado'
  | 'Notificado (Orden emitida)'
  | 'En procedimiento / En proceso'
  | 'Entregado (con o sin guía)'
  | 'Entregado pero no facturado'
  | 'Facturado y pendiente de pago (Por cobrar)'
  | 'Pagado / Concluido';

export interface DocumentoContratacion {
  id: string;
  tipo: TipoDocumento;
  numero: string;
  entidad: string;
  ruc_entidad?: string;
  descripcion: string;
  siaf_expediente?: string;
  orden_vinculada?: string;
  monto: number;
  fecha_emision: string;
  fecha_compromiso?: string;
  estado: EstadoContratacion;
  archivo_pdf_nombre?: string | null;
  archivo_pdf_path?: string | null;
  archivo_pdf_url?: string | null;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
}

export const ESTADOS_ORDENADOS: EstadoContratacion[] = [
  'Cotizado / Registrado',
  'Notificado (Orden emitida)',
  'En procedimiento / En proceso',
  'Entregado (con o sin guía)',
  'Entregado pero no facturado',
  'Facturado y pendiente de pago (Por cobrar)',
  'Pagado / Concluido',
];

export const ENTIDADES_FRECUENTES = [
  { sigla: 'MML', nombre: 'Municipalidad Metropolitana de Lima', ruc: '20131380951' },
  { sigla: 'PRODUCE', nombre: 'Ministerio de la Producción', ruc: '20504794637' },
  { sigla: 'SBS', nombre: 'Superintendencia de Banca, Seguros y AFP', ruc: '20131370564' },
  { sigla: 'Chilca', nombre: 'Municipalidad Distrital de Chilca', ruc: '20162292376' },
];
