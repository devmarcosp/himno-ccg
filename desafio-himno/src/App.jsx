import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { 
  Music, Star, Trophy, Play, RotateCcw, ArrowRight, 
  FastForward, Award, ThumbsUp, ThumbsDown, UserMinus, 
  Wifi, Send, Smartphone, CheckCircle 
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

const HIMNO_ESTRUCTURA = [
  { id: 'e1', title: 'Estrofa 1', lines: ['En aulas de saber y estrategias a crear', 'Estudiantes que florecen listos para avanzar', 'Calidad en cada paso siempre con pasión', 'Con docentes que inspiran guiando el corazón.'] },
  { id: 'c1', title: 'Coro', lines: ['Colegio Claudio Gay...', 'Unidos en verdad', 'Con educación cercana, familiar de calidad.', 'Forjando el futuro con esfuerzo', 'Esfuerzo y dedicación', 'Estudiantes y asistentes somos la gran misión...'] },
  { id: 'e2', title: 'Estrofa 2', lines: ['Aquí la educación es un lazo sin igual', 'La familia y el saber son nuestro ideal', 'Estrategias que nos llevan a grandes triunfos hoy', 'Formamos el mañana con confianza y con amor.'] },
  { id: 'c2', title: 'Coro 2', lines: ['Colegio Claudio Gay...', 'Ejemplo de unidad', 'Crecemos juntos siempre con toda dignidad.'] },
  { id: 'final', title: 'Final', lines: ['Educación, calidad...', 'Futuro y vocación', 'Claudio Gay', '¡Siempre en nuestro corazón!'] }
];

const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

// ==========================================
// COMPONENTE: CONTROL REMOTO (CELULAR)
// ==========================================
const RemoteControl = () => {
  const [currentWord, setCurrentWord] = useState("");
  const [status, setStatus] = useState("Conectado");

  const sendWord = () => {
    if (currentWord.trim() === "") return;
    setStatus("Enviando...");
    set(ref(db, 'remoto/palabraEnviada'), {
      texto: currentWord.trim().toUpperCase(),
      timestamp: Date.now()
    }).then(() => {
      setStatus("Enviado ✓");
      setCurrentWord("");
      setTimeout(() => setStatus("Conectado"), 1500);
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-[3rem] border-2 border-slate-700 shadow-2xl">
        <div className="flex justify-between items-center mb-10 border-b border-slate-700 pb-6">
          <Smartphone className="text-red-500" size={40} />
          <div className="text-xs font-black text-green-400 bg-green-950 px-4 py-2 rounded-full flex items-center gap-2">
            <Wifi size={14} className="animate-pulse" /> {status}
          </div>
        </div>
        <p className="text-center text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Escribe la palabra oculta</p>
        <input 
          type="text" value={currentWord}
          onChange={(e) => setCurrentWord(e.target.value)}
          className="w-full bg-slate-700 text-white text-4xl font-black p-6 rounded-3xl mb-8 border-4 border-slate-600 outline-none uppercase text-center"
        />
        <button onClick={sendWord} className="w-full bg-red-600 text-white text-3xl font-black py-8 rounded-3xl border-b-8 border-red-800 active:translate-y-2 active:border-b-0 transition-all flex items-center justify-center gap-4">
          ENVIAR <Send size={32} />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE: PANTALLA (PROYECTOR)
// ==========================================
const MainDisplay = () => {
  const [students, setStudents] = useState(Array.from({ length: 44 }, (_, i) => ({ id: i + 1, name: `Estudiante ${i + 1}`, points: 0, played: false })));
  const [gameState, setGameState] = useState('lobby'); 
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [shuffledSections, setShuffledSections] = useState([]);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentSectionData, setCurrentSectionData] = useState(null);
  const [sessionPoints, setSessionPoints] = useState(0);
  
  // EL "SEGURO": Guardamos el tiempo de la última palabra procesada
  const lastProcessedTime = useRef(0);

  useEffect(() => {
    const wordRef = ref(db, 'remoto/palabraEnviada');
    return onValue(wordRef, (snapshot) => {
      const data = snapshot.val();
      // SOLO procesar si el timestamp es NUEVO (mayor al último que guardamos)
      if (data && data.timestamp && data.timestamp > lastProcessedTime.current) {
        lastProcessedTime.current = data.timestamp; // Actualizamos el seguro
        validarPalabraRemota(data.texto);
      }
    });
  }, [currentSectionData, gameState]);

  const validarPalabraRemota = (word) => {
    if (!currentSectionData || gameState !== 'playing') return;
    let targetWordData = null;
    currentSectionData.lines.forEach(line => line.forEach(w => {
      if (!targetWordData && w.isHidden && !w.isRevealed) targetWordData = w;
    }));
    if (!targetWordData) return;

    const clean = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,]/g,"").toUpperCase();
    handleWordValidation(clean(targetWordData.text) === clean(word));
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

  const startSpin = () => {
    const available = students.filter(s => !s.played);
    if (available.length === 0) return alert("¡Todos jugaron!");
    setGameState('spinning');
    let count = 0;
    const interval = setInterval(() => {
      setSelectedStudent(available[Math.floor(Math.random() * available.length)]);
      if (count++ > 20) { clearInterval(interval); setGameState('announced'); }
    }, 80);
  };

  const maskSection = (section) => ({
    ...section,
    lines: section.lines.map(line => {
      const words = line.split(' ');
      const indices = new Set();
      const numToHide = Math.min(words.length - 1, Math.floor(Math.random() * 2) + 1);
      while(indices.size < numToHide) indices.add(Math.floor(Math.random() * words.length));
      return words.map((text, idx) => ({ text, isHidden: indices.has(idx), isRevealed: false, status: null }));
    })
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">
      <nav className="max-w-7xl mx-auto bg-white border-b-4 border-red-600 p-6 rounded-[2rem] flex justify-between items-center shadow-xl mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Dale Play <span className="text-red-600">CCG</span></h1>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs font-black text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200"><Wifi size={16} /> REMOTO ACTIVO</div>
          <div className="font-black text-slate-800 text-xl">{students.filter(s => s.played).length} / 44</div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {gameState === 'lobby' && (
            <div className="bg-white rounded-[4rem] p-16 text-center shadow-2xl border flex flex-col items-center justify-center min-h-[550px]">
              <Star size={80} className="text-red-600 mb-10 animate-pulse" fill="currentColor" />
              <button onClick={startSpin} className="bg-red-600 text-white text-4xl font-black px-16 py-8 rounded-[2rem] border-b-[12px] border-red-800 shadow-2xl">¡GIRAR!</button>
            </div>
          )}

          {gameState === 'spinning' && (
            <div className="bg-slate-900 rounded-[4rem] p-16 text-center flex flex-col items-center justify-center min-h-[550px] shadow-2xl border-[10px] border-slate-800">
              <h2 className="text-8xl font-black text-white italic tracking-tighter animate-bounce truncate w-full px-10">{selectedStudent?.name}</h2>
            </div>
          )}

          {gameState === 'announced' && (
            <div className="bg-red-600 rounded-[4rem] p-16 text-center text-white shadow-2xl flex flex-col items-center justify-center min-h-[550px] border-b-[15px] border-red-800">
              <p className="text-2xl font-bold opacity-80 uppercase tracking-[0.5em] mb-8">Pasa al frente:</p>
              <h2 className="text-8xl font-black mb-16">{selectedStudent?.name}</h2>
              <div className="flex gap-6">
                <button onClick={() => setGameState('lobby')} className="bg-red-800 text-white px-8 py-4 rounded-2xl font-black border-4 border-red-400">AUSENTE</button>
                <button onClick={() => { setGameState('playing'); setCurrentSectionIdx(0); setSessionPoints(0); setCurrentSectionData(maskSection(shuffle(HIMNO_ESTRUCTURA)[0])); }} className="bg-white text-red-600 px-12 py-5 rounded-2xl font-black text-3xl shadow-xl">¡A CANTAR!</button>
              </div>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="space-y-8">
              <div className="bg-slate-900 text-white p-8 rounded-[3rem] flex justify-between items-center border-b-4 border-red-600">
                <div className="font-black text-2xl uppercase tracking-tight">{selectedStudent?.name}</div>
                <div className="text-yellow-400 font-black text-5xl">{sessionPoints} <span className="text-[10px] text-white block uppercase">Puntos</span></div>
              </div>

              <div className="bg-white p-16 rounded-[4rem] shadow-2xl min-h-[400px] flex flex-col justify-center border border-slate-100 relative">
                <h4 className="text-red-600 font-black text-xs tracking-widest uppercase mb-10">{currentSectionData?.title}</h4>
                <div className="space-y-8">
                  {currentSectionData?.lines.map((line, lIdx) => (
                    <p key={lIdx} className="text-4xl md:text-5xl font-black flex flex-wrap gap-x-6 leading-tight">
                      {line.map((word, wIdx) => (
                        <span key={wIdx} className={`rounded-2xl px-2 py-1 ${word.isHidden ? (word.isRevealed ? (word.status === 'correct' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50 line-through opacity-50') : 'bg-slate-200 text-transparent min-w-[8rem] border-b-8 border-slate-300 mb-2') : 'text-slate-800'}`}>{word.text}</span>
                      ))}
                    </p>
                  ))}
                </div>
              </div>

              {currentSectionData?.lines.every(l => l.every(w => !w.isHidden || w.isRevealed)) && (
                <div className="grid grid-cols-2 gap-6">
                  <button onClick={() => setCurrentSectionData(maskSection(shuffle(HIMNO_ESTRUCTURA)[0]))} className="bg-slate-800 text-white py-8 rounded-[2rem] font-black text-3xl border-b-8 border-slate-700">OTRA SECCIÓN</button>
                  <button onClick={() => { setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, points: s.points + sessionPoints, played: true } : s)); setGameState('summary'); }} className="bg-red-600 text-white py-8 rounded-[2rem] font-black text-3xl border-b-8 border-red-800">TERMINAR TURNO</button>
                </div>
              )}
            </div>
          )}

          {gameState === 'summary' && (
            <div className="bg-white rounded-[4rem] p-20 text-center shadow-2xl flex flex-col items-center justify-center min-h-[550px]">
              <h2 className="text-7xl font-black mb-10 uppercase">{selectedStudent?.name}</h2>
              <div className="bg-red-600 text-white px-20 py-10 rounded-[3rem] text-9xl font-black mb-16 shadow-2xl">{sessionPoints}</div>
              <button onClick={() => setGameState('lobby')} className="bg-slate-900 text-white px-16 py-6 rounded-2xl font-black text-2xl">VOLVER AL INICIO</button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-[3rem] shadow-2xl border overflow-hidden sticky top-32">
            <div className="p-8 bg-slate-900 text-white font-black flex items-center gap-3 uppercase italic"><Trophy className="text-yellow-400" size={24}/> RANKING CCG</div>
            <div className="max-h-[600px] overflow-y-auto">
              {students.sort((a,b) => b.points - a.points || a.id - b.id).map((s, idx) => (
                <div key={s.id} className={`px-8 py-5 border-b flex justify-between items-center ${s.id === selectedStudent?.id ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                  <div className="font-black text-slate-800 truncate w-36 uppercase text-sm tracking-tight">{idx+1}. {s.name}</div>
                  <div className="flex items-center gap-4">{s.played && <CheckCircle className="text-green-500" size={18}/>}<span className="font-mono font-black text-xl">{s.points}</span></div>
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
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRole(params.get("control") === "celular" ? "controller" : "display");
  }, []);
  return role === "controller" ? <RemoteControl /> : <MainDisplay />;
};

export default App;