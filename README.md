# Cerrajería: web + panel

- Web pública: `/`
- Panel (solicitudes, quejas, precios): `/admin`

## Cambiar datos del negocio
Todo está en `lib/site.ts` (nombre, ciudad, WhatsApp, horario, servicios y precios iniciales).

## Local
```bash
npm install
cp .env.example .env.local   # pon ADMIN_PASSWORD (DATABASE_URL es opcional en dev)
npm run dev
```
Sin `DATABASE_URL` los mensajes se guardan en memoria y se borran al reiniciar (solo sirve para probar).

## Publicar en Vercel
```bash
npm i -g vercel
vercel                      # crea y enlaza el proyecto
vercel integration add neon # crea la base de datos y agrega DATABASE_URL
vercel env add ADMIN_PASSWORD
vercel --prod
```
Las tablas se crean solas en la primera visita.
