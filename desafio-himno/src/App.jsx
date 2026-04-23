import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, remove } from "firebase/database";
import { 
  Music, Star, Trophy, RotateCcw, Award, Wifi, 
  ChevronRight, School, Drum, Hand, LayoutGrid, Home,
  Square, PlayCircle, RefreshCw, ArrowLeft, Mic2, Check, X, Mic, ExternalLink, SkipBack, ListMusic, FileText, ThumbsUp, ThumbsDown, Minimize2, Flag
} from 'lucide-react';

// ==========================================
// 1. CONFIGURACIÓN FIREBASE
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
const YOUTUBE_ID_KARAOKE = "qt_U4mFJHUU"; 

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
  { id: 'h1', title: 'Estrofa 1', lines: ['En aulas de saber y estrategias a crear', 'Estudiantes que florecen listos para avanzar', 'Calidad en cada paso siempre con pasión', 'Con docentes que inspiran guiando el corazón.'] },
  { id: 'h2', title: 'Coro', lines: ['Colegio Claudio Gay...', 'Unidos en verdad', 'Con educación cercana, familiar de calidad.', 'Forjando el futuro con esfuerzo', 'Esfuerzo y dedicación', 'Estudiantes y asistentes somos la gran misión...'] },
  { id: 'h3', title: 'Estrofa 2', lines: ['Aquí la educación es un lazo sin igual', 'La familia y el saber son nuestro ideal', 'Estrategias que nos llevan a grandes triunfos hoy', 'Formamos el mañana con confianza y con amor.'] }
];

const KARAOKE_ESTRUCTURA = [
  { id: 'k1', title: 'Intro Rapa Nui', lines: ['Hoe tatou ite vaka!!! …Huiiii', 'Aroto i te hetu´u, a au i oho mai ai', 'E koro ko reka ana au i tooku oho ki hiva'] },
  { id: 'k2', title: 'Verso 1', lines: ['Voy navegando, navegando', 'Voy navegando muy feliz', 'Llevo en mi bote muchas frutas', 'Y todo lo que aprendí…'] },
  { id: 'k3', title: 'Verso 2', lines: ['Dejé mi tierra y a mis hermanos', 'Por conocer más de mi país', 'No soy del norte ni del sur', 'Porque yo soy de Rapa Nui'] },
  { id: 'k4', title: 'Puente', lines: ['Tahi rua, toru, ha', 'EEEEE A HE HOI´ EEEE'] }
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
const shuffleArray = (array) => {
    let m = array.length, t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m]; array[m] = array[i]; array[i] = t;
    }
    return array;
};

const normalize = (str) => (!str ? "" : str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[¡!¿?.,;:"']/g, "").trim().toUpperCase());

const generateBeatSequence = () => {
    let seq = [];
    let currentSum = 0;
    while (currentSum < 4) {
        const pick = MUSICAL_FIGURES.filter(f => f.value <= (4 - currentSum))[Math.floor(Math.random() * MUSICAL_FIGURES.filter(f => f.value <= (4 - currentSum)).length)];
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
    case 'Redonda': return (<div className={baseClass}><svg viewBox="0 0 100 60" className="w-14 h-8 md:w-20 md:h-12"><ellipse cx="50" cy="30" rx="35" ry="22" fill="none" stroke={color} strokeWidth="12" transform="rotate(-20 50 30)" /></svg></div>);
    case 'Blanca': return (<div className={baseClass}><svg viewBox="0 0 80 140" className="w-10 h-16 md:w-14 md:h-24"><ellipse cx="30" cy="110" rx="22" ry="16" fill="none" stroke={color} strokeWidth="12" transform="rotate(-20 30 110)" /><path d="M52 10 L52 105" stroke={color} strokeWidth="12" strokeLinecap="round" /></svg></div>);
    case 'Negra': return (<div className={baseClass}><svg viewBox="0 0 80 140" className="w-10 h-16 md:w-14 md:h-24"><ellipse cx="30" cy="110" rx="22" ry="16" fill={color} transform="rotate(-20 30 110)" /><path d="M52 10 L52 105" stroke={color} strokeWidth="12" strokeLinecap="round" /></svg></div>);
    case 'Corcheas': return (<div className={baseClass}><svg viewBox="0 0 140 140" className="w-16 h-16 md:w-24 md:h-24"><ellipse cx="25" cy="110" rx="18" ry="12" fill={color} transform="rotate(-20 25 110)" /><path d="M42 20 L42 105" stroke={color} strokeWidth="12" /><ellipse cx="95" cy="110" rx="18" ry="12" fill={color} transform="rotate(-20 95 110)" /><path d="M112 20 L112 105" stroke={color} strokeWidth="12" /><path d="M42 25 L112 25" stroke={color} strokeWidth="16" /></svg></div>);
    default: return null;
  }
};

const GlobalNavbar = ({ curso, actividad, onBack, onHome }) => (
  <nav className="max-w-7xl mx-auto bg-white border-b-8 border-red-600 p-6 rounded-[3rem] flex flex-col sm:flex-row justify-between items-center shadow-2xl mb-8 gap-6 mt-6 animate-in slide-in-from-top duration-500">
    <div className="flex items-center gap-6">
      <div className="bg-slate-900 p-4 rounded-3xl text-white shadow-xl">
        {actividad === 'polirritmia' ? <Drum size={32}/> : <Music size={32} />}
      </div>
      <div>
        <h1 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter leading-none text-slate-900">CCG-INTERACTIVO</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic mt-1">
          {curso} {actividad ? `| ${actividad.toUpperCase()}` : ''}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-4">
        <button onClick={onHome} className="bg-slate-100 p-4 rounded-full text-slate-600 hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center gap-2 px-6 font-black uppercase text-xs text-slate-600">
            <Home size={20}/> Inicio
        </button>
        <button onClick={onBack} className="bg-slate-100 p-4 rounded-full text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2 px-6 font-black uppercase text-xs text-slate-600">
            <ArrowLeft size={20}/> Atrás
        </button>
        <div className="w-[2px] h-8 bg-slate-200 mx-2"></div>
        <button onClick={() => window.location.reload()} className="bg-slate-50 p-4 rounded-full text-slate-300 hover:text-red-600 border border-slate-200 transition-all shadow-sm text-slate-300"><RotateCcw size={28}/></button>
    </div>
  </nav>
);

// ==========================================
// VISTAS CONFIGURACIÓN
// ==========================================
const CourseSelector = ({ onSelect }) => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans">
    <div className="bg-slate-800 p-12 rounded-[3rem] border-2 border-slate-700 shadow-2xl max-w-4xl w-full text-center text-white">
      <div className="bg-red-600/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner text-red-500 text-red-500 text-red-500"><School size={40} /></div>
      <h2 className="text-3xl sm:text-5xl font-black mb-10 uppercase italic tracking-tighter text-white">CCG-INTERACTIVO</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-white text-white">
        {CURSOS.map(curso => (
          <button key={curso} onClick={() => onSelect(curso)} className="bg-slate-700 hover:bg-red-600 text-white py-5 px-8 rounded-2xl transition-all border-b-4 border-slate-900 flex items-center justify-between group text-white">
            <span className="text-xl italic font-black">{curso}</span>
            <ChevronRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        ))}
      </div>
    </div>
  </div>
);

const CategorySelector = ({ curso, onSelectCategory }) => (
  <div className="flex flex-col items-center justify-center p-6 font-sans text-center">
    <h2 className="text-5xl font-black mb-4 italic uppercase tracking-tighter text-slate-900">{curso}</h2>
    <p className="text-red-500 font-black uppercase tracking-[0.5em] text-xs mb-16 italic underline decoration-red-600 underline-offset-8 text-red-500">Actividad</p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl w-full font-black text-white text-white">
      <button onClick={() => onSelectCategory('himno')} className="bg-white p-10 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border-b-12 border-slate-200 text-slate-900"><div className="bg-red-100 p-6 rounded-full text-red-600 mb-6 mx-auto w-fit text-red-600"><Music size={60} /></div><span className="text-3xl uppercase italic tracking-tighter text-slate-900">HIMNO</span></button>
      <button onClick={() => onSelectCategory('karaoke')} className="bg-white p-10 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border-b-12 border-slate-200 text-slate-900"><div className="bg-green-100 p-6 rounded-full text-green-600 mb-6 mx-auto w-fit text-green-600"><Mic size={60} /></div><span className="text-3xl uppercase italic tracking-tighter text-slate-900">KARAOKE</span></button>
      {curso === CURSO_CON_POLIRRITMIA && (<button onClick={() => onSelectCategory('polirritmia')} className="bg-slate-800 text-white p-10 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border-b-12 border-slate-950 border-2 border-slate-700 text-white"><div className="bg-blue-600 p-6 rounded-full text-white mb-6 mx-auto w-fit text-white"><LayoutGrid size={60} /></div><span className="text-3xl uppercase italic tracking-tighter text-white">POLIRRITMIA</span></button>)}
    </div>
  </div>
);

const ModeSelector = ({ onSelect }) => (
  <div className="flex flex-col items-center justify-center p-6 font-sans text-center">
    <h2 className="text-5xl font-black mb-16 italic uppercase tracking-tighter text-slate-900">Configuración</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-4xl w-full font-black text-white text-white">
      <button onClick={() => onSelect('completo')} className="bg-white p-12 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border-b-12 border-slate-200 text-slate-900"><div className="bg-indigo-100 p-6 rounded-full text-indigo-600 mx-auto mb-6 text-indigo-600"><ListMusic size={80} /></div><span className="text-4xl uppercase italic tracking-tighter block mb-2 text-slate-900">CANTO COMPLETO</span><p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-slate-400">Avance por evaluación</p></button>
      <button onClick={() => onSelect('seccion')} className="bg-white p-12 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border-b-12 border-slate-200 text-slate-900"><div className="bg-orange-100 p-6 rounded-full text-orange-600 mx-auto mb-6 text-orange-600"><FileText size={80} /></div><span className="text-4xl uppercase italic tracking-tighter block mb-2 text-slate-900">CANTA SECCIÓN</span><p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-slate-400">Estrofa al azar</p></button>
    </div>
  </div>
);

// ==========================================
// VISTA: CONTROL REMOTO (PARA CELULAR)
// ==========================================
const RemoteControl = () => {
  const [appState, setAppState] = useState(null);
  const [evalPol, setEvalPol] = useState(Array(4).fill(null).map(() => ({ L: true, R: true })));
  const [status, setStatus] = useState("Conectado");

  useEffect(() => {
    onValue(ref(db, 'estado'), (snap) => setAppState(snap.val()));
    onValue(ref(db, 'remoto/evalPol'), (snap) => { if(snap.val()) setEvalPol(snap.val()); });
  }, []);

  const sendAction = (action) => {
    setStatus("Enviando...");
    const messageId = Date.now() + "_" + Math.random().toString(36).substr(2, 5);
    set(ref(db, 'remoto/mensaje'), { texto: action, timestamp: messageId })
      .then(() => { setStatus("OK ✓"); setTimeout(() => setStatus("Conectado"), 800); });
  };

  const toggleEval = (rowIdx, hand) => {
    const newVal = [...evalPol];
    newVal[rowIdx][hand] = !newVal[rowIdx][hand]; 
    setEvalPol(newVal);
    update(ref(db, 'remoto'), { evalPol: newVal });
  };

  if (!appState) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-10 font-sans text-center text-white"><Wifi size={40} className="mb-4 animate-pulse" /><p className="italic text-slate-500 font-black uppercase text-xs text-white">Conectando...</p></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col items-center justify-center font-sans overflow-hidden">
      <div className="w-full max-w-md bg-slate-900 p-6 rounded-3xl border-2 border-slate-800 shadow-2xl relative">
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div className="text-[10px] font-black text-green-400 bg-green-950 px-4 py-2 rounded-full flex items-center gap-2 animate-pulse text-green-400"><Wifi size={12}/> {status}</div>
          <p className="text-[10px] font-black text-slate-500 uppercase italic text-slate-500">REMOTO MAESTRO</p>
        </div>

        <div className="space-y-8 animate-in fade-in">
          {appState.modoActual === 'polirritmia' ? (
              <div className="space-y-4 text-white">
                 <p className="text-center text-slate-500 font-black uppercase text-[10px] tracking-widest italic text-slate-500">EVALUACIÓN RÍTMICA</p>
                 <div className="grid grid-cols-2 gap-3 text-white">
                    {evalPol.map((row, idx) => (
                       <React.Fragment key={idx}>
                           <button onClick={() => toggleEval(idx, 'L')} className={`py-6 rounded-2xl font-black border-b-8 ${row.L ? 'bg-green-600 border-green-800 text-white' : 'bg-red-600 border-red-800 text-white'}`}>IZQ {idx + 1}</button>
                           <button onClick={() => toggleEval(idx, 'R')} className={`py-6 rounded-2xl font-black border-b-8 ${row.R ? 'bg-green-600 border-green-800 text-white' : 'bg-red-600 border-red-800 text-white'}`}>DER {idx + 1}</button>
                       </React.Fragment>
                    ))}
                 </div>
                 <button onClick={() => update(ref(db, 'remoto'), { evalPol: Array(4).fill(null).map(() => ({ L: true, R: true })) })} className="w-full bg-slate-800 py-3 rounded-xl text-[10px] font-black uppercase text-slate-500 mt-4 text-white">Reiniciar</button>
              </div>
          ) : (
              <div className="space-y-6 text-white text-white">
                  {appState.palabraActual && appState.palabraActual !== "..." && (
                      <div className="bg-white/5 border-2 border-dashed border-white/20 p-6 rounded-3xl mb-4 animate-bounce">
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 text-white">Palabra Oculta:</p>
                          <h3 className="text-white text-5xl font-black italic tracking-tighter uppercase text-white">{appState.palabraActual}</h3>
                      </div>
                  )}
                  <div className="grid grid-cols-1 gap-6">
                      <button onClick={() => sendAction("CORRECTO")} className="w-full bg-green-600 text-white py-14 rounded-5xl font-black text-4xl shadow-2xl border-b-[20px] border-green-800 active:scale-95 flex items-center justify-center gap-4 text-white"><ThumbsUp size={64} /> ¡BIEN!</button>
                      <button onClick={() => sendAction("ERROR")} className="w-full bg-red-600 text-white py-14 rounded-5xl font-black text-4xl shadow-2xl border-b-[20px] border-red-800 active:scale-95 flex items-center justify-center gap-4 text-white"><ThumbsDown size={64} /> ERROR</button>
                  </div>
              </div>
          )}
          
          <div className="pt-6">
             <button 
                onClick={() => sendAction("FINALIZAR_TURNO")}
                className="w-full bg-slate-100 text-slate-900 py-6 rounded-3xl font-black text-xl border-b-8 border-slate-300 active:scale-95 flex items-center justify-center gap-3 transition-all text-slate-900"
             >
                <Flag size={24} /> FINALIZAR TURNO
             </button>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-600 font-black uppercase italic tracking-widest text-slate-600 italic">CCG INTERACTIVO</div>
      </div>
    </div>
  );
};

// ==========================================
// VISTA: PANTALLA PRINCIPAL PROYECTOR
// ==========================================
const MainDisplay = ({ curso, modo = 'himno', singingMode = 'seccion', onBack, onHome }) => {
  const [students, setStudents] = useState([]);
  const [gameState, setGameState] = useState('lobby'); 
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentSectionData, setCurrentSectionData] = useState(null);
  const [activeLineIdx, setActiveLineIdx] = useState(0); 
  const [sessionPoints, setSessionPoints] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [polyrhythmRows, setPolyrhythmRows] = useState([]);
  const [evalPol, setEvalPol] = useState(Array(4).fill(null).map(() => ({ L: true, R: true })));

  const audioRef = useRef(null);
  const turnStartTime = useRef(Date.now());
  const lastProcessedMsgId = useRef(""); 
  const lyricsContainerRef = useRef(null);

  // Auto-scroll reactivo línea por línea
  useEffect(() => {
      const activeElement = document.getElementById(`line-${activeLineIdx}`);
      if (activeElement && lyricsContainerRef.current) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }, [activeLineIdx]);

  // Soplo al Celular: Palabra actual en la línea actual
  useEffect(() => {
    if (gameState === 'playing' && currentSectionData && modo !== 'polirritmia') {
        let currentWord = "...";
        let found = false;
        // Buscamos la palabra oculta en la línea que el proyector está centrando
        currentSectionData.lines[activeLineIdx]?.forEach(w => {
            if (!found && w.isHidden && !w.isRevealed) {
                currentWord = w.text;
                found = true;
            }
        });
        // Si no hay más en esta línea, buscamos en la siguiente para pre-cargar
        if (!found) {
            currentSectionData.lines[activeLineIdx + 1]?.forEach(w => {
                if (!found && w.isHidden && !w.isRevealed) {
                    currentWord = w.text;
                    found = true;
                }
            });
        }
        update(ref(db, 'estado'), { palabraActual: currentWord });
    }
  }, [currentSectionData, activeLineIdx, gameState, modo]);

  const handleWordValidation = useCallback((input) => {
    if (!currentSectionData || gameState !== 'playing') return;
    
    let processedOne = false;

    setCurrentSectionData(prev => {
        if (!prev) return prev;
        
        let newLines = [...prev.lines];
        let lineIdxToReveal = activeLineIdx;

        // Revelamos solo la SIGUIENTE palabra oculta del proyector
        let wordFound = false;
        const updatedLines = newLines.map((line, lIdx) => {
            return line.map(w => {
                if (!wordFound && w.isHidden && !w.isRevealed) {
                    wordFound = true;
                    let isCorrect = input === "CORRECTO";
                    return { ...w, isRevealed: true, status: isCorrect ? 'correct' : 'wrong' };
                }
                return w;
            });
        });

        // Verificamos si la línea actual se completó para saltar automáticamente
        const currentLine = updatedLines[activeLineIdx];
        const lineComplete = currentLine?.every(w => !w.isHidden || w.isRevealed);
        
        if (lineComplete && activeLineIdx < updatedLines.length - 1) {
            // Avance lento y fluido
            setTimeout(() => setActiveLineIdx(prevIdx => prevIdx + 1), 800);
        }

        return { ...prev, lines: updatedLines };
    });
  }, [currentSectionData, gameState, activeLineIdx]);

  const startSpin = () => {
    const available = students.filter(s => !s.played);
    if (isSpinning || available.length === 0) return;
    setIsSpinning(true); setGameState('spinning');
    let count = 0;
    const maxTicks = 45;
    
    // Barajado dinámico para azar total REAL
    const pool = shuffleArray([...available]);
    
    const interval = setInterval(() => {
        const studentIndex = count % pool.length;
        setSelectedStudent(pool[studentIndex]);
        if (count >= maxTicks) { 
            clearInterval(interval); 
            setSelectedStudent(pool[Math.floor(Math.random() * pool.length)]);
            setGameState('announced'); 
            setIsSpinning(false);
        }
        count++;
    }, 70);
  };

  const startTurn = () => {
    turnStartTime.current = Date.now(); 
    remove(ref(db, 'remoto/mensaje'));
    setActiveLineIdx(0);
    setIsAudioPlaying(false);

    if (modo === 'polirritmia') {
        setPolyrhythmRows(Array.from({ length: 4 }, () => ({ left: generateBeatSequence(), right: generateBeatSequence() })));
        const reset = Array(4).fill(null).map(() => ({ L: true, R: true }));
        set(ref(db, 'remoto/evalPol'), reset);
    } else {
        const source = modo === 'himno' ? HIMNO_ESTRUCTURA : KARAOKE_ESTRUCTURA;
        let targetSections = singingMode === 'completo' ? source : [shuffleArray([...source])[0]];
        
        setCurrentSectionData({
            title: singingMode === 'completo' ? "CANTO COMPLETO" : targetSections[0].title,
            lines: targetSections.flatMap(s => s.lines).map(lineText => {
                const words = lineText.split(' ');
                const eligible = words.map((w, i) => (w.replace(/[¡!¿?.,;:"']/g, "").length >= 3 ? i : -1)).filter(i => i !== -1);
                const toHideCount = Math.ceil(eligible.length * 0.5);
                const toHideIndices = new Set(shuffleArray(eligible).slice(0, toHideCount));
                return words.map((text, idx) => ({ text, isHidden: toHideIndices.has(idx), isRevealed: false, status: null }));
            })
        });
    }
    setGameState('playing');
  };

  const cerrarEscenario = () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } setIsAudioPlaying(false); };

  const savePoints = () => {
    const finalScore = modo === 'polirritmia' ? Math.round((evalPol.reduce((acc, r) => acc + (r.L?1:0) + (r.R?1:0), 0) / 8) * 100) : (() => {
          let total = 0, correct = 0;
          currentSectionData?.lines.forEach(l => l.forEach(w => { if (w.isHidden) { total++; if (w.status === 'correct') correct++; } }));
          return total > 0 ? Math.round((correct / total) * 100) : 100;
        })();
    const cursoPath = curso.replace(/ /g, "_").toLowerCase();
    const studentIdx = NOMBRES_ESTUDIANTES[curso].indexOf(selectedStudent.name);
    if (studentIdx !== -1) {
        update(ref(db, `cursos/${cursoPath}/estudiantes/${studentIdx}`), { points: finalScore, played: true });
    }
    setSessionPoints(finalScore); cerrarEscenario(); setGameState('summary');
  };

  useEffect(() => {
    update(ref(db, 'estado'), { cursoActual: curso, modoActual: modo });
    if (!curso) return;
    const unsub = onValue(ref(db, `cursos/${curso.replace(/ /g, "_").toLowerCase()}/estudiantes`), (snap) => {
        const data = snap.val();
        if (data) setStudents(Object.values(data));
        else {
            const initial = (NOMBRES_ESTUDIANTES[curso] || []).map((n, i) => ({ id: i + 1, name: n, points: 0, played: false }));
            set(ref(db, `cursos/${curso.replace(/ /g, "_").toLowerCase()}/estudiantes`), initial);
            setStudents(initial);
        }
    });
    return () => unsub();
  }, [curso, modo]);

  useEffect(() => {
    onValue(ref(db, 'remoto/evalPol'), (snap) => { if(snap.val()) setEvalPol(snap.val()); });
    const unsubMsg = onValue(ref(db, 'remoto/mensaje'), (snapshot) => {
      const data = snapshot.val();
      if (data && data.timestamp && data.timestamp !== lastProcessedMsgId.current) {
        lastProcessedMsgId.current = data.timestamp;
        if (data.texto === "FINALIZAR_TURNO") savePoints();
        else handleWordValidation(data.texto);
      }
    });
    return () => unsubMsg();
  }, [currentSectionData, gameState, handleWordValidation, savePoints]);

  const isScenarioMode = gameState === 'playing';

  return (
    <div className="flex flex-col h-full text-slate-900">
      <audio ref={audioRef} src={modo === 'himno' ? "/himno.mp3" : "/Voy Navegando, Navegando.mp3"} onEnded={() => setIsAudioPlaying(false)} />
      
      {/* CAPA ESCENARIO (HIMNO, KARAOKE Y POLIRRITMIA) */}
      {isScenarioMode && (
          <div className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col text-center overflow-hidden animate-in fade-in duration-300">
              <button onClick={cerrarEscenario} className="absolute top-8 right-8 text-white/20 hover:text-white p-4 z-[10001] transition-all text-white"><X size={64}/></button>
              
              <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-6 px-10 py-4 bg-white/5 rounded-full border border-white/10 text-white">
                  <div className={`${modo === 'himno' ? 'bg-red-600' : 'bg-blue-600'} w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg text-white`}>
                      {modo === 'polirritmia' ? <Drum size={24}/> : <Music size={24}/>}
                  </div>
                  <span className="text-2xl font-black italic tracking-tighter uppercase">{selectedStudent?.name}</span>
              </div>

              <div ref={lyricsContainerRef} className="flex-1 overflow-y-auto scrollbar-hide py-[45vh]">
                  {modo === 'polirritmia' ? (
                      <div className="max-w-6xl mx-auto space-y-12">
                          {polyrhythmRows.map((row, rIdx) => (
                              <div key={rIdx} className="flex gap-10 items-center justify-center bg-white/5 p-12 rounded-[4rem] border-2 border-white/5 animate-in zoom-in">
                                  <div className="bg-white text-slate-900 w-20 h-20 flex items-center justify-center font-black rounded-3xl text-4xl text-slate-900">{rIdx + 1}</div>
                                  <div className={`flex items-center gap-6 p-10 rounded-[3rem] border-4 transition-all ${evalPol[rIdx]?.L === true ? 'bg-green-600 border-green-400' : 'bg-red-600 border-red-400'}`}>
                                      <Hand className="text-white -scale-x-100 text-white" size={60}/>
                                      <div className="flex gap-4">{row.left.map((fig, i) => <MusicNote key={i} type={fig.type} color="white" />)}</div>
                                  </div>
                                  <div className={`flex items-center gap-6 p-10 rounded-[3rem] border-4 transition-all ${evalPol[rIdx]?.R === true ? 'bg-green-600 border-green-400' : 'bg-red-600 border-red-400'}`}>
                                      <Hand className="text-white text-white" size={60}/>
                                      <div className="flex gap-4">{row.right.map((fig, i) => <MusicNote key={i} type={fig.type} color="white" />)}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="max-w-7xl mx-auto space-y-16">
                      {currentSectionData?.lines.map((line, lIdx) => {
                          const active = lIdx === activeLineIdx;
                          return (
                              <div key={lIdx} id={`line-${lIdx}`} className={`transition-all duration-1000 px-10 ${active ? 'scale-110 opacity-100' : 'opacity-10 blur-sm'}`}>
                                  <p className="text-4xl sm:text-[8vh] font-black flex flex-wrap gap-x-8 justify-center leading-tight tracking-tight text-white">
                                      {line.map((word, wIdx) => (
                                          <span key={wIdx} className={word.isHidden ? (word.isRevealed ? (word.status === 'correct' ? 'text-green-500' : 'text-red-500 opacity-50 line-through') : 'text-transparent border-b-[12px] border-white/20 min-w-[10rem]') : ''}>{word.text}</span>
                                      ))}
                                  </p>
                              </div>
                          );
                      })}
                      </div>
                  )}
              </div>

              {modo !== 'polirritmia' && (
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                    <button onClick={() => { if(audioRef.current) { audioRef.current.play(); setIsAudioPlaying(true); } }} className="bg-green-600 text-white p-10 rounded-full border-b-8 border-green-800 hover:scale-110 transition-all text-white"><PlayCircle size={64}/></button>
                  </div>
              )}
          </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 order-1">
          {gameState === 'lobby' && (
            <div className="bg-white rounded-[4rem] p-24 text-center shadow-2xl border flex flex-col items-center justify-center min-h-[600px] animate-in zoom-in text-slate-900">
              <div className="bg-red-50 p-12 rounded-full mb-12 text-red-600 text-red-600 text-red-600"><Star size={120} className="animate-pulse" fill="currentColor" /></div>
              <h2 className="text-5xl sm:text-7xl font-black text-slate-900 mb-16 uppercase italic">¿Quién pasa?</h2>
              <button onClick={startSpin} className="text-white text-3xl sm:text-6xl font-black px-16 py-10 rounded-[3rem] border-b-18 shadow-2xl active:scale-95 transition-all uppercase italic bg-red-600 border-red-900 text-white text-white">GIRAR RULETA</button>
            </div>
          )}

          {gameState === 'spinning' && (
            <div className="bg-slate-900 rounded-[4rem] p-24 text-center flex flex-col items-center justify-center min-h-[600px] border-15 border-slate-800 shadow-2xl overflow-hidden text-white"><h2 className="text-5xl sm:text-[8rem] font-black italic tracking-tighter animate-in fade-in zoom-in duration-75 uppercase truncate w-full px-10 text-white text-white text-white">{selectedStudent?.name}</h2></div>
          )}

          {gameState === 'announced' && (
            <div className={`rounded-[4rem] p-20 text-center text-white shadow-2xl flex flex-col items-center justify-center min-h-[600px] border-b-20 animate-in slide-in-from-bottom ${modo === 'himno' ? 'bg-red-600 border-red-900' : 'bg-green-600 border-green-900'}`}>
              <p className="text-2xl font-bold opacity-70 uppercase tracking-widest mb-16 italic text-white text-white text-white text-white text-white">Pasa al frente:</p>
              <h2 className="text-6xl sm:text-[7rem] font-black mb-20 drop-shadow-2xl uppercase italic text-white text-white text-white text-white text-white">{selectedStudent?.name}</h2>
              <button onClick={startTurn} className="bg-white text-slate-900 px-16 py-10 rounded-3xl font-black text-5xl shadow-2xl hover:scale-105 transition-all italic uppercase text-slate-900 text-slate-900 text-slate-900 text-slate-900">¡A JUGAR!</button>
            </div>
          )}

          {gameState === 'summary' && (
            <div className="bg-white rounded-[5rem] p-16 sm:p-24 text-center shadow-2xl min-h-[600px] border animate-in zoom-in border-slate-100 text-slate-900">
              <Award size={150} className="text-yellow-500 mb-12 mx-auto animate-bounce text-yellow-500 text-yellow-500 text-yellow-500 text-yellow-500 text-yellow-500 text-yellow-500 text-yellow-500" />
              <h2 className="text-5xl sm:text-[6rem] font-black text-slate-900 mb-12 uppercase italic leading-none text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900">{selectedStudent?.name}</h2>
              <div className="bg-red-600 text-white px-20 py-10 rounded-[4rem] text-7xl sm:text-[10rem] font-mono font-black mb-16 shadow-2xl leading-none text-white text-white text-white text-white text-white text-white text-white">{sessionPoints}</div>
              <button onClick={() => { setGameState('lobby'); setSelectedStudent(null); }} className="bg-slate-900 text-white px-20 py-10 rounded-2xl font-black text-3xl sm:text-4xl italic uppercase shadow-xl hover:scale-110 transition-transform text-white text-white text-white text-white text-white text-white text-white text-white text-white text-white">Siguiente</button>
            </div>
          )}
        </div>

        {/* RANKING */}
        <div className="lg:col-span-4 order-2 text-slate-900">
          <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden lg:sticky lg:top-32 text-slate-900">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center border-b-8 border-red-600 text-white"><h3 className="font-black uppercase text-xl italic flex items-center gap-4 text-white text-white text-white text-white text-white text-white text-white text-white text-white text-white text-white"><Trophy className="text-yellow-400" size={32}/> RANKING</h3></div>
            <div className="max-h-125 lg:max-h-[700px] overflow-y-auto scrollbar-hide bg-white text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900">
              {students.sort((a,b) => (b.points || 0) - (a.points || 0) || a.id - b.id).map((s, idx) => (
                <div key={s.id} className={`px-10 py-6 border-b flex items-center justify-between transition-all ${s.id === selectedStudent?.id ? 'bg-red-50 scale-105 z-10 shadow-xl' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-6">
                    <span className={`text-2xl font-black w-10 ${idx < 3 ? 'text-red-600 text-4xl' : 'text-slate-100'}`}>{idx + 1}</span>
                    <div className="flex flex-col text-slate-900 text-slate-900 text-slate-900 text-slate-900">
                      <span className="font-black uppercase text-lg truncate w-32 leading-none mb-1 italic text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900 text-slate-900">{s.name}</span>
                      <span className={`text-[9px] font-black tracking-widest ${s.played ? 'text-green-500' : 'text-slate-400'}`}>{s.played ? 'PARTICIPÓ ✓' : 'PENDIENTE'}</span>
                    </div>
                  </div>
                  <div className="text-right font-mono font-black text-3xl text-slate-800 text-slate-800 text-slate-800 text-slate-800 text-slate-800 text-slate-800 text-slate-800 text-slate-800">{s.played ? (s.points || 0) : 0}</div>
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
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);
  const [role, setRole] = useState("display");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRole(params.get("control") === "celular" ? "controller" : "display");
  }, []);

  if (role === "controller") return <RemoteControl />;
  if (!selectedCourse) return <CourseSelector onSelect={setSelectedCourse} />;
  
  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col">
      <GlobalNavbar 
        curso={selectedCourse} 
        actividad={selectedCategory} 
        onBack={() => {
            if (selectedMode) setSelectedMode(null);
            else if (selectedCategory) setSelectedCategory(null);
            else setSelectedCourse(null);
        }} 
        onHome={() => {
            setSelectedCourse(null);
            setSelectedCategory(null);
            setSelectedMode(null);
        }} 
      />
      
      <main className="flex-1 overflow-y-auto">
        {!selectedCategory ? (
          <CategorySelector curso={selectedCourse} onSelectCategory={setSelectedCategory} />
        ) : (selectedCategory === 'himno' || selectedCategory === 'karaoke') && !selectedMode ? (
          <ModeSelector onSelect={setSelectedMode} />
        ) : (
          <MainDisplay 
              curso={selectedCourse} 
              modo={selectedCategory} 
              singingMode={selectedMode} 
              onBack={() => setSelectedMode(null)}
              onHome={() => { setSelectedCourse(null); setSelectedCategory(null); setSelectedMode(null); }}
          />
        )}
      </main>
    </div>
  );
};

export default App;