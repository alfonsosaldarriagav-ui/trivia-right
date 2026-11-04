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
    { lvl: "b", type: "Escucha al cliente", said: true,
      text: "El próximo mes cerramos la planta. Son 80 personas y no queremos que esto explote en redes.",
      answer: "out",
      why: "Cuando hay reducción de personal, Outplacement acompaña a quienes salen y cuida la marca empleadora frente al mercado.",
      ref: "Diapositivas 4 y 6" },
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
    { lvl: "i", type: "Caso rápido",
      text: "Un banco lanzó un sistema nuevo y la mitad del equipo sigue usando Excel por miedo a equivocarse.",
      context: "Es una brecha de habilidades que afecta a muchas personas a la vez.",
      answer: "cap",
      why: "Las Capacitaciones desarrollan capacidades críticas en grupos completos. Aquí no falta liderazgo, falta dominio de la herramienta.",
      ref: "Diapositiva 4" },
    { lvl: "i", type: "Lee entre líneas", said: true,
      text: "En la encuesta de clima, “compensación” salió en rojo por segundo año seguido.",
      answer: "ben",
      why: "Antes de subir sueldos a ciegas, el cliente necesita saber dónde está frente al mercado. Ese es el Benchmark.",
      ref: "Diapositivas 6 y 8 (Caso 3: retención)" },
    { lvl: "i", type: "Lee entre líneas", said: true,
      text: "Mis supervisores son buenos, pero cada vez que dan feedback alguien presenta su renuncia.",
      answer: "cap",
      why: "Dar feedback y manejar conversaciones difíciles es una habilidad blanda que se entrena en grupo con una Capacitación.",
      ref: "Diapositivas 6 y 8" },
    { lvl: "a", type: "Cross-selling",
      text: "Estás cubriendo una vacante clave con Perms. El candidato ideal pide 30% más de lo presupuestado.",
      context: "¿Qué solución de Right sumas antes de que el cliente negocie?",
      answer: "ben",
      why: "Con un Benchmark el cliente sabe si el pedido está en mercado y negocia con datos. Una búsqueda abre la puerta a varias soluciones.",
      ref: "Diapositiva 7" },
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
