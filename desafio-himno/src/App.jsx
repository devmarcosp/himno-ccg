import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { 
  Music, Star, Trophy, Play, RotateCcw, ArrowRight, 
  FastForward, Award, ThumbsUp, ThumbsDown, UserMinus, 
  Wifi, Send, Smartphone, CheckCircle 
} from 'lucide-react';

// ==========================================
// 1. CONFIGURACIÓN DE FIREBASE (Tus credenciales)
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

// Estructura del Himno
const HIMNO_ESTRUCTURA = [
  { id: 'e1', title: 'Estrofa 1', lines: ['En aulas de saber y estrategias a crear', 'Estudiantes que florecen listos para avanzar', 'Calidad en cada paso siempre con pasión', 'Con docentes que inspiran guiando el corazón.'] },
  { id: 'c1', title: 'Coro', lines: ['Colegio Claudio Gay...', 'Unidos en verdad', 'Con educación cercana, familiar de calidad.', 'Forjando el futuro con esfuerzo', 'Esfuerzo y dedicación', 'Estudiantes y asistentes somos la gran misión...'] },
  { id: 'e2', title: 'Estrofa 2', lines: ['Aquí la educación es un lazo sin igual', 'La familia y el saber son nuestro ideal', 'Estrategias que nos llevan a grandes triunfos hoy', 'Formamos el mañana con confianza y con amor.'] },
  { id: 'c2', title: 'Coro 2', lines: ['Colegio Claudio Gay...', 'Ejemplo de unidad', 'Crecemos juntos siempre con toda dignidad.'] },
  { id: 'final', title: 'Final', lines: ['Educación, calidad...', 'Futuro y vocación', 'Claudio Gay', '¡Siempre en nuestro corazón!'] }
];

const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

// ==========================================
// COMPONENTE: CONTROL REMOTO (VISTA CELULAR)
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
          type="text" 
          value={currentWord}
          onChange={(e) => setCurrentWord(e.target.value)}
          placeholder="..."
          className="w-full bg-slate-700 text-white text-4xl font-black p-6 rounded-3xl mb-8 border-4 border-slate-600 focus:border-red-500 outline-none uppercase text-center placeholder:opacity-20 shadow-inner"
        />
        
        <button 
          onClick={sendWord} 
          className="w-full bg-red-600 text-white text-3xl font-black py-8 rounded-3xl border-b-8 border-red-800 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-4 shadow-xl"
        >
          ENVIAR <Send size={32} />
        </button>
      </div>
      <p className="mt-10 text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">Modo Controlador Remoto - CCG</p>
    </div>
  );
};

// ==========================================
// COMPONENTE: PANTALLA (VISTA PROYECTOR)
// ==========================================
const MainDisplay = () => {
  const [students, setStudents] = useState(Array.from({ length: 44 }, (_, i) => ({ id: i + 1, name: `Estudiante ${i + 1}`, points: 0, played: false })));
  const [gameState, setGameState] = useState('lobby'); 
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [shuffledSections, setShuffledSections] = useState([]);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentSectionData, setCurrentSectionData] = useState(null);
  const [sessionPoints, setSessionPoints] = useState(0);

  // Escuchar Firebase para recibir palabras del celular
  useEffect(() => {
    const wordRef = ref(db, 'remoto/palabraEnviada');
    return onValue(wordRef, (snapshot) => {
      const data = snapshot.val();
      // Solo validamos si la palabra se envió hace menos de 5 segundos
      if (data && data.timestamp > Date.now() - 5000) {
        validarPalabraRemota(data.texto);
      }
    });
  }, [currentSectionData, gameState]);

  const validarPalabraRemota = (word) => {
    if (!currentSectionData || gameState !== 'playing') return;
    
    // Buscamos la primera palabra oculta disponible
    let targetWordData = null;
    currentSectionData.lines.forEach(line => line.forEach(w => {
      if (!targetWordData && w.isHidden && !w.isRevealed) targetWordData = w;
    }));

    if (!targetWordData) return;

    // Normalizar para comparar (quitar tildes y signos)
    const clean = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,]/g,"").toUpperCase();
    const isCorrect = clean(targetWordData.text) === clean(word);
    
    handleWordValidation(isCorrect);
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
    if (available.length === 0) return alert("¡Todos los alumnos participaron!");
    setGameState('spinning');
    let count = 0;
    const interval = setInterval(() => {
      setSelectedStudent(available[Math.floor(Math.random() * available.length)]);
      if (count++ > 20) { clearInterval(interval); setGameState('announced'); }
    }, 80);
  };

  const startTurn = () => {
    const order = shuffle(HIMNO_ESTRUCTURA);
    setShuffledSections(order);
    setCurrentSectionIdx(0);
    setSessionPoints(0);
    setCurrentSectionData(maskSection(order[0]));
    setGameState('playing');
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

  const isSectionComplete = () => currentSectionData?.lines.every(l => l.every(w => !w.isHidden || w.isRevealed));

  const saveAndFinish = () => {
    setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, points: s.points + sessionPoints, played: true } : s));
    setGameState('summary');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">
      {/* HEADER TIPO TV */}
      <nav className="max-w-7xl mx-auto bg-white border-b-4 border-red-600 p-6 rounded-[2rem] flex justify-between items-center shadow-xl mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-2.5 rounded-2xl text-white shadow-lg"><Music size={32} /></div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Dale Play <span className="text-red-600">CCG</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs font-black text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200">
            <Wifi size={16} /> CONTROL REMOTO ACTIVO
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">En Sala</p>
            <p className="text-xl font-black text-slate-800 leading-none">{students.filter(s => s.played).length} / 44</p>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          {/* VISTA LOBBY */}
          {gameState === 'lobby' && (
            <div className="bg-white rounded-[4rem] p-16 text-center shadow-2xl border border-slate-100 flex flex-col items-center justify-center min-h-[550px] animate-in zoom-in duration-500">
              <div className="bg-red-50 p-10 rounded-full mb-10 shadow-inner">
                 <Star size={80} className="text-red-600 animate-pulse" fill="currentColor" />
              </div>
              <h2 className="text-6xl font-black text-slate-900 mb-12 uppercase tracking-tighter">¿Quién cantará hoy?</h2>
              <button onClick={startSpin} className="bg-red-600 text-white text-4xl font-black px-20 py-10 rounded-[2.5rem] border-b-[12px] border-red-800 hover:scale-105 active:translate-y-2 active:border-b-4 transition-all shadow-2xl shadow-red-200">
                ¡GIRAR RULETA!
              </button>
            </div>
          )}

          {/* VISTA SPINNING */}
          {gameState === 'spinning' && (
            <div className="bg-slate-900 rounded-[4rem] p-16 text-center flex flex-col items-center justify-center min-h-[550px] border-[10px] border-slate-800 shadow-2xl">
              <h2 className="text-8xl font-black text-white italic tracking-tighter animate-bounce truncate w-full px-10">
                {selectedStudent?.name}
              </h2>
            </div>
          )}

          {/* VISTA ANUNCIO */}
          {gameState === 'announced' && (
            <div className="bg-red-600 rounded-[4rem] p-16 text-center text-white shadow-2xl flex flex-col items-center justify-center min-h-[550px] border-b-[15px] border-red-800 animate-in slide-in-from-bottom duration-500">
              <p className="text-2xl font-bold opacity-80 uppercase tracking-[0.5em] mb-8 italic">Pasa al frente:</p>
              <h2 className="text-9xl font-black mb-16 drop-shadow-2xl">{selectedStudent?.name}</h2>
              <div className="flex gap-6 w-full max-w-2xl">
                <button onClick={() => setGameState('lobby')} className="flex-1 bg-red-800/50 text-white px-8 py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-3 border-4 border-red-400 hover:bg-red-900/50 transition-all">
                  <UserMinus size={30}/> AUSENTE
                </button>
                <button onClick={startTurn} className="flex-2 bg-white text-red-600 px-16 py-6 rounded-3xl font-black text-3xl shadow-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-4">
                  ¡A CANTAR! <ArrowRight size={36} strokeWidth={4}/>
                </button>
              </div>
            </div>
          )}

          {/* VISTA JUEGO */}
          {gameState === 'playing' && (
            <div className="space-y-8 animate-in fade-in duration-700">
              <div className="bg-slate-900 text-white p-10 rounded-[3rem] flex justify-between items-center shadow-2xl border-b-4 border-red-600">
                <div className="flex items-center gap-6">
                  <div className="bg-red-600 w-20 h-20 rounded-3xl flex items-center justify-center font-black text-4xl shadow-xl">{currentSectionIdx + 1}</div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tight">{selectedStudent?.name}</h3>
                    <p className="text-xs text-red-500 font-black uppercase tracking-[0.4em]">Sección Activa</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] text-center min-w-[150px]">
                  <span className="text-6xl font-mono font-black text-yellow-400 leading-none">{sessionPoints}</span>
                  <span className="block text-xs font-black text-slate-500 uppercase mt-2 tracking-widest">PUNTOS</span>
                </div>
              </div>

              <div className="bg-white p-16 rounded-[4rem] shadow-2xl min-h-[420px] flex flex-col justify-center border border-slate-100 relative">
                <div className="absolute top-10 left-16">
                   <h4 className="text-red-600 font-black text-sm uppercase tracking-[0.6em] flex items-center gap-3 animate-pulse">
                     <div className="w-3 h-3 bg-red-600 rounded-full"></div> {currentSectionData?.title}
                   </h4>
                </div>
                
                <div className="space-y-8 mt-10">
                  {currentSectionData?.lines.map((line, lIdx) => (
                    <p key={lIdx} className="text-4xl md:text-5xl font-black flex flex-wrap gap-x-6 leading-tight tracking-tight">
                      {line.map((word, wIdx) => (
                        <span key={wIdx} className={`rounded-2xl px-2 py-1 transition-all duration-300 ${word.isHidden ? (word.isRevealed ? (word.status === 'correct' ? 'text-green-600 bg-green-50 animate-in zoom-in' : 'text-red-500 bg-red-50 line-through opacity-50') : 'bg-slate-200 text-transparent min-w-[8rem] border-b-8 border-slate-300 mb-2') : 'text-slate-800'}`}>
                          {word.text}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {isSectionComplete() ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom duration-500">
                    {currentSectionIdx < 4 && (
                      <button onClick={() => { setCurrentSectionIdx(i=>i+1); setCurrentSectionData(maskSection(shuffledSections[currentSectionIdx+1])); }} className="bg-slate-800 text-white py-8 rounded-[2rem] font-black text-3xl border-b-[10px] border-slate-700 hover:bg-slate-900 transition-all flex items-center justify-center gap-4">
                        <FastForward size={36}/> OTRA SECCIÓN
                      </button>
                    )}
                    <button onClick={saveAndFinish} className={`${currentSectionIdx === 4 ? 'col-span-2' : ''} bg-red-600 text-white py-8 rounded-[2rem] font-black text-3xl border-b-[10px] border-red-800 hover:bg-red-700 transition-all flex items-center justify-center gap-4`}>
                      <Award size={36}/> TERMINAR TURNO
                    </button>
                  </div>
                ) : (
                  <div className="p-10 bg-slate-100 rounded-[2rem] border-4 border-dashed border-slate-300 text-center animate-pulse">
                    <p className="text-slate-500 font-black text-2xl uppercase tracking-tighter flex items-center justify-center gap-4">
                      <Smartphone size={40}/> ESPERANDO PALABRA DESDE EL CELULAR...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VISTA RESUMEN FINAL */}
          {gameState === 'summary' && (
            <div className="bg-white rounded-[4rem] p-20 text-center shadow-2xl flex flex-col items-center justify-center min-h-[550px] border border-slate-100 animate-in zoom-in duration-500">
              <div className="bg-yellow-100 p-10 rounded-full mb-10 text-yellow-600 shadow-inner">
                <Award size={120} />
              </div>
              <h2 className="text-8xl font-black text-slate-900 mb-10 tracking-tighter uppercase italic">{selectedStudent?.name}</h2>
              <div className="bg-red-600 text-white px-20 py-10 rounded-[3rem] text-9xl font-mono font-black mb-16 shadow-2xl shadow-red-200">
                {sessionPoints}
                <p className="text-xs font-black uppercase tracking-[0.5em] mt-4 opacity-70">Puntos Totales</p>
              </div>
              <button onClick={() => setGameState('lobby')} className="bg-slate-900 text-white px-20 py-8 rounded-3xl font-black text-3xl border-b-8 border-slate-700 hover:bg-slate-800 active:translate-y-2 active:border-b-0 transition-all">
                SIGUIENTE ALUMNO
              </button>
            </div>
          )}
        </div>

        {/* PANEL LATERAL: RANKING */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden sticky top-32">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-black flex items-center gap-3 uppercase tracking-tighter text-xl italic">
                <Trophy className="text-yellow-400" size={30} /> RANKING CCG
              </h3>
            </div>
            <div className="max-h-[650px] overflow-y-auto scrollbar-hide bg-white">
              {students.sort((a,b) => b.points - a.points || a.id - b.id).map((s, idx) => (
                <div key={s.id} className={`px-8 py-6 border-b border-slate-50 flex items-center justify-between transition-all ${s.id === selectedStudent?.id ? 'bg-red-50 scale-105 z-10 shadow-lg' : 'hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-6">
                    <span className={`text-xl font-black w-8 ${idx < 3 ? 'text-red-600 text-2xl' : 'text-slate-300'}`}>
                      {idx + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 truncate w-36 leading-none mb-1.5 text-lg uppercase tracking-tight">
                        {s.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Alumno CCG</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    {s.played && (
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-inner">
                        <CheckCircle size={18} strokeWidth={4}/>
                      </div>
                    )}
                    <span className={`font-mono font-black text-2xl ${s.points > 0 ? 'text-slate-900' : 'text-slate-200'}`}>
                      {s.points}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-6 text-center text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em]">44 Alumnos • Colegio Claudio Gay</p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// RUTEADOR PRINCIPAL
// ==========================================
const App = () => {
  const [role, setRole] = useState("display");

  useEffect(() => {
    // Detectamos si es el celular por la URL: ?control=celular
    const params = new URLSearchParams(window.location.search);
    setRole(params.get("control") === "celular" ? "controller" : "display");
  }, []);

  return role === "controller" ? <RemoteControl /> : <MainDisplay />;
};

export default App;