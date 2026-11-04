# Trivia en vivo · Right Management

Juego tipo Kahoot para los BDMs. Una pantalla se proyecta y cada participante juega desde su celular.

## Qué incluye

- **Pantalla del anfitrión (`/host`)**: PIN de 6 dígitos y código QR para unirse, lista de jugadores en vivo, preguntas con cuenta regresiva, gráfico de respuestas, explicación con la diapositiva de referencia, ranking con cambios de posición y podio final con confeti y música.
- **Pantalla del jugador (`/play`)**: botones grandes de colores y formas (una por solución), resultado inmediato, puntos ganados, racha, puesto actual y distancia con el jugador de adelante.
- **Puntaje estilo Kahoot**: quien responde más rápido gana más puntos (entre el 50% y el 100% del puntaje de la pregunta). Desde el tercer acierto seguido se suman +50 puntos por racha.
- **Reconexión**: si un jugador recarga o pierde señal, vuelve a entrar con su puntaje intacto.

## Requisitos

- [Node.js](https://nodejs.org) versión 18 o superior.

## Cómo jugarlo en una sala (misma red Wi-Fi)

1. Descomprime la carpeta y ábrela en una terminal.
2. Instala las dependencias (solo la primera vez):
   ```
   npm install
   ```
3. Inicia el juego:
   ```
   npm start
   ```
4. En la computadora conectada al proyector, abre `http://localhost:3000/host`.
5. Los participantes escanean el QR o entran a la dirección que aparece en pantalla y escriben el PIN. Deben estar en la misma red Wi-Fi que la computadora.
6. Cuando todos estén dentro, presiona **Empezar**.

**Atajos del anfitrión:** `Enter` o `Espacio` avanza al siguiente paso y `F` activa la pantalla completa. Para sacar a alguien de la partida, haz clic en su nombre en la sala de espera.

> Si la red de la oficina bloquea la conexión entre equipos, publica el juego en internet (ver abajo).

## Cómo publicarlo en internet (para jugar desde cualquier red)

Con [Render](https://render.com), que tiene un plan gratuito:

1. Sube esta carpeta a un repositorio de GitHub.
2. En Render, crea un **New → Web Service** y conecta el repositorio.
3. Configura **Build command** con `npm install` y **Start command** con `npm start`.
4. Render te dará una dirección del tipo `https://trivia-right.onrender.com`. El anfitrión entra a `/host` y los jugadores escanean el QR.

Railway, Fly.io o cualquier servidor con Node.js funcionan igual.

> En el plan gratuito de Render, el servidor se apaga si nadie lo usa. Ábrelo unos minutos antes de la sesión para que arranque.

## Cómo editar las preguntas

Todo el contenido está en **`questions.js`**:

| Campo | Qué es |
|---|---|
| `text` | La pregunta o frase del cliente |
| `said: true` | La muestra entre comillas con “Si un cliente te dice…” |
| `context` | Una línea adicional opcional |
| `answer` | `out` Outplacement · `coa` Coaching · `cap` Capacitación · `ben` Benchmark · `ass` Assessment |
| `lvl` | `b` Básico 100 · `i` Intermedio 200 · `a` Avanzado 300 · `f` Reto final 500 |
| `why` / `ref` | Explicación y diapositiva que se muestran al revelar la respuesta |
| `time` | Segundos para responder esa pregunta (opcional) |

Al inicio del mismo archivo puedes cambiar el tiempo por pregunta (`timePerQuestion`), el tiempo de lectura (`previewSeconds`) y el bonus de racha (`streakBonus`). Después de editar, reinicia con `npm start`.

## Estructura

```
server.js          Servidor del juego (salas, tiempos, puntaje, ranking)
questions.js       Contenido de la trivia
public/host.html   Pantalla del proyector
public/play.html   Pantalla del celular
public/shared.js   Formas, sonidos y confeti
public/styles.css  Estilos compartidos
```
