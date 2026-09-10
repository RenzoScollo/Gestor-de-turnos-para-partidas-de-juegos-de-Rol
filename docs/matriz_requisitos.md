# Matriz de alcance y evidencia

Revisión sobre `0d9422d`, con main original `cc70a3c` integrado. No constituye un acta de aprobación. Fuente funcional: [propuesta del grupo](../proposal.md). El documento de Google permanece pendiente de relectura.

Estados: **probado** significa que existe una comprobación ejecutada del caso indicado, no que estén verificadas todas sus variantes. **Parcial** requiere ampliar la evidencia. **Pendiente** indica que no hay un entregable comprobado.

## Funcionalidad acordada

| Requisito de la propuesta | Código y evidencia | Estado de cierre |
| --- | --- | --- |
| CRUD Usuario | `usuario.service.ts`, `UsersPage.tsx`; integración de registro, permisos y baja de cuenta | Parcial: auditar edición completa y navegación del CRUD |
| CRUD Objeto, Tienda y Clase | Servicios respectivos, pantallas específicas; integración «CRUD de catálogo»; creación y compra en E2E | Parcial: revisar todas las variantes y detalles visuales |
| CRUD Misión | `juego.service.ts`, `ModulePage`; integración de CRUD y recompensas | Probado en integración; completar recorrido visual de edición/baja |
| Personaje dependiente de Jugador | `personaje.service.ts`, `PersonajesPage`; creación privada, inventario inicial y restricciones en integración | Parcial: completar edición/baja y filtro en navegador |
| Jugador y Anfitrión dependientes de Usuario | `ProfilesPage`, servicios de perfiles; integración de altas, cambios y dependencias | Probado en integración; revisar navegación con ambos perfiles |
| Partidas activas, privacidad y anfitrión; detalle | Integración excluye una partida finalizada y verifica privacidad/anfitrión en detalle | Probado en API; falta recorrido específico del filtro en navegador |
| Objetos sugeridos por clase y detalle | Integración distingue dos clases, excluye el objeto comprado y rechaza personaje ajeno | Probado en API; falta recorrido específico del filtro en navegador |
| Personajes por clase y detalle | Integración distingue clases, comprueba los atributos requeridos y consulta sin filtro | Probado en API; falta filtro/restablecimiento visual |
| Jugar sesión + realizar misión | E2E de dos cuentas: asistencia, inicio, misión, 50 XP y 100 monedas, cierre | Probado para el recorrido positivo; integración cubre rechazos e idempotencia |
| Comercialización | E2E: comprar por 40 y vender por 28; integración de saldo, propiedad, rollback y concurrencia | Probado para los casos enumerados |
| CRUD Partida y Sesión | Servicios, `ModulePage`; creación E2E y CRUD de sesiones planificadas en integración | Parcial: auditar recorrido visual completo de partidas |
| CRUD Inventario y movimiento | E2E crea segundo inventario, mueve a posición 2 y vende; integración de capacidad y baja | Probado para los casos enumerados |
| Calificar anfitrión | E2E termina con karma 1; integración impide repetición | Probado para el caso enumerado |
| Crear personaje y gestionar partida | Recorrido de dos cuentas y pruebas de cupo/contraseña/propiedad | Parcial: confirmar totalidad de variantes con la propuesta ampliada |
| Actualizar usuario | Integración persiste nombre/nickname y contraseña; invalida cookie anterior y rechaza contraseña antigua | Probado en API; falta recorrido de edición en navegador |

Las referencias de pruebas están en [integración MySQL](../src/integration/juego.test.ts), [tests backend](../src/tests), [tests frontend](../frontend/src) y [E2E](../e2e/autenticacion.spec.ts). No se atribuye autoría individual a partir de un conteo de tests.

## Condiciones técnicas y entregables

Las [condiciones de la cátedra](https://github.com/utnfrrodsw/tp) requieren separación frontend/API, persistencia, capas, validación, permisos, pruebas y visualización en tres tamaños. Para la entrega final agregan documentación de API, video, evidencia de tests, enlaces de PR y despliegue. La [guía documental](https://github.com/utnfrrodsw/tp/blob/main/docs.md) pide un índice en `docs/README.md`, minutas y seguimiento de tareas. Su tabla marca despliegue como TBD, pero el README lo enumera: se conserva pendiente hasta aclaración docente.

| Área | Evidencia actual | Trabajo restante |
| --- | --- | --- |
| Arquitectura | React/Vite separado de Express; servicios/DTO/entidades; MikroORM y MySQL | Revisar consistencia final de contratos con el código de entrega |
| Autenticación | Cookie, `auth.ts`, autorización backend y layout protegido; tests de sesión | Auditar permisos visuales de cada operación |
| Tests | 76 backend, 50 frontend, 23 MySQL y 4 E2E locales registrados en seguimiento | Adjuntar ejecución remota final e identificar participación real de integrantes |
| Responsive/UX | Menú y Dashboard comprobados a 375/768/1440; Enter y salto al contenido | Revisar todos los módulos, contrastes, datos largos y modo oscuro; revisar estrategia mobile-first |
| Instalación | Guía y scripts; actualización `esUnico` documentada | Ensayo limpio completo con la versión final |
| Propuesta/modelo | Enlaces corregidos y modelo actual basado en entidades | Cotejar con documento del grupo y validación docente |
| API | [Contratos HTTP](api.md): entradas, salidas, permisos, sesión, errores y acciones | Revisión final de ejemplos y cambios posteriores |
| Seguimiento grupal | Historial Git y planes existentes | Aportar minutas y tracking reales; no reconstruir reuniones ficticias |
| PR final | Rama en fork | Publicar/enlazar el PR final cuando corresponda; no sustituirlo por enlace a rama |
| Video | Sin evidencia consultada | Grabar demostración real y registrar URL accesible |
| Despliegue | Sin URL/credenciales verificadas | Definir plataforma, desplegar y comprobar acceso; no publicar secretos |
| Defensa y envío | No verificables desde el código | Coordinación y envío por el grupo |

## Orden de cierre

1. Completar las pruebas funcionales marcadas parciales y corregir fallos reales.
2. Revisar interfaz de todos los módulos y documentar contratos de API.
3. Ensayar instalación limpia y revisar seguridad de dependencias.
4. Reunir evidencia grupal, video y despliegue; validar con el documento compartido.
5. Publicar el PR final y registrar resultados de CI asociados a ese commit.

No se asigna un porcentaje global: mezclar código probado con entregables ausentes ocultaría lo que impide entregar.
