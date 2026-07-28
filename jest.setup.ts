// jest.setup.ts — Variables de entorno para que los tests UNITARIOS (los que
// no tocan la base) no dependan de que exista un .env local. El test de
// INTEGRACION si necesita el .env real (usa buildApp -> mikro-orm.config,
// que ya hace su propio "import 'dotenv/config'").
process.env.JWT_SECRET ??= 'clave-secreta-solo-para-tests';
process.env.JWT_EXPIRES_IN ??= '2h';
