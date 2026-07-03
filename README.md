# LightERP

Es un pequeño proyecto el cual me he propuesto hacer y actualizar con el tiempo, por ahora no es funcional, para ello se ha utilizado **Laravel** para el backend, que actúa como API y un frontend desarrollado en **React** con **Vite** y **Tailwind CSS**.

La base de datos se hizo en principio en **Phpmyadmin** pero luego me pasé **Supabase (PostgreSQL)**. Ya que es más sencillo crear una base de datos......supongo...

---

## Arquitectura del Proyecto

El repositorio está organizado en un único contenedor con dos carpetas principales independientes:

- `backend/`: Lógica de negocio, modelos de datos, controladores y API REST construida con Laravel.
- `frontend/`: Interfaz de usuario, componentes reactivos de control de inventario, clientes y ventas creados con React.

---

## Requisitos Previos

Antes de clonar y ejecutar el proyecto, asegúrate de tener instalado el siguiente entorno en tu máquina local:

- **PHP** (versión 8.1 o superior)
- **Composer** (gestor de dependencias de PHP)
- **Node.js** (versión 18 o superior) y **npm**
- **Extensiones de PHP activas**: es obligatorio abrir tu archivo `php.ini` y descomentar/activar los drivers de PostgreSQL eliminando el punto y coma (`;`) inicial:

  ```ini
  extension=pdo_pgsql
  extension=pgsql
  ```

---

## Paso 1: Creación de la Base de Datos en Supabase

Antes de configurar el backend, necesitas tener un proyecto de Supabase activo con la base de datos PostgreSQL lista para conectarse.

1. Entra en [https://supabase.com](https://supabase.com) e inicia sesión (o crea una cuenta si no tienes).

2. Haz clic en **New Project** y rellena los datos:
   - **Name**: el nombre del proyecto, por ejemplo `lighterp`.
   - **Database Password**: define una contraseña segura y guárdala, la necesitarás luego en el `.env`.
   - **Region**: elige la región más cercana a ti o a tus usuarios.

3. Espera a que Supabase termine de aprovisionar el proyecto (suele tardar uno o dos minutos).

4. Una vez creado, ve a **Project Settings** (icono de engranaje) > **Database**.

5. En la sección **Connection string**, selecciona la pestaña **Connection pooling** (recomendado para aplicaciones como Laravel) y copia los datos de conexión:
   - Host (por ejemplo `aws-0-eu-west-1.pooler.supabase.com`)
   - Port (normalmente `6543` para el pooler, o `5432` para conexión directa)
   - Database name (`postgres`)
   - User (algo como `postgres.tu_referencia_de_proyecto`)
   - Password (la que definiste en el paso 2)

6. Guarda estos datos, los usarás en el paso siguiente para configurar el archivo `.env` del backend.

No es necesario crear las tablas manualmente desde el panel de Supabase: las migraciones de Laravel (`php artisan migrate`) se encargarán de generar toda la estructura de la base de datos automáticamente una vez conectada.

---

## Paso 2: Configuración del Backend (Laravel)

1. Múdate a la carpeta del servidor desde tu terminal:

   ```bash
   cd backend
   ```

2. Instala todas las dependencias requeridas por el framework:

   ```bash
   composer install
   ```

3. Crea tu archivo de configuración de entorno local clonando la plantilla:

   ```bash
   cp .env.example .env
   ```

4. Abre el archivo `.env` recién creado y configura el bloque de la base de datos con las credenciales de conexión (por ejemplo, apuntando al pooler de Supabase):

   ```env
   DB_CONNECTION=pgsql
   DB_HOST=tu-host.pooler.supabase.com
   DB_PORT=6543
   DB_DATABASE=postgres
   DB_USERNAME=postgres.tu_usuario
   DB_PASSWORD=TU_CONTRASEÑA_SECRETA_DE_SUPABASE
   ```

5. Genera la clave única de encriptación de la aplicación:

   ```bash
   php artisan key:generate
   ```

6. Ejecuta las migraciones. Este paso leerá el esquema de código y creará automáticamente las tablas estructurales (`users`, `products`, `sales`, etc.) en la base de datos:

   ```bash
   php artisan migrate
   ```

   *(Opcional: si dispones de datos de prueba configurados en los seeders, puedes poblar las tablas ejecutando `php artisan db:seed`).*

7. Enciende el servidor local de desarrollo del backend:

   ```bash
   php artisan serve
   ```

   El backend se desplegará por defecto en: `http://localhost:8000`

---

## Paso 3: Configuración del Frontend (React)

1. Abre una nueva ventana de la terminal y dirígete a la carpeta de la interfaz de usuario:

   ```bash
   cd frontend
   ```

2. Instala todos los paquetes de Node y librerías de diseño necesarias:

   ```bash
   npm install
   ```

3. Asegúrate de que los servicios de conexión (por ejemplo, `src/services/api.js` o configuraciones de Axios) apunten a la dirección local asignada a Laravel:

   ```javascript
   const API_URL = "http://localhost:8000/api";
   ```

4. Ejecuta el servidor de desarrollo local de Vite:

   ```bash
   npm run dev
   ```

   Vite te proporcionará una URL local (normalmente `http://localhost:5173`). Abre ese enlace en tu navegador para empezar a interactuar con LightERP.

---

## Arrancar Todo con un Solo Archivo (.bat)

Para no tener que abrir dos terminales manualmente cada vez que quieras trabajar en el proyecto, puedes crear un archivo `.bat` en tu escritorio que levante ambos servidores a la vez.

1. Crea un archivo nuevo llamado `start.bat` en tu escritorio.

2. Pega el siguiente contenido (ajusta la ruta de `PROYECTO` si tu carpeta de LightERP no está exactamente en esa ubicación):

   ```bat
   @echo off
   echo Iniciando LightERP...

   set PROYECTO=C:\Users\tuusuario\LightERP

   start "LightERP Backend" cmd /k "cd /d %PROYECTO%\backend && php artisan serve"
   start "LightERP Frontend" cmd /k "cd /d %PROYECTO%\frontend && npm run dev"

   echo Backend y frontend lanzados en ventanas separadas.
   ```

3. Guarda el archivo y haz doble clic sobre él para lanzar ambos servidores desde el escritorio.

Como el `.bat` ya no está dentro del repositorio, usa rutas absolutas (`cd /d %PROYECTO%\...`) en lugar de rutas relativas, así funciona sin importar desde dónde lo ejecutes.

Esto abrirá dos ventanas de consola independientes, una con el servidor de Laravel (`http://localhost:8000`) y otra con el servidor de Vite (`http://localhost:5173`).

---

## Estructura del ERP (por ahora...)

- **Inventario**: control de productos, stock y categorías.
- **Clientes**: gestión de fichas de cliente e historial.
- **Ventas**: generación de pedidos, facturación y reportes.
- **Usuarios**: autenticación y control de accesos por rol.

---

## Stack Tecnológico

| Capa       | Tecnología                          |
|------------|--------------------------------------|
| Backend    | Laravel (PHP)                        |
| Frontend   | React + Vite + Tailwind CSS          |
| Base de datos | Supabase (PostgreSQL)             |
| API        | REST (Laravel)                       |
