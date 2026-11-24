# Resultados de loterías y chances de Colombia

Sitio de resultados que se actualiza solo minutos después de cada sorteo, con panel para el celular.

## Qué hace

- **Portada**: lo que ya salió hoy (lo más nuevo primero), lo que falta con cuenta regresiva, loterías de la semana, Baloto, MiLoto, ColorLoto y buscador de números.
- **Una página por sorteo** (`/dorado-noche`) y **una por fecha** (`/dorado-noche/24-de-noviembre-de-2026`), además de `/resultados/ayer` y `/resultados/<fecha>`: es lo que trae visitas desde Google.
- **Robot**: sabe a qué hora juega cada sorteo (`lib/juegos.ts`). Cuando pasa la hora, lo busca en la fuente A (resultadodelaloteria.com) y, si no está, en la B (astroluna.co). Se despierta con las visitas (`/api/hoy`, cada 40 s mientras alguien tiene la página abierta) y con un cron de respaldo (`/api/robot`).
- **Panel** `/admin` (para el celular):
  - **Resultados**: ver los de hoy, escribir o corregir uno a mano (el robot ya no lo pisa), borrar, y «Revisar fuentes ahora».
  - **Imágenes**: 4 espacios de imagen + enlace (encabezado, debajo del encabezado, mitad, final). Las fotos se achican en el celular antes de subir; los GIF se suben tal cual.
  - **Ajustes**: nombre del sitio, barra fija de WhatsApp, código de AdSense (activa los anuncios y `/ads.txt`), correo y cambio de clave.

## En esta PC

```
npm install
npm run dev -- -p 5700
```

La base local es `data/loteria.db` (no se sube). Para llenarla con los últimos 100 resultados de cada juego:

```
npx tsx --env-file-if-exists=.env.local scripts/cargar-historial.ts
```

Otros scripts: `scripts/robot.ts` (una pasada del robot), `scripts/sondear-fuentes.ts` (compara las dos fuentes y los horarios), `scripts/consulta.ts "SELECT …"`.

La clave del panel en esta PC está en `.env.local` (`ADMIN_PASSWORD`).

## Publicar (Vercel + Turso)

1. Importar el repo en Vercel.
2. Base de datos: `vercel integration add tursocloud/database` (crea `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`).
3. Variables: `ADMIN_PASSWORD`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL` (ver `.env.example`).
4. Cargar el historial en la base de producción: correr `scripts/cargar-historial.ts` con las variables de Turso.
5. Cron de respaldo: en GitHub → Settings → Secrets → Actions, crear `SITE_URL` y `CRON_SECRET` (el workflow `.github/workflows/robot.yml` llama a `/api/robot` cada 5 minutos de 10 a. m. a medianoche).

Nota: el plan gratis de Vercel es para uso no comercial; con AdSense corresponde el plan Pro.
