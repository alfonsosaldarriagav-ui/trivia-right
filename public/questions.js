// ─────────────────────────────────────────────────────────────
//  CONTENIDO DE LA TRIVIA — edita aquí las preguntas
//  answer: out | coa | cap | ben | ass
//  lvl:    b (100 pts) | i (200) | a (300) | f (500)
// ─────────────────────────────────────────────────────────────
module.exports = {
  title: "¿Qué solución ofrecerías?",
  subtitle: "Trivia BDM · Right Management",
  timePerQuestion: 20,   // segundos para responder
  previewSeconds: 4,     // segundos para leer la pregunta antes de responder
  streakBonus: 50,       // puntos extra desde el 3er acierto seguido

  levels: {
    b: { name: "Básico", points: 100 },
    i: { name: "Intermedio", points: 200 },
    a: { name: "Avanzado", points: 300 },
    f: { name: "Reto final", points: 500 }
  },

  solutions: [
    { id: "out", name: "Outplacement", color: "#3D5AFE", ink: "#FFFFFF", shape: "triangle" },
    { id: "coa", name: "Coaching",     color: "#E8590C", ink: "#FFFFFF", shape: "diamond" },
    { id: "cap", name: "Capacitación", color: "#0E9F8E", ink: "#FFFFFF", shape: "circle" },
    { id: "ben", name: "Benchmark",    color: "#F2B705", ink: "#1A1400", shape: "square" },
    { id: "ass", name: "Assessment",   color: "#9C36B5", ink: "#FFFFFF", shape: "star" }
  ],

  questions: [
    { lvl: "b", type: "¿Quién soy?",
      text: "Pongo tus sueldos y beneficios frente al espejo del mercado para que tu talento no se vaya.",
      answer: "ben",
      why: "El Benchmark Salarial y de Beneficios ayuda a atraer y retener talento comparando la oferta del cliente con el mercado.",
      ref: "Diapositiva 4" },
    { lvl: "b", type: "¿Quién soy?",
      text: "Encuentro el potencial escondido en tu organización antes de que lo descubra la competencia.",
      answer: "ass",
      why: "El Assessment identifica potencial y talento clave. Es la respuesta cuando el cliente dice “queremos identificar talento”.",
      ref: "Diapositivas 4 y 6" },
    { lvl: "i", type: "Lee entre líneas", said: true,
      text: "Ascendimos al mejor técnico a gerente. Seis meses después, su equipo no lo sigue.",
      answer: "coa",
      why: "El problema es de liderazgo en una persona clave. El Coaching Ejecutivo potencia al líder y acelera sus resultados.",
      ref: "Diapositivas 4 y 6" },
    { lvl: "a", type: "Cross-selling",
      text: "Ya vendiste Outplacement a una minera. Ahora 15 jefes de línea deben comunicar las salidas la misma semana y no saben cómo hacerlo.",
      context: "¿Qué sumas para que todos lleguen preparados a tiempo?",
      answer: "cap",
      why: "Son muchos jefes con la misma necesidad y poco tiempo: una Capacitación en conversaciones difíciles. El Coaching se reserva para líderes clave puntuales.",
      ref: "Diapositiva 8 (Caso 1: despidos masivos)" },
    { lvl: "f", type: "Reto final", said: true, time: 25,
      text: "No es un despido masivo. Es un solo gerente con 20 años en la empresa, pero queremos que salga con dignidad y que el resto del equipo lo note.",
      answer: "out",
      why: "Outplacement no es solo para salidas masivas. Acompaña a cada persona en su transición y muestra al equipo que la empresa cuida a su gente.",
      ref: "Diapositivas 3 y 4" }
  ]
};
