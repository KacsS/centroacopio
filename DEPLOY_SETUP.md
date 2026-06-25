# Guía de Despliegue y Base de Datos (Cloudflare R2 & SQL)

Este documento centraliza toda la configuración necesaria para desplegar la aplicación e interactuar con el sistema de base de datos, ya sea usando el almacenamiento de objetos nativo en Cloudflare R2 o migrando en el futuro a un motor SQL tradicional (como SQLite, Cloudflare D1, PostgreSQL o MySQL).

---

## 1. Conexión de Almacenamiento en la Nube con Cloudflare R2

La aplicación utiliza por defecto una base de datos ligera guardada en archivos JSON dentro de un bucket de Cloudflare R2 mediante el cliente compatible con S3 de AWS (`@aws-sdk/client-s3`) implementado en [src/lib/r2-storage.ts](src/lib/r2-storage.ts).

### Paso 1: Crear el Bucket en Cloudflare R2
1. Inicia sesión en tu panel de control de **Cloudflare**.
2. Dirígete a la sección **R2** en la barra lateral izquierda.
3. Haz clic en **Create Bucket** (Crear Bucket).
4. Asigna un nombre único a tu bucket, por ejemplo: `centro-acopio-vzla` y confírmalo.

### Paso 2: Generar tus credenciales API de R2
1. En la página de inicio de **R2**, haz clic en **Manage R2 API Tokens** (Gestionar tokens de la API R2) del lado derecho.
2. Selecciona **Create API Token** (Crear token de API).
3. Configura los siguientes permisos:
   * **Permissions**: Edit (o Read/Write para permitir cargar y leer los datos).
   * **Bucket Scopes**: Puedes limitarlo a tu nuevo bucket (`centro-acopio-vzla`) o permitir acceso general.
4. Presiona **Create API Token** y copia los valores generados de inmediato (no se podrán ver de nuevo).

### Paso 3: Configurar Variables de Entorno
Crea o edita tu archivo `.env.local` (para desarrollo local) o agrégalas como variables de entorno de producción en Cloudflare Pages, Vercel o Netlify:

```bash
# Nombre del bucket que creaste
CLOUDFLARE_R2_BUCKET=centro-acopio-vzla

# ID de cuenta de Cloudflare (Se encuentra en la URL de tu panel de Cloudflare o en la barra lateral)
CLOUDFLARE_ACCOUNT_ID=tu_cloudflare_account_id

# Credenciales del API Token de R2 creado en el Paso 2
CLOUDFLARE_R2_ACCESS_KEY_ID=tu_access_key_id_r2
CLOUDFLARE_R2_SECRET_ACCESS_KEY=tu_secret_access_key_r2
```

### Comportamiento Automático de Datos:
* **Con credenciales R2:** Los datos de centros y deliveries serán leídos y guardados en `data/relief_centers.json` y `data/delivery_volunteers.json` directamente en la nube.
* **Sin credenciales R2 (Modo de contingencia local):** La aplicación no fallará; pasará automáticamente a guardar y sincronizar la base de datos en el navegador del usuario utilizando `localStorage` en tiempo real.

---

## 2. Definición y Estructura SQL (Para futura migración a SQL)

Si en el desarrollo necesitas migrar la app a una base de datos relacional robusta (como Cloudflare D1 en edge workers, PostgreSQL o SQLite), puedes inicializar las bases de datos ejecutando las siguientes sentencias SQL:

### Tabla de Centros de Acopio (`relief_centers`)

```sql
CREATE TABLE relief_centers (
    id VARCHAR(36) PRIMARY KEY, -- Identificador único (UUID)
    center_name VARCHAR(255) NOT NULL, -- Nombre comercial o del centro
    city VARCHAR(100) NOT NULL, -- Ciudad (Ej: Caracas, Valencia)
    sector VARCHAR(100) NOT NULL, -- Sector o Municipio
    address TEXT NOT NULL, -- Dirección física detallada
    description TEXT NOT NULL, -- Propósito y cobertura de la iniciativa
    attention_start TIME NOT NULL, -- Inicio del horario de atención (Formato HH:MM)
    attention_end TIME NOT NULL, -- Cierre del horario de atención (Formato HH:MM)
    required_supplies TEXT NOT NULL, -- Insumos requeridos guardados como JSON stringificado/array
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Marca de tiempo de registro
);
```

### Tabla de Voluntarios de Delivery/Transporte (`delivery_volunteers`)

```sql
CREATE TABLE delivery_volunteers (
    id VARCHAR(36) PRIMARY KEY, -- Identificador único (UUID)
    name VARCHAR(255) NOT NULL, -- Nombre completo del conductor voluntario
    city VARCHAR(100) NOT NULL, -- Ciudad base
    sector VARCHAR(100) NOT NULL, -- Zonas en las que se moviliza o sector recurrente
    nearby_address TEXT NOT NULL, -- Referencia vecinal de ubicación
    transport_type VARCHAR(20) NOT NULL CHECK (transport_type IN ('moto', 'carro', 'camion')), -- Tipo de vehículo
    phone VARCHAR(50) NOT NULL, -- Teléfono de contacto / WhatsApp directo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Marca de tiempo de registro
);
```

---

## 3. Instrucciones de Despliegue en la Nube (Cloudflare Pages)

Para empaquetar y subir el proyecto a producción en **Cloudflare Pages** en solo unos pasos desde la terminal:

1. **Instalar el CLI de Cloudflare Wrangler (Opcional si usas git):**
   ```bash
   npm install -g wrangler
   ```

2. **Compilar el proyecto de manera estática y optimizada:**
   ```bash
   npm run build
   ```

3. **Subir la carpeta de salida a Cloudflare Pages:**
   ```bash
   npx wrangler pages deploy .next
   ```
   *(También puedes conectar directamente tu repositorio de GitHub desde el panel de Cloudflare Pages para que cada `git push` compile y publique de manera automatizada de forma gratuita).*
