import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update } from "firebase/database";
import { 
  Music, Star, Trophy, Play, RotateCcw, ArrowRight, 
  FastForward, Award, UserMinus, Wifi, Send, Smartphone, 
  CheckCircle, ChevronRight, School
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
// 2. BASE DE DATOS DE ESTUDIANTES (LIMPIA)
// ==========================================
const NOMBRES_ESTUDIANTES = {
  "1° Básico": ["Mateo Alfaro", "Emilia Álvarez", "Lorenzo Alvez", "Agustín Araya", "Santiago Arévalo", "Emilia Ayala", "Colomba Berríos", "Martín Campos", "Luciana Castro", "Emma Cifuentes", "Luciana Cortés", "Mía Cumares", "Tomás De La Barrera", "Bruno Del Villar", "Eydan Durán", "Isidora Flores", "Sofía Gallardo", "Isabella Gonzalez", "Trinidad González", "Amaro Herrera", "Evan Jiménez", "Agustina Lara", "Emilio Lemus", "Thomas León", "Josefa Leyton", "Martín Mancilla", "Isidora Mancilla", "Isidora Mariñan", "Antonella Martinez", "Matilda Matus", "Anaís Mena", "José Montenegro", "Rafaela Morales", "Antonia Muñoz", "Emma Nuñez", "Antonella Núñez", "Ignacio Olivares", "Guillermo Rojas", "Rudy Rojas", "Fabian Rojas", "Lucas Salinas", "Catalina Sánchez", "Bastián Silva", "Rocío Sosa", "Tomás Urbina", "Vicente Vergara", "Alonso Villaroel", "Santiago Yesca"],
  "2° Básico": ["Trinidad Aguilar", "Amalia Álvarez", "Agustina Carrasco", "Florencia Cisterna", "Daniel Cornejo", "Tryana Cortés", "Charlotte Cortez", "Benoit Delobel", "Leonore Delobel", "Gabriel Encina", "Pascal Espinoza", "Julián Fernández", "Pascuala Fernández", "Amaro Figueroa", "Facundo Figueroa", "Matteo Garcia", "Gabriel González", "Julieta Gutiérrez", "Denisse Herrera", "Mayte Isla", "Amanda Jorquera", "Pedro Leiva", "Bruno Lobos", "Santiago López", "Antonia Martínez", "Monserrat Mundaca", "Agustín Muñoz", "Alejandro Núñez", "Lucas Osorio", "Martín Paéz", "Javiera Pérez", "Felipe Pérez", "Emilio Pulgar", "Gaspar Rojas", "José Rojo", "Amanda Tapia", "Arleth Tapia", "Lorenzo Vélez", "Herman Vicencio", "Angel Villegas", "Colomba Yáñez", "Emma Yubano", "Agusthín Aguilar"],
  "3° Básico": ["Carlos Aceituno", "Santiago Aguilera", "Fernando Cabrera", "Gabriel Cabrera", "Maximiliano Calderón", "Javiera Castillo", "Lucas Cortes", "Julián Farias", "Rodrigo Figueroa", "Matilda González", "Antonella González", "Dylan Guerra", "Diana Isamat", "Isidora Jara", "Joaquina Jélvez", "Renata Lemus", "Sarai Levet", "Santiago López", "Abigail Manríquez", "Alexandra Meza", "Simone Ortega", "Renato Ortiz", "Antonia Pandolfa", "Agustín Paredes", "Vicente Pereira", "Constanza Pereira", "Rafaella Ramírez", "Xiomara Ramos", "Vicente Reyes", "Renata Robledo", "Carlo Rojas", "Maite Segovia", "Emma Silva", "Julián Sosa", "Valentina Toro", "Dominique Torrejón", "Amaro Ulloa", "Bastián Valencia", "Maite Vásquez", "Lucas Vélez", "Eluney Villanueva"],
  "4° Básico": ["Emiliano Ahumada", "Gabriel Arancibia", "Vicente Araya", "Emiliano Ardiles", "Antonella Arévalo", "Simona Britez", "Emilia Cáceres", "Gael Caniupán", "Mia Carrasco", "Vicente Carrasco", "Mateo Céspedes", "José Tomás Contreras", "Javier Contreras", "Catalina Correa", "Beatriz Estay", "Tomás Farías", "Josefa Garay", "Matías Inostroza", "Elian Inostroza", "Antonio Lorca", "Giovanni Madariaga", "Agustín Marín", "Aynhara Matus", "Renata Medina", "Rafaela Miranda", "Máximo Moir", "Gabriel Morales", "Laura Mura", "Emilia Núñez", "Dominique Paredes", "Gaspar Pizarro", "Tomás Ramos", "Mateo Rivera", "Bastián Rodríguez", "Julián Rodríguez", "Arlette Salinas", "Valentina Salinas", "Bastián Sazo", "Mía Soto", "Rafaella Torrejón", "Diego Vega", "Gonzalo Villanueva", "Branko Mura"],
  "5° Básico": ["Maximiliano Bravo", "Gustavo Bustos", "Maximiliano Campos", "Florencia Cifuentes", "Juan Cortés", "Simón Delgado", "Catalina Fuentes", "Mateo Fuentes", "Celeste González", "Cristobal Hernández", "Duvan Herrera", "Marco Mancilla", "Isabella Manríquez", "Katerine Martinez", "Pascale Meyer", "Maximiliano Morán", "Tomás Moyano", "Josefa Muñoz", "Mateo Muñoz", "Amparo Muñoz", "Ignacio Mura", "Amaro Navea", "Lucas Núñez", "Liz Otárola", "Raúl Páez", "Lucas Pavez", "Agustín Puga", "Laura Ramírez", "Facundo Rojas", "Pedro Rolack", "Verónica Silva", "Emilia Tapia", "Isabella Torres", "Matheo Vargas", "Trinidad Vásquez", "Martina Vega", "Josué Vera", "Simón Villarroel", "Rafael Zúñiga", "Mateo Cornejo", "Maite Villarroel", "Isidora Zamora", "Sergio Oyanedel"],
  "6° Básico": ["Salvador Allende", "Máximo Araya", "Enzo Arias", "Juan Avallay", "Vicente Azócar", "Leandro Berríos", "Domingo Bruna", "Rafaela Cádiz", "Fernanda Carrasco", "Benjamín Carrasco", "Matilde Carter", "Imee Cruz", "Luciano Díaz", "Dante Flores", "Rafaela Fredes", "Pascal Fuentes", "Anaís Gallegos", "Gastón Garay", "Alicia Guerra", "Nelson Herrera", "Maximiliano Ibacache", "Julieta Jélvez", "Renato Lazcano", "Tomás Maldonado", "Pablo Molina", "Lucas Moncada", "Belén Monsalves", "Amalia Oróstica", "Myrna Pérez", "Camilo Ramírez", "Amaro Rojas", "Angel Rojas", "Simona Saravia", "Benjamín Tapia", "Juan Torrejón", "Nara Urtubia", "Josefa Valdés", "Agustina Vargas", "Catalina Vega", "Luciano Vélez", "Luciano Vergara", "Agustín Videla", "Polett Zamora", "Mathias Monges"],
  "7° Básico": ["Jaime Abarca", "Vicente Acevedo", "Franco Avendaño", "RocÍo Ayala", "Facundo Barra", "Máximo Bugueño", "Charlotte Campos", "Isabella Contreras", "Ricardo Donoso", "Ian Flores", "Mayte Gallardo", "Fernanda Huenchulao", "Francisca Infante", "Luciano Iturra", "Patricio Jara", "Gabriel Jara", "Julieta León", "Laura Lobos", "Salma Marcarian", "Amelia Méndez", "Magdalena Miranda", "Rodrigo Montenegro", "Martín Moyano", "Renata Pinto", "Josué Quinchavil", "Julián Ramírez", "Matilda Robledo", "Leonor Rojas", "Simón Rojas", "Lucas Salazar", "Alexandra Salgado", "Valentín Santibáñez", "Cristian Silva", "Emiliano Silva", "Emilia Solís", "Agustín Tello", "Isidora Vásquez", "Antonella Velázquez", "Fernando Videla", "Francisco Videla", "Antonia Villarroel", "Agustina Villegas", "Ronaldo Yáñez"],
  "8° Básico": ["Belén Albornoz", "Emilia Arias", "Emilia Ayala", "Renata Caballero", "Rafael Cabrera", "Isidora Carvajal", "Santiago Cocio", "Cristóbal Contreras", "Julieta Donoso", "Cristóbal Estay", "Johán Figueroa", "Benjamín Fredes", "Isidora Galdámez", "Nahuel Gamboa", "Julieta García", "Monserrat González", "Martín Guzmán", "Dominique Herrera", "Trinidad Higueras", "Benjamín López", "Arturo López", "Fernando Martínez", "Tomas Méndez", "Rafaela Miranda", "Tomás Morales", "Rafaela Muñoz", "Valentina Nuñez", "Paolo Núñez", "Renato Orellana", "Joaquín Pandolfa", "Catalina Papagallo", "Lucas Paredes", "Nicolás Pereira", "Jesús Pinto", "Antonia Reyes", "Ariel Salinas", "Pascal Saravia", "Joaquín Trigo", "Emilia Urbina", "Noelia Varas", "Johann Anabalón"]
};

const CURSOS = Object.keys(NOMBRES_ESTUDIANTES);

const HIMNO_ESTRUCTURA = [
  { id: 'e1', title: 'Estrofa 1', lines: ['En aulas de saber y estrategias a crear', 'Estudiantes que florecen listos para avanzar', 'Calidad en cada paso siempre con pasión', 'Con docentes que inspiran guiando el corazón.'] },
  { id: 'c1', title: 'Coro', lines: ['Colegio Claudio Gay...', 'Unidos en verdad', 'Con educación cercana, familiar de calidad.', 'Forjando el futuro con esfuerzo', 'Esfuerzo y dedicación', 'Estudiantes y asistentes somos la gran misión...'] },
  { id: 'e2', title: 'Estrofa 2', lines: ['Aquí la educación es un lazo sin igual', 'La familia y el saber son nuestro ideal', 'Estrategias que nos llevan a grandes triunfos hoy', 'Formamos el mañana con confianza y con amor.'] },
  { id: 'c2', title: 'Coro 2', lines: ['Colegio Claudio Gay...', 'Ejemplo de unidad', 'Crecemos juntos siempre con toda dignidad.'] },
  { id: 'final', title: 'Final', lines: ['Educación, calidad...', 'Futuro y vocación', 'Claudio Gay', '¡Siempre en nuestro corazón!'] }
];

const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

const normalize = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[¡!¿?.,;:"']/g, "").trim().toUpperCase();
};

// ==========================================
// VISTA: SELECTOR DE CURSO CON REPRODUCTOR
// ==========================================
const CourseSelector = ({ onSelect }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.log("Audio play failed", e));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <audio ref={audioRef} src="/himno.mp3" onEnded={() => setIsPlaying(false)} />
      
      <div className="bg-slate-800 p-6 sm:p-12 rounded-[2rem] sm:rounded-[4rem] border-2 border-slate-700 shadow-2xl max-w-3xl w-full text-center relative overflow-hidden">
        
        {/* BOTÓN FLOTANTE DE AUDIO */}
        <button 
          onClick={toggleAudio}
          className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-3 sm:p-4 rounded-full transition-all border-b-4 ${isPlaying ? 'bg-red-600 border-red-800 text-white animate-pulse' : 'bg-slate-700 border-slate-900 text-slate-400'}`}
        >
          {isPlaying ? <Music size={20} /> : <RotateCcw size={20} />}
          <span className="block text-[7px] font-black mt-1 uppercase">{isPlaying ? 'Sonando' : 'Himno'}</span>
        </button>

        <div className="bg-red-600/10 w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-inner">
          <School className="text-red-500" size={32} />
        </div>
        
        <h2 className="text-2xl sm:text-5xl font-black text-white mb-2 sm:mb-4 uppercase tracking-tighter italic">Dale Play CCG</h2>
        <p className="text-slate-400 mb-6 sm:mb-12 font-bold uppercase tracking-widest text-[9px] sm:text-sm">Configuración y Cursos</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left">
          {CURSOS.map(curso => (
            <button 
              key={curso} 
              onClick={() => {
                if(audioRef.current) audioRef.current.pause();
                onSelect(curso);
              }} 
              className="bg-slate-700 hover:bg-red-600 text-white font-black py-4 sm:py-5 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all border-b-4 sm:border-b-8 border-slate-900 hover:border-red-800 flex items-center justify-between group"
            >
              <span className="text-sm sm:text-xl italic">{curso}</span>
              <ChevronRight className="group-hover:translate-x-2 transition-transform" size={18} />
            </button>
          ))}
        </div>
      </div>
      <p className="mt-8 text-slate-600 font-black uppercase text-[10px] tracking-[0.4em]">Desarrollado por MN Resources • 2026</p>
    </div>
  );
};

// ==========================================
// VISTA: CONTROL REMOTO (CELULAR)
// ==========================================
const RemoteControl = () => {
  const [currentWord, setCurrentWord] = useState("");
  const [status, setStatus] = useState("Conectado");
  const sendWord = () => {
    if (currentWord.trim() === "") return;
    setStatus("Enviando...");
    set(ref(db, 'remoto/palabraEnviada'), { texto: currentWord.trim(), timestamp: Date.now() })
      .then(() => { setStatus("Enviado ✓"); setCurrentWord(""); setTimeout(() => setStatus("Conectado"), 1000); });
  };
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md bg-slate-900 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] border-2 border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center mb-8 sm:mb-10 border-b border-slate-800 pb-6 sm:pb-8">
          <Smartphone className="text-red-500" size={32} />
          <div className="text-[10px] font-black text-green-400 bg-green-950 px-4 py-1.5 rounded-full flex items-center gap-2">
            <Wifi size={12} className="animate-pulse" /> {status}
          </div>
        </div>
        <input 
          type="text" 
          value={currentWord} 
          onChange={(e) => setCurrentWord(e.target.value)} 
          className="w-full bg-slate-800 text-white text-2xl sm:text-4xl font-black p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] mb-6 sm:mb-10 border-4 border-slate-700 outline-none uppercase text-center focus:border-red-500" 
          placeholder="ESCRIBE AQUÍ" 
        />
        <button 
          onClick={sendWord} 
          className="w-full bg-red-600 text-white text-2xl sm:text-3xl font-black py-6 sm:py-8 rounded-2xl sm:rounded-[2rem] border-b-8 sm:border-b-[12px] border-red-900 active:translate-y-2 active:border-b-0 transition-all shadow-xl"
        >
          ENVIAR PALABRA
        </button>
      </div>
    </div>
  );
};

// ==========================================
// VISTA: PANTALLA PRINCIPAL
// ==========================================
const MainDisplay = ({ curso }) => {
  const [students, setStudents] = useState([]);
  const [gameState, setGameState] = useState('lobby'); 
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentSectionData, setCurrentSectionData] = useState(null);
  const [sessionPoints, setSessionPoints] = useState(0);
  const lastProcessedTime = useRef(0);

  // Solución al error de split si curso es nulo
  const cursoNombreCorto = (curso || "CURSO").split(" ")[0];

  useEffect(() => {
    if (!curso) return;
    const cursoPath = curso.replace(/ /g, "_").toLowerCase();
    const studentsRef = ref(db, `cursos/${cursoPath}/estudiantes`);
    return onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStudents(Object.values(data));
      } else {
        const nombres = NOMBRES_ESTUDIANTES[curso] || [];
        const initial = nombres.map((nombre, i) => ({ id: i + 1, name: nombre, points: 0, played: false }));
        set(studentsRef, initial);
      }
    });
  }, [curso]);

  useEffect(() => {
    const wordRef = ref(db, 'remoto/palabraEnviada');
    return onValue(wordRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.timestamp > lastProcessedTime.current) {
        lastProcessedTime.current = data.timestamp;
        validarPalabraRemota(data.texto);
      }
    });
  }, [currentSectionData, gameState]);

  const validarPalabraRemota = (word) => {
    if (!currentSectionData || gameState !== 'playing') return;
    let target = null;
    currentSectionData.lines.forEach(l => l.forEach(w => { if (!target && w.isHidden && !w.isRevealed) target = w; }));
    if (target) handleWordValidation(normalize(target.text) === normalize(word));
  };

  const handleWordValidation = (isCorrect) => {
    let found = false;
    const newLines = currentSectionData.lines.map(line => line.map(w => {
      if (!found && w.isHidden && !w.isRevealed) {
        found = true;
        if (isCorrect) setSessionPoints(p => p + 10);
        return { ...w, isRevealed: true, status: isCorrect ? 'correct' : 'wrong' };
      }
      return w;
    }));
    setCurrentSectionData({ ...currentSectionData, lines: newLines });
  };

  const maskSection = (section) => ({
    ...section,
    lines: section.lines.map(line => {
      const words = line.split(' ');
      const indices = new Set();
      const targetCount = Math.min(words.length - 1, Math.floor(Math.random() * 2) + 1);
      while(indices.size < targetCount) {
        const randIdx = Math.floor(Math.random() * words.length);
        if (words[randIdx].length > 3 || Math.random() > 0.6) indices.add(randIdx);
      }
      return words.map((text, idx) => ({ text, isHidden: indices.has(idx), isRevealed: false, status: null }));
    })
  });

  const startSpin = () => {
    const available = students.filter(s => !s.played);
    if (available.length === 0) return;
    setGameState('spinning');
    let count = 0;
    const interval = setInterval(() => {
      setSelectedStudent(available[Math.floor(Math.random() * available.length)]);
      if (count++ >= 35) { clearInterval(interval); setGameState('announced'); }
    }, 60);
  };

  const savePoints = () => {
    const cursoPath = curso.replace(/ /g, "_").toLowerCase();
    const studentIdx = students.findIndex(s => s.id === selectedStudent.id);
    const updates = {};
    updates[`cursos/${cursoPath}/estudiantes/${studentIdx}/points`] = (students[studentIdx].points || 0) + sessionPoints;
    updates[`cursos/${cursoPath}/estudiantes/${studentIdx}/played`] = true;
    update(ref(db), updates);
    setGameState('summary');
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans p-3 sm:p-4 md:p-8 overflow-x-hidden">
      <nav className="max-w-7xl mx-auto bg-white border-b-4 sm:border-b-8 border-red-600 p-4 sm:p-8 rounded-2xl sm:rounded-[3rem] flex flex-col sm:flex-row justify-between items-center shadow-xl mb-6 sm:mb-12 gap-4">
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-center sm:justify-start">
          <div className="bg-slate-900 p-3 sm:p-4 rounded-xl sm:rounded-3xl text-white shadow-xl">
            <Music size={24} />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-4xl font-black uppercase tracking-tighter leading-none">Dale Play <span className="text-red-600">CCG</span></h1>
            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1 italic">{curso}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100 hidden sm:flex items-center gap-2">
            <Wifi size={14} /> EN LÍNEA
          </div>
          <button onClick={() => window.location.reload()} className="bg-slate-50 p-2 sm:p-4 rounded-full text-slate-300 hover:text-red-600 border border-slate-200 transition-colors">
            <RotateCcw size={20}/>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
        <div className="lg:col-span-8 order-1">
          {gameState === 'lobby' && (
            <div className="bg-white rounded-[2rem] sm:rounded-[5rem] p-8 sm:p-20 text-center shadow-2xl border flex flex-col items-center justify-center min-h-[400px] sm:min-h-[600px] animate-in zoom-in duration-500">
              <Star size={60} className="text-red-600 mb-6 sm:mb-12 animate-pulse" fill="currentColor" />
              <button onClick={startSpin} className="bg-red-600 text-white text-2xl sm:text-5xl font-black px-10 sm:px-24 py-6 sm:py-10 rounded-2xl sm:rounded-[3rem] border-b-8 sm:border-b-[15px] border-red-900 shadow-2xl active:scale-95 transition-transform">
                ¡GIRAR!
              </button>
            </div>
          )}

          {gameState === 'spinning' && (
            <div className="bg-slate-900 rounded-[2rem] sm:rounded-[5rem] p-8 sm:p-20 text-center flex flex-col items-center justify-center min-h-[400px] sm:min-h-[600px] border-8 sm:border-[15px] border-slate-800 shadow-2xl overflow-hidden">
              <h2 key={selectedStudent?.id} className="text-3xl sm:text-8xl font-black text-white italic tracking-tighter animate-in fade-in zoom-in duration-75 truncate w-full px-4 sm:px-10 uppercase">
                {selectedStudent?.name}
              </h2>
            </div>
          )}

          {gameState === 'announced' && (
            <div className="bg-red-600 rounded-[2rem] sm:rounded-[5rem] p-8 sm:p-20 text-center text-white shadow-2xl flex flex-col items-center justify-center min-h-[400px] sm:min-h-[600px] border-b-[10px] sm:border-b-[20px] border-red-900 animate-in slide-in-from-bottom">
              <p className="text-lg sm:text-3xl font-bold opacity-70 uppercase tracking-[0.4em] mb-8 sm:mb-12 italic">Pasa al frente:</p>
              <h2 className="text-3xl sm:text-7xl font-black mb-12 sm:mb-20 drop-shadow-2xl uppercase">{selectedStudent?.name}</h2>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 w-full max-w-3xl">
                <button onClick={() => setGameState('lobby')} className="w-full sm:flex-1 bg-red-800/50 text-white px-6 py-4 sm:py-6 rounded-2xl font-black text-lg sm:text-2xl border-2 sm:border-4 border-red-400 flex items-center justify-center gap-3 active:scale-95 transition-transform">
                  <UserMinus size={20}/> AUSENTE
                </button>
                <button onClick={() => { setGameState('playing'); setSessionPoints(0); setCurrentSectionData(maskSection(shuffle(HIMNO_ESTRUCTURA)[0])); }} className="w-full sm:flex-2 bg-white text-red-600 px-6 py-4 sm:py-8 rounded-2xl font-black text-xl sm:text-4xl shadow-2xl active:scale-95 transition-transform">
                  ¡A CANTAR!
                </button>
              </div>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500">
              <div className="bg-slate-900 text-white p-6 sm:p-10 rounded-2xl sm:rounded-[3.5rem] flex justify-between items-center border-b-4 sm:border-b-8 border-red-600 shadow-2xl">
                <div className="flex items-center gap-4 sm:gap-8">
                  <div className="bg-red-600 w-12 h-12 sm:w-24 sm:h-24 rounded-xl sm:rounded-3xl flex items-center justify-center font-black text-2xl sm:text-5xl shadow-2xl">🎙️</div>
                  <h3 className="text-base sm:text-4xl font-black uppercase italic truncate max-w-[120px] sm:max-w-none">{selectedStudent?.name}</h3>
                </div>
                <div className="bg-white/5 p-4 sm:p-8 rounded-xl sm:rounded-[2.5rem] text-center min-w-[70px] sm:min-w-[150px]">
                  <span className="text-2xl sm:text-7xl font-mono font-black text-yellow-400 leading-none">{sessionPoints}</span>
                  <span className="block text-[7px] sm:text-xs font-black text-slate-500 uppercase mt-1">PTS</span>
                </div>
              </div>

              <div className="bg-white p-6 sm:p-20 rounded-[2rem] sm:rounded-[5rem] shadow-2xl min-h-[300px] sm:min-h-[450px] flex flex-col justify-center border relative overflow-hidden">
                <div className="absolute top-4 sm:top-10 left-6 sm:left-16">
                  <h4 className="text-red-600 font-black text-[9px] sm:text-sm uppercase tracking-[0.4em] sm:tracking-[0.8em] flex items-center gap-2 sm:gap-4">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div> {currentSectionData?.title}
                  </h4>
                </div>
                <div className="space-y-4 sm:space-y-10 mt-10 sm:mt-12">
                  {currentSectionData?.lines.map((line, lIdx) => (
                    <p key={lIdx} className="text-lg sm:text-4xl md:text-5xl lg:text-6xl font-black flex flex-wrap gap-x-2 sm:gap-x-8 leading-tight">
                      {line.map((word, wIdx) => (
                        <span key={wIdx} className={`rounded-lg sm:rounded-3xl px-1.5 sm:px-3 py-0.5 sm:py-1 transition-all duration-500 ${word.isHidden ? (word.isRevealed ? (word.status === 'correct' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50 line-through opacity-50') : 'bg-slate-200 text-transparent min-w-[3rem] sm:min-w-[10rem] border-b-4 sm:border-b-[10px] border-slate-300 mb-1 sm:mb-2') : 'text-slate-800'}`}>
                          {word.text}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              </div>

              {currentSectionData?.lines.every(l => l.every(w => !w.isHidden || w.isRevealed)) && (
                <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-8 animate-in slide-in-from-bottom">
                  <button onClick={() => setCurrentSectionData(maskSection(shuffle(HIMNO_ESTRUCTURA)[0]))} className="bg-slate-800 text-white py-5 sm:py-10 rounded-2xl sm:rounded-[3rem] font-black text-lg sm:text-4xl border-b-4 sm:border-b-[12px] border-slate-700 active:scale-95 transition-transform">OTRA SECCIÓN</button>
                  <button onClick={savePoints} className="bg-red-600 text-white py-5 sm:py-10 rounded-2xl sm:rounded-[3rem] font-black text-lg sm:text-4xl border-b-4 sm:border-b-[12px] border-red-800 shadow-2xl active:scale-95 transition-transform">TERMINAR TURNO</button>
                </div>
              )}
            </div>
          )}

          {gameState === 'summary' && (
            <div className="bg-white rounded-[2rem] sm:rounded-[5rem] p-10 sm:p-24 text-center shadow-2xl min-h-[400px] sm:min-h-[600px] animate-in zoom-in">
              <Award size={80} className="text-yellow-500 mb-8 sm:mb-12 mx-auto" />
              <h2 className="text-3xl sm:text-7xl font-black text-slate-900 mb-8 sm:mb-12 uppercase italic">{selectedStudent?.name}</h2>
              <div className="bg-red-600 text-white px-10 sm:px-24 py-6 sm:py-12 rounded-[2rem] sm:rounded-[4rem] text-6xl sm:text-[10rem] font-mono font-black mb-10 sm:mb-16 shadow-2xl leading-none">
                {sessionPoints}
              </div>
              <button onClick={() => setGameState('lobby')} className="w-full sm:w-auto bg-slate-900 text-white px-10 sm:px-24 py-5 sm:py-10 rounded-2xl sm:rounded-[2.5rem] font-black text-xl sm:text-4xl active:scale-95 transition-transform">SIGUIENTE</button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 order-2">
          <div className="bg-white rounded-[2rem] sm:rounded-[4rem] shadow-2xl border overflow-hidden lg:sticky lg:top-32">
            <div className="p-6 sm:p-10 bg-slate-900 text-white flex justify-between items-center border-b-4 sm:border-b-8 border-red-600">
              <h3 className="font-black uppercase tracking-tighter text-base sm:text-2xl italic flex items-center gap-3">
                <Trophy className="text-yellow-400" size={20} /> RANKING
              </h3>
              <span className="text-[10px] font-bold opacity-50 uppercase">{cursoNombreCorto}</span>
            </div>
            <div className="max-h-[400px] lg:max-h-[700px] overflow-y-auto bg-white">
              {students.length > 0 ? (
                students.sort((a,b) => (b.points || 0) - (a.points || 0) || a.id - b.id).map((s, idx) => (
                  <div key={s.id} className={`px-6 sm:px-10 py-4 sm:py-8 border-b flex items-center justify-between ${s.id === selectedStudent?.id ? 'bg-red-50' : 'hover:bg-slate-50'} transition-colors`}>
                    <div className="flex items-center gap-4 sm:gap-8">
                      <span className={`text-sm sm:text-2xl font-black w-6 sm:w-10 ${idx < 3 ? 'text-red-600 sm:text-4xl' : 'text-slate-200'}`}>
                        {idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 uppercase text-[10px] sm:text-xl truncate w-32 sm:w-44 leading-tight">{s.name}</span>
                        <span className="text-[7px] sm:text-[10px] text-slate-400 font-black tracking-widest">{s.played ? 'PARTICIPÓ' : 'PENDIENTE'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-sm sm:text-3xl text-slate-800">{s.points || 0}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center text-slate-300 font-bold uppercase text-xs">Cargando Estudiantes...</div>
              )}
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRole(params.get("control") === "celular" ? "controller" : "display");
  }, []);

  if (role === "controller") return <RemoteControl />;
  if (!selectedCourse) return <CourseSelector onSelect={setSelectedCourse} />;
  
  return <MainDisplay curso={selectedCourse} />;
};

export default App;