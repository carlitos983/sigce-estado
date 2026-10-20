import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SIGCE | Gestión y Seguimiento de Contrataciones con el Estado',
  description:
    'Plataforma privada para control de Cotizaciones, Órdenes de Compra (OC/OS), Guías de Remisión y Facturas con el Estado.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
