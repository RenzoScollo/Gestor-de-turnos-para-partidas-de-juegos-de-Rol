# Seguimiento de cierre del TP

Base de trabajo: `f1a7dfd`, sincronizada desde el repositorio original al fork de Renzo Scollo el 9 de septiembre de 2026. Rama de implementación: `entrega/completar-tp`.

Actualización posterior: se integró `origin/main` en `cc70a3c` (PR #31), con objetos únicos y mejoras de comercio/inventarios. Las pruebas E2E se adaptaron a los nuevos controles y textos. Las bases existentes necesitan agregar `objetos.esUnico`; ver [actualización de instalación](instalacion.md#bases-existentes-campo-de-objeto-único).

Este archivo registra el cierre de la entrega. Una tarea pendiente no se considera cumplida por la sola presencia de código o por un informe anterior.

El detalle de estados y evidencias se mantiene en la [matriz de requisitos](matriz_requisitos.md). El [índice documental](README.md) enlaza el modelo actual y los [contratos de API](api.md).

## Requisitos y evidencia pendiente

| Área | Trabajo para cerrar | Evidencia necesaria |
| --- | --- | --- |
| Requisitos | Contrastar propuesta, documento del grupo y condiciones vigentes de la cátedra | Matriz requisito → implementación → prueba |
| Comunicación HTTP | Unificar clientes y gestionar expiración de sesión | Pruebas de errores y sesión; recorrido en navegador |
| Funcionalidad | Auditar todos los CRUD, filtros y casos de uso | Pruebas por requisito y por rol |
| Objeto único | Precisar alcance e incorporar dato requerido | Persistencia, DTO, interfaz y pruebas |
| Frontend | Resolver advertencias, accesibilidad y presentación responsive | Lint y revisión en tamaños pequeño, medio y grande |
| E2E | Ejecutar flujo real desde navegador con backend y MySQL | Suite reproducible y resultado guardado |
| CI | Automatizar frontend, backend y MySQL | Ejecución verde en Actions del fork |
| Documentación | Actualizar propuesta, modelo, API e índice | Enlaces válidos e instalación comprobada |
| Demostración | Preparar datos, guion, video y despliegue según alcance | Artefactos reales, sin credenciales privadas |

## Automatización

`.github/workflows/verificacion.yml` ejecuta compilación, tests y lint del frontend, además de compilación, tests unitarios e integración MySQL del backend. La base del servicio CI es efímera; la suite crea y elimina exclusivamente su propia base aleatoria. La contraseña declarada en el workflow pertenece solo a ese servicio de prueba.

La primera ejecución remota aprobó ambos trabajos: [Actions 34419939705](https://github.com/RenzoScollo/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/actions/runs/34419939705). El workflow incorpora también E2E en Chromium y guarda las trazas de los fallos durante siete días. La [ejecución 34421403879](https://github.com/RenzoScollo/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/actions/runs/34421403879) aprobó esa incorporación con los dos recorridos iniciales; no demuestra todavía la integración posterior del PR #31 ni el tercer recorrido ampliado.

## Comunicación HTTP

Los servicios de usuarios, jugadores y partidas ya utilizan `api.ts`. Una búsqueda de `fetch(` en `frontend/src` encuentra únicamente el cliente común.

Una respuesta protegida `401` notifica al contexto, que limpia identidad, usuarios y perfiles. El layout protegido existente redirige al login al perder la identidad. Un rechazo de contraseña al iniciar sesión no dispara esa notificación. Las recargas de listas iniciadas antes de limpiar la sesión no vuelven a introducir datos privados.

El cliente también identifica errores de conexión sin reintentar escrituras, admite respuestas `204` y conserva el estado HTTP ante cuerpos de error inesperados. Compilación y 39 pruebas del frontend aprobadas; lint sin errores, con tres advertencias previas. La prueba de contexto verifica limpieza de identidad y listas ante un `401` del cliente real; falta comprobar la navegación completa en E2E.

## Carga de pantallas y perfiles combinados

Las cargas iniciales de clases, tiendas y personajes usan su estado inicial de carga; los reintentos se solicitan desde eventos y descartan respuestas de efectos anteriores o pantallas desmontadas. Se eliminaron las tres advertencias de React sin desactivar reglas de lint.

Personajes comprueba la existencia del perfil jugador independientemente del perfil anfitrión. Antes, una cuenta con ambos perfiles no veía la opción de crear personajes.

Verificación local: compilación correcta, 44 pruebas aprobadas y lint sin errores ni advertencias. Las nuevas pruebas cubren reintentos después de fallos de conexión en las tres páginas y creación de personajes con perfiles combinados.

## Pruebas de navegador

Cuatro recorridos locales aprobados con Chromium, Express y MySQL reales, sin reemplazar las respuestas de la API:

- Registro de anfitrión, login, creación de partida y sesión planificada, persistencia después de recargar, invalidación de cookie y redirección al login ante un `401`.
- Cierre de sesión desde el botón y bloqueo del acceso posterior a una ruta privada.
- Ingreso con Enter, once enlaces navegables con teclado, indicación de página activa, salto al contenido y ausencia de desborde horizontal en Partidas y Dashboard a 375, 768 y 1440 píxeles.
- Dos cuentas separadas: el anfitrión crea clase y partida; el jugador crea su personaje; el anfitrión inicia una sesión con ese participante, completa una misión con 50 XP y 100 monedas, finaliza la sesión y recibe karma +1 del jugador. Se verifica que no se ofrece completar de nuevo la misión y que el personaje conserva 50 XP y 200 monedas tras recargar.
- Dentro del tercer recorrido se crea una tienda y un objeto de valor 40, se compra (saldo 160), se crea un segundo inventario y se mueve el objeto a su posición 2. Luego se vende por 28 (70 %), se comprueba que sale del inventario y que el saldo persistido queda en 188.

El recorrido positivo de juego y comercio queda comprobado. Esto no demuestra todos los permisos ni todas las variantes de negocio: deben contrastarse también con las pruebas unitarias, de integración y la matriz de requisitos pendiente. Tampoco sustituye la revisión responsive y de accesibilidad.

Para repetirlos desde la raíz:

```powershell
npm ci
npm --prefix frontend ci
npx playwright install chromium
$env:TEST_DB_HOST = '127.0.0.1'
$env:TEST_DB_PORT = '3306'
$env:TEST_DB_USER = 'usuario_de_pruebas'
# Definir TEST_DB_PASSWORD en el entorno local, sin subirla al repositorio.
npm run test:e2e
```

El usuario de MySQL necesita permiso para crear y eliminar bases de prueba. La suite exige `TEST_DB_PORT` explícito, crea una base `rpg_e2e_<identificador aleatorio>` y elimina únicamente esa base al finalizar, incluso ante fallos de pruebas. Nunca reutiliza `DB_NAME`. Un corte forzado del proceso puede impedir la limpieza: revisar cualquier base residual antes de eliminarla manualmente.

Los puertos 5174 y 3101 deben estar libres. Vite mantiene su destino habitual `localhost:3000` al ejecutar la aplicación normalmente; solo el entorno E2E establece `API_PROXY_TARGET`. Las capturas y trazas de fallos quedan en `test-results/`, excluido de Git.

## Accesibilidad y responsive: revisión parcial

El menú usa enlaces reales (`NavLink`) en lugar de elementos de lista con clic, expone la página actual y tiene un nombre accesible. Incluye un enlace inicial para saltar al contenido principal y un indicador de foco visible. Login y Registro usan formularios con etiquetas asociadas y autocompletado; admiten envío con Enter. Los errores de ingreso ya no desaparecen automáticamente a los tres segundos.

Las tarjetas del Dashboard se adaptan al ancho disponible. Se revisaron capturas del Dashboard en los tres tamaños indicados; el aviso global dejó de superponerse al encabezado. Estas comprobaciones no certifican accesibilidad completa ni cubren todavía todos los CRUD, el modo oscuro o todas las combinaciones de datos.

## Contrato de objetos únicos en inventarios

La revisión de API detectó que la interfaz consultaba `esUnico` pero el detalle de inventario no lo enviaba. Se agregó el indicador al DTO del endpoint y una prueba que compra un objeto único, consulta su inventario y comprueba el atributo junto con el rango de venta. Resultado local: 20 pruebas MySQL y 76 unitarias del backend aprobadas. Esta prueba no certifica todavía la exclusión concurrente de dos objetos únicos equivalentes en una misma partida.

## Ampliación de evidencia funcional

La suite MySQL se amplió a 23 casos. Las nuevas comprobaciones cubren:

- Dos copias únicas de igual nombre compradas simultáneamente por jugadores distintos de la misma partida: una sola compra exitosa, una sola copia adquirida y un solo débito.
- Partidas activas frente a una finalizada; detalle con privacidad y anfitrión.
- Personajes de dos clases, atributos exigidos y consulta sin filtro.
- Objetos sugeridos de la clase correcta; exclusión después de comprar y rechazo al consultar sugerencias de un personaje ajeno.
- Actualización de nombre/nickname y contraseña: datos persistidos, cookie anterior invalidada, contraseña antigua rechazada y nuevo login correcto sin exponer el hash.

Estas son pruebas de API con MySQL real; no sustituyen los recorridos visuales todavía pendientes en la matriz. No se modificó la regla existente de unicidad durante esta ampliación.

## Dependencias y auditoría

La auditoría del 10 de septiembre de 2026 detectó alertas en `mysql2` (incluida la copia 3.20.0 fijada por MikroORM) y `qs`. Se actualizó `mysql2` a 3.24.4 y `qs` a 6.16.0. El override `mysql2: "$mysql2"` hace que MikroORM 6.6.16 use el mismo driver que la dependencia directa; no se migró el ORM a la versión 7.

`npm ci` reinstaló correctamente desde el lockfile y `npm ls mysql2 qs` confirmó una sola versión del driver, sin dependencias inválidas. La auditoría de ambos proyectos informó cero vulnerabilidades conocidas en esa consulta. Esto no equivale a una garantía de seguridad ni reemplaza revisiones posteriores. CI ejecuta auditoría con umbral `moderate` para señalar nuevas alertas.

La [ejecución remota 34478165867](https://github.com/RenzoScollo/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/actions/runs/34478165867) aprobó el commit anterior a esta actualización de dependencias; la nueva versión requiere su propia ejecución.
