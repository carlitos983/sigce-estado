# SIGCE — Sistema Privado de Gestión de Contrataciones con el Estado

Aplicación web Full Stack construida con **Next.js 14 (App Router)**, **Tailwind CSS** y **Supabase (PostgreSQL + Storage)** para gestionar y dar seguimiento paso a paso a **Cotizaciones**, **Órdenes de Compra / Servicio (OC / OS)**, **Guías de Remisión** y **Facturas** emitidas a entidades públicas (ej. **MML**, **PRODUCE**, **SBS**, **Chilca**).

## 1. Estructura de Carpetas del Proyecto

```text
gestion-contrataciones-estado/
├── .env.local.example              # Plantilla de variables de entorno de Supabase
├── package.json                    # Dependencias (Next.js 14, Supabase JS, Lucide, Tailwind)
├── next.config.mjs                 # Configuración de Next.js
├── tailwind.config.ts              # Diseño moderno y responsive (PC y móvil)
├── tsconfig.json                   # Configuración TypeScript
├── supabase/
│   └── schema.sql                  # Script SQL: Tabla, Índices, Triggers, RLS y Bucket PDF
└── src/
    ├── types/
    │   └── contrataciones.ts       # Tipos TypeScript, los 7 estados y catálogo de entidades
    ├── lib/
    │   └── supabase.ts             # Cliente Supabase y helper para subir/descargar PDFs
    └── app/
        ├── globals.css             # Estilos globales Tailwind CSS
        ├── layout.tsx              # Layout raíz en español
        └── page.tsx                # Dashboard principal, pestañas, filtros, estados y visor PDF
```

## 2. Configuración Paso a Paso de Supabase y Variables de Entorno

### Paso 1: Crear el proyecto y la base de datos en Supabase
1. Ingresa a [https://supabase.com/dashboard](https://supabase.com/dashboard) y crea un nuevo proyecto.
2. En el menú lateral izquierdo, abre **SQL Editor** -> **New Query**.
3. Copia y pega todo el contenido del archivo `supabase/schema.sql` y haz clic en **Run**.
   - Esto creará automáticamente la tabla `public.contrataciones_documentos` con validación para los **7 estados del proceso**, índices de búsqueda rápida y el bucket de almacenamiento `documentos-contrataciones` configurado para archivos PDF de hasta 15 MB.

### Paso 2: Configurar las variables de entorno (`.env.local`)
1. En tu panel de Supabase, ve a **Project Settings (ícono de engranaje)** -> **API**.
2. Copia el **Project URL** y la clave **anon / public** (`Project API keys`).
3. En la raíz de tu proyecto Next.js, duplica el archivo `.env.local.example` y renómbralo a `.env.local`:

```bash
cp .env.local.example .env.local
```

4. Completa tus credenciales en `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STORAGE_BUCKET=documentos-contrataciones
```

### Paso 3: Instalar dependencias y ejecutar en local
```bash
npm install
npm run dev
```
Abre `http://localhost:3000` desde tu PC o celular en la misma red. Si aún no has configurado `.env.local`, la aplicación inicia automáticamente en **Modo Persistencia Local (Demo Interactiva)** para que puedas probar todas las funciones de inmediato.
