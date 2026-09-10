# API HTTP del gestor de rol

Base local: `http://localhost:3000/api`. Desde Vite se utiliza `/api` mediante proxy. Se reciben y devuelven datos JSON, salvo las respuestas `204`, sin cuerpo. Los listados son arrays, no objetos paginados.

Fuente del contrato: [rutas](../src/routes), [controladores](../src/controllers), [autorización](../src/security/authorization.ts), [autenticación](../src/security/auth.ts), [validadores](../src/validators), [esquema de usuario](../src/schemas/usuario.schema.ts) y [servicio de juego](../src/services/juego.service.ts). Los DTO internos no implican permiso para escribir todos sus campos.

## Sesión y seguridad

| Método y ruta | Entrada | Respuesta |
| --- | --- | --- |
| GET `/health` | Ninguna | 200: status, message, timestamp y lista orientativa de endpoints |
| POST `/auth/register` | nombreUsuario, nickname, contrasena, tipo (`jugador` o `anfitrion`); imagen opcional | 201: usuario público; crea su perfil, no inicia sesión |
| POST `/auth/login` | nickname, contrasena | 200: `{ usuario, roles }` y cookie `rpg_session` |
| GET `/auth/me` | Cookie | 200: `{ usuario, roles }`; 401 si no hay sesión válida |
| POST `/auth/logout` | Cookie opcional, sin cuerpo | 204; invalida sesión y limpia cookie |

Usuario público: `{ idUsuario, nombreUsuario, nickname, imagen }`. Roles: `{ idUsuario, anfitrion, jugador }`; una cuenta puede tener ambos perfiles.

La cookie es HttpOnly, SameSite=Strict, ruta `/api`; en producción también Secure. Dura ocho horas. Las sesiones están en memoria: reiniciar el proceso las invalida, y un nuevo login invalida las sesiones anteriores de esa cuenta. Cambiar la contraseña o borrar la cuenta también invalida el acceso. No hay autenticación Bearer ni tokens para guardar en localStorage.

Registro exige nombre de 2–50 caracteres, nickname de 3–50, contraseña de 6–100 e imagen de hasta 255. Login acepta nickname de 1–50 y contraseña de 1–100. Los cuerpos son estrictos. Login y registro comparten un límite de 30 solicitudes POST por IP en 15 minutos; las siguientes reciben 429. Login puede devolver 503 si se alcanza el límite de sesiones del servidor.

Todas las rutas restantes exigen sesión. Los GET de catálogos, usuarios, perfiles, partidas, personajes, sesiones y misiones son visibles a cuentas autenticadas. Inventarios y sugerencias de un personaje se restringen a su propietario.

El servidor compara el encabezado Origin de las escrituras con `CORS_ORIGIN`. El frontend actual necesita servir `/api` bajo su mismo origen, mediante proxy inverso en producción; habilitar CORS por sí solo no cambia esta arquitectura.

## Convención de CRUD simple

Para los recursos siguientes: GET `/<recurso>` devuelve lista; GET `/<recurso>/:id`, detalle; POST crea con 201; PUT actualiza con 200; DELETE elimina con 204. Los PUT de estos CRUD son parciales, salvo restricciones indicadas. No enviar IDs generados en el cuerpo.

| Recurso / ID | Cuerpo de creación | Campos actualizables por el cliente | Permiso de escritura |
| --- | --- | --- | --- |
| `usuarios` / idUsuario | nombreUsuario, nickname, contrasena; imagen opcional | nombreUsuario, nickname, contrasena, imagen | Crear: anfitrión; editar/borrar: propia cuenta |
| `jugadores` / idUsuario | idUsuario, estado booleano | estado | Perfil propio |
| `anfitriones` / idUsuario | idUsuario | PUT rechazado con 403; karma y cantidad de partidas no son editables | Alta/baja de perfil propio; servidor fija los valores iniciales |
| `clases` / idClase | nombreClase, descripcionClase | Los mismos | Anfitrión |
| `tiendas` / idTienda | nombre, claseTienda; idClase opcional/null | Los mismos | Anfitrión |
| `objetos` / idObjeto | nombre, descripcion, tipoObjeto, valor, nivelObjeto; esUnico, idTienda y posicion opcionales | Los mismos, solo si no está adquirido | Anfitrión |
| `partidas` / idPartida | nombre, estado (`activa`/`finalizada`), limiteJugadores, esPrivada, idUsuarioAnfitrion; contrasena si privada | Datos de la partida, sin transferir a otro anfitrión | Anfitrión propietario |
| `personajes` / idPersonaje | nombreFicticio, raza, idClase, idUsuarioJugador, idPartida; contrasenaPartida si privada | Solo nombreFicticio, raza, idClase | Jugador propietario |

El servidor fija al crear personajes: dinero 100, XP 0 y nivel 1. No permite adjudicarse progresión ni cambiar propietario/partida mediante PUT. Crea el inventario inicial dentro de la misma transacción.

Los datos públicos por recurso se especifican en [src/types](../src/types): incluyen IDs y referencias aplanadas, nunca contraseñas. Partida agrega nicknameAnfitrion y esPrivada; Personaje incluye claseNombre, jugadorNombre y partidaNombre; Objeto incluye esUnico, idTienda, idPersonaje, numInventario y posicion. Una referencia inexistente de tienda o inventario en el DTO de objeto se representa con null.

Las bajas pueden rechazarse si existen dependencias o historial. Una cuenta no puede borrar datos ajenos. Un objeto adquirido solo se modifica mediante compra, venta o movimiento, no mediante el CRUD del catálogo.

DELETE `/clases/:id` devuelve 409 si hay tiendas vinculadas, sin modificar sus referencias. Para quitar una vinculación explícitamente, enviar PUT `/tiendas/:id` con `{ "idClase": null }`; también se puede cambiar por otra clase existente. Los personajes vinculados siguen impidiendo la baja. Esta validación evita depender del `ON DELETE SET NULL` que puede tener la FK nullable de tiendas en instalaciones existentes.

### Listados especiales

| GET | Resultado |
| --- | --- |
| `/partidas/activas` | Array de partidas activas, con privacidad y anfitrión |
| `/personajes?idClase=1` | Array de personajes de esa clase; sin filtro devuelve todos |
| `/objetos/sugeridos/:idPersonaje` | Array de objetos cuya tienda está vinculada a la clase del personaje propio |

## Sesiones, misiones e inventarios

Estos recursos tienen GET de lista y detalle, POST de creación (201), PUT (200) y DELETE (204). Los IDs compuestos de la URL identifican el recurso y prevalecen sobre el cuerpo al actualizar. En PUT se deben enviar todos los campos no identificadores requeridos por su esquema, no un parche arbitrario.

| Colección | URL de detalle/edición/baja | Cuerpo POST; en PUT omitir identificadores |
| --- | --- | --- |
| `/sesiones` | `/sesiones/:idPartida/:numSesion` | idPartida, numSesion, duracionSesion |
| `/misiones` | `/misiones/:idPartida/:numSesion/:numMision` | idPartida, numSesion, numMision, descripcion, dineroTotal, xpTotal; asistenciaGrupoGrande opcional (0) |
| `/inventarios` | `/inventarios/:idPersonaje/:numInventario` | idPersonaje, numInventario, cantidadEspacio |

IDs y números de recurso son enteros positivos hasta 2147483647. Duración, dinero y XP son enteros entre 0 y 2147483647. Capacidad: 1–1000. Descripción de misión: 1–5000 caracteres, sin contar espacios exteriores. Estos cuerpos rechazan claves desconocidas.

Sesión y misión: escribe el anfitrión de la partida. Inventario: escribe su jugador propietario. Solo se editan/borran sesiones planificadas; las misiones completadas no se editan ni borran. No se borra un inventario ocupado ni se reduce dejando objetos fuera de capacidad.

### Respuestas

- Sesión: `{ idPartida, numSesion, duracionSesion, cantJugadores, estadoSesion }`. Estado: 0 planificada, 1 en curso, 2 finalizada. El GET de detalle agrega `participantes: [{ idPersonaje, nombre, dioKarma }]`.
- Misión: identificadores, descripcion, dineroTotal, xpTotal, dineroOtorgadoAJugadores, xpOtorgadoJugadores, asistenciaGrupoGrande y estado booleano (completada).
- Inventario: `{ idPersonaje, numInventario, cantidadEspacio }`. El GET de detalle agrega `objetos: [{ idObjeto, nombre, posicion, valor, esUnico, minimo, maximo }]`; minimo/maximo son precios enteros de venta. La lista de inventarios contiene solo los propios; sin perfil jugador devuelve `[]`.

## Acciones de negocio

Todas son POST y devuelven 200 si se completan.

| Ruta | Cuerpo | Respuesta / restricciones |
| --- | --- | --- |
| `/sesiones/:idPartida/:numSesion/jugar` | `{ "idPersonajes": [1, 2] }` | DTO sesión; participantes de esa partida, sin duplicados; una sesión en curso por partida |
| `/sesiones/:idPartida/:numSesion/finalizar` | Sin cuerpo | DTO sesión; no admite misiones pendientes |
| `/sesiones/:idPartida/:numSesion/calificar` | `{ "valor": 1 }` o -1 | `{ karma }`; participante de sesión finalizada, una vez, sin autocalificarse |
| `/misiones/:idPartida/:numSesion/:numMision/completar` | `{ "recompensas": [{ "idPersonaje": 1, "dinero": 100, "xp": 50 }] }` | DTO misión; reparto entre asistentes, sumas exactas a los totales, sin repetir misión |
| `/objetos/:idObjeto/comprar` | `{ "idPersonaje": 1, "numInventario": 1, "posicion": 0 }` | `{ objeto, idPersonaje, numInventario, dineroRestante }` |
| `/inventarios/:idPersonaje/:numInventario/mover` | `{ "idObjeto": 1, "posicion": 2 }` | `{ idObjeto, idPersonaje, numInventario, cantidadEspacio, posicion }` |
| `/objetos/:idObjeto/vender` | `{ "idPersonaje": 1, "idTienda": 1, "precio": 28 }` | `{ idObjeto, idPersonaje, dineroRestante, precio }` |

Compra exige objeto en tienda, saldo, posición libre y propiedad del inventario. Movimiento exige objeto del mismo personaje y posición válida. Venta acepta un entero entre ceil(valor × 0.70) y floor(valor × 1.00). Las operaciones usan transacciones; el cliente debe refrescar saldo e inventario después del éxito y no reintentar automáticamente escrituras cuya respuesta se perdió.

## Errores

Forma habitual: `{ "message": "Descripción del problema" }`. Algunos validadores agregan `errors: [{ campo, mensaje }]`; el cliente común admite ambos formatos.

| Código | Interpretación |
| --- | --- |
| 400 | Cuerpo, identificador o entrada inválida |
| 401 | Falta sesión, expiró o credenciales incorrectas en login |
| 403 | Operación, propietario u origen no autorizado |
| 404 | Recurso o ruta inexistente |
| 409 | Conflicto de negocio, duplicado, dependencia, capacidad o estado incompatible |
| 429 | Límite de solicitudes de autenticación |
| 500 | Error interno; no debe interpretarse como éxito ni reintentarse a ciegas |
| 503 | Servidor sin capacidad de sesiones para nuevo login |

El mensaje concreto y algunos errores de referencias dependen del módulo: consultar controladores y tests para los casos específicos. El servidor limita el cuerpo JSON a 64 KB. No enviar contraseñas reales en ejemplos, capturas ni repositorios.

## Ejemplo de cliente con cookie

Ejemplo para ejecutar en la consola del navegador abierto en el frontend local; reemplazar los datos por una cuenta de prueba propia:

```javascript
const login = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'same-origin',
  body: JSON.stringify({ nickname: 'cuenta_de_prueba', contrasena: 'clave_de_prueba' }),
});
if (!login.ok) throw new Error(`Login HTTP ${login.status}`);
const partidas = await fetch('/api/partidas/activas', { credentials: 'same-origin' });
if (!partidas.ok) throw new Error(`Partidas HTTP ${partidas.status}`);
console.log(await partidas.json());
```

Para una demostración reproducible sin credenciales reales, ejecutar la [suite E2E](entrega.md#pruebas-de-navegador), que crea sus cuentas y su base temporal. No usa datos de producción.
