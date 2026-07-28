// app.ts — Punto de entrada del backend.
// Arma la app (buildApp) y la deja escuchando.
// Uso: npm run dev (recarga sola) o npm start
import 'dotenv/config';
import { buildApp } from './buildApp';

async function main() {
  const { app } = await buildApp();

  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`API escuchando en http://localhost:${port}`);
    console.log(`Prueba: GET http://localhost:${port}/api/usuarios`);
  });
}

main().catch((err) => {
  console.error('No se pudo iniciar el servidor:', err);
  process.exit(1);
});
