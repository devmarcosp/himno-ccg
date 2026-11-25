import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ref, onValue, set, update, remove } from "firebase/database";
import {
  Rocket, Mic2, Brain, LayoutGrid, Drum, Ear, Trophy, Medal, Users,
  Check, X, Lock, Eye, SkipForward, ThumbsUp, ThumbsDown, RefreshCw, Sparkles
} from 'lucide-react';
import {
  db, NOMBRES_ESTUDIANTES, HIMNO_ESTRUCTURA,
  shuffleArray, generateBeatSequence
} from './shared.js';
import { MusicNote, ActionButton } from './components.jsx';

// ==========================================
// 1. CONFIGURACIÓN DEL JUEGO
// ==========================================
const TEAM_SIZE = 4;              // la aventura se juega en grupos de 4
const APROBACION = 60;            // puntaje mínimo para "pasar" una etapa
const MEMORICE_PARES = 6;         // 6 pares = 12 cartas (grilla 4x3)
const MEMORICE_INTENTOS_EXTRA = 5; // intentos disponibles por sobre el mínimo
const RITMO_COMPASES = 3;
const QUIZ_PREGUNTAS = 4;
const OIDO_RONDAS = 6;

const ETAPAS = [
  {
    id: 'voz', nombre: 'LA VOZ', subtitulo: 'Canten el himno', icon: Mic2,
    bg: 'bg-red-600', border: 'border-red-900', soft: 'bg-red-100', text: 'text-red-600',
    instruccion: 'El equipo canta una parte del himno. En la pantalla faltan palabras: hay que cantarlas de memoria. El profe marca cada palabra con ✓ o ✗.'
  },
  {
    id: 'saber', nombre: 'EL SABER', subtitulo: 'Cuestionario musical', icon: Brain,
    bg: 'bg-indigo-600', border: 'border-indigo-900', soft: 'bg-indigo-100', text: 'text-indigo-600',
    instruccion: 'Cuatro preguntas sobre los parámetros del sonido: duración, altura, timbre e intensidad. El equipo conversa y elige una alternativa.'
  },
  {
    id: 'memoria', nombre: 'LA MEMORIA', subtitulo: 'Memorice musical', icon: LayoutGrid,
    bg: 'bg-amber-500', border: 'border-amber-700', soft: 'bg-amber-100', text: 'text-amber-600',
    instruccion: 'Encuentren los 6 pares musicales dando vuelta las cartas. Ojo: los intentos son limitados, así que hay que memorizar.'
  },
  {
    id: 'ritmo', nombre: 'EL RITMO', subtitulo: 'Eco rítmico', icon: Drum,
    bg: 'bg-emerald-600', border: 'border-emerald-900', soft: 'bg-emerald-100', text: 'text-emerald-600',
    instruccion: 'Tres compases de 4/4 en pantalla. El equipo los lee y los toca con palmas, uno por uno. El profe valida cada compás.'
  },
  {
    id: 'oido', nombre: 'EL OÍDO', subtitulo: '¿Agudo o grave?', icon: Ear,
    bg: 'bg-sky-600', border: 'border-sky-900', soft: 'bg-sky-100', text: 'text-sky-600',
    instruccion: 'Aparecen seis sonidos. El equipo decide rápido si cada uno es AGUDO o GRAVE.'
  }
];

// ==========================================
// 2. BANCOS DE CONTENIDO
//    (provisorios: después se amplían y se generan al azar)
// ==========================================
const QUIZ_BANK = [
  { param: 'Duración', question: '¿Cuántos tiempos dura una figura REDONDA?', options: ['1 tiempo', '2 tiempos', '4 tiempos'], correct: 2 },
  { param: 'Duración', question: '¿Qué figura dura la mitad de una BLANCA?', options: ['La negra', 'La redonda', 'La corchea'], correct: 0 },
  { param: 'Duración', question: '¿Cuántas corcheas caben en el tiempo de una NEGRA?', options: ['4 corcheas', '2 corcheas', '3 corcheas'], correct: 1 },
  { param: 'Duración', question: '¿Cuántos tiempos caben en un compás de 4/4?', options: ['3 tiempos', '4 tiempos', '2 tiempos'], correct: 1 },
  { param: 'Altura', question: '¿Qué significa que un sonido sea AGUDO?', options: ['Que suena muy fuerte', 'Que suena alto o fino', 'Que dura mucho rato'], correct: 1 },
  { param: 'Altura', question: '¿Cuál de estos instrumentos suena más GRAVE?', options: ['El triángulo', 'La flauta', 'El bombo'], correct: 2 },
  { param: 'Altura', question: '¿Qué parámetro del sonido nos dice si una nota es más alta o más baja?', options: ['La altura', 'La intensidad', 'El timbre'], correct: 0 },
  { param: 'Timbre', question: 'El TIMBRE de un sonido es...', options: ['la velocidad del sonido', 'el color del sonido, lo que nos dice quién suena', 'cuánto dura el sonido'], correct: 1 },
  { param: 'Timbre', question: 'Si escuchamos la misma melodía en guitarra y después en flauta, ¿qué parámetro cambió?', options: ['La duración', 'La altura', 'El timbre'], correct: 2 },
  { param: 'Timbre', question: '¿A qué familia de instrumentos pertenece el violín?', options: ['Viento', 'Percusión', 'Cuerdas'], correct: 2 },
  { param: 'Intensidad', question: '¿Qué nos indica la palabra FORTE en una partitura?', options: ['Tocar suave', 'Tocar fuerte', 'Tocar rápido'], correct: 1 },
  { param: 'Intensidad', question: 'La INTENSIDAD del sonido se refiere a...', options: ['si es fuerte o suave', 'si es agudo o grave', 'si es rápido o lento'], correct: 0 },
  { param: 'Tempo', question: 'Si una canción empieza a sonar más rápido, ¿qué elemento está cambiando?', options: ['El timbre', 'El tempo', 'La altura'], correct: 1 },
  { param: 'Pulso', question: 'El PULSO de una canción es...', options: ['el latido constante, como el corazón', 'el instrumento que suena más fuerte', 'la letra de la canción'], correct: 0 }
];

const QUIZ_BANK_1BASICO = [
  { param: 'Altura', question: '¿Cuál de los dos suena más GRAVE?', options: ['🐘 El elefante', '🐦 El pajarito'], correct: 0 },
  { param: 'Altura', question: '¿Cuál de los dos suena más AGUDO?', options: ['🐭 El ratoncito', '🦁 El león'], correct: 0 },
  { param: 'Altura', question: '¿Cuál suena más agudo?', options: ['🔔 Una campanita', '🪘 Un bombo grande'], correct: 0 },
  { param: 'Intensidad', question: '¿Cuál de los dos suena más FUERTE?', options: ['🤫 Un susurro', '🥁 Un tambor'], correct: 1 },
  { param: 'Intensidad', question: '¿Cuál de los dos suena más SUAVE?', options: ['🌧️ La lluvia suave', '⛈️ Un trueno'], correct: 0 },
  { param: 'Duración', question: '¿Cuál sonido dura MÁS tiempo?', options: ['👏 Una palmada', '🔔 Una campana grande'], correct: 1 },
  { param: 'Duración', question: 'Si el ritmo es LENTO, ¿cómo caminamos?', options: ['🐢 Despacito', '🐇 Muy rápido'], correct: 0 },
  { param: 'Tempo', question: '¿Cuál animal se mueve con un ritmo RÁPIDO?', options: ['🐇 El conejo', '🐌 El caracol'], correct: 0 },
  { param: 'Timbre', question: '¿Cómo hacemos sonar un tambor?', options: ['🥁 Golpeándolo', '🎻 Frotándolo con un arco'], correct: 0 },
  { param: 'Timbre', question: 'Escuchamos un sonido y sabemos que es una guitarra. Eso es...', options: ['el timbre, el color del sonido', 'el volumen del sonido'], correct: 0 }
];

const MEMORICE_BANK = [
  { id: 'redonda', a: { figure: 'Redonda' }, b: { emoji: '4️⃣', text: '4 tiempos' } },
  { id: 'blanca', a: { figure: 'Blanca' }, b: { emoji: '2️⃣', text: '2 tiempos' } },
  { id: 'negra', a: { figure: 'Negra' }, b: { emoji: '1️⃣', text: '1 tiempo' } },
  { id: 'corcheas', a: { figure: 'Corcheas' }, b: { emoji: '➗', text: 'Media tiempo cada una' } },
  { id: 'agudo', a: { text: 'AGUDO' }, b: { emoji: '🐦', text: 'Pajarito' } },
  { id: 'grave', a: { text: 'GRAVE' }, b: { emoji: '🐘', text: 'Elefante' } },
  { id: 'forte', a: { text: 'FORTE' }, b: { emoji: '🔊', text: 'Fuerte' } },
  { id: 'piano', a: { text: 'PIANO' }, b: { emoji: '🔈', text: 'Suave' } },
  { id: 'timbre', a: { text: 'TIMBRE' }, b: { emoji: '🎨', text: 'El color del sonido' } },
  { id: 'pulso', a: { text: 'PULSO' }, b: { emoji: '❤️', text: 'Latido constante' } },
  { id: 'tempo', a: { text: 'TEMPO' }, b: { emoji: '🏃', text: 'La velocidad' } },
  { id: 'cuerdas', a: { text: 'CUERDAS FROTADAS' }, b: { emoji: '🎻', text: 'Violín' } }
];

const MEMORICE_BANK_1BASICO = [
  { id: 'fuerte', a: { text: 'FUERTE' }, b: { emoji: '🥁', text: 'Tambor' } },
  { id: 'suave', a: { text: 'SUAVE' }, b: { emoji: '🤫', text: 'Susurro' } },
  { id: 'agudo', a: { text: 'AGUDO' }, b: { emoji: '🐦', text: 'Pajarito' } },
  { id: 'grave', a: { text: 'GRAVE' }, b: { emoji: '🐘', text: 'Elefante' } },
  { id: 'rapido', a: { text: 'RÁPIDO' }, b: { emoji: '🐇', text: 'Conejo' } },
  { id: 'lento', a: { text: 'LENTO' }, b: { emoji: '🐢', text: 'Tortuga' } },
  { id: 'largo', a: { text: 'SONIDO LARGO' }, b: { emoji: '🔔', text: 'Campana' } },
  { id: 'corto', a: { text: 'SONIDO CORTO' }, b: { emoji: '👏', text: 'Palmada' } }
];

const OIDO_ITEMS = [
  { emoji: '🐘', label: 'Elefante', altura: 'grave' },
  { emoji: '🐦', label: 'Pajarito', altura: 'agudo' },
  { emoji: '🥁', label: 'Bombo', altura: 'grave' },
  { emoji: '🔔', label: 'Campanita', altura: 'agudo' },
  { emoji: '🎻', label: 'Violín', altura: 'agudo' },
  { emoji: '🎸', label: 'Bajo eléctrico', altura: 'grave' },
  { emoji: '🐭', label: 'Ratoncito', altura: 'agudo' },
  { emoji: '🦁', label: 'Rugido de león', altura: 'grave' },
  { emoji: '🦗', label: 'Grillo', altura: 'agudo' },
  { emoji: '⛈️', label: 'Trueno', altura: 'grave' },
  { emoji: '🎺', label: 'Trompeta', altura: 'agudo' },
  { emoji: '🚢', label: 'Bocina de barco', altura: 'grave' }
];

// ==========================================
// 3. UTILIDADES DEL JUEGO
// ==========================================
const porcentaje = (aciertos, total) => (total > 0 ? Math.round((aciertos / total) * 100) : 0);

const estrellas = (score) => (score >= 90 ? 3 : score >= 70 ? 2 : score >= APROBACION ? 1 : 0);

const medalla = (score) => {
  if (score >= 90) return { nombre: 'MEDALLA DE ORO', emoji: '🥇', bg: 'bg-amber-400', border: 'border-amber-600' };
  if (score >= 70) return { nombre: 'MEDALLA DE PLATA', emoji: '🥈', bg: 'bg-slate-300', border: 'border-slate-500' };
  if (score >= APROBACION) return { nombre: 'MEDALLA DE BRONCE', emoji: '🥉', bg: 'bg-orange-400', border: 'border-orange-600' };
  return { nombre: 'A SEGUIR PRACTICANDO', emoji: '💪', bg: 'bg-slate-500', border: 'border-slate-700' };
};

// Primera palabra oculta que el profe todavía no ha validado
const palabraPendiente = (lineas) => {
  if (!lineas) return "";
  for (const linea of lineas) {
    for (const w of linea) {
      if (w.isHidden && !w.isRevealed) return w.text;
    }
  }
  return "";
};

const contarOcultas = (lineas) => {
  let total = 0, revisadas = 0, correctas = 0;
  (lineas || []).forEach(l => l.forEach(w => {
    if (w.isHidden) {
      total++;
      if (w.isRevealed) { revisadas++; if (w.status === 'correct') correctas++; }
    }
  }));
  return { total, revisadas, correctas };
};

// ==========================================
// 4. PIEZAS DE UI
// ==========================================
const EtapaRuta = ({ etapaIdx, puntajes, fase }) => (
  <div className="bg-white rounded-3rem shadow-2xl border border-slate-100 p-6 flex flex-wrap items-center justify-center gap-3">
    {ETAPAS.map((etapa, idx) => {
      const I = etapa.icon;
      const puntaje = puntajes[idx];
      const lista = typeof puntaje === 'number';
      const activa = idx === etapaIdx && fase !== 'final';
      return (
        <div
          key={etapa.id}
          className={`flex items-center gap-3 px-5 py-3 rounded-full border-b-4 transition-all ${
            activa ? `${etapa.bg} ${etapa.border} text-white scale-110 shadow-xl`
            : lista ? 'bg-slate-900 border-slate-950 text-white'
            : 'bg-slate-100 border-slate-200 text-slate-400'
          }`}
        >
          {lista ? <Check size={20} /> : activa ? <I size={20} /> : <Lock size={16} />}
          <span className="font-black uppercase italic text-xs tracking-tight hidden sm:inline">{etapa.nombre}</span>
          <span className="font-mono font-black text-sm">{lista ? puntaje : idx + 1}</span>
        </div>
      );
    })}
  </div>
);

const Estrellas = ({ cantidad, size = 'text-5xl' }) => (
  <div className={`${size} tracking-widest leading-none`}>
    {[0, 1, 2].map(i => <span key={i} className={i < cantidad ? '' : 'opacity-20 grayscale'}>⭐</span>)}
  </div>
);

const CaraCarta = ({ cara }) => {
  if (cara.figure) return <MusicNote type={cara.figure} color="#0f172a" />;
  return (
    <div className="text-center leading-tight">
      {cara.emoji && <div className="text-4xl sm:text-5xl mb-1">{cara.emoji}</div>}
      <div className="font-black uppercase italic text-slate-900 text-xs sm:text-base">{cara.text}</div>
    </div>
  );
};

// ==========================================
// 5. VISTA PROYECTOR: AVENTURA MUSICAL
// ==========================================
export const AventuraDisplay = ({ curso }) => {
  const [students, setStudents] = useState([]);
  const [fase, setFase] = useState('lobby');
  // lobby → spinning → equipo → etapa_intro → etapa_activa → etapa_resultado → final
  const [equipo, setEquipo] = useState([]);
  const [etapaIdx, setEtapaIdx] = useState(0);
  const [puntajes, setPuntajes] = useState([]);
  const [ultimoPuntaje, setUltimoPuntaje] = useState(0);
  const [puntajeFinal, setPuntajeFinal] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  // Etapa 1 · LA VOZ
  const [vozLineas, setVozLineas] = useState(null);
  const [vozTitulo, setVozTitulo] = useState("");
  const [vozLineaActiva, setVozLineaActiva] = useState(0);

  // Etapa 2 · EL SABER
  const [quiz, setQuiz] = useState([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizPick, setQuizPick] = useState(null);
  const [quizAciertos, setQuizAciertos] = useState(0);

  // Etapa 3 · LA MEMORIA
  const [cartas, setCartas] = useState([]);
  const [volteadas, setVolteadas] = useState([]);
  const [intentos, setIntentos] = useState(0);

  // Etapa 4 · EL RITMO
  const [compases, setCompases] = useState([]);
  const [ritmoEval, setRitmoEval] = useState([]);

  // Etapa 5 · EL OÍDO
  const [oido, setOido] = useState([]);
  const [oidoIdx, setOidoIdx] = useState(0);
  const [oidoPick, setOidoPick] = useState(null);
  const [oidoAciertos, setOidoAciertos] = useState(0);

  const timerRef = useRef(null);
  const puntajesRef = useRef([]);
  const etapaIdxRef = useRef(0);
  const lastMsgId = useRef("");
  const yaSincronizo = useRef(false);

  const etapa = ETAPAS[etapaIdx];
  const esPrimero = curso === "1° Básico";
  const bancoQuiz = esPrimero ? QUIZ_BANK_1BASICO : QUIZ_BANK;
  const bancoMemorice = esPrimero ? MEMORICE_BANK_1BASICO : MEMORICE_BANK;
  const intentosMax = MEMORICE_PARES + MEMORICE_INTENTOS_EXTRA;
  const paresEncontrados = cartas.filter(c => c.matched).length / 2;
  const equipoIds = new Set(equipo.map(s => s.id));

  useEffect(() => { etapaIdxRef.current = etapaIdx; }, [etapaIdx]);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const programar = (fn, ms) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fn, ms);
  };

  // ── Carga del curso ─────────────────────────────────────────
  useEffect(() => {
    update(ref(db, 'estado'), { cursoActual: curso, modoActual: 'aventura', gameState: 'lobby' });
    remove(ref(db, 'remoto/mensaje'));
    if (!curso) return;
    const path = `cursos/${curso.replace(/ /g, "_").toLowerCase()}/estudiantes`;
    const unsub = onValue(ref(db, path), (snap) => {
      const data = snap.val();
      if (data) setStudents(Object.values(data));
      else {
        const initial = (NOMBRES_ESTUDIANTES[curso] || []).map((n, i) => ({ id: i + 1, name: n, points: 0, played: false }));
        set(ref(db, path), initial);
        setStudents(initial);
      }
    });
    return () => unsub();
  }, [curso]);

  // ── Ruleta: arma el grupo de 4 ──────────────────────────────
  const girarRuleta = useCallback(() => {
    if (isSpinning || students.length === 0) return;
    remove(ref(db, 'remoto/mensaje'));
    setIsSpinning(true);
    setFase('spinning');
    let ticks = 0;
    const interval = setInterval(() => {
      setEquipo(shuffleArray([...students]).slice(0, TEAM_SIZE));
      if (ticks >= 30) {
        clearInterval(interval);
        // Prioriza a quienes aún no participan; si ya pasaron todos, rellena con el resto
        const pendientes = shuffleArray(students.filter(s => !s.played));
        const resto = shuffleArray(students.filter(s => s.played));
        setEquipo([...pendientes, ...resto].slice(0, TEAM_SIZE));
        setFase('equipo');
        setIsSpinning(false);
      }
      ticks++;
    }, 80);
  }, [students, isSpinning]);

  const comenzarAventura = useCallback(() => {
    puntajesRef.current = [];
    setPuntajes([]);
    setEtapaIdx(0);
    setFase('etapa_intro');
  }, []);

  // ── Preparar la etapa que viene ─────────────────────────────
  const empezarEtapa = useCallback(() => {
    clearTimeout(timerRef.current);
    remove(ref(db, 'remoto/mensaje'));
    const actual = ETAPAS[etapaIdxRef.current];

    if (actual.id === 'voz') {
      const seccion = shuffleArray([...HIMNO_ESTRUCTURA])[0];
      setVozTitulo(seccion.title);
      setVozLineas(seccion.lines.map(texto => {
        const palabras = texto.split(' ');
        const elegibles = palabras
          .map((w, i) => (w.replace(/[¡!¿?.,;:"']/g, "").length >= 3 ? i : -1))
          .filter(i => i !== -1);
        const ocultas = new Set(shuffleArray(elegibles).slice(0, Math.ceil(elegibles.length * 0.4)));
        return palabras.map((text, idx) => ({ text, isHidden: ocultas.has(idx), isRevealed: false, status: null }));
      }));
      setVozLineaActiva(0);
    }

    if (actual.id === 'saber') {
      setQuiz(shuffleArray([...bancoQuiz]).slice(0, QUIZ_PREGUNTAS));
      setQuizIdx(0); setQuizPick(null); setQuizAciertos(0);
    }

    if (actual.id === 'memoria') {
      const pares = shuffleArray([...bancoMemorice]).slice(0, MEMORICE_PARES);
      const mazo = pares.flatMap(p => [
        { key: `${p.id}-a`, pairId: p.id, cara: p.a },
        { key: `${p.id}-b`, pairId: p.id, cara: p.b }
      ]);
      setCartas(shuffleArray(mazo).map(c => ({ ...c, matched: false })));
      setVolteadas([]); setIntentos(0);
    }

    if (actual.id === 'ritmo') {
      setCompases(Array.from({ length: RITMO_COMPASES }, () => generateBeatSequence()));
      setRitmoEval(Array(RITMO_COMPASES).fill(null));
    }

    if (actual.id === 'oido') {
      setOido(shuffleArray([...OIDO_ITEMS]).slice(0, OIDO_RONDAS));
      setOidoIdx(0); setOidoPick(null); setOidoAciertos(0);
    }

    setFase('etapa_activa');
  }, [bancoQuiz, bancoMemorice]);

  // ── Cierre de etapa ─────────────────────────────────────────
  const cerrarEtapa = useCallback((score) => {
    clearTimeout(timerRef.current);
    const idx = etapaIdxRef.current;
    const acumulado = [...puntajesRef.current];
    acumulado[idx] = score;
    puntajesRef.current = acumulado;
    setPuntajes(acumulado);
    setUltimoPuntaje(score);
    setFase('etapa_resultado');
  }, []);

  const guardarPuntajes = useCallback((score) => {
    const cursoPath = curso.replace(/ /g, "_").toLowerCase();
    equipo.forEach(miembro => {
      const idx = NOMBRES_ESTUDIANTES[curso].indexOf(miembro.name);
      if (idx !== -1) {
        update(ref(db, `cursos/${cursoPath}/estudiantes/${idx}`), { points: score, played: true });
      }
    });
  }, [curso, equipo]);

  const siguienteEtapa = useCallback(() => {
    const idx = etapaIdxRef.current;
    if (idx >= ETAPAS.length - 1) {
      const logrados = puntajesRef.current;
      const final = porcentaje(logrados.reduce((a, b) => a + (b || 0), 0), ETAPAS.length * 100);
      setPuntajeFinal(final);
      guardarPuntajes(final);
      setFase('final');
    } else {
      setEtapaIdx(idx + 1);
      setFase('etapa_intro');
    }
  }, [guardarPuntajes]);

  const reintentarEtapa = useCallback(() => {
    const acumulado = [...puntajesRef.current];
    delete acumulado[etapaIdxRef.current];
    puntajesRef.current = acumulado;
    setPuntajes(acumulado);
    empezarEtapa();
  }, [empezarEtapa]);

  const nuevoEquipo = useCallback(() => {
    clearTimeout(timerRef.current);
    remove(ref(db, 'remoto/mensaje'));
    puntajesRef.current = [];
    setPuntajes([]);
    setEquipo([]);
    setEtapaIdx(0);
    setUltimoPuntaje(0);
    setPuntajeFinal(0);
    setVozLineas(null);
    setFase('lobby');
  }, []);

  // ── Etapa 1 · validación palabra por palabra ────────────────
  const validarPalabra = useCallback((esCorrecta) => {
    if (!vozLineas) return;
    let marcada = false;
    const nuevas = vozLineas.map(linea => linea.map(w => {
      if (!marcada && w.isHidden && !w.isRevealed) {
        marcada = true;
        return { ...w, isRevealed: true, status: esCorrecta ? 'correct' : 'wrong' };
      }
      return w;
    }));
    if (!marcada) return;
    setVozLineas(nuevas);

    // Avanza el foco cuando la línea actual queda completa
    const lineaActual = nuevas[vozLineaActiva];
    const completa = lineaActual?.every(w => !w.isHidden || w.isRevealed);
    if (completa && vozLineaActiva < nuevas.length - 1) setVozLineaActiva(vozLineaActiva + 1);

    const { total, revisadas, correctas } = contarOcultas(nuevas);
    if (revisadas === total) programar(() => cerrarEtapa(porcentaje(correctas, total)), 1200);
  }, [vozLineas, vozLineaActiva, cerrarEtapa]);

  const terminarVoz = useCallback(() => {
    const { total, correctas } = contarOcultas(vozLineas);
    cerrarEtapa(total > 0 ? porcentaje(correctas, total) : 100);
  }, [vozLineas, cerrarEtapa]);

  // ── Etapa 2 · cuestionario ──────────────────────────────────
  const responderQuiz = useCallback((opcionIdx) => {
    if (quizPick !== null) return;
    const pregunta = quiz[quizIdx];
    if (!pregunta) return;
    const acierto = opcionIdx === pregunta.correct;
    const aciertos = quizAciertos + (acierto ? 1 : 0);
    setQuizPick(opcionIdx);
    setQuizAciertos(aciertos);
    programar(() => {
      if (quizIdx >= quiz.length - 1) cerrarEtapa(porcentaje(aciertos, quiz.length));
      else { setQuizIdx(i => i + 1); setQuizPick(null); }
    }, 1800);
  }, [quiz, quizIdx, quizPick, quizAciertos, cerrarEtapa]);

  // Desde el celular: marcar la respuesta hablada del equipo
  const marcarQuizManual = useCallback((acierto) => {
    if (quizPick !== null) return;
    const pregunta = quiz[quizIdx];
    if (!pregunta) return;
    responderQuiz(acierto ? pregunta.correct : (pregunta.correct + 1) % pregunta.options.length);
  }, [quiz, quizIdx, quizPick, responderQuiz]);

  const terminarQuiz = useCallback(() => cerrarEtapa(porcentaje(quizAciertos, quiz.length || 1)), [quizAciertos, quiz, cerrarEtapa]);

  // ── Etapa 3 · memorice ──────────────────────────────────────
  const voltearCarta = useCallback((idx) => {
    if (volteadas.length >= 2) return;
    if (volteadas.includes(idx) || cartas[idx]?.matched) return;

    const abiertas = [...volteadas, idx];
    setVolteadas(abiertas);
    if (abiertas.length < 2) return;

    const [a, b] = abiertas;
    const acierto = cartas[a].pairId === cartas[b].pairId;
    const intentosUsados = intentos + 1;
    setIntentos(intentosUsados);

    programar(() => {
      setVolteadas([]);
      const mazo = acierto
        ? cartas.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c))
        : cartas;
      if (acierto) setCartas(mazo);

      const encontrados = mazo.filter(c => c.matched).length / 2;
      if (encontrados === MEMORICE_PARES || intentosUsados >= intentosMax) {
        programar(() => cerrarEtapa(porcentaje(encontrados, MEMORICE_PARES)), 700);
      }
    }, acierto ? 650 : 1100);
  }, [volteadas, cartas, intentos, intentosMax, cerrarEtapa]);

  const terminarMemorice = useCallback(() => cerrarEtapa(porcentaje(paresEncontrados, MEMORICE_PARES)), [paresEncontrados, cerrarEtapa]);

  // ── Etapa 4 · eco rítmico ───────────────────────────────────
  const validarCompas = useCallback((esCorrecto, compasIdx = null) => {
    const objetivo = compasIdx !== null ? compasIdx : ritmoEval.findIndex(v => v === null);
    if (objetivo < 0 || objetivo >= ritmoEval.length) return;
    const nuevas = [...ritmoEval];
    nuevas[objetivo] = esCorrecto;
    setRitmoEval(nuevas);
    if (nuevas.every(v => v !== null)) {
      programar(() => cerrarEtapa(porcentaje(nuevas.filter(Boolean).length, nuevas.length)), 1000);
    }
  }, [ritmoEval, cerrarEtapa]);

  const terminarRitmo = useCallback(() => {
    cerrarEtapa(porcentaje(ritmoEval.filter(Boolean).length, ritmoEval.length || 1));
  }, [ritmoEval, cerrarEtapa]);

  // ── Etapa 5 · agudo o grave ─────────────────────────────────
  const responderOido = useCallback((respuesta) => {
    if (oidoPick !== null) return;
    const item = oido[oidoIdx];
    if (!item) return;
    const acierto = respuesta === item.altura;
    const aciertos = oidoAciertos + (acierto ? 1 : 0);
    setOidoPick(respuesta);
    setOidoAciertos(aciertos);
    programar(() => {
      if (oidoIdx >= oido.length - 1) cerrarEtapa(porcentaje(aciertos, oido.length));
      else { setOidoIdx(i => i + 1); setOidoPick(null); }
    }, 1300);
  }, [oido, oidoIdx, oidoPick, oidoAciertos, cerrarEtapa]);

  const marcarOidoManual = useCallback((acierto) => {
    const item = oido[oidoIdx];
    if (!item) return;
    responderOido(acierto ? item.altura : (item.altura === 'agudo' ? 'grave' : 'agudo'));
  }, [oido, oidoIdx, responderOido]);

  const terminarOido = useCallback(() => cerrarEtapa(porcentaje(oidoAciertos, oido.length || 1)), [oidoAciertos, oido, cerrarEtapa]);

  // ── Soplo al celular ────────────────────────────────────────
  useEffect(() => {
    let info = "", ayuda = "", progreso = "";

    if (fase === 'etapa_activa') {
      if (etapa.id === 'voz') {
        const { total, revisadas } = contarOcultas(vozLineas);
        info = "Palabra oculta que viene:";
        ayuda = palabraPendiente(vozLineas);
        progreso = `${revisadas}/${total}`;
      }
      if (etapa.id === 'saber') {
        const p = quiz[quizIdx];
        info = p?.question || "";
        ayuda = p ? p.options[p.correct] : "";
        progreso = `${Math.min(quizIdx + 1, quiz.length)}/${quiz.length}`;
      }
      if (etapa.id === 'memoria') {
        info = "El equipo juega en la pantalla grande";
        ayuda = `${paresEncontrados} de ${MEMORICE_PARES} pares`;
        progreso = `${Math.max(intentosMax - intentos, 0)} intentos restantes`;
      }
      if (etapa.id === 'ritmo') {
        const pendiente = ritmoEval.findIndex(v => v === null);
        info = pendiente === -1 ? "Compases listos" : `Escuchando el compás ${pendiente + 1}`;
        ayuda = "Marca ✓ si el eco rítmico estuvo bien";
        progreso = `${ritmoEval.filter(v => v !== null).length}/${ritmoEval.length}`;
      }
      if (etapa.id === 'oido') {
        const item = oido[oidoIdx];
        info = item ? `${item.emoji} ${item.label}` : "";
        ayuda = item ? item.altura.toUpperCase() : "";
        progreso = `${Math.min(oidoIdx + 1, oido.length)}/${oido.length}`;
      }
    }

    if (fase === 'etapa_intro') { info = etapa.instruccion; ayuda = ""; }
    if (fase === 'etapa_resultado') { info = `Etapa ${etapaIdx + 1} terminada`; ayuda = `${ultimoPuntaje} puntos`; }
    if (fase === 'final') { info = "Aventura completa"; ayuda = `${puntajeFinal} puntos`; }

    update(ref(db, 'estado'), {
      cursoActual: curso || "",
      modoActual: 'aventura',
      gameState: fase,
      avEtapaId: etapa.id,
      avEtapaNum: etapaIdx + 1,
      avEtapaTotal: ETAPAS.length,
      avEtapaNombre: etapa.nombre,
      avEtapaSub: etapa.subtitulo,
      avEquipo: equipo.map(s => s.name).join(' · ') || "",
      avInfo: info || "",
      avAyuda: ayuda || "",
      avProgreso: progreso || "",
      avPuntaje: fase === 'final' ? puntajeFinal : ultimoPuntaje
    });
  }, [fase, etapa, etapaIdx, equipo, curso, vozLineas, quiz, quizIdx, cartas, intentos,
      intentosMax, paresEncontrados, ritmoEval, oido, oidoIdx, ultimoPuntaje, puntajeFinal]);

  // ── Listener del control remoto (refs para evitar closures viejas) ──
  const acciones = {
    girarRuleta, comenzarAventura, empezarEtapa, siguienteEtapa, reintentarEtapa, nuevoEquipo,
    validarPalabra, terminarVoz, marcarQuizManual, terminarQuiz, terminarMemorice,
    validarCompas, terminarRitmo, marcarOidoManual, terminarOido
  };
  const accionesRef = useRef(acciones);
  const faseRef = useRef(fase);
  accionesRef.current = acciones;
  faseRef.current = fase;
  const etapaIdRef = useRef(etapa.id);
  etapaIdRef.current = etapa.id;

  useEffect(() => {
    const unsub = onValue(ref(db, 'remoto/mensaje'), (snapshot) => {
      const data = snapshot.val();

      // Al montar, ignora mensajes de una sesión anterior en vez de re-ejecutarlos
      if (!yaSincronizo.current) {
        yaSincronizo.current = true;
        lastMsgId.current = data?.timestamp || "";
        return;
      }
      if (!data?.timestamp || data.timestamp === lastMsgId.current) return;
      lastMsgId.current = data.timestamp;

      const a = accionesRef.current;
      const f = faseRef.current;
      const id = etapaIdRef.current;

      switch (data.texto) {
        case 'AV_GIRAR': a.girarRuleta(); break;
        case 'AV_COMENZAR': a.comenzarAventura(); break;
        case 'AV_EMPEZAR': a.empezarEtapa(); break;
        case 'AV_SIGUIENTE': a.siguienteEtapa(); break;
        case 'AV_REINTENTAR': a.reintentarEtapa(); break;
        case 'AV_NUEVO_EQUIPO': a.nuevoEquipo(); break;
        case 'AV_BIEN':
        case 'AV_ERROR': {
          if (f !== 'etapa_activa') break;
          const bien = data.texto === 'AV_BIEN';
          if (id === 'voz') a.validarPalabra(bien);
          else if (id === 'ritmo') a.validarCompas(bien);
          else if (id === 'saber') a.marcarQuizManual(bien);
          else if (id === 'oido') a.marcarOidoManual(bien);
          break;
        }
        case 'AV_TERMINAR_ETAPA': {
          if (f !== 'etapa_activa') break;
          if (id === 'voz') a.terminarVoz();
          else if (id === 'saber') a.terminarQuiz();
          else if (id === 'memoria') a.terminarMemorice();
          else if (id === 'ritmo') a.terminarRitmo();
          else if (id === 'oido') a.terminarOido();
          break;
        }
        default: break;
      }
    });
    return () => unsub();
  }, []);

  // ==========================================
  // RENDER
  // ==========================================
  const EtapaIcon = etapa.icon;
  const compasPendiente = ritmoEval.findIndex(v => v === null);
  const preguntaActual = quiz[quizIdx];
  const itemOido = oido[oidoIdx];

  return (
    <div className="flex flex-col h-full text-slate-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 w-full px-2">
        <div className="lg:col-span-8 order-1 space-y-8">

          {fase !== 'lobby' && fase !== 'spinning' && (
            <EtapaRuta etapaIdx={etapaIdx} puntajes={puntajes} fase={fase} />
          )}

          {/* ── LOBBY ─────────────────────────────────────── */}
          {fase === 'lobby' && (
            <div className="bg-white rounded-4rem p-16 sm:p-24 text-center shadow-2xl border flex flex-col items-center justify-center min-h-[600px] animate-in zoom-in">
              <div className="bg-blue-100 p-12 rounded-full mb-10 text-blue-600"><Rocket size={110} /></div>
              <h2 className="text-5xl font-black text-slate-900 mb-4 uppercase italic">Aventura Musical</h2>
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs italic mb-10">
                {ETAPAS.length} etapas · equipos de {TEAM_SIZE}
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-14">
                {ETAPAS.map(e => {
                  const I = e.icon;
                  return (
                    <div key={e.id} className={`${e.soft} ${e.text} px-5 py-3 rounded-full flex items-center gap-2 font-black uppercase italic text-xs`}>
                      <I size={18} /> {e.nombre}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={girarRuleta}
                disabled={students.length === 0}
                className={`text-white text-3xl font-black px-20 py-10 rounded-3rem border-b-18 shadow-2xl transition-all uppercase italic ${
                  students.length === 0
                    ? 'bg-slate-300 border-slate-400 cursor-wait animate-pulse'
                    : 'bg-blue-600 border-blue-900 active:scale-95'
                }`}
              >
                {students.length === 0 ? 'CARGANDO CURSO...' : 'GIRAR RULETA DE EQUIPOS'}
              </button>
            </div>
          )}

          {/* ── RULETA GIRANDO ────────────────────────────── */}
          {fase === 'spinning' && (
            <div className="bg-slate-900 rounded-4rem p-16 text-center flex flex-col items-center justify-center min-h-[600px] border-15 border-slate-800 text-white">
              <Users size={60} className="mb-10 text-blue-400 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                {equipo.map((s, i) => (
                  <div key={`${s.id}-${i}`} className="bg-slate-800 rounded-3xl py-8 px-6 animate-in fade-in zoom-in duration-75">
                    <span className="text-2xl sm:text-3xl font-black italic uppercase truncate block">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EQUIPO LISTO ──────────────────────────────── */}
          {fase === 'equipo' && (
            <div className="bg-blue-600 border-blue-900 rounded-4rem p-14 text-center text-white shadow-2xl flex flex-col items-center justify-center min-h-[600px] border-b-20 animate-in zoom-in">
              <p className="text-2xl font-bold opacity-70 uppercase tracking-widest mb-10 italic">Equipo de la aventura</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full mb-14">
                {equipo.map((s, i) => (
                  <div key={s.id} className="bg-white/10 rounded-3xl py-7 px-6 flex items-center gap-4 border-b-4 border-white/10">
                    <span className="bg-white text-blue-700 w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center font-black text-xl">{i + 1}</span>
                    <span className="text-2xl font-black italic uppercase truncate">{s.name}</span>
                  </div>
                ))}
              </div>
              <button onClick={comenzarAventura} className="bg-white text-blue-700 px-16 py-10 rounded-3xl font-black text-4xl sm:text-5xl shadow-2xl hover:scale-105 transition-all italic uppercase">
                ¡COMENZAR!
              </button>
            </div>
          )}

          {/* ── PRESENTACIÓN DE LA ETAPA ──────────────────── */}
          {fase === 'etapa_intro' && (
            <div className={`${etapa.bg} ${etapa.border} rounded-4rem p-16 text-center text-white shadow-2xl flex flex-col items-center justify-center min-h-[520px] border-b-20 animate-in zoom-in`}>
              <p className="text-xl font-black opacity-70 uppercase tracking-[0.4em] mb-8 italic">Etapa {etapaIdx + 1} de {ETAPAS.length}</p>
              <div className="bg-white/15 p-10 rounded-full mb-8"><EtapaIcon size={90} /></div>
              <h2 className="text-6xl font-black uppercase italic mb-3 drop-shadow-xl">{etapa.nombre}</h2>
              <p className="text-2xl font-black uppercase italic opacity-80 mb-10">{etapa.subtitulo}</p>
              <p className="text-xl sm:text-2xl font-bold max-w-3xl leading-relaxed opacity-90 mb-12">{etapa.instruccion}</p>
              <button onClick={empezarEtapa} className="bg-white text-slate-900 px-16 py-8 rounded-3xl font-black text-4xl shadow-2xl hover:scale-105 transition-all italic uppercase">
                EMPEZAR ETAPA
              </button>
            </div>
          )}

          {/* ── ETAPA ACTIVA ──────────────────────────────── */}
          {fase === 'etapa_activa' && (
            <div className="space-y-8 animate-in fade-in">
              <div className={`p-8 rounded-[3.5rem] flex justify-between items-center border-b-8 shadow-2xl bg-slate-900 ${etapa.border}`}>
                <div className="flex items-center gap-6 text-white min-w-0">
                  <div className={`${etapa.bg} w-16 h-16 shrink-0 rounded-3xl flex items-center justify-center shadow-2xl`}><EtapaIcon size={36} /></div>
                  <div className="min-w-0">
                    <h3 className="text-3xl sm:text-4xl font-black uppercase italic truncate">{etapa.nombre}</h3>
                    <span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Etapa {etapaIdx + 1} / {ETAPAS.length} · {etapa.subtitulo}</span>
                  </div>
                </div>
                <div className="text-white/40 font-black uppercase italic text-xs tracking-widest text-right shrink-0 hidden sm:block">
                  {equipo.length} jugadores
                </div>
              </div>

              {/* Etapa 1 · LA VOZ */}
              {etapa.id === 'voz' && (
                <>
                  <div className="bg-white p-10 sm:p-16 rounded-4rem shadow-2xl border min-h-[420px] text-center">
                    <h4 className="font-black text-sm uppercase tracking-widest flex items-center gap-4 animate-pulse justify-center text-red-600 mb-10">
                      <div className="w-3 h-3 rounded-full bg-red-600"></div> {vozTitulo}
                    </h4>
                    <div className="max-h-[460px] overflow-y-auto scrollbar-hide space-y-10">
                      {vozLineas?.map((linea, lIdx) => (
                        <div key={lIdx} className={`transition-all duration-700 ${lIdx === vozLineaActiva ? 'scale-105 opacity-100' : 'scale-95 opacity-25 blur-[1px]'}`}>
                          <p className="text-3xl sm:text-5xl font-black flex flex-wrap gap-x-5 gap-y-2 justify-center leading-tight">
                            {linea.map((w, wIdx) => (
                              <span key={wIdx} className={w.isHidden
                                ? (w.isRevealed
                                  ? (w.status === 'correct' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50 line-through opacity-50')
                                  : 'bg-slate-100 text-transparent border-b-4 border-slate-200 min-w-[5rem]')
                                : 'text-slate-800'}>{w.text}</span>
                            ))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <button onClick={() => validarPalabra(true)} className="bg-green-600 border-green-900 text-white py-10 rounded-3rem font-black text-3xl border-b-12 shadow-2xl active:scale-95 transition-all uppercase italic flex items-center justify-center gap-4"><Check size={40} /> BIEN</button>
                    <button onClick={() => validarPalabra(false)} className="bg-red-600 border-red-900 text-white py-10 rounded-3rem font-black text-3xl border-b-12 shadow-2xl active:scale-95 transition-all uppercase italic flex items-center justify-center gap-4"><X size={40} /> ERROR</button>
                  </div>
                </>
              )}

              {/* Etapa 2 · EL SABER */}
              {etapa.id === 'saber' && preguntaActual && (
                <div className="bg-white p-10 sm:p-16 rounded-4rem shadow-2xl border min-h-[520px] flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-10">
                    <span className="bg-indigo-100 text-indigo-600 px-6 py-3 rounded-full font-black uppercase italic text-xs tracking-widest">{preguntaActual.param}</span>
                    <span className="font-mono font-black text-slate-300 text-2xl">{quizIdx + 1}/{quiz.length}</span>
                  </div>
                  <h3 className="text-3xl sm:text-5xl font-black text-center leading-tight mb-14">{preguntaActual.question}</h3>
                  <div className={`grid grid-cols-1 gap-5 ${preguntaActual.options.length === 2 ? 'sm:grid-cols-2' : ''}`}>
                    {preguntaActual.options.map((opcion, i) => {
                      const elegida = quizPick === i;
                      const esCorrecta = i === preguntaActual.correct;
                      const revelada = quizPick !== null;
                      return (
                        <button
                          key={i}
                          onClick={() => responderQuiz(i)}
                          disabled={revelada}
                          className={`py-8 px-8 rounded-3xl font-black text-xl sm:text-2xl border-b-8 transition-all text-left flex items-center gap-5 ${
                            revelada
                              ? (esCorrecta ? 'bg-green-600 border-green-900 text-white scale-105'
                                : elegida ? 'bg-red-600 border-red-900 text-white opacity-80'
                                : 'bg-slate-100 border-slate-200 text-slate-400')
                              : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-indigo-600 hover:border-indigo-900 hover:text-white active:scale-95'
                          }`}
                        >
                          <span className="shrink-0 w-12 h-12 rounded-2xl bg-white/20 border-2 border-current/20 flex items-center justify-center text-xl">
                            {revelada && esCorrecta ? <Check size={28} /> : revelada && elegida ? <X size={28} /> : String.fromCharCode(65 + i)}
                          </span>
                          <span>{opcion}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Etapa 3 · LA MEMORIA */}
              {etapa.id === 'memoria' && (
                <div className="bg-white p-8 sm:p-14 rounded-4rem shadow-2xl border">
                  <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
                    <span className="bg-amber-100 text-amber-600 px-6 py-3 rounded-full font-black uppercase italic text-xs tracking-widest">
                      {paresEncontrados} / {MEMORICE_PARES} pares
                    </span>
                    <span className={`px-6 py-3 rounded-full font-black uppercase italic text-xs tracking-widest ${intentosMax - intentos <= 2 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                      {Math.max(intentosMax - intentos, 0)} intentos restantes
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                    {cartas.map((carta, idx) => {
                      const abierta = volteadas.includes(idx) || carta.matched;
                      return (
                        <button
                          key={carta.key}
                          onClick={() => voltearCarta(idx)}
                          disabled={abierta}
                          className={`aspect-square rounded-3xl border-b-8 flex items-center justify-center p-3 transition-all ${
                            carta.matched ? 'bg-green-50 border-green-500 ring-4 ring-green-500/30'
                            : abierta ? 'bg-white border-amber-500 shadow-xl scale-105'
                            : 'bg-amber-500 border-amber-700 hover:bg-amber-400 active:scale-95'
                          }`}
                        >
                          {abierta ? <CaraCarta cara={carta.cara} /> : <span className="text-4xl sm:text-5xl opacity-70">🎵</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Etapa 4 · EL RITMO */}
              {etapa.id === 'ritmo' && (
                <>
                  <div className="bg-white p-8 sm:p-14 rounded-4rem shadow-2xl border space-y-6">
                    {compases.map((compas, cIdx) => {
                      const nota = ritmoEval[cIdx];
                      const esActual = cIdx === compasPendiente;
                      return (
                        <div key={cIdx} className={`rounded-[2.5rem] border-4 p-6 flex flex-col sm:flex-row items-center gap-6 transition-all ${
                          nota === true ? 'bg-green-50 border-green-500'
                          : nota === false ? 'bg-red-50 border-red-500'
                          : esActual ? 'bg-emerald-50 border-emerald-500 scale-[1.02] shadow-xl'
                          : 'bg-slate-50 border-slate-200 opacity-50'
                        }`}>
                          <div className="bg-slate-900 text-white w-14 h-14 shrink-0 flex items-center justify-center font-black rounded-2xl text-2xl shadow-md">{cIdx + 1}</div>
                          <div className="flex-1 flex items-center justify-center gap-3 flex-wrap">
                            {compas.map((fig, i) => <MusicNote key={i} type={fig.type} color="#0f172a" />)}
                          </div>
                          <div className="flex gap-3 shrink-0">
                            <button onClick={() => validarCompas(true, cIdx)} className={`w-16 h-16 rounded-2xl flex items-center justify-center border-b-4 transition-all active:scale-95 ${nota === true ? 'bg-green-600 border-green-800 text-white' : 'bg-white border-slate-200 text-green-600 hover:bg-green-600 hover:text-white'}`}><Check size={32} /></button>
                            <button onClick={() => validarCompas(false, cIdx)} className={`w-16 h-16 rounded-2xl flex items-center justify-center border-b-4 transition-all active:scale-95 ${nota === false ? 'bg-red-600 border-red-800 text-white' : 'bg-white border-slate-200 text-red-600 hover:bg-red-600 hover:text-white'}`}><X size={32} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-center text-slate-400 font-black uppercase tracking-widest text-xs italic">
                    El equipo toca cada compás con palmas · el profe valida con ✓ o ✗
                  </p>
                </>
              )}

              {/* Etapa 5 · EL OÍDO */}
              {etapa.id === 'oido' && itemOido && (
                <div className="bg-white p-10 sm:p-16 rounded-4rem shadow-2xl border min-h-[520px] flex flex-col items-center justify-center">
                  <span className="font-mono font-black text-slate-300 text-2xl mb-6">{oidoIdx + 1}/{oido.length}</span>
                  <div className="text-[9rem] leading-none mb-4 animate-bounce">{itemOido.emoji}</div>
                  <h3 className="text-4xl sm:text-6xl font-black uppercase italic mb-12">{itemOido.label}</h3>

                  {oidoPick === null ? (
                    <div className="grid grid-cols-2 gap-6 w-full">
                      <button onClick={() => responderOido('agudo')} className="bg-sky-500 border-sky-800 text-white py-12 rounded-3rem font-black text-3xl sm:text-4xl border-b-12 shadow-2xl active:scale-95 transition-all uppercase italic">AGUDO ⬆️</button>
                      <button onClick={() => responderOido('grave')} className="bg-indigo-700 border-indigo-950 text-white py-12 rounded-3rem font-black text-3xl sm:text-4xl border-b-12 shadow-2xl active:scale-95 transition-all uppercase italic">GRAVE ⬇️</button>
                    </div>
                  ) : (
                    <div className={`w-full py-12 rounded-3rem text-center text-white font-black uppercase italic shadow-2xl animate-in zoom-in ${oidoPick === itemOido.altura ? 'bg-green-600' : 'bg-red-600'}`}>
                      <div className="text-7xl mb-4">{oidoPick === itemOido.altura ? '✅' : '❌'}</div>
                      <p className="text-3xl">Era {itemOido.altura.toUpperCase()}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── RESULTADO DE LA ETAPA ─────────────────────── */}
          {fase === 'etapa_resultado' && (
            <div className="bg-white rounded-5rem p-14 text-center shadow-2xl min-h-[560px] border border-slate-100 flex flex-col items-center justify-center animate-in zoom-in">
              <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs italic mb-6">Etapa {etapaIdx + 1} · {etapa.nombre}</p>
              <Estrellas cantidad={estrellas(ultimoPuntaje)} size="text-6xl" />
              <div className={`text-white px-16 py-8 rounded-4rem text-[7rem] font-mono font-black my-8 shadow-2xl leading-none ${ultimoPuntaje >= APROBACION ? 'bg-green-600' : 'bg-red-600'}`}>
                {ultimoPuntaje}
              </div>
              <h2 className="text-4xl font-black uppercase italic mb-12">
                {ultimoPuntaje >= APROBACION ? '¡ETAPA SUPERADA!' : 'ETAPA NO SUPERADA'}
              </h2>
              <div className="flex flex-col sm:flex-row gap-5 w-full">
                <button onClick={reintentarEtapa} className="flex-1 bg-slate-100 text-slate-600 px-10 py-7 rounded-3xl font-black text-xl italic uppercase border-b-8 border-slate-300 hover:bg-slate-200 transition-all flex items-center justify-center gap-3">
                  <RefreshCw size={24} /> REINTENTAR
                </button>
                <button onClick={siguienteEtapa} className="flex-[2] bg-slate-900 text-white px-10 py-7 rounded-3xl font-black text-2xl sm:text-3xl italic uppercase border-b-8 border-slate-950 hover:scale-105 transition-all flex items-center justify-center gap-3">
                  {etapaIdx >= ETAPAS.length - 1 ? <><Trophy size={30} /> VER RESULTADO FINAL</> : <><SkipForward size={30} /> SIGUIENTE ETAPA</>}
                </button>
              </div>
            </div>
          )}

          {/* ── FINAL DE LA AVENTURA ──────────────────────── */}
          {fase === 'final' && (
            <div className="bg-white rounded-5rem p-14 text-center shadow-2xl border border-slate-100 animate-in zoom-in">
              {(() => { const m = medalla(puntajeFinal); return (
                <>
                  <div className="text-[9rem] leading-none mb-2 animate-bounce">{m.emoji}</div>
                  <h2 className={`${m.bg} ${m.border} border-b-8 text-slate-900 inline-block px-12 py-5 rounded-full text-2xl sm:text-3xl font-black uppercase italic mb-10 shadow-xl`}>{m.nombre}</h2>
                </>
              ); })()}

              <div className="bg-slate-900 text-white px-16 py-10 rounded-4rem text-[8rem] font-mono font-black mb-10 shadow-2xl leading-none">{puntajeFinal}</div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-10">
                {ETAPAS.map((e, idx) => {
                  const I = e.icon;
                  const p = puntajes[idx] ?? 0;
                  return (
                    <div key={e.id} className="bg-slate-50 rounded-3xl p-5 border-b-4 border-slate-200">
                      <I size={26} className={`mx-auto mb-2 ${e.text}`} />
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 truncate">{e.nombre}</p>
                      <p className="font-mono font-black text-2xl text-slate-800">{p}</p>
                      <Estrellas cantidad={estrellas(p)} size="text-xs" />
                    </div>
                  );
                })}
              </div>

              <div className="bg-blue-50 rounded-3rem p-8 mb-10">
                <p className="text-blue-400 font-black uppercase tracking-[0.3em] text-[10px] italic mb-4 flex items-center justify-center gap-2"><Sparkles size={14} /> Puntos guardados para el equipo</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {equipo.map(s => (
                    <div key={s.id} className="bg-white rounded-2xl py-4 px-5 font-black uppercase italic text-slate-700 truncate flex items-center gap-3">
                      <Medal size={18} className="text-blue-500 shrink-0" /> {s.name}
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={nuevoEquipo} className="w-full bg-blue-600 text-white px-10 py-9 rounded-3rem font-black text-3xl sm:text-4xl italic uppercase border-b-12 border-blue-900 hover:scale-105 transition-all flex items-center justify-center gap-4">
                <Users size={38} /> NUEVO EQUIPO
              </button>
            </div>
          )}
        </div>

        {/* ── RANKING ─────────────────────────────────────── */}
        <div className="lg:col-span-4 order-2 text-slate-900">
          <div className="bg-white rounded-3rem shadow-2xl border border-slate-100 overflow-hidden lg:sticky lg:top-32">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center border-b-8 border-blue-600">
              <h3 className="font-black uppercase text-xl italic flex items-center gap-4"><Trophy className="text-yellow-400" size={32} /> RANKING</h3>
            </div>
            <div className="max-h-125 lg:max-h-[750px] overflow-y-auto scrollbar-hide bg-white">
              {[...students].sort((a, b) => (b.points || 0) - (a.points || 0) || a.id - b.id).map((s, idx) => (
                <div key={s.id} className={`px-10 py-6 border-b flex items-center justify-between transition-all ${equipoIds.has(s.id) ? 'bg-blue-50 scale-105 z-10 shadow-xl' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-6">
                    <span className={`text-2xl font-black w-10 ${idx < 3 ? 'text-blue-600 text-4xl' : 'text-slate-100'}`}>{idx + 1}</span>
                    <div className="flex flex-col">
                      <span className="font-black uppercase text-lg truncate w-32 leading-none mb-1 italic">{s.name}</span>
                      <span className={`text-[9px] font-black tracking-widest ${s.played ? 'text-green-500' : 'text-slate-400'}`}>{s.played ? 'PARTICIPÓ ✓' : 'PENDIENTE'}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono font-black text-3xl text-slate-800">{s.played ? (s.points || 0) : 0}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. VISTA CELULAR: CONTROL DE LA AVENTURA
// ==========================================
const Panel = ({ children }) => (
  <div className="bg-white/5 border-2 border-dashed border-white/20 p-6 rounded-3xl mb-4 text-left">{children}</div>
);

export const AventuraRemote = ({ appState, sendAction }) => {
  const fase = appState.gameState;
  const etapaId = appState.avEtapaId;
  const usaBienError = ['voz', 'ritmo', 'saber', 'oido'].includes(etapaId);

  return (
    <div className="space-y-5">
      <div className="bg-blue-600/20 border border-blue-500/40 rounded-2xl px-5 py-3 flex items-center justify-between">
        <span className="text-blue-300 text-[10px] font-black uppercase tracking-widest">Aventura</span>
        <span className="text-white text-[10px] font-black uppercase italic truncate ml-3">{appState.avEquipo || 'Sin equipo'}</span>
      </div>

      {fase === 'lobby' && (
        <ActionButton onClick={() => sendAction("AV_GIRAR")} bg="bg-blue-600" border="border-blue-900" py="py-10" fontSize="text-2xl" icon={Users} iconSize={30}>
          GIRAR RULETA DE EQUIPOS
        </ActionButton>
      )}

      {fase === 'equipo' && (
        <>
          <Panel>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">Equipo sorteado</p>
            <h3 className="text-white text-lg font-black uppercase italic leading-snug">{appState.avEquipo}</h3>
          </Panel>
          <ActionButton onClick={() => sendAction("AV_COMENZAR")} bg="bg-blue-600" border="border-blue-900" py="py-8" icon={Rocket} iconSize={26}>COMENZAR AVENTURA</ActionButton>
          <ActionButton onClick={() => sendAction("AV_GIRAR")} bg="bg-slate-700" border="border-slate-900" py="py-5" fontSize="text-sm" icon={RefreshCw} iconSize={18}>SORTEAR OTRO EQUIPO</ActionButton>
        </>
      )}

      {fase === 'etapa_intro' && (
        <>
          <Panel>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Etapa {appState.avEtapaNum} / {appState.avEtapaTotal}</p>
            <h3 className="text-white text-2xl font-black uppercase italic mb-1">{appState.avEtapaNombre}</h3>
            <p className="text-blue-300 text-xs font-black uppercase italic mb-4">{appState.avEtapaSub}</p>
            <p className="text-slate-300 text-sm font-bold leading-relaxed">{appState.avInfo}</p>
          </Panel>
          <ActionButton onClick={() => sendAction("AV_EMPEZAR")} bg="bg-emerald-600" border="border-emerald-900" py="py-8" icon={Rocket} iconSize={26}>EMPEZAR ETAPA</ActionButton>
        </>
      )}

      {fase === 'etapa_activa' && (
        <>
          <Panel>
            <div className="flex items-center justify-between mb-4">
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Etapa {appState.avEtapaNum}: {appState.avEtapaNombre}</p>
              <span className="text-white/50 text-[10px] font-mono font-black">{appState.avProgreso}</span>
            </div>
            {appState.avInfo && <h3 className="text-white text-lg font-bold mb-4 leading-snug">{appState.avInfo}</h3>}
            {appState.avAyuda && (
              <>
                <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2"><Eye size={12} /> Para el profe</p>
                <h3 className="text-green-300 text-xl font-black uppercase italic">{appState.avAyuda}</h3>
              </>
            )}
          </Panel>

          {usaBienError && (
            <div className="grid grid-cols-2 gap-4">
              <ActionButton onClick={() => sendAction("AV_BIEN")} bg="bg-green-600" border="border-green-800" py="py-12" rounded="rounded-4xl" fontSize="text-2xl" borderSize="border-b-12" icon={ThumbsUp} iconSize={40} gap="gap-2">BIEN</ActionButton>
              <ActionButton onClick={() => sendAction("AV_ERROR")} bg="bg-red-600" border="border-red-800" py="py-12" rounded="rounded-4xl" fontSize="text-2xl" borderSize="border-b-12" icon={ThumbsDown} iconSize={40} gap="gap-2">ERROR</ActionButton>
            </div>
          )}
          {etapaId === 'memoria' && (
            <p className="text-center text-slate-500 text-[10px] font-black uppercase tracking-widest italic py-4">
              El equipo da vuelta las cartas en la pantalla grande
            </p>
          )}

          <ActionButton onClick={() => sendAction("AV_TERMINAR_ETAPA")} bg="bg-slate-700" border="border-slate-900" py="py-5" fontSize="text-sm" icon={SkipForward} iconSize={18}>TERMINAR ETAPA AHORA</ActionButton>
        </>
      )}

      {fase === 'etapa_resultado' && (
        <>
          <Panel>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{appState.avEtapaNombre}</p>
            <h3 className="text-white text-5xl font-mono font-black">{appState.avPuntaje}</h3>
          </Panel>
          <ActionButton onClick={() => sendAction("AV_SIGUIENTE")} bg="bg-blue-600" border="border-blue-900" py="py-8" icon={SkipForward} iconSize={26}>
            {Number(appState.avEtapaNum) >= Number(appState.avEtapaTotal) ? 'VER RESULTADO FINAL' : 'SIGUIENTE ETAPA'}
          </ActionButton>
          <ActionButton onClick={() => sendAction("AV_REINTENTAR")} bg="bg-slate-700" border="border-slate-900" py="py-5" fontSize="text-sm" icon={RefreshCw} iconSize={18}>REINTENTAR ETAPA</ActionButton>
        </>
      )}

      {fase === 'final' && (
        <>
          <Panel>
            <p className="text-yellow-400 text-[10px] font-black uppercase tracking-widest mb-1">Aventura completa</p>
            <h3 className="text-white text-5xl font-mono font-black mb-3">{appState.avPuntaje}</h3>
            <p className="text-slate-400 text-xs font-bold uppercase italic">{appState.avEquipo}</p>
          </Panel>
          <ActionButton onClick={() => sendAction("AV_NUEVO_EQUIPO")} bg="bg-blue-600" border="border-blue-900" py="py-8" icon={Users} iconSize={26}>NUEVO EQUIPO</ActionButton>
        </>
      )}

      {fase === 'spinning' && (
        <p className="text-center text-slate-500 font-black uppercase text-[10px] tracking-widest italic py-10 animate-pulse">Sorteando equipo...</p>
      )}
    </div>
  );
};
