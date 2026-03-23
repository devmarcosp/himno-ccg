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
// VISTA: SELECTOR DE CURSO
// ==========================================
const CourseSelector = ({ onSelect }) => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans">
    <div className="bg-slate-800 p-12 rounded-[4rem] border-2 border-slate-700 shadow-2xl max-w-3xl w-full text-center">
      <div className="bg-red-600/10 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8">
        <School className="text-red-500" size={48} />
      </div>
      <h2 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter italic">Dale Play CCG</h2>
      <p className="text-slate-400 mb-12 font-bold uppercase tracking-widest text-sm">Escoge el curso para cargar la Ruleta</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        {CURSOS.map(curso => (
          <button key={curso} onClick={() => onSelect(curso)} className="bg-slate-700 hover:bg-red-600 text-white font-black py-5 px-8 rounded-3xl transition-all border-b-8 border-slate-900 hover:border-red-800 flex items-center justify-between group">
            <span className="text-xl italic">{curso}</span>
            <ChevronRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        ))}
      </div>
    </div>
  </div>
);

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
    <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-slate-900 p-10 rounded-[3.5rem] border-2 border-slate-800 shadow-2xl">
        <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-8">
          <Smartphone className="text-red-500" size={44} />
          <div className="text-xs font-black text-green-400 bg-green-950 px-5 py-2 rounded-full flex items-center gap-2"><Wifi size={14} className="animate-pulse" /> {status}</div>
        </div>
        <input type="text" value={currentWord} onChange={(e) => setCurrentWord(e.target.value)} className="w-full bg-slate-800 text-white text-4xl font-black p-8 rounded-[2rem] mb-10 border-4 border-slate-700 outline-none uppercase text-center focus:border-red-500" placeholder="ESCRIBE AQUÍ" />
        <button onClick={sendWord} className="w-full bg-red-600 text-white text-3xl font-black py-8 rounded-[2rem] border-b-[12px] border-red-900 active:translate-y-2 active:border-b-0 transition-all">ENVIAR PALABRA</button>
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

  useEffect(() => {
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
    if (available.length === 0) return alert("¡Todos jugaron!");
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
    <div className="min-h-screen bg-[#f1f5f9] font-sans p-4 md:p-8">
      <nav className="max-w-7xl mx-auto bg-white border-b-8 border-red-600 p-8 rounded-[3rem] flex justify-between items-center shadow-2xl mb-12">
        <div className="flex items-center gap-6">
          <div className="bg-slate-900 p-4 rounded-3xl text-white shadow-xl"><Music size={32} /></div>
          <div><h1 className="text-4xl font-black uppercase tracking-tighter leading-none">Dale Play <span className="text-red-600">CCG</span></h1><p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2 italic">{curso}</p></div>
        </div>
        <button onClick={() => window.location.reload()} className="bg-slate-50 p-4 rounded-full text-slate-300 hover:text-red-600 border border-slate-200"><RotateCcw size={28}/></button>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          {gameState === 'lobby' && (
            <div className="bg-white rounded-[5rem] p-20 text-center shadow-2xl border flex flex-col items-center justify-center min-h-[600px] animate-in zoom-in duration-500">
              <Star size={100} className="text-red-600 mb-12 animate-pulse" fill="currentColor" />
              <button onClick={startSpin} className="bg-red-600 text-white text-5xl font-black px-24 py-10 rounded-[3rem] border-b-[15px] border-red-900 shadow-2xl">¡GIRAR RULETA!</button>
            </div>
          )}

          {gameState === 'spinning' && (
            <div className="bg-slate-900 rounded-[5rem] p-20 text-center flex flex-col items-center justify-center min-h-[600px] border-[15px] border-slate-800 shadow-2xl">
              <h2 key={selectedStudent?.id} className="text-6xl md:text-8xl font-black text-white italic tracking-tighter animate-in fade-in zoom-in duration-75 truncate w-full px-10">{selectedStudent?.name}</h2>
            </div>
          )}

          {gameState === 'announced' && (
            <div className="bg-red-600 rounded-[5rem] p-20 text-center text-white shadow-2xl flex flex-col items-center justify-center min-h-[600px] border-b-[20px] border-red-900 animate-in slide-in-from-bottom">
              <p className="text-3xl font-bold opacity-70 uppercase tracking-[0.6em] mb-12 italic">Canta ahora:</p>
              <h2 className="text-7xl md:text-8xl font-black mb-20 drop-shadow-2xl">{selectedStudent?.name}</h2>
              <div className="flex gap-8 w-full max-w-3xl">
                <button onClick={() => setGameState('lobby')} className="flex-1 bg-red-800/50 text-white px-10 py-6 rounded-[2rem] font-black text-2xl border-4 border-red-400 flex items-center justify-center gap-3"><UserMinus size={32}/> AUSENTE</button>
                <button onClick={() => { setGameState('playing'); setSessionPoints(0); setCurrentSectionData(maskSection(shuffle(HIMNO_ESTRUCTURA)[0])); }} className="flex-2 bg-white text-red-600 px-16 py-8 rounded-[2rem] font-black text-4xl shadow-2xl">¡A JUGAR!</button>
              </div>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="space-y-10">
              <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] flex justify-between items-center border-b-8 border-red-600 shadow-2xl">
                <div className="flex items-center gap-8"><div className="bg-red-600 w-24 h-24 rounded-3xl flex items-center justify-center font-black text-5xl shadow-2xl">🎙️</div><h3 className="text-4xl font-black uppercase italic">{selectedStudent?.name}</h3></div>
                <div className="bg-white/5 p-8 rounded-[2.5rem] text-center min-w-[180px]"><span className="text-7xl font-mono font-black text-yellow-400">{sessionPoints}</span><span className="block text-xs font-black text-slate-500 uppercase mt-2">PUNTOS</span></div>
              </div>

              <div className="bg-white p-20 rounded-[5rem] shadow-2xl min-h-[450px] flex flex-col justify-center border relative">
                <div className="absolute top-10 left-16"><h4 className="text-red-600 font-black text-sm uppercase tracking-[0.8em] flex items-center gap-4"><div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div> {currentSectionData?.title}</h4></div>
                <div className="space-y-10 mt-12">
                  {currentSectionData?.lines.map((line, lIdx) => (
                    <p key={lIdx} className="text-3xl md:text-5xl lg:text-6xl font-black flex flex-wrap gap-x-8 leading-tight">
                      {line.map((word, wIdx) => (
                        <span key={wIdx} className={`rounded-3xl px-3 py-1 transition-all duration-500 ${word.isHidden ? (word.isRevealed ? (word.status === 'correct' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50 line-through opacity-50') : 'bg-slate-200 text-transparent min-w-[10rem] border-b-[10px] border-slate-300 mb-2') : 'text-slate-800'}`}>{word.text}</span>
                      ))}
                    </p>
                  ))}
                </div>
              </div>

              {currentSectionData?.lines.every(l => l.every(w => !w.isHidden || w.isRevealed)) && (
                <div className="grid grid-cols-2 gap-8 animate-in slide-in-from-bottom">
                  <button onClick={() => setCurrentSectionData(maskSection(shuffle(HIMNO_ESTRUCTURA)[0]))} className="bg-slate-800 text-white py-10 rounded-[3rem] font-black text-4xl border-b-[12px] border-slate-700">OTRA SECCIÓN</button>
                  <button onClick={savePoints} className="bg-red-600 text-white py-10 rounded-[3rem] font-black text-4xl border-b-[12px] border-red-800 shadow-2xl">TERMINAR TURNO</button>
                </div>
              )}
            </div>
          )}

          {gameState === 'summary' && (
            <div className="bg-white rounded-[5rem] p-24 text-center shadow-2xl min-h-[600px] animate-in zoom-in">
              <Award size={120} className="text-yellow-500 mb-12 mx-auto" />
              <h2 className="text-6xl md:text-8xl font-black text-slate-900 mb-12 uppercase italic">{selectedStudent?.name}</h2>
              <div className="bg-red-600 text-white px-24 py-12 rounded-[4rem] text-[10rem] font-mono font-black mb-16 shadow-2xl">{sessionPoints}</div>
              <button onClick={() => setGameState('lobby')} className="bg-slate-900 text-white px-24 py-10 rounded-[2.5rem] font-black text-4xl">SIGUIENTE ALUMNO</button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-[4rem] shadow-2xl border overflow-hidden sticky top-32">
            <div className="p-10 bg-slate-900 text-white flex justify-between items-center border-b-8 border-red-600"><h3 className="font-black uppercase tracking-tighter text-2xl italic"><Trophy className="text-yellow-400 mr-3 inline"/> RANKING</h3></div>
            <div className="max-h-[700px] overflow-y-auto bg-white">
              {students.sort((a,b) => b.points - a.points || a.id - b.id).map((s, idx) => (
                <div key={s.id} className={`px-10 py-8 border-b flex items-center justify-between ${s.id === selectedStudent?.id ? 'bg-red-50 scale-105 z-10 shadow-xl' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-8"><span className={`text-2xl font-black w-10 ${idx < 3 ? 'text-red-600 text-4xl' : 'text-slate-200'}`}>{idx + 1}</span><div className="flex flex-col"><span className="font-black text-slate-900 uppercase text-xl">{s.name}</span><span className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{s.played ? 'PARTICIPÓ' : 'PENDIENTE'}</span></div></div>
                  <div className="text-right"><span className="font-mono font-black text-3xl">{s.points}</span></div>
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
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRole(params.get("control") === "celular" ? "controller" : "display");
  }, []);
  if (role === "controller") return <RemoteControl />;
  if (!selectedCourse) return <CourseSelector onSelect={setSelectedCourse} />;
  return <MainDisplay curso={selectedCourse} />;
};

export default App;