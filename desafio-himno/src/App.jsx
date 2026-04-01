import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, remove } from "firebase/database";
import { 
  Music, Star, Trophy, RotateCcw, Award, Wifi, 
  Smartphone, ChevronRight, School, Drum, Hand, LayoutGrid, 
  Square, PlayCircle, RefreshCw, ArrowLeft, Mic2, Check, X, ThumbsUp, ThumbsDown
} from 'lucide-react';

// ==========================================
// 1. CONFIGURACIÓN DE FIREBASE
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAENUFLOZfeTu7D5u3DcJXfOtYtzU0HOVw",
  authDomain: "ccg-app-ac924.firebaseapp.com",
  databaseURL: "https://ccg-app-ac924-default-rtdb.firebaseio.com", 
  projectId: "ccg-app-ac924",
  storageBucket: "ccg-app-ac924.firebasestorage.app",
  messagingSenderId: "664241982692",
  appId: "1:664241982692:web:a61aacf815f9ccfbbc30f1"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ==========================================
// 2. CONSTANTES GLOBALES
// ==========================================
const CURSO_CON_POLIRRITMIA = "6° Básico";

const NOMBRES_ESTUDIANTES = {
  "1° Básico": ["Mateo Alfaro", "Emilia Álvarez", "Lorenzo Alvez", "Agustín Araya", "Santiago Arévalo", "Emilia Ayala", "Colomba Berríos", "Martín Campos", "Luciana Castro", "Emma Cifuentes", "Luciana Cortés", "Mía Cumares", "Tomás De La Barrera", "Bruno Del Villar", "Eydan Durán", "Isidora Flores", "Sofía Gallardo", "Isabella Gonzalez", "Trinidad González", "Amaro Herrera", "Evan Jiménez", "Agustina Lara", "Emilio Lemus", "Thomas León", "Josefa Leyton", "Martín Mancilla", "Isidora Mancilla", "Isidora Mariñan", "Antonella Martinez", "Matilda Matus", "Anaís Mena", "José Montenegro", "Rafaela Morales", "Antonia Muñoz", "Emma Nuñez", "Antonella Núñez", "Ignacio Olivares", "Guillermo Rojas", "Rudy Rojas", "Fabian Rojas", "Lucas Salinas", "Catalina Sánchez", "Bastián Silva", "Rocío Sosa", "Tomás Urbina", "Vicente Vergara", "Alonso Villaroel", "Santiago Yesca"],
  "2° Básico": ["Trinidad Aguilar", "Amalia Álvarez", "Agustina Carrasco", "Florencia Cisterna", "Daniel Cornejo", "Tryana Cortés", "Charlotte Cortez", "Benoit Delobel", "Leonore Delobel", "Gabriel Encina", "Pascal Espinoza", "Julián Fernández", "Pascuala Fernández", "Amaro Figueroa", "Facundo Figueroa", "Matteo Garcia", "Gabriel González", "Julieta Gutiérrez", "Denisse Herrera", "Mayte Isla", "Amanda Jorquera", "Pedro Leiva", "Bruno Lobos", "Santiago López", "Antonia Martínez", "Monserrat Mundaca", "Agustín Muñoz", "Alejandro Núñez", "Lucas Osorio", "Martín Paéz", "Javiera Pérez", "Felipe Pérez", "Emilio Pulgar", "Gaspar Rojas", "José Rojo", "Amanda Tapia", "Arleth Tapia", "Lorenzo Vélez", "Herman Vicencio", "Angel Villegas", "Colomba Yáñez", "Emma Yubano", "Agusthín Aguilar"],
  "3° Básico": ["Carlos Aceituno", "Santiago Aguilera", "Fernando Cabrera", "Gabriel Cabrera", "Maximiliano Calderón", "Javiera Castillo", "Lucas Cortes", "Julián Farias", "Rodrigo Figueroa", "Matilda González", "Antonella González", "Dylan Guerra", "Diana Isamat", "Isidora Jara", "Joaquina Jélvez", "Renata Lemus", "Sarai Levet", "Santiago López", "Abigail Manríquez", "Alexandra Meza", "Simone Ortega", "Renato Ortiz", "Antonia Pandolfa", "Agustín Paredes", "Vicente Pereira", "Constanza Pereira", "Rafaella Ramírez", "Xiomara Ramos", "Vicente Reyes", "Renata Robledo", "Carlo Rojas", "Maite Segovia", "Emma Silva", "Julián Sosa", "Valentina Toro", "Dominique Torrejón", "Amaro Ulloa", "Bastián Valencia", "Maite Vásquez", "Lucas Vélez", "Eluney Villanueva"],
  "4° Básico": ["Emiliano Ahumada", "Gabriel Arancibia", "Vicente Araya", "Emiliano Ardiles", "Antonella Arévalo", "Simona Britez", "Emilia Cáceres", "Gael Caniupán", "Mia Carrasco", "Vicente Carrasco", "Mateo Céspedes", "José Tomás Contreras", "Javier Contreras", "Catalina Correa", "Beatriz Estay", "Tomás Farías", "Josefa Garay", "Matías Inostroza", "Elian Inostroza", "Antonio Lorca", "Giovanni Madariaga", "Agustín Marín", "Aynhara Matus", "Renata Medina", "Rafaela Miranda", "Máximo Moir", "Gabriel Morales", "Laura Mura", "Emilia Núñez", "Dominique Paredes", "Gaspar Pizarro", "Tomás Ramos", "Mateo Rivera", "Bastián Rodríguez", "Julián Rodríguez", "Arlette Salinas", "Valentina Salinas", "Bastián Sazo", "Mía Soto", "Rafaella Torrejón", "Diego Vega", "Gonzalo Villanueva", "Branko Mura"],
  "5° Básico": ["Maximiliano Bravo", "Gustavo Bustos", "Maximiliano Campos", "Florencia Cifuentes", "Juan Cortés", "Simón Delgado", "Catalina Fuentes", "Mateo Fuentes", "Celeste González", "Cristobal Hernández", "Duvan Herrera", "Marco Mancilla", "Isabella Manríquez", "Katerine Martinez", "Pascale Meyer", "Maximiliano Morán", "Tomás Moyano", "Josefa Muñoz", "Mateo Muñoz", "Amparo Muñoz", "Ignacio Mura", "Amaro Navea", "Lucas Núñez", "Liz Otárola", "Raúl Páez", "Lucas Pavez", "Agustín Puga", "Laura Ramírez", "Facundo Rojas", "Pedro Rolack", "Verónica Silva", "Emilia Tapia", "Isabella Torres", "Matheo Vargas", "Trinidad Vásquez", "Martina Vega", "Josué Vera", "Simón Villarroel", "Rafael Zúñiga", "Mateo Cornejo", "Maite Villarroel", "Isidora Zamora", "Sergio Oyanedel"],
  "6° Básico": ["Salvador Allende", "Máximo Araya", "Enzo Arias", "Juan Avallay", "Vicente Azócar", "Leandro Berríos", "Domingo Bruna", "Rafaela Cádiz", "Fernanda Carrasco", "Benjamín Carrasco", "Matilde Carter", "Imee Cruz", "Luciano Díaz", "Dante Flores", "Rafaela Fredes", "Pascal Fuentes", "Anaís Gallegos", "Gastón Garay", "Alicia Guerra", "Nelson Herrera", "Maximiliano Ibacache", "Julieta Jélvez", "Renato Lazcano", "Tomás Maldonado", "Pablo Molina", "Lucas Moncada", "Belén Monsalves", "Amalia Oróstica", "Myrna Pérez", "Camilo Ramírez", "Amaro Rojas", "Angel Rojas", "Simona Saravia", "Benjamín Tapia", "Juan Torrejón", "Nara Urtubia", "Josefa Valdés", "Agustina Vargas", "Catalina Vega", "Luciano Vélez", "Luciano Vergara", "Agustín Videla", "Polett Zamora", "Mathias Monges"],
  "7° Básico": ["Jaime Abarca", "Vicente Acevedo", "Franco Avendaño", "RocÍo Ayala", "Facundo Barra", "Máximo Bugueño", "Charlotte Campos", "Isabella Contreras", "Ricardo Donoso", "Ian Flores", "Mayte Gallardo", "Fernanda Huenchulao", "Francisca Infante", "Luciano Iturra", "Patricio Jara", "Gabriel Jara", "Julieta León", "Laura Lobos", "Salma Marcarian", "Amelia Méndez", "Magdalena Miranda", "Rodrigo Montenegro", "Martín Moyano", "Renata Pinto", "Josué Quinchavil", "Julián Ramírez", "Matilda Robledo", "Leonor Rojas", "Simón Rojas", "Lucas Salazar", "Alexandra Salgado", "Valentín Santibáñez", "Cristian Silva", "Emiliano Silva", "Emilia Solís", "Agustín Tello", "Isidora Vásquez", "Antonella Velázquez", "Fernando Videla", "Francisco Videla", "Antonia Villarroel", "Agustina Villegas", "Ronaldo Yáñez"],
  "8° Básico": ["Belén Albornoz", "Emilia Arias", "Emilia Ayala", "Renata Caballero", "Rafael Cabrera", "Isidora Carvajal", "Santiago Cocio", "Cristóbal Contreras", "Julieta Donoso", "Cristóbal Estay", "Johán Figueroa", "Benjamín Fredes", "Isidora Galdámez", "Nahuel Gamboa", "Julieta García", "Monserrat González", "Martín Guzmán", "Dominique Herrera", "Trinidad Higueras", "Benjamín López", "Arturo López", "Fernando Martínez", "Tomas Méndez", "Rafaela Miranda", "Tomas Morales", "Rafaela Muñoz", "Valentina Nuñez", "Paolo Núñez", "Renato Orellana", "Joaquín Pandolfa", "Catalina Papagallo", "Lucas Paredes", "Nicolás Pereira", "Jesús Pinto", "Antonia Reyes", "Ariel Salinas", "Pascal Saravia", "Joaquín Trigo", "Emilia Urbina", "Noelia Varas", "Johann Anabalón"]
};

const CURSOS = Object.keys(NOMBRES_ESTUDIANTES);

const HIMNO_ESTRUCTURA = [
  { id: 'e1', title: 'Estrofa 1', lines: ['En aulas de saber y estrategias a crear', 'Estudiantes que florecen listos para avanzar', 'Calidad en cada paso siempre con pasión', 'Con docentes que inspiran guiando el corazón.'] },
  { id: 'c1', title: 'Coro', lines: ['Colegio Claudio Gay...', 'Unidos en verdad', 'Con educación cercana, familiar de calidad.', 'Forjando el futuro con esfuerzo', 'Esfuerzo y dedicación', 'Estudiantes y asistentes somos la gran misión...'] },
  { id: 'e2', title: 'Estrofa 2', lines: ['Aquí la educación es un lazo sin igual', 'La familia y el saber son nuestro ideal', 'Estrategias que nos llevan a grandes triunfos hoy', 'Formamos el mañana con confianza y con amor.'] },
  { id: 'c2', title: 'Coro 2', lines: ['Colegio Claudio Gay...', 'Ejemplo de unidad', 'Crecemos juntos siempre con toda dignidad.'] },
  { id: 'final', title: 'Final', lines: ['Educación, calidad...', 'Futuro y vocación', 'Claudio Gay', '¡Siempre en nuestro corazón!'] }
];

const MUSICAL_FIGURES = [
  { type: 'Redonda', value: 4, color: '#dc2626' },
  { type: 'Blanca', value: 2, color: '#2563eb' },
  { type: 'Negra', value: 1, color: '#0f172a' },
  { type: 'Corcheas', value: 1, color: '#334155' }
];

// ==========================================
// 3. UTILIDADES
// ==========================================
const normalize = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[¡!¿?.,;:"']/g, "").trim().toUpperCase();
};

const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

const generateBeatSequence = () => {
    let seq = [];
    let currentSum = 0;
    while (currentSum < 4) {
        const remaining = 4 - currentSum;
        const possible = MUSICAL_FIGURES.filter(f => f.value <= remaining);
        const pick = possible[Math.floor(Math.random() * possible.length)];
        seq.push(pick);
        currentSum += pick.value;
    }
    return seq;
};

// ==========================================
// 4. COMPONENTES VISUALES
// ==========================================
const MusicNote = ({ type, color = "currentColor" }) => {
  const baseClass = "flex items-center justify-center p-1";
  switch (type) {
    case 'Redonda':
      return (
        <div className={baseClass}>
          <svg viewBox="0 0 100 60" className="w-12 h-8 md:w-16 md:h-10">
            <ellipse cx="50" cy="30" rx="35" ry="22" fill="none" stroke={color} strokeWidth="12" transform="rotate(-20 50 30)" />
          </svg>
        </div>
      );
    case 'Blanca':
      return (
        <div className={baseClass}>
          <svg viewBox="0 0 80 140" className="w-8 h-12 md:w-10 md:h-20">
            <ellipse cx="30" cy="110" rx="22" ry="16" fill="none" stroke={color} strokeWidth="12" transform="rotate(-20 30 110)" />
            <path d="M52 10 L52 105" stroke={color} strokeWidth="12" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'Negra':
      return (
        <div className={baseClass}>
          <svg viewBox="0 0 80 140" className="w-8 h-12 md:w-10 md:h-20">
            <ellipse cx="30" cy="110" rx="22" ry="16" fill={color} transform="rotate(-20 30 110)" />
            <path d="M52 10 L52 105" stroke={color} strokeWidth="12" strokeLinecap="round" />
          </svg>
        </div>
      );
    case 'Corcheas':
      return (
        <div className={baseClass}>
          <svg viewBox="0 0 140 140" className="w-12 h-12 md:w-16 md:h-16">
            <ellipse cx="25" cy="110" rx="18" ry="12" fill={color} transform="rotate(-20 25 110)" />
            <path d="M42 20 L42 105" stroke={color} strokeWidth="12" />
            <ellipse cx="95" cy="110" rx="18" ry="12" fill={color} transform="rotate(-20 95 110)" />
            <path d="M112 20 L112 105" stroke={color} strokeWidth="12" />
            <path d="M42 25 L112 25" stroke={color} strokeWidth="16" />
          </svg>
        </div>
      );
    default: return null;
  }
};

// ==========================================
// VISTAS PROYECTOR
// ==========================================
const CourseSelector = ({ onSelect }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play().catch(e => console.log(e));
    setIsPlaying(!isPlaying);
  };
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <audio ref={audioRef} src="/himno.mp3" onEnded={() => setIsPlaying(false)} />
      <div className="bg-slate-800 p-6 sm:p-12 rounded-4xl border-2 border-slate-700 shadow-2xl max-w-3xl w-full text-center relative overflow-hidden">
        <button onClick={toggleAudio} className={`absolute top-4 right-4 p-3 rounded-full transition-all border-b-4 ${isPlaying ? 'bg-red-600 border-red-800 animate-pulse text-white' : 'bg-slate-700 border-slate-900 text-slate-400'}`}>
          <Music size={20} />
          <span className="block text-[7px] font-black mt-1 uppercase">{isPlaying ? 'Sonando' : 'Himno'}</span>
        </button>
        <div className="bg-red-600/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner text-red-500">
          <School size={32} />
        </div>
        <h2 className="text-2xl sm:text-5xl font-black mb-10 uppercase italic tracking-tighter text-white">CCG-INTERACTIVO</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {CURSOS.map(curso => (
            <button key={curso} onClick={() => onSelect(curso)} className="bg-slate-700 hover:bg-red-600 text-white py-4 px-6 rounded-xl transition-all border-b-4 border-slate-900 flex items-center justify-between group">
              <span className="text-lg italic font-black">{curso}</span>
              <ChevronRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const CategorySelector = ({ curso, onSelectCategory, onBack }) => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white font-sans text-center">
    <button onClick={onBack} className="mb-10 text-slate-500 hover:text-white flex items-center gap-2 font-black uppercase text-xs tracking-widest mx-auto transition-colors"><RotateCcw size={16}/> Volver</button>
    <h2 className="text-5xl font-black mb-2 italic uppercase tracking-tighter">{curso}</h2>
    <p className="text-red-500 font-black uppercase tracking-[0.5em] text-xs mb-16 italic underline decoration-red-600">Modalidad de Clase</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl w-full text-slate-900">
      <button onClick={() => onSelectCategory('himno')} className="bg-white p-12 rounded-[3rem] shadow-2xl hover:scale-105 transition-all flex flex-col items-center gap-6 border-b-15 border-slate-200">
        <div className="bg-red-100 p-6 rounded-full text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all"><Music size={60} /></div>
        <span className="text-4xl font-black uppercase block italic tracking-tighter">HIMNO</span>
      </button>
      <button onClick={() => onSelectCategory('polirritmia')} className="bg-slate-800 text-white p-12 rounded-[3rem] shadow-2xl hover:scale-105 transition-all flex flex-col items-center gap-6 border-b-15 border-slate-950">
        <div className="bg-blue-600 p-6 rounded-full text-white group-hover:bg-white group-hover:text-blue-600 transition-all"><LayoutGrid size={60} /></div>
        <span className="text-4xl font-black uppercase block italic tracking-tighter">POLIRRITMIA</span>
      </button>
    </div>
  </div>
);

// ==========================================
// VISTA: CONTROL REMOTO (PARA CELULAR)
// ==========================================
const RemoteControl = () => {
  const [remoteView, setRemoteView] = useState("menu");
  const [appState, setAppState] = useState(null);
  const [evalPol, setEvalPol] = useState(Array(4).fill(null).map(() => ({ L: true, R: true })));
  const [currentWord, setCurrentWord] = useState("");
  const [status, setStatus] = useState("Conectado");
  const hasInitializedNav = useRef(false);

  useEffect(() => {
    const estadoRef = ref(db, 'estado');
    const remotoRef = ref(db, 'remoto/evalPol');
    
    const unsubEstado = onValue(estadoRef, (snap) => {
        const val = snap.val();
        setAppState(val);
        
        // FIX: Navegación automática solo al inicio
        if (val && !hasInitializedNav.current) {
            hasInitializedNav.current = true;
            if (val.cursoActual !== CURSO_CON_POLIRRITMIA) {
                setRemoteView("himno");
            }
        }
    });
    const unsubRemoto = onValue(remotoRef, (snap) => { if(snap.val()) setEvalPol(snap.val()); });
    
    return () => { unsubEstado(); unsubRemoto(); };
  }, []);

  const toggleEval = (rowIdx, hand) => {
    const newVal = [...evalPol];
    newVal[rowIdx][hand] = !newVal[rowIdx][hand]; 
    setEvalPol(newVal);
    update(ref(db, 'remoto'), { evalPol: newVal });
  };

  const sendWord = () => {
    if (!currentWord.trim()) return;
    setStatus("Enviando...");
    set(ref(db, 'remoto/mensaje'), { texto: currentWord.trim().toUpperCase(), timestamp: Date.now() })
      .then(() => { setStatus("OK ✓"); setCurrentWord(""); setTimeout(() => setStatus("Conectado"), 1000); });
  };

  if (!appState) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-10 text-center font-sans"><Wifi size={40} className="mb-4 animate-pulse" /><p className="italic text-slate-500 font-black uppercase text-xs tracking-widest">Conectando...</p></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col items-center justify-center font-sans overflow-hidden">
      <div className="w-full max-w-md bg-slate-900 p-6 rounded-3xl border-2 border-slate-800 shadow-2xl relative">
        <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
          <button onClick={() => setRemoteView("menu")} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={20}/>
          </button>
          <div className="text-[10px] font-black text-green-400 bg-green-950 px-4 py-1.5 rounded-full flex items-center gap-2 animate-pulse">
            <Wifi size={12}/> {status}
          </div>
        </div>

        {remoteView === "menu" ? (
          <div className="space-y-6 py-4">
              <h2 className="text-center font-black text-2xl uppercase tracking-tighter italic text-red-500">Mando CCG</h2>
              <button onClick={() => setRemoteView("himno")} className="w-full bg-white text-slate-900 p-8 rounded-3xl font-black text-2xl flex items-center justify-center gap-4 active:scale-95 shadow-lg transition-transform"><Mic2 /> HIMNO</button>
              {appState?.cursoActual === CURSO_CON_POLIRRITMIA && (
                <button onClick={() => setRemoteView("polirritmia")} className="w-full bg-blue-600 text-white p-8 rounded-3xl font-black text-2xl flex items-center justify-center gap-4 active:scale-95 shadow-lg transition-transform"><Drum /> POLIRRITMIA</button>
              )}
          </div>
        ) : remoteView === "polirritmia" ? (
           <div className="space-y-4 animate-in fade-in">
              <p className="text-center text-slate-500 font-black uppercase text-[10px] tracking-widest italic">Toca para marcar ERROR:</p>
              <div className="grid grid-cols-1 gap-3">
                 {evalPol.map((row, idx) => (
                    <div key={idx} className="grid grid-cols-2 gap-3 text-white">
                        <button onClick={() => toggleEval(idx, 'L')} className={`py-7 rounded-2xl font-black border-b-8 transition-all flex items-center justify-center gap-2 ${row.L === true ? 'bg-green-600 border-green-800 text-white' : 'bg-red-600 border-red-800 text-white'}`}>
                            {row.L ? <Check size={16}/> : <X size={16}/>} IZQ {idx + 1}
                        </button>
                        <button onClick={() => toggleEval(idx, 'R')} className={`py-7 rounded-2xl font-black border-b-8 transition-all flex items-center justify-center gap-2 ${row.R === true ? 'bg-green-600 border-green-800 text-white' : 'bg-red-600 border-red-800 text-white'}`}>
                            {row.R ? <Check size={16}/> : <X size={16}/>} DER {idx + 1}
                        </button>
                    </div>
                 ))}
              </div>
              <button onClick={() => update(ref(db, 'remoto'), { evalPol: Array(4).fill(null).map(() => ({ L: true, R: true })) })} className="w-full bg-slate-800 py-3 rounded-xl text-[10px] font-black uppercase text-slate-500 flex items-center justify-center gap-2 mt-4"><RefreshCw size={12}/> Limpiar Evaluación</button>
           </div>
        ) : (
          <div className="space-y-6 animate-in fade-in text-white">
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest text-center italic">Actividad Himno</p>
            <input type="text" value={currentWord} onChange={(e) => setCurrentWord(e.target.value)} className="w-full bg-slate-800 text-white text-4xl font-black p-6 rounded-2xl border-4 border-slate-700 outline-none uppercase text-center focus:border-red-500 transition-colors text-slate-100 placeholder-slate-600" placeholder="..." />
            <button onClick={sendWord} className="w-full bg-red-600 text-white text-2xl font-black py-6 rounded-2xl border-b-12 border-red-900 uppercase active:translate-y-1 transition-all shadow-xl">ENVIAR</button>
          </div>
        )}
        <div className="mt-8 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-600 font-black uppercase italic tracking-widest">{appState?.cursoActual}</div>
      </div>
    </div>
  );
};

// ==========================================
// VISTA: PANTALLA PRINCIPAL PROYECTOR
// ==========================================
const MainDisplay = ({ curso, modo = 'himno' }) => {
  const [students, setStudents] = useState([]);
  const [gameState, setGameState] = useState('lobby'); 
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentSectionData, setCurrentSectionData] = useState(null);
  const [polyrhythmRows, setPolyrhythmRows] = useState([]);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [bpm, setBpm] = useState(80);
  const [beat, setBeat] = useState(false);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [evalPol, setEvalPol] = useState(Array(4).fill(null).map(() => ({ L: true, R: true })));
  const audioCtxRef = useRef(null);
  const turnStartTime = useRef(Date.now());

  const initAudio = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
  };

  const playMetronomeSound = () => {
    if (!audioCtxRef.current || !metronomeOn) return;
    const time = audioCtxRef.current.currentTime;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    osc.frequency.setValueAtTime(1000, time);
    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    osc.start(time);
    osc.stop(time + 0.1);
  };

  const handleWordValidation = useCallback((typedText) => {
    if (!currentSectionData || gameState !== 'playing') return;
    let found = false;
    setCurrentSectionData(prev => {
        if (!prev) return prev;
        const newLines = prev.lines.map(line => line.map(w => {
            if (!found && w.isHidden && !w.isRevealed) {
                found = true;
                const isCorrect = normalize(w.text) === normalize(typedText);
                return { ...w, isRevealed: true, status: isCorrect ? 'correct' : 'wrong' };
            }
            return w;
        }));
        return { ...prev, lines: newLines };
    });
  }, [currentSectionData, gameState]);

  const startSpin = () => {
    initAudio();
    const available = students.filter(s => !s.played);
    if (available.length === 0) return alert("¡Curso Finalizado!");
    setGameState('spinning');
    let count = 0;
    const interval = setInterval(() => {
      setSelectedStudent(available[Math.floor(Math.random() * available.length)]);
      if (count++ >= 35) { clearInterval(interval); setGameState('announced'); }
    }, 60);
  };

  const startTurn = () => {
    initAudio();
    turnStartTime.current = Date.now(); 
    remove(ref(db, 'remoto/mensaje'));

    if (modo === 'polirritmia') {
        setPolyrhythmRows(Array.from({ length: 4 }, () => ({ left: generateBeatSequence(), right: generateBeatSequence() })));
        const reset = Array(4).fill(null).map(() => ({ L: true, R: true }));
        setEvalPol(reset);
        set(ref(db, 'remoto/evalPol'), reset);
    } else {
        const choice = shuffle(HIMNO_ESTRUCTURA)[0];
        let setOfSections = (['c1', 'c2', 'final'].includes(choice.id)) ? [shuffle(HIMNO_ESTRUCTURA.filter(s => s.id.startsWith('e')))[0], choice] : [choice];
        setCurrentSectionData({
            title: setOfSections.map(s => s.title).join(" + "),
            lines: setOfSections.flatMap(s => s.lines).map(line => {
                const words = line.split(' ');
                const indices = new Set();
                while(indices.size < Math.min(words.length - 1, 2)) indices.add(Math.floor(Math.random() * words.length));
                return words.map((text, idx) => ({ text, isHidden: indices.has(idx), isRevealed: false, status: null }));
            })
        });
    }
    setGameState('playing');
  };

  const calculateFinalScore = () => {
      if (modo === 'polirritmia') {
          let hits = 0;
          evalPol.forEach(r => { if(r.L === true) hits++; if(r.R === true) hits++; });
          return Math.round((hits / 8) * 100);
      }
      if (!currentSectionData) return 0;
      let totalHidden = 0, correctOnes = 0;
      currentSectionData.lines.forEach(l => l.forEach(w => {
          if (w.isHidden) { totalHidden++; if (w.status === 'correct') correctOnes++; }
      }));
      return totalHidden > 0 ? Math.round((correctOnes / totalHidden) * 100) : 100;
  };

  const savePoints = () => {
    const finalScore = calculateFinalScore();
    const cursoPath = curso.replace(/ /g, "_").toLowerCase();
    const originalNombres = NOMBRES_ESTUDIANTES[curso];
    const studentIdx = originalNombres.indexOf(selectedStudent.name);

    if (studentIdx !== -1) {
        update(ref(db, `cursos/${cursoPath}/estudiantes/${studentIdx}`), { 
            points: finalScore, 
            played: true 
        });

        const fecha = new Date().toISOString().slice(0, 10);
        set(ref(db, `cursos/${cursoPath}/historial/${fecha}/${studentIdx}`), {
          nombre: selectedStudent.name,
          points: finalScore,
          modo: modo,
          timestamp: Date.now()
        });
    }

    setSessionPoints(finalScore);
    setMetronomeOn(false);
    setGameState('summary');
  };

  useEffect(() => {
      if (!metronomeOn || gameState !== 'playing') { setBeat(false); return; }
      const interval = setInterval(() => { setBeat(prev => !prev); playMetronomeSound(); }, (60000 / bpm));
      return () => clearInterval(interval);
  }, [metronomeOn, gameState, bpm]);

  useEffect(() => {
    update(ref(db, 'estado'), { cursoActual: curso, modoActual: modo });
    if (!curso) return;
    const cursoPath = curso.replace(/ /g, "_").toLowerCase();
    const studentsRef = ref(db, `cursos/${cursoPath}/estudiantes`);
    const unsub = onValue(studentsRef, (snap) => {
        const data = snap.val();
        if (data) setStudents(Object.values(data));
        else {
            const initial = (NOMBRES_ESTUDIANTES[curso] || []).map((n, i) => ({ id: i + 1, name: n, points: 0, played: false }));
            set(studentsRef, initial);
        }
    });
    return () => unsub();
  }, [curso, modo]);

  useEffect(() => {
    const evalRef = ref(db, 'remoto/evalPol');
    const msgRef = ref(db, 'remoto/mensaje');
    const unsubEval = onValue(evalRef, (snap) => { if(snap.val()) setEvalPol(snap.val()); });
    const unsubMsg = onValue(msgRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.texto && data.timestamp > turnStartTime.current) {
        handleWordValidation(data.texto);
        remove(msgRef);
      }
    });
    return () => { unsubEval(); unsubMsg(); };
  }, [currentSectionData, gameState, handleWordValidation]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { if(document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans p-4 sm:p-8 overflow-x-hidden text-slate-900">
      <nav className="max-w-7xl mx-auto bg-white border-b-8 border-red-600 p-6 rounded-6xl flex flex-col sm:flex-row justify-between items-center shadow-2xl mb-12 gap-4">
        <div className="flex items-center gap-6">
          <div className="bg-slate-900 p-4 rounded-3xl text-white shadow-xl">{modo === 'polirritmia' ? <Drum size={32}/> : <Music size={32} />}</div>
          <div><h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter italic leading-none text-slate-900">CCG-INTERACTIVO</h1><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mt-2 italic">{curso}</p></div>
        </div>
        <div className="flex items-center gap-4">
            {modo === 'polirritmia' && (
                <div className="bg-blue-50 text-blue-600 px-6 py-3 rounded-full border border-blue-200 flex items-center gap-4 font-black shadow-inner">
                    <button onClick={() => { initAudio(); setMetronomeOn(!metronomeOn); }} className={`p-2 rounded-full transition-all ${metronomeOn ? 'bg-red-500 text-white shadow-lg' : 'bg-blue-600 text-white shadow-md'}`}>
                        {metronomeOn ? <Square size={20} fill="currentColor"/> : <PlayCircle size={20} fill="currentColor"/>}
                    </button>
                    <input type="range" min="40" max="160" value={bpm} onChange={(e) => setBpm(parseInt(e.target.value))} className="w-24 accent-blue-600" />
                    <span className="text-sm w-16 font-bold">{bpm} BPM</span>
                    <div className={`w-4 h-4 rounded-full ${beat ? 'bg-blue-600 scale-150' : 'bg-blue-200'} transition-all duration-75`}></div>
                </div>
            )}
            <button onClick={() => window.location.reload()} className="bg-slate-50 p-4 rounded-full text-slate-300 hover:text-red-600 border border-slate-200 transition-colors shadow-sm"><RotateCcw size={28}/></button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 order-1">
          {gameState === 'lobby' && (
            <div className="bg-white rounded-6xl p-12 sm:p-24 text-center shadow-2xl border flex flex-col items-center justify-center min-h-125 animate-in zoom-in duration-500 text-slate-900">
              <div className="bg-red-50 p-10 rounded-full mb-10 text-red-600">{modo === 'polirritmia' ? <Drum size={100} className="animate-bounce" /> : <Star size={100} className="animate-pulse" fill="currentColor" />}</div>
              <h2 className="text-5xl sm:text-7xl font-black text-slate-900 mb-12 uppercase italic tracking-tighter">¿Quién sigue?</h2>
              <button onClick={() => { initAudio(); startSpin(); }} className={`text-white text-3xl sm:text-6xl font-black px-12 sm:px-24 py-8 sm:py-12 rounded-[3rem] border-b-18 shadow-2xl active:scale-95 transition-all uppercase italic ${modo === 'polirritmia' ? 'bg-blue-600 border-blue-900' : 'bg-red-600 border-red-900'}`}>GIRAR RULETA</button>
            </div>
          )}

          {gameState === 'spinning' && (
            <div className="bg-slate-900 rounded-6xl p-12 sm:p-24 text-center flex flex-col items-center justify-center min-h-125 border-15 border-slate-800 shadow-2xl overflow-hidden text-white">
              <h2 key={selectedStudent?.id} className="text-5xl sm:text-[8rem] font-black italic tracking-tighter animate-in fade-in zoom-in duration-75 uppercase truncate w-full px-10">{selectedStudent?.name}</h2>
            </div>
          )}

          {gameState === 'announced' && (
            <div className={`rounded-6xl p-12 sm:p-24 text-center text-white shadow-2xl flex flex-col items-center justify-center min-h-125 border-b-20 animate-in slide-in-from-bottom ${modo === 'polirritmia' ? 'bg-blue-600 border-blue-900' : 'bg-red-600 border-red-900'}`}>
              <p className="text-2xl sm:text-3xl font-bold opacity-70 uppercase tracking-widest mb-12 italic text-white">Es el turno de:</p>
              <h2 className="text-6xl sm:text-[7rem] font-black mb-16 sm:mb-24 drop-shadow-2xl uppercase leading-none italic text-white">{selectedStudent?.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl text-slate-900">
                <button onClick={() => setGameState('lobby')} className="bg-black/20 px-10 py-6 rounded-3xl font-black text-2xl border-4 border-white/20 italic text-white">AUSENTE</button>
                <button onClick={startTurn} className="bg-white px-16 py-8 rounded-3xl font-black text-4xl shadow-2xl hover:scale-105 transition-transform italic uppercase">¡A JUGAR!</button>
              </div>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="space-y-10 animate-in fade-in">
              <div className={`p-8 sm:p-12 rounded-[4rem] flex justify-between items-center border-b-8 shadow-2xl ${modo === 'polirritmia' ? 'bg-slate-900 border-blue-600' : 'bg-slate-900 border-red-600'}`}>
                <div className="flex items-center gap-10 text-white">
                    <div className={`${modo === 'polirritmia' ? 'bg-blue-600 shadow-blue-500/50' : 'bg-red-600 shadow-red-500/50'} w-16 h-16 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center shadow-2xl`}>{modo === 'polirritmia' ? <Drum size={48} /> : <Music size={48} />}</div>
                    <h3 className="text-2xl sm:text-5xl font-black uppercase italic truncate leading-none text-white">{selectedStudent?.name}</h3>
                </div>
              </div>

              {modo === 'polirritmia' ? (
                <div className="bg-white p-6 md:p-8 rounded-[4rem] shadow-2xl border flex flex-col gap-6 relative overflow-hidden text-slate-900">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 font-black text-[10px] text-blue-300 uppercase tracking-widest text-blue-300">Lectura de 4 Compases</div>
                    {polyrhythmRows.map((row, rIdx) => (
                        <div key={rIdx} className="flex gap-4 border-b border-slate-100 last:border-0 pb-4 last:pb-0 animate-in slide-in-from-bottom" style={{animationDelay: `${rIdx*100}ms`}}>
                            <div className="bg-slate-800 text-white w-10 flex items-center justify-center font-black rounded-xl text-xl italic shadow-md">{rIdx + 1}</div>
                            <div className={`flex-1 p-4 rounded-[2.5rem] border-2 flex items-center gap-4 transition-all ${evalPol[rIdx]?.L === true ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
                                <Hand className="text-blue-600 -scale-x-100 shrink-0" size={32}/>
                                <div className="flex gap-1 overflow-x-auto">{row.left.map((fig, i) => <MusicNote key={i} type={fig.type} color="#2563eb" />)}</div>
                            </div>
                            <div className={`flex-1 p-4 rounded-[2.5rem] border-2 flex items-center gap-4 transition-all ${evalPol[rIdx]?.R === true ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'}`}>
                                <Hand className="text-red-600 shrink-0" size={32}/>
                                <div className="flex gap-1 overflow-x-auto">{row.right.map((fig, i) => <MusicNote key={i} type={fig.type} color="#dc2626" />)}</div>
                            </div>
                        </div>
                    ))}
                </div>
              ) : (
                <div className="bg-white p-8 sm:p-20 rounded-6xl shadow-2xl min-h-100 flex flex-col justify-center border relative overflow-hidden text-center text-slate-900">
                    <h4 className="absolute top-10 left-16 text-red-600 font-black text-xs uppercase tracking-widest flex items-center gap-4 animate-pulse"><div className="w-3 h-3 bg-red-600 rounded-full text-red-600"></div> {currentSectionData?.title}</h4>
                    <div className="space-y-10 text-slate-800 text-slate-900">
                    {currentSectionData?.lines.map((line, lIdx) => (
                        <p key={lIdx} className="text-3xl sm:text-5xl font-black flex flex-wrap gap-x-6 leading-[1.1] justify-center">
                        {line.map((word, wIdx) => (
                            <span key={wIdx} className={`rounded-3xl px-3 transition-all ${word.isHidden ? (word.isRevealed ? (word.status === 'correct' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50 line-through opacity-50') : 'bg-slate-100 text-transparent min-w-24 border-b-10 border-slate-200 mb-2') : 'text-slate-800'}`}>{word.text}</span>
                        ))}
                        </p>
                    ))}
                    </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-8 animate-in slide-in-from-bottom">
                  <button onClick={savePoints} className={`text-white py-10 rounded-[3rem] font-black text-3xl sm:text-5xl border-b-15 shadow-2xl transition-all italic uppercase ${modo === 'polirritmia' ? 'bg-blue-600 border-blue-900' : 'bg-red-600 border-red-900'}`}>Finalizar Turno</button>
              </div>
            </div>
          )}

          {gameState === 'summary' && (
            <div className="bg-white rounded-6xl p-16 sm:p-32 text-center shadow-2xl min-h-150 border animate-in zoom-in border-slate-100 text-slate-900">
              <Award size={150} className="text-yellow-500 mb-12 mx-auto drop-shadow-xl animate-bounce" />
              <h2 className="text-5xl sm:text-[6rem] font-black text-slate-900 mb-12 uppercase italic tracking-tighter leading-none text-slate-900">{selectedStudent?.name}</h2>
              <div className="bg-red-600 text-white px-20 py-10 rounded-[4rem] text-7xl sm:text-[11rem] font-mono font-black mb-16 shadow-2xl leading-none">
                {sessionPoints}
              </div>
              <button onClick={() => { setGameState('lobby'); setSelectedStudent(null); }} className="bg-slate-900 text-white px-20 py-10 rounded-2xl font-black text-3xl sm:text-4xl italic uppercase shadow-xl hover:scale-110 transition-transform">Siguiente</button>
            </div>
          )}
        </div>

        {/* RANKING PROTEGIDO */}
        <div className="lg:col-span-4 order-2 text-slate-900">
          <div className="bg-white rounded-[3rem] sm:rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden lg:sticky lg:top-32 text-slate-900">
            <div className="p-8 sm:p-10 bg-slate-900 text-white flex justify-between items-center border-b-8 border-red-600">
              <h3 className="font-black uppercase text-2xl italic flex items-center gap-4 text-white"><Trophy className="text-yellow-400" size={32}/> RANKING</h3>
            </div>
            <div className="max-h-125 lg:max-h-187.5 overflow-y-auto scrollbar-hide bg-white">
              {students
                .sort((a,b) => (b.points || 0) - (a.points || 0) || a.id - b.id)
                .map((s, idx) => (
                <div key={s.id} className={`px-10 py-8 border-b flex items-center justify-between transition-all ${s.id === selectedStudent?.id ? 'bg-red-50 scale-105 z-10 shadow-xl' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-8">
                    <span className={`text-3xl font-black w-10 ${idx < 3 ? 'text-red-600 text-5xl' : 'text-slate-100'}`}>{idx + 1}</span>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 uppercase text-xl truncate w-36 leading-none mb-2 italic">{s.name}</span>
                      <span className={`text-[10px] font-black tracking-widest ${s.played ? 'text-green-500' : 'text-slate-400'}`}>{s.played ? 'PARTICIPÓ ✓' : 'PENDIENTE'}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono font-black text-4xl text-slate-800">{s.played ? (s.points || 0) : 0}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [role, setRole] = useState("display");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRole(params.get("control") === "celular" ? "controller" : "display");
  }, []);

  if (role === "controller") return <RemoteControl />;
  if (!selectedCourse) return <CourseSelector onSelect={setSelectedCourse} />;
  
  // FIX: Solo el curso constante ve el selector de categoría
  if (selectedCourse === CURSO_CON_POLIRRITMIA && !selectedCategory) {
    return <CategorySelector curso={selectedCourse} onSelectCategory={setSelectedCategory} onBack={() => setSelectedCourse(null)} />;
  }
  
  return <MainDisplay curso={selectedCourse} modo={selectedCategory || 'himno'} />;
};

export default App;