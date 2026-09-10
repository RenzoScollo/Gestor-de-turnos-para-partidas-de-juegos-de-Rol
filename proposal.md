# Propuesta TP DSW

## Grupo
### Integrantes
53958 - Gudiño, Octavio Alejandro <br>
54241 - Salomon, Emanuel <br> 
54279 - Scollo, Renzo <br>
54307 - Testi, Franco  <br> 
54342 - Ciesco, Alejandro Mario <br>

### Repositorios
* [Frontend del repositorio original](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/tree/main/frontend)
* [Backend del repositorio original](https://github.com/FrancoTesti/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/tree/main/src)
* [Rama de cierre en el fork de Renzo](https://github.com/RenzoScollo/Gestor-de-turnos-para-partidas-de-juegos-de-Rol/tree/entrega/completar-tp)

El proyecto es un monorepositorio: frontend y backend tienen dependencias y ejecución separadas. El PR final de entrega todavía debe publicarse; el enlace a la rama no lo reemplaza.

## Tema
### Descripción
Trata de un gestor de turnos para partidas de juegos de Rol, con sistema de compra-venta de objetos del juego en las partidas, con registro y logueo tanto para “Jugador” como “Anfitrión” y sistema para crear personajes de rol.

### Modelo
[Modelo de datos implementado y relaciones](docs/modelo.md).

[DER anterior del grupo](docs/DER_NEW.png), conservado como referencia histórica: no representa todos los cambios del código actual.



## 𝘼𝙡𝙘𝙖𝙣𝙘𝙚 𝙁𝙪𝙣𝙘𝙞𝙤𝙣𝙖𝙡 

### 𝘼𝙡𝙘𝙖𝙣𝙘𝙚 𝙈𝙞́𝙣𝙞𝙢𝙤

Regularidad:
|Req|Detalle|
|:-|:-|
|CRUD simple|1. CRUD Usuario<br>2. CRUD Objeto<br>3. CRUD Tienda <br>4. CRUD Misión <br>5. CRUD Clase |
|CRUD dependiente|1. CRUD Personaje {Depende de} CRUD Jugador<br>2. CRUD Jugador {Depende de} CRUD Usuario. <br>3. CRUD Anfitrion {Depende de} CRUD Usuario |
|Listado<br>+<br>detalle|1. Listado de partidas filtrado por estado (activo), muestra nombre de la partida, su privacidad y anfitrión => detalle de todas las partidas que están siendo hosteadas. <br> 2. Listado de objetos sugeridos filtrado por clase de personaje, muestra nombre del objeto, tipo, valor => detalle de los objetos que se pueden comprar y coinciden con mi clase. <br> 3. Listado de personajes filtrado por clase, muestra nombre del personaje, jugador asociado, xp, nivel, raza y el id del personaje => detalle de los personajes que poseen el clase elegido. Si no se elige: cualquiera.|
|CUU/Epic|1. Jugar una sesión<br>2. Gestionar comercialización de objetos <br>3. Realizar misión|



Adicionales para Aprobación
|Req|Detalle|
|:-|:-|
|CRUD |1. CRUD Usuario<br>2. CRUD Objeto <br>3. CRUD Partida <br>4. CRUD Tienda<br>5. CRUD Misión<br>6. CRUD Personaje<br>7. CRUD Jugador <br>8. CRUD Sesión <br>9. CRUD Anfitrión <br>10. CRUD Inventario|
|CUU/Epic|1. Gestionar inventario<br>2. Calificar anfitrión<br>3. Crear personaje <br>4. Gestionar partida <br>5. Actualizar usuario |


### 𝘼𝙡𝙘𝙖𝙣𝙘𝙚 𝘼𝙙𝙞𝙘𝙞𝙤𝙣𝙖𝙡 𝙑𝙤𝙡𝙪𝙣𝙩𝙖𝙧𝙞𝙤

|Req|Detalle|
|:-|:-|
|Listados |1. |
|CUU/Epic|1. <br>2. |
|Otros|1. |

