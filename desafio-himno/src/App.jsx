import React, { useState, useEffect } from 'react';
import { Users, Trophy, Play, RotateCcw, CheckCircle, XCircle, Music, Star, User, ArrowRight, FastForward, Award, ThumbsUp, ThumbsDown } from 'lucide-react';

const HIMNO_ESTRUCTURA = [
  { id: 'e1', title: 'Estrofa 1', lines: [
    'En aulas de saber y estrategias a crear',
    'Estudiantes que florecen listos para avanzar',
    'Calidad en cada paso siempre con pasión',
    'Con docentes que inspiran guiando el corazón.'
  ]},
  { id: 'c1', title: 'Coro', lines: [
    'Colegio Claudio Gay...',
    'Unidos en verdad',
    'Con educación cercana, familiar de calidad.',
    'Forjando el futuro con esfuerzo',
    'Esfuerzo y dedicación',
    'Estudiantes y asistentes somos la gran misión...'
  ]},
  { id: 'e2', title: 'Estrofa 2', lines: [
    'Aquí la educación es un lazo sin igual',
    'La familia y el saber son nuestro ideal',
    'Estrategias que nos llevan a grandes triunfos hoy',
    'Formamos el mañana con confianza y con amor.'
  ]},
  { id: 'c2', title: 'Coro 2', lines: [
    'Colegio Claudio Gay...',
    'Ejemplo de unidad',
    'Crecemos juntos siempre con toda dignidad.'
  ]},
  { id: 'final', title: 'Final', lines: [
    'Educación, calidad...',
    'Futuro y vocación',
    'Claudio Gay',
    '¡Siempre en nuestro corazón!'
  ]}
];

const App = () => {
  const [students, setStudents] = useState(
    Array.from({ length: 40 }, (_, i) => ({
      id: i + 1,
      name: `Estudiante ${i + 1}`,
      points: 0,
      played: false
    }))
  );
  
  const [gameState, setGameState] = useState('lobby'); // lobby, spinning, announced, playing, turn_summary
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [shuffledSections, setShuffledSections] = useState([]);
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentSectionData, setCurrentSectionData] = useState(null);
  const [sessionPoints, setSessionPoints] = useState(0);

  // Utilidad para desordenar
  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

  // Genera la máscara con estado de revelación para cada palabra
  const maskSection = (section) => {
    return {
      ...section,
      lines: section.lines.map(line => {
        const words = line.split(' ');
        const numToHide = Math.min(words.length - 1, Math.floor(Math.random() * 2) + 1);
        const indicesToHide = new Set();
        while(indicesToHide.size < numToHide) {
          const idx = Math.floor(Math.random() * words.length);
          if (words[idx].length > 3 || Math.random() > 0.7) indicesToHide.add(idx);
        }
        return words.map((word, idx) => ({
          text: word,
          isHidden: indicesToHide.has(idx),
          isRevealed: false,
          status: null // 'correct' o 'wrong'
        }));
      })
    };
  };

  const startSpin = () => {
    const available = students.filter(s => !s.played);
    if (available.length === 0) return alert("¡Todos participaron!");

    setGameState('spinning');
    let count = 0;
    const interval = setInterval(() => {
      setSelectedStudent(available[Math.floor(Math.random() * available.length)]);
      count++;
      if (count > 20) {
        clearInterval(interval);
        setGameState('announced');
      }
    }, 80);
  };

  const startStudentTurn = () => {
    // IMPORTANTE: Aquí se decide el orden al azar para este estudiante específico
    const order = shuffle(HIMNO_ESTRUCTURA);
    setShuffledSections(order);
    setCurrentSectionIdx(0);
    setSessionPoints(0);
    loadSection(order[0]);
    setGameState('playing');
  };

  const loadSection = (section) => {
    setCurrentSectionData(maskSection(section));
  };

  // Lógica de validación PALABRA POR PALABRA
  const handleWordValidation = (isCorrect) => {
    if (!currentSectionData) return;

    // Buscamos la primera palabra oculta que no haya sido revelada aún
    let found = false;
    const newLines = currentSectionData.lines.map(line => {
      return line.map(word => {
        if (!found && word.isHidden && !word.isRevealed) {
          found = true;
          if (isCorrect) setSessionPoints(p => p + 10);
          return { ...word, isRevealed: true, status: isCorrect ? 'correct' : 'wrong' };
        }
        return word;
      });
    });

    setCurrentSectionData({ ...currentSectionData, lines: newLines });
  };

  // Verifica si ya se revelaron todas las palabras ocultas de la sección
  const isSectionComplete = () => {
    if (!currentSectionData) return false;
    return currentSectionData.lines.every(line => 
      line.every(word => !word.isHidden || word.isRevealed)
    );
  };

  const nextStep = () => {
    if (currentSectionIdx < shuffledSections.length - 1) {
      const nextIdx = currentSectionIdx + 1;
      setCurrentSectionIdx(nextIdx);
      loadSection(shuffledSections[nextIdx]);
    } else {
      // Fin del turno
      setStudents(prev => prev.map(s => 
        s.id === selectedStudent.id ? { ...s, points: s.points + sessionPoints, played: true } : s
      ));
      setGameState('turn_summary');
    }
  };

  const finishTurn = () => {
    setGameState('lobby');
    setSelectedStudent(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-10">
      {/* Header Estilo TV */}
      <nav className="bg-white border-b-4 border-red-600 px-8 py-5 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-2 rounded-xl text-white">
            <Music size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
            Dale Play <span className="text-red-600">CCG</span>
          </h1>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Participantes</p>
            <p className="text-lg font-black text-slate-800 leading-none">{students.filter(s => s.played).length} / 40</p>
          </div>
          <button onClick={() => window.location.reload()} className="text-slate-300 hover:text-red-600 transition-colors">
            <RotateCcw size={22} />
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ESCENARIO PRINCIPAL */}
        <div className="lg:col-span-8">
          
          {gameState === 'lobby' && (
            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-16 text-center flex flex-col items-center justify-center min-h-[550px] animate-in fade-in zoom-in duration-500">
              <div className="w-32 h-32 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-10 shadow-inner">
                <Star size={64} fill="currentColor" className="animate-pulse" />
              </div>
              <h2 className="text-5xl font-black text-slate-900 mb-6 uppercase tracking-tighter">¡Próximo Turno!</h2>
              <p className="text-slate-400 text-xl mb-12 max-w-md font-bold">Descubre quién será el valiente que cantará el himno hoy.</p>
              <button 
                onClick={startSpin}
                className="bg-red-600 hover:bg-red-700 text-white text-3xl font-black px-16 py-8 rounded-[2rem] shadow-2xl shadow-red-200 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 border-b-8 border-red-800"
              >
                <Play fill="currentColor" size={36} /> ¡GIRAR!
              </button>
            </div>
          )}

          {gameState === 'spinning' && (
            <div className="bg-slate-900 rounded-[3rem] p-16 text-center flex flex-col items-center justify-center min-h-[550px] relative overflow-hidden border-8 border-slate-800">
              <div className="absolute top-0 left-0 w-full h-2 bg-red-600 animate-pulse"></div>
              <p className="text-red-600 font-black tracking-[0.5em] mb-4 text-sm animate-pulse">BUSCANDO ESTUDIANTE...</p>
              <h2 className="text-7xl font-black text-white italic tracking-tighter animate-bounce truncate w-full px-6">
                {selectedStudent?.name}
              </h2>
            </div>
          )}

          {gameState === 'announced' && (
            <div className="bg-red-600 rounded-[3rem] p-16 text-center flex flex-col items-center justify-center min-h-[550px] text-white shadow-2xl shadow-red-200 border-b-[12px] border-red-800 animate-in slide-in-from-bottom duration-500">
              <User size={100} className="mb-8 opacity-20" />
              <p className="text-2xl font-bold opacity-80 uppercase tracking-[0.4em] mb-6">Pasa al frente:</p>
              <h2 className="text-8xl font-black mb-16 drop-shadow-2xl">{selectedStudent?.name}</h2>
              <button 
                onClick={startStudentTurn}
                className="bg-white text-red-600 text-3xl font-black px-16 py-7 rounded-3xl hover:bg-slate-100 transition-all flex items-center gap-4 shadow-xl active:scale-95"
              >
                ¡LISTO PARA CANTAR! <ArrowRight size={40} strokeWidth={4} />
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="space-y-6 animate-in fade-in duration-700">
              {/* Info de la Sesión */}
              <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] flex justify-between items-center shadow-xl border-b-4 border-red-600">
                <div className="flex items-center gap-5">
                  <div className="bg-red-600 w-16 h-16 rounded-2xl flex items-center justify-center font-black text-3xl shadow-lg">
                    {currentSectionIdx + 1}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{selectedStudent?.name}</h3>
                    <p className="text-xs text-red-500 font-black uppercase tracking-[0.3em]">Etapa {currentSectionIdx + 1} de 5</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-3xl text-center min-w-[120px]">
                  <span className="block text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Puntos</span>
                  <span className="text-4xl font-mono font-black text-yellow-400 leading-none">{sessionPoints}</span>
                </div>
              </div>

              {/* El Himno en Pantalla */}
              <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl min-h-[400px] flex flex-col justify-center relative overflow-hidden">
                <div className="absolute top-8 left-12">
                   <h4 className="text-red-600 font-black text-sm uppercase tracking-[0.5em] flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-ping"></div> {currentSectionData?.title}
                  </h4>
                </div>
                
                <div className="space-y-6 mt-8">
                  {currentSectionData?.lines.map((line, lIdx) => (
                    <p key={lIdx} className="text-3xl md:text-4xl flex flex-wrap gap-x-4 font-black leading-tight tracking-tight">
                      {line.map((word, wIdx) => (
                        <span 
                          key={wIdx} 
                          className={`
                            transition-all duration-300 rounded-xl px-1.5
                            ${word.isHidden 
                              ? (word.isRevealed 
                                  ? (word.status === 'correct' ? 'text-green-600 bg-green-50 animate-in zoom-in' : 'text-red-500 bg-red-50 line-through opacity-60') 
                                  : 'bg-slate-200 text-transparent min-w-[6rem] border-b-4 border-slate-300 mb-1') 
                              : 'text-slate-800'}
                          `}
                        >
                          {word.text}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              </div>

              {/* Botones de Control Palabra por Palabra */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-24">
                {!isSectionComplete() ? (
                  <>
                    <button 
                      onClick={() => handleWordValidation(false)}
                      className="bg-white border-b-8 border-slate-300 border-x-2 border-t-2 border-slate-200 text-slate-300 hover:text-red-600 hover:border-red-600 rounded-3xl font-black text-3xl transition-all flex items-center justify-center gap-4 active:border-b-0 active:mt-2"
                    >
                      <ThumbsDown size={40} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => handleWordValidation(true)}
                      className="bg-green-500 text-white border-b-8 border-green-700 rounded-3xl font-black text-3xl hover:bg-green-600 transition-all shadow-xl shadow-green-100 flex items-center justify-center gap-4 active:border-b-0 active:mt-2"
                    >
                      <ThumbsUp size={40} strokeWidth={3} />
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={nextStep}
                    className="col-span-2 bg-slate-900 text-white py-6 rounded-3xl font-black text-3xl hover:bg-red-600 transition-all flex items-center justify-center gap-6 animate-in slide-in-from-bottom duration-300 border-b-8 border-slate-700 active:border-b-0 active:mt-2"
                  >
                    {currentSectionIdx < 4 ? 'SIGUIENTE ETAPA' : 'FINALIZAR TURNO'} <FastForward size={40} strokeWidth={3} />
                  </button>
                )}
              </div>
            </div>
          )}

          {gameState === 'turn_summary' && (
            <div className="bg-white rounded-[3.5rem] p-16 text-center flex flex-col items-center justify-center min-h-[550px] shadow-2xl border border-slate-100 animate-in zoom-in duration-500">
              <div className="bg-yellow-100 p-8 rounded-full mb-10 text-yellow-600 shadow-inner">
                <Award size={100} />
              </div>
              <h2 className="text-3xl font-bold text-slate-400 uppercase tracking-widest mb-2">Resumen de Turno</h2>
              <h3 className="text-7xl font-black text-slate-900 mb-10">{selectedStudent?.name}</h3>
              <div className="bg-red-600 text-white px-16 py-8 rounded-[2.5rem] mb-14 shadow-2xl shadow-red-100">
                <p className="text-white/70 font-black uppercase text-xs mb-2 tracking-[0.3em]">Total Puntos Ganados</p>
                <p className="text-8xl font-mono font-black leading-none">{sessionPoints}</p>
              </div>
              <button 
                onClick={finishTurn}
                className="bg-slate-900 text-white px-16 py-6 rounded-2xl font-black text-2xl hover:bg-slate-800 transition-all border-b-8 border-slate-700 active:border-b-0 active:mt-2"
              >
                VOLVER AL INICIO
              </button>
            </div>
          )}
        </div>

        {/* LÍDERES (PANEL DERECHO) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden sticky top-32">
            <div className="p-8 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-900 flex items-center gap-3 uppercase tracking-tighter text-base">
                <Trophy className="text-yellow-500" size={24} /> Ranking CCG
              </h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto scrollbar-hide">
              {students
                .sort((a, b) => b.points - a.points || a.id - b.id)
                .map((student, idx) => (
                <div 
                  key={student.id} 
                  className={`px-8 py-5 border-b border-slate-50 flex items-center justify-between transition-all ${student.id === selectedStudent?.id ? 'bg-red-50' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-5">
                    <span className={`text-sm font-black w-6 ${idx < 3 ? 'text-red-600 text-lg' : 'text-slate-300'}`}>
                      {idx + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 truncate w-32 leading-none mb-1 text-base">{student.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Estudiante {student.id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {student.played && (
                      <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle size={14} strokeWidth={3} />
                      </div>
                    )}
                    <span className={`font-mono font-black text-xl ${student.points > 0 ? 'text-slate-900' : 'text-slate-200'}`}>
                      {student.points}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <footer className="mt-16 text-center">
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.6em] mb-1">Proyecto Himno Colegio Claudio Gay</p>
        <p className="text-slate-300 text-[9px] font-bold">"40 Años Educando con el Corazón"</p>
      </footer>
    </div>
  );
};

export default App;