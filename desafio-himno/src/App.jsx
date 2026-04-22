import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, remove } from "firebase/database";
import { 
  Music, Star, Trophy, RotateCcw, Award, Wifi, 
  ChevronRight, School, Drum, Hand, LayoutGrid, Home,
  Square, PlayCircle, RefreshCw, ArrowLeft, Mic2, Check, X, Mic, ExternalLink, SkipBack, ListMusic, FileText, ThumbsUp, ThumbsDown, Minimize2
} from 'lucide-react';

// ==========================================
// 1. CONFIGURACIÓN
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

const CURSO_CON_POLIRRITMIA = "6° Básico";
const YOUTUBE_ID_KARAOKE = "qt_U4mFJHUU"; 

// ==========================================
// 2. ESTRUCTURAS DE LETRAS
// ==========================================
const HIMNO_ESTRUCTURA = [
  { id: 'h1', title: 'Estrofa 1', lines: ['En aulas de saber y estrategias a crear', 'Estudiantes que florecen listos para avanzar', 'Calidad en cada paso siempre con pasión', 'Con docentes que inspiran guiando el corazón.'] },
  { id: 'h2', title: 'Coro', lines: ['Colegio Claudio Gay...', 'Unidos en verdad', 'Con educación cercana, familiar de calidad.', 'Forjando el futuro con esfuerzo', 'Esfuerzo y dedicación', 'Estudiantes y asistentes somos la gran misión...'] }
];

const KARAOKE_ESTRUCTURA = [
  { id: 'k1', title: 'Intro Rapa Nui', lines: ['Hoe tatou ite vaka!!! …Huiiii', 'Aroto i te hetu´u, a au i oho mai ai', 'E koro ko reka ana au i tooku oho ki hiva'] },
  { id: 'k2', title: 'Verso 1', lines: ['Voy navegando, navegando', 'Voy navegando muy feliz', 'Llevo en mi bote muchas frutas', 'Y todo lo que aprendí…'] },
  { id: 'k3', title: 'Verso 2', lines: ['Dejé mi tierra y a mis hermanos', 'Por conocer más de mi país', 'No soy del norte ni del sur', 'Porque yo soy de Rapa Nui'] },
  { id: 'k4', title: 'Puente', lines: ['Tahi rua, toru, ha', 'EEEEE A HE HOI´ EEEE'] },
  { id: 'k5', title: 'Rapa Nui 2', lines: ['A roto ite hetu´u, a au i oho mai ai', 'E koro ko reka ana tooku oho ki hiva eeeeee'] },
  { id: 'k6', title: 'Verso 3', lines: ['Por las estrellas me voy guiando como lo hizo mi abuelo ayer', 'Me prometí venir un día y al conti a conocer…'] },
  { id: 'k7', title: 'Verso 4', lines: ['El sol muy fuerte está quemando y yo no paro de remar', 'Mi corazón está saltando, pero en mi alma fuerza y mas…'] },
  { id: 'k8', title: 'Climax', lines: ['Ya muchas noches han pasado y el cielo estrellado está', 'Veo unas luces a lo lejos… Al continente al fin llegué'] }
];

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

const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);
const normalize = (str) => (!str ? "" : str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[¡!¿?.,;:"']/g, "").trim().toUpperCase());

// ==========================================
// VISTAS NAVEGACIÓN
// ==========================================
const CourseSelector = ({ onSelect }) => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans">
    <div className="bg-slate-800 p-12 rounded-[3rem] border-2 border-slate-700 shadow-2xl max-w-4xl w-full text-center text-white">
      <div className="bg-red-600/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner text-red-500"><School size={40} /></div>
      <h2 className="text-3xl sm:text-5xl font-black mb-10 uppercase italic tracking-tighter">CCG-INTERACTIVO</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        {CURSOS.map(curso => (
          <button key={curso} onClick={() => onSelect(curso)} className="bg-slate-700 hover:bg-red-600 text-white py-5 px-8 rounded-2xl transition-all border-b-4 border-slate-900 flex items-center justify-between group">
            <span className="text-xl italic font-black">{curso}</span>
            <ChevronRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        ))}
      </div>
    </div>
  </div>
);

const CategorySelector = ({ curso, onSelectCategory, onBack }) => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white font-sans text-center">
    <button onClick={onBack} className="mb-12 text-slate-500 hover:text-white flex items-center gap-2 font-black uppercase text-xs tracking-widest mx-auto transition-colors"><RotateCcw size={16}/> Volver</button>
    <h2 className="text-5xl font-black mb-4 italic uppercase tracking-tighter">{curso}</h2>
    <p className="text-red-500 font-black uppercase tracking-[0.5em] text-xs mb-16 italic underline decoration-red-600 underline-offset-8">Actividad</p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-6xl w-full text-slate-900 font-black">
      <button onClick={() => onSelectCategory('himno')} className="bg-white p-10 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border-b-12 border-slate-200"><div className="bg-red-100 p-6 rounded-full text-red-600 mb-6 mx-auto w-fit"><Music size={60} /></div><span className="text-3xl uppercase italic tracking-tighter">HIMNO</span></button>
      <button onClick={() => onSelectCategory('karaoke')} className="bg-white p-10 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border-b-12 border-slate-200"><div className="bg-green-100 p-6 rounded-full text-green-600 mb-6 mx-auto w-fit"><Mic size={60} /></div><span className="text-3xl uppercase italic tracking-tighter">KARAOKE</span></button>
      {curso === CURSO_CON_POLIRRITMIA && (<button onClick={() => onSelectCategory('polirritmia')} className="bg-slate-800 text-white p-10 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border-b-12 border-slate-950"><div className="bg-blue-600 p-6 rounded-full text-white mb-6 mx-auto w-fit"><LayoutGrid size={60} /></div><span className="text-3xl uppercase italic tracking-tighter">POLIRRITMIA</span></button>)}
    </div>
  </div>
);

const ModeSelector = ({ onSelect, onBack }) => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white font-sans text-center">
    <button onClick={onBack} className="mb-12 text-slate-500 hover:text-white flex items-center gap-2 font-black uppercase text-xs tracking-widest mx-auto transition-colors"><RotateCcw size={16}/> Cambiar Actividad</button>
    <h2 className="text-5xl font-black mb-16 italic uppercase tracking-tighter">Modo de Canto</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-4xl w-full text-slate-900 font-black">
      <button onClick={() => onSelect('completo')} className="bg-white p-12 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border-b-12 border-slate-200">
        <div className="bg-indigo-100 p-6 rounded-full text-indigo-600 mb-6 mx-auto w-fit"><ListMusic size={60} /></div>
        <span className="text-3xl uppercase italic tracking-tighter block mb-2">CANTO COMPLETO</span>
        <p className="text-xs font-bold text-slate-400 uppercase">Avance por evaluación</p>
      </button>
      <button onClick={() => onSelect('seccion')} className="bg-white p-12 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border-b-12 border-slate-200">
        <div className="bg-orange-100 p-6 rounded-full text-orange-600 mb-6 mx-auto w-fit"><FileText size={60} /></div>
        <span className="text-3xl uppercase italic tracking-tighter block mb-2">CANTA SECCIÓN</span>
        <p className="text-xs font-bold text-slate-400 uppercase">Estrofa al azar</p>
      </button>
    </div>
  </div>
);

// ==========================================
// VISTA: CONTROL REMOTO (PARA CELULAR)
// ==========================================
const RemoteControl = () => {
  const [appState, setAppState] = useState(null);
  const [currentWord, setCurrentWord] = useState("");
  const [status, setStatus] = useState("Conectado");

  useEffect(() => {
    onValue(ref(db, 'estado'), (snap) => setAppState(snap.val()));
  }, []);

  const sendAction = (action) => {
    setStatus("Enviando...");
    // Enviamos con un timestamp único para asegurar que el proyector detecte cada click como nuevo
    const messageId = Date.now();
    set(ref(db, 'remoto/mensaje'), { texto: action, timestamp: messageId })
      .then(() => { setStatus("OK ✓"); setCurrentWord(""); setTimeout(() => setStatus("Conectado"), 800); });
  };

  if (!appState) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-10 font-sans text-center"><Wifi size={40} className="mb-4 animate-pulse" /><p className="italic text-slate-500 font-black uppercase text-xs">Conectando...</p></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col items-center justify-center font-sans overflow-hidden">
      <div className="w-full max-w-md bg-slate-900 p-6 rounded-3xl border-2 border-slate-800 shadow-2xl relative text-center">
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div className="text-[10px] font-black text-green-400 bg-green-950 px-4 py-2 rounded-full flex items-center gap-2 animate-pulse"><Wifi size={12}/> {status}</div>
          <p className="text-[10px] font-black text-slate-500 uppercase">{appState?.cursoActual}</p>
        </div>

        <div className="space-y-8 animate-in fade-in">
          {appState.modoActual === 'karaoke' ? (
              <div className="space-y-6">
                  <p className="text-slate-500 font-black uppercase text-xs tracking-widest italic">Evaluación Karaoke</p>
                  <div className="grid grid-cols-1 gap-6">
                      <button onClick={() => sendAction("CORRECTO")} className="w-full bg-green-600 text-white py-16 rounded-5xl font-black text-4xl shadow-2xl border-b-20 border-green-800 active:scale-95 flex items-center justify-center gap-4"><ThumbsUp size={64} /> ¡BIEN!</button>
                      <button onClick={() => sendAction("ERROR")} className="w-full bg-red-600 text-white py-16 rounded-5xl font-black text-4xl shadow-2xl border-b-20 border-red-800 active:scale-95 flex items-center justify-center gap-4"><ThumbsDown size={64} /> ERROR</button>
                  </div>
              </div>
          ) : (
              <div className="space-y-8">
                  <p className="text-slate-500 font-black uppercase text-xs tracking-widest italic">Escribe la palabra</p>
                  <input type="text" value={currentWord} onChange={(e) => setCurrentWord(e.target.value)} className="w-full bg-slate-800 text-white text-5xl font-black p-8 rounded-3xl border-4 border-slate-700 outline-none uppercase text-center focus:border-red-500" placeholder="..." />
                  <button onClick={() => sendAction(currentWord)} className="w-full bg-red-600 text-white text-3xl font-black py-8 rounded-3xl border-b-12 border-red-900 active:scale-95 shadow-xl uppercase">ENVIAR</button>
              </div>
          )}
        </div>
        <div className="mt-8 pt-4 border-t border-slate-800 text-center text-[10px] text-slate-600 font-black uppercase italic tracking-widest">CONTROL REMOTO</div>
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
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const audioRef = useRef(null);
  const turnStartTime = useRef(Date.now());
  const lyricsContainerRef = useRef(null);

  // Auto-scroll basado en la sección activa (no en el tiempo)
  useEffect(() => {
      const activeElement = document.getElementById(`section-${activeSectionIdx}`);
      if (activeElement && lyricsContainerRef.current) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }, [activeSectionIdx]);

  const handleWordValidation = useCallback((input) => {
    if (!currentSectionData || gameState !== 'playing') return;
    
    let revealedOne = false;
    
    setCurrentSectionData(prev => {
        if (!prev) return prev;
        
        // Buscamos en la SECCIÓN ACTIVA
        const newSections = prev.sections.map((sec, sIdx) => {
            if (sIdx !== activeSectionIdx) return sec;

            let wordFoundInThisCall = false;
            return {
                ...sec,
                lines: sec.lines.map(line => line.map(w => {
                    if (!revealedOne && !wordFoundInThisCall && w.isHidden && !w.isRevealed) {
                        revealedOne = true;
                        wordFoundInThisCall = true;
                        let isCorrect = false;
                        if (input === "CORRECTO") isCorrect = true;
                        else if (input === "ERROR") isCorrect = false;
                        else isCorrect = normalize(w.text) === normalize(input);
                        return { ...w, isRevealed: true, status: isCorrect ? 'correct' : 'wrong' };
                    }
                    return w;
                }))
            };
        });

        // Verificamos si la SECCIÓN ACTIVA se completó
        const currentSec = newSections[activeSectionIdx];
        const allRevealed = currentSec.lines.every(line => line.every(w => !w.isHidden || w.isRevealed));
        
        if (allRevealed && activeSectionIdx < newSections.length - 1) {
            // Avanzamos recién cuando se termina la parte
            setActiveSectionIdx(prevIdx => prevIdx + 1);
        }

        return { ...prev, sections: newSections };
    });
  }, [currentSectionData, gameState, activeSectionIdx]);

  const startSpin = () => {
    const available = students.filter(s => !s.played);
    if (isSpinning || available.length === 0) return;
    
    setIsSpinning(true);
    setGameState('spinning');
    let count = 0;
    const maxTicks = 40;
    
    const interval = setInterval(() => {
        const studentIndex = count % available.length;
        setSelectedStudent(available[studentIndex]);
        if (count >= maxTicks) { 
            clearInterval(interval); 
            setGameState('announced'); 
            setIsSpinning(false);
        }
        count++;
    }, 70);
  };

  const startTurn = () => {
    turnStartTime.current = Date.now(); 
    remove(ref(db, 'remoto/mensaje'));
    setActiveSectionIdx(0);
    setIsAudioPlaying(false);

    const source = modo === 'himno' ? HIMNO_ESTRUCTURA : KARAOKE_ESTRUCTURA;
    let target = singingMode === 'completo' ? source : [shuffle(source)[0]];

    setCurrentSectionData({
        title: singingMode === 'completo' ? "CANTO COMPLETO" : target[0].title,
        sections: target.map(s => ({
            ...s,
            lines: s.lines.map(line => {
                const words = line.split(' ');
                const eligible = words.map((w, i) => (w.replace(/[¡!¿?.,;:"']/g, "").length >= 3 ? i : -1)).filter(i => i !== -1);
                const hideCount = Math.ceil(eligible.length * 0.5);
                const toHide = new Set(shuffle(eligible).slice(0, hideCount));
                return words.map((text, idx) => ({ text, isHidden: toHide.has(idx), isRevealed: false, status: null }));
            })
        }))
    });
    setGameState('playing');
  };

  const cerrarEscenario = () => {
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
      setIsAudioPlaying(false);
  };

  const savePoints = () => {
    const finalScore = (() => {
          let total = 0, correct = 0;
          currentSectionData?.sections.forEach(sec => sec.lines.forEach(l => l.forEach(w => { if (w.isHidden) { total++; if (w.status === 'correct') correct++; } })));
          return total > 0 ? Math.round((correct / total) * 100) : 100;
        })();

    const cursoPath = curso.replace(/ /g, "_").toLowerCase();
    const originalNombres = NOMBRES_ESTUDIANTES[curso];
    const studentIdx = originalNombres.indexOf(selectedStudent.name);
    if (studentIdx !== -1) {
        update(ref(db, `cursos/${cursoPath}/estudiantes/${studentIdx}`), { points: finalScore, played: true });
        const fecha = new Date().toISOString().slice(0, 10);
        set(ref(db, `cursos/${cursoPath}/historial/${fecha}/${studentIdx}`), { nombre: selectedStudent.name, points: finalScore, modo: `${modo}_${singingMode}`, timestamp: Date.now() });
    }
    setSessionPoints(finalScore);
    cerrarEscenario();
    setGameState('summary');
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
    const unsubMsg = onValue(ref(db, 'remoto/mensaje'), (snapshot) => {
      const data = snapshot.val();
      // Verificamos el timestamp para asegurar que no procesamos mensajes viejos al reconectar
      if (data && data.texto && data.timestamp > turnStartTime.current) {
        handleWordValidation(data.texto);
        // NO borramos el mensaje aquí para no interferir con la concurrencia, lo manejamos por timestamp
      }
    });
    return () => unsubMsg();
  }, [currentSectionData, gameState, handleWordValidation]);

  const isShowcase = isAudioPlaying && singingMode === 'completo';

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans text-slate-900">
      <audio ref={audioRef} src={modo === 'himno' ? "/himno.mp3" : "/Voy Navegando, Navegando.mp3"} onEnded={cerrarEscenario} />
      
      {/* CAPA ESCENARIO (AVANCE POR EVALUACIÓN) */}
      {isShowcase && (
          <div className="fixed inset-0 bg-slate-950 z-9999 flex flex-col text-center overflow-hidden animate-in fade-in duration-300">
              <button onClick={cerrarEscenario} className="absolute top-8 right-8 text-white/20 hover:text-white p-4 z-10001"><X size={64}/></button>
              <div ref={lyricsContainerRef} className="flex-1 overflow-y-auto scrollbar-hide py-[45vh]">
                  <div className="max-w-7xl mx-auto space-y-[45vh]">
                  {currentSectionData?.sections.map((sec, sIdx) => {
                      const active = sIdx === activeSectionIdx;
                      return (
                          <div key={sec.id} id={`section-${sIdx}`} className={`transition-all duration-1000 px-10 ${active ? 'scale-110 opacity-100' : 'opacity-5 blur-sm'}`}>
                              <p className="text-red-600 font-black uppercase tracking-widest text-xl mb-10">{sec.title}</p>
                              <div className="space-y-8 text-white">
                                  {sec.lines.map((line, lIdx) => (
                                      <p key={lIdx} className="text-4xl sm:text-[8vh] font-black flex flex-wrap gap-x-8 justify-center leading-tight tracking-tight text-white">
                                          {line.map((word, wIdx) => (
                                              <span key={wIdx} className={word.isHidden ? (word.isRevealed ? (word.status === 'correct' ? 'text-green-500' : 'text-red-500 opacity-50 line-through') : 'text-transparent border-b-[10px] border-white/20 min-w-[8rem]') : ''}>{word.text}</span>
                                          ))}
                                      </p>
                                  ))}
                              </div>
                          </div>
                      );
                  })}
                  </div>
              </div>
          </div>
      )}

      {/* NAVBAR */}
      <nav className="max-w-7xl mx-auto bg-white border-b-8 border-red-600 p-6 rounded-[3rem] flex flex-col sm:flex-row justify-between items-center shadow-2xl mb-12 gap-6 mt-6">
        <div className="flex items-center gap-6">
          <div className="bg-slate-900 p-4 rounded-3xl text-white shadow-xl">{modo === 'polirritmia' ? <Drum size={32}/> : (modo === 'himno' ? <Music size={32} /> : <Mic size={32}/>)}</div>
          <div><h1 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter leading-none">CCG-INTERACTIVO</h1><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic">{curso}</p></div>
        </div>
        <div className="flex items-center gap-4">
            <button onClick={onHome} className="bg-slate-100 p-4 rounded-full text-slate-600 hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center gap-2 px-6 font-black uppercase text-xs"><Home size={20}/> Inicio</button>
            <button onClick={onBack} className="bg-slate-100 p-4 rounded-full text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2 px-6 font-black uppercase text-xs"><ArrowLeft size={20}/> Atrás</button>
            <div className="w-0.5 h-8 bg-slate-200 mx-2"></div>
            <button onClick={() => window.location.reload()} className="bg-slate-50 p-4 rounded-full text-slate-300 hover:text-red-600 border border-slate-200 transition-all shadow-sm"><RotateCcw size={28}/></button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 order-1 text-slate-900">
          {gameState === 'lobby' && (
            <div className="bg-white rounded-[4rem] p-24 text-center shadow-2xl border flex flex-col items-center justify-center min-h-150 animate-in zoom-in">
              <div className="bg-red-50 p-12 rounded-full mb-12 text-red-600"><Star size={120} className="animate-pulse" fill="currentColor" /></div>
              <h2 className="text-5xl sm:text-7xl font-black mb-16 uppercase italic">¿Quién sigue?</h2>
              <button onClick={startSpin} className="bg-red-600 text-white text-3xl sm:text-6xl font-black px-16 py-10 rounded-[3rem] border-b-18 border-red-900 shadow-2xl active:scale-95 transition-all uppercase italic">GIRAR RULETA</button>
            </div>
          )}

          {gameState === 'spinning' && (
            <div className="bg-slate-900 rounded-[4rem] p-24 text-center flex flex-col items-center justify-center min-h-150 border-15 border-slate-800 shadow-2xl overflow-hidden">
              <h2 key={selectedStudent?.id} className="text-5xl sm:text-[8rem] font-black italic tracking-tighter animate-in fade-in zoom-in duration-75 uppercase truncate w-full px-10 text-white">{selectedStudent?.name}</h2>
            </div>
          )}

          {gameState === 'announced' && (
            <div className={`rounded-[4rem] p-20 text-center shadow-2xl flex flex-col items-center justify-center min-h-150 border-b-20 animate-in slide-in-from-bottom ${modo === 'himno' ? 'bg-red-600 border-red-900' : 'bg-green-600 border-green-900'}`}>
              <p className="text-2xl font-bold opacity-70 uppercase tracking-widest mb-16 italic text-white">Es el turno de:</p>
              <h2 className="text-6xl sm:text-[7rem] font-black mb-20 drop-shadow-2xl uppercase italic text-white">{selectedStudent?.name}</h2>
              <button onClick={startTurn} className="bg-white text-slate-900 px-16 py-10 rounded-3xl font-black text-5xl shadow-2xl hover:scale-105 transition-all italic uppercase">¡A JUGAR!</button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="space-y-12 animate-in fade-in">
              <div className={`p-10 rounded-[3.5rem] flex justify-between items-center border-b-8 shadow-2xl ${modo === 'himno' ? 'bg-slate-900 border-red-600' : 'bg-slate-900 border-green-600'}`}>
                <div className="flex items-center gap-10 text-white">
                    <div className={`${modo === 'himno' ? 'bg-red-600' : 'bg-green-600'} w-20 h-20 sm:w-32 sm:h-32 rounded-4xl flex items-center justify-center shadow-2xl text-white`}>{(modo === 'himno' ? <Music size={56} /> : <Mic size={56}/>)}</div>
                    <div><h3 className="text-3xl sm:text-6xl font-black uppercase italic truncate text-white">{selectedStudent?.name}</h3><span className="text-[10px] font-black uppercase opacity-60 tracking-widest text-white">Modo: {singingMode}</span></div>
                </div>
                {singingMode === 'completo' && (<button onClick={() => { if(audioRef.current) { audioRef.current.play(); setIsAudioPlaying(true); } }} className="bg-green-600 text-white p-8 rounded-full border-b-8 border-green-800 shadow-xl hover:scale-110 active:scale-95 transition-all"><PlayCircle size={48}/></button>)}
              </div>

              <div className="bg-white p-12 sm:p-20 rounded-[4rem] shadow-2xl border min-h-100 text-center">
                 <h4 className="font-black text-sm uppercase tracking-tighter flex items-center gap-4 animate-pulse justify-center text-red-600 mb-10 italic"><div className="w-3 h-3 rounded-full bg-red-600"></div> {currentSectionData?.title}</h4>
                 <div className="space-y-10">
                 {currentSectionData?.sections.map((sec, sIdx) => (
                    <div key={sec.id} id={`section-${sIdx}`} className={`space-y-8 transition-all duration-500 ${sIdx === activeSectionIdx ? 'scale-100 opacity-100' : 'scale-90 opacity-20 blur-[1px]'}`}>
                        {sec.lines.map((line, lIdx) => (
                            <p key={lIdx} className="text-2xl sm:text-4xl font-black flex flex-wrap gap-x-6 justify-center leading-tight">
                                {line.map((word, wIdx) => (<span key={wIdx} className={word.isHidden ? (word.isRevealed ? (word.status === 'correct' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50 line-through opacity-50') : 'bg-slate-100 text-transparent border-b-4 border-slate-200 min-w-20') : 'text-slate-800'}>{word.text}</span>))}
                            </p>
                        ))}
                    </div>
                 ))}
                 </div>
              </div>

              <button onClick={savePoints} className={`w-full py-10 rounded-[3rem] font-black text-3xl sm:text-5xl border-b-15 shadow-2xl transition-all italic uppercase text-white ${modo === 'himno' ? 'bg-red-600 border-red-900' : 'bg-green-600 border-green-900'}`}>Finalizar Turno</button>
            </div>
          )}

          {gameState === 'summary' && (
            <div className="bg-white rounded-[5rem] p-16 sm:p-24 text-center shadow-2xl min-h-150 border border-slate-100 animate-in zoom-in">
              <Award size={150} className="text-yellow-500 mb-12 mx-auto animate-bounce" />
              <h2 className="text-5xl sm:text-[6rem] font-black mb-12 uppercase italic leading-none">{selectedStudent?.name}</h2>
              <div className="bg-red-600 text-white px-20 py-10 rounded-[4rem] text-7xl sm:text-[10rem] font-mono font-black mb-16 shadow-2xl leading-none">{sessionPoints}</div>
              <button onClick={() => { setGameState('lobby'); setSelectedStudent(null); }} className="bg-slate-900 text-white px-20 py-10 rounded-2xl font-black text-3xl sm:text-4xl italic uppercase shadow-xl hover:scale-110 transition-transform">Siguiente</button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 order-2 text-slate-900">
          <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden lg:sticky lg:top-10">
            <div className="p-8 bg-slate-900 flex justify-between items-center border-b-8 border-red-600"><h3 className="font-black uppercase text-xl italic flex items-center gap-4 text-white"><Trophy className="text-yellow-400" size={32}/> RANKING</h3></div>
            <div className="max-h-125 lg:max-h-175 overflow-y-auto scrollbar-hide">
              {students.sort((a,b) => (b.points || 0) - (a.points || 0) || a.id - b.id).map((s, idx) => (
                <div key={s.id} className={`px-10 py-6 border-b flex items-center justify-between transition-all ${s.id === selectedStudent?.id ? 'bg-red-50 scale-105 z-10 shadow-xl' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-6">
                    <span className={`text-2xl font-black w-10 ${idx < 3 ? 'text-red-600 text-4xl' : 'text-slate-100'}`}>{idx + 1}</span>
                    <div className="flex flex-col"><span className="font-black uppercase text-lg truncate w-32 leading-none mb-1 italic">{s.name}</span><span className={`text-[9px] font-black tracking-widest ${s.played ? 'text-green-500' : 'text-slate-400'}`}>{s.played ? 'PARTICIPÓ ✓' : 'PENDIENTE'}</span></div>
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

const App = () => {
  const [role] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("control") === "celular" ? "controller" : "display";
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);

  if (role === "controller") return <RemoteControl />;
  if (!selectedCourse) return <CourseSelector onSelect={setSelectedCourse} />;
  if (!selectedCategory) return <CategorySelector curso={selectedCourse} onSelectCategory={setSelectedCategory} onBack={() => setSelectedCourse(null)} />;
  if ((selectedCategory === 'himno' || selectedCategory === 'karaoke') && !selectedMode) return <ModeSelector onSelect={setSelectedMode} onBack={() => setSelectedCategory(null)} />;
  
  return (
    <MainDisplay 
        curso={selectedCourse} 
        modo={selectedCategory} 
        singingMode={selectedMode} 
        onBack={() => setSelectedMode(null)}
        onHome={() => { setSelectedCourse(null); setSelectedCategory(null); setSelectedMode(null); }}
    />
  );
};

export default App;