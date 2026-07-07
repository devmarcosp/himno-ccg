import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, remove } from "firebase/database";
import { 
  Music, Star, Trophy, RotateCcw, Award, Wifi, 
  ChevronRight, School, Drum, Hand, LayoutGrid, Home,
  Square, PlayCircle, RefreshCw, ArrowLeft, Mic2, Check, X, Mic, ExternalLink, SkipBack, ListMusic, FileText, ThumbsUp, ThumbsDown, Minimize2, Globe, Eye, Flag, Presentation
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

const MUNDIAL_QUESTIONS = [
  { flag: '🇨🇱', country: 'Chile', question: '¿Cuántas líneas y cuántos espacios tiene un pentagrama?', answer: '5 líneas y 4 espacios' },
  { flag: '🇦🇷', country: 'Argentina', question: '¿Para qué sirve la Llave de Sol?', answer: 'Para dar nombre a las notas, ubicando el Sol en la 2da línea (registro agudo).' },
  { flag: '🇧🇷', country: 'Brasil', question: '¿Cuál es la diferencia entre el Ritmo y el Pulso?', answer: 'El pulso es el latido constante, el ritmo es la combinación de diferentes duraciones.' },
  { flag: '🇩🇪', country: 'Alemania', question: '¿Cuántos tiempos dura una figura Redonda?', answer: '4 tiempos' },
  { flag: '🇫🇷', country: 'Francia', question: '¿Qué figura musical dura exactamente 2 tiempos?', answer: 'La Blanca' },
  { flag: '🇮🇹', country: 'Italia', question: '¿A qué llamamos "Tempo" en la música?', answer: 'A la velocidad a la que se interpreta o toca una obra musical.' },
  { flag: '🇪🇸', country: 'España', question: '¿Qué es un Ostinato?', answer: 'Un patrón rítmico o melódico que se repite constantemente en una canción.' },
  { flag: '🇺🇾', country: 'Uruguay', question: 'Si vemos una nota en la primera línea del pentagrama (con Llave de Sol), ¿qué nota es?', answer: 'Nota Mi' },
  { flag: '🇨🇴', country: 'Colombia', question: 'Nombra 2 instrumentos que pertenezcan a la familia de percusión.', answer: 'Batería, pandero, xilófono, tambor, etc.' },
  { flag: '🇲🇽', country: 'México', question: '¿Cómo puede la música transmitir la emoción de "tristeza"?', answer: 'Usando tempos lentos, tonalidades menores o instrumentos suaves.' },
  { flag: '🇯🇵', country: 'Japón', question: '¿Para qué se utiliza la Llave de Fa?', answer: 'Para escribir y leer los sonidos o registros más graves.' },
  { flag: '🇰🇷', country: 'Corea del Sur', question: '¿Qué nos indica la cifra indicadora de compás (ej. 4/4)?', answer: 'La cantidad de tiempos o pulsos que caben dentro de cada compás.' },
  { flag: '🇺🇸', country: 'EE.UU.', question: '¿Cuántas corcheas equivalen al mismo tiempo que una Negra?', answer: '2 corcheas' },
  { flag: '🇬🇧', country: 'Inglaterra', question: 'Si una canción acelera su velocidad, ¿qué elemento musical está cambiando?', answer: 'El Tempo' },
  { flag: '🇵🇹', country: 'Portugal', question: '¿Qué familia de instrumentos usa cuerdas frotadas con un arco para generar sonido?', answer: 'Cuerdas frotadas (Ej: Violín, Violonchelo)' }
];

const MUNDIAL_QUESTIONS_1BASICO = [
  { flag: '🇨🇱', country: 'Chile', question: 'Cuando un ritmo es LENTO, ¿qué emoción puede estar transmitiendo? Dibújala.', answer: 'Calma, tristeza o tranquilidad (dibujo libre).' },
  { flag: '🇦🇷', country: 'Argentina', question: 'Cuando un ritmo es RÁPIDO, ¿qué emoción puede estar transmitiendo? Dibújala.', answer: 'Alegría, emoción o energía (dibujo libre).' },
  { flag: '🇧🇷', country: 'Brasil', question: 'Dibuja algo que suene FUERTE (forte).', answer: 'Un trueno, tambores, algo grande y ruidoso (dibujo libre).' },
  { flag: '🇩🇪', country: 'Alemania', question: 'Dibuja algo que suene SUAVE (piano).', answer: 'Un susurro, una pluma cayendo, algo delicado (dibujo libre).' },
  { flag: '🇫🇷', country: 'Francia', question: 'Dibuja un patrón: círculo, cuadrado, círculo, cuadrado... ¿qué sigue?', answer: 'Círculo (el patrón se repite).' },
  { flag: '🇮🇹', country: 'Italia', question: 'Si la música suena triste, ¿qué color usarías para dibujar esa emoción?', answer: 'Colores fríos: azul, gris, morado (respuesta libre).' },
  { flag: '🇪🇸', country: 'España', question: 'Si la música suena alegre, ¿qué color usarías para dibujar esa emoción?', answer: 'Colores cálidos: amarillo, naranjo, rojo (respuesta libre).' },
  { flag: '🇺🇾', country: 'Uruguay', question: 'Dibuja un patrón de palmadas: fuerte, suave, fuerte, suave... ¿qué sigue?', answer: 'Suave (el patrón se repite).' },
  { flag: '🇨🇴', country: 'Colombia', question: 'Dibuja un animal que camine LENTO como un ritmo lento.', answer: 'Tortuga, caracol, elefante (dibujo libre).' },
  { flag: '🇲🇽', country: 'México', question: 'Dibuja un animal que se mueva RÁPIDO como un ritmo rápido.', answer: 'Conejo, guepardo, colibrí (dibujo libre).' },
  { flag: '🇯🇵', country: 'Japón', question: 'Dibuja cómo te sientes cuando escuchas una canción de cumpleaños.', answer: 'Felicidad, fiesta (dibujo libre).' },
  { flag: '🇰🇷', country: 'Corea del Sur', question: 'Dibuja una cara feliz y una cara triste. ¿Cuál va con un ritmo lento?', answer: 'La cara triste va con el ritmo lento.' },
  { flag: '🇺🇸', country: 'EE.UU.', question: 'Dibuja un patrón de figuras: estrella, luna, estrella, luna... ¿qué sigue?', answer: 'Estrella (el patrón se repite).' },
  { flag: '🇬🇧', country: 'Inglaterra', question: 'Si la música da miedo, ¿qué dibujarías?', answer: 'Algo oscuro, una tormenta, un monstruo (dibujo libre).' },
  { flag: '🇵🇹', country: 'Portugal', question: 'Dibuja algo que represente el silencio.', answer: 'Un dedo en la boca (shh), la noche, algo quieto (dibujo libre).' }
];

const MUSICAL_FIGURES = [
  { type: 'Redonda', value: 4, color: '#dc2626' },
  { type: 'Blanca', value: 2, color: '#2563eb' },
  { type: 'Negra', value: 1, color: '#0f172a' },
  { type: 'Corcheas', value: 1, color: '#334155' }
];

const MUNDIAL_SLIDES = [
  {
    title: 'Objetivo',
    body: 'Repasar y aplicar los elementos del lenguaje musical (figuras rítmicas, notas en el pentagrama y compases de 4/4).'
  },
  {
    title: 'Actividad 1',
    body: 'Dibuja 5 pentagramas en tu cuaderno o guía y trabaja en cada uno según las instrucciones:'
  },
  {
    title: 'Pentagrama 1',
    body: 'En llave de sol escribe las siguientes notas, (en este orden): si – la – re – mi – mi – do – fa – si. Debajo de cada nota, escribe su nombre.'
  },
  {
    title: 'Pentagrama 2',
    body: 'En llave de sol crea 6 compases de 4/4 (4 tiempos cada uno) usando las notas del pentagrama 1. Recuerda que las figuras de cada compás deben sumar exactamente 4 tiempos.'
  },
  {
    title: 'Pentagrama 3',
    body: 'En llave de sol crea otros 6 compases de 4/4 (4 tiempos cada uno), distintos a los anteriores, usando las mismas notas. En cada compás debes usar al menos dos figuras diferentes (por ejemplo, una blanca y dos negras).'
  },
  {
    title: 'Pentagrama 4',
    body: 'En llave de fa escribe la escala de Do completa (do – re – mi – fa – sol – la – si – do).'
  },
  {
    title: 'Pentagrama 5',
    body: 'En llave de Fa escribe las siguientes notas, en este orden: fa – do – sol – re – la – mi – si. Debajo de cada nota, escribe su nombre.'
  }
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

// ==========================================
// 4. COMPONENTES VISUALES
// ==========================================

const MusicNote = ({ type, color = "currentColor" }) => {
  const baseClass = "flex items-center justify-center p-1";
  switch (type) {
    case 'Redonda': return (<div className={baseClass}><svg viewBox="0 0 100 60" className="w-14 h-8"><ellipse cx="50" cy="30" rx="35" ry="22" fill="none" stroke={color} strokeWidth="12" transform="rotate(-20 50 30)" /></svg></div>);
    case 'Blanca': return (<div className={baseClass}><svg viewBox="0 0 80 140" className="w-10 h-16"><ellipse cx="30" cy="110" rx="22" ry="16" fill="none" stroke={color} strokeWidth="12" transform="rotate(-20 30 110)" /><path d="M52 10 L52 105" stroke={color} strokeWidth="12" strokeLinecap="round" /></svg></div>);
    case 'Negra': return (<div className={baseClass}><svg viewBox="0 0 80 140" className="w-10 h-16"><ellipse cx="30" cy="110" rx="22" ry="16" fill={color} transform="rotate(-20 30 110)" /><path d="M52 10 L52 105" stroke={color} strokeWidth="12" strokeLinecap="round" /></svg></div>);
    case 'Corcheas': return (<div className={baseClass}><svg viewBox="0 0 140 140" className="w-16 h-16"><ellipse cx="25" cy="110" rx="18" ry="12" fill={color} transform="rotate(-20 25 110)" /><path d="M42 20 L42 105" stroke={color} strokeWidth="12" /><ellipse cx="95" cy="110" rx="18" ry="12" fill={color} transform="rotate(-20 95 110)" /><path d="M112 20 L112 105" stroke={color} strokeWidth="12" /><path d="M42 25 L112 25" stroke={color} strokeWidth="16" /></svg></div>);
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
        <button onClick={onHome} className="bg-slate-100 p-4 rounded-full text-slate-600 hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center gap-2 px-6 font-black uppercase text-xs">
            <Home size={20}/> Inicio
        </button>
        <button onClick={onBack} className="bg-slate-100 p-4 rounded-full text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center gap-2 px-6 font-black uppercase text-xs">
            <ArrowLeft size={20}/> Atrás
        </button>
        <div className="w-[2px] h-8 bg-slate-200 mx-2"></div>
        <button onClick={() => window.location.reload()} className="bg-slate-50 p-4 rounded-full text-slate-300 hover:text-red-600 border border-slate-200 transition-all shadow-sm"><RotateCcw size={28}/></button>
    </div>
  </nav>
);

const CourseSelector = ({ onSelect }) => (
  <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans">
    <div className="bg-slate-800 p-12 rounded-[3rem] border-2 border-slate-700 shadow-2xl max-w-4xl w-full text-center text-white">
      <div className="bg-red-600/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner text-red-500"><School size={40} /></div>
      <h2 className="text-3xl sm:text-5xl font-black mb-10 uppercase italic tracking-tighter text-white">CCG-INTERACTIVO</h2>
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

const CategorySelector = ({ curso, onSelectCategory }) => (
  <div className="flex flex-col items-center justify-center p-6 text-slate-900 font-sans text-center">
    <h2 className="text-5xl font-black mb-4 italic uppercase tracking-tighter text-slate-900">{curso}</h2>
    <p className="text-red-500 font-black uppercase tracking-[0.5em] text-xs mb-16 italic underline decoration-red-600 underline-offset-8">Actividad</p>
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 max-w-7xl w-full text-slate-900 font-black">
      <button onClick={() => onSelectCategory('himno')} className="bg-white p-10 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border-b-12 border-slate-200"><div className="bg-red-100 p-6 rounded-full text-red-600 mb-6 mx-auto w-fit text-red-600"><Music size={60} /></div><span className="text-3xl uppercase italic tracking-tighter text-slate-900 text-slate-900">HIMNO</span></button>
      <button onClick={() => onSelectCategory('karaoke')} className="bg-white p-10 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border-b-12 border-slate-200"><div className="bg-green-100 p-6 rounded-full text-green-600 mb-6 mx-auto w-fit text-green-600"><Mic size={60} /></div><span className="text-3xl uppercase italic tracking-tighter text-slate-900 text-slate-900">KARAOKE</span></button>
      <button onClick={() => onSelectCategory('mundial')} className="bg-white p-10 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border-b-12 border-slate-200"><div className="bg-yellow-100 p-6 rounded-full text-yellow-600 mb-6 mx-auto w-fit text-yellow-600"><Globe size={60} /></div><span className="text-3xl uppercase italic tracking-tighter text-slate-900 text-slate-900">MUNDIAL</span></button>
      {curso === CURSO_CON_POLIRRITMIA && (<button onClick={() => onSelectCategory('polirritmia')} className="bg-slate-800 text-white p-10 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border-b-12 border-slate-950 border-2 border-slate-700 text-white"><div className="bg-blue-600 p-6 rounded-full text-white mb-6 mx-auto w-fit text-white text-white"><LayoutGrid size={60} /></div><span className="text-3xl uppercase italic tracking-tighter text-white">POLIRRITMIA</span></button>)}
    </div>
  </div>
);

const ModeSelector = ({ onSelect }) => (
  <div className="flex flex-col items-center justify-center p-6 text-slate-900 font-sans text-center">
    <h2 className="text-5xl font-black mb-16 italic uppercase tracking-tighter text-slate-900 text-slate-900">Configuración</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-4xl w-full text-slate-900 font-black">
      <button onClick={() => onSelect('completo')} className="bg-white p-12 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border-b-12 border-slate-200 text-slate-900 text-slate-900"><div className="bg-indigo-100 p-6 rounded-full text-indigo-600 mx-auto mb-6 text-indigo-600"><ListMusic size={80} /></div><span className="text-4xl uppercase italic tracking-tighter block mb-2 text-slate-900">CANTO COMPLETO</span><p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-slate-400">Avance por evaluación</p></button>
      <button onClick={() => onSelect('seccion')} className="bg-white p-12 rounded-[3rem] shadow-2xl hover:scale-105 transition-all border-b-12 border-slate-200 text-slate-900 text-slate-900"><div className="bg-orange-100 p-6 rounded-full text-orange-600 mx-auto mb-6 text-orange-600"><FileText size={80} /></div><span className="text-4xl uppercase italic tracking-tighter block mb-2 text-slate-900">CANTA SECCIÓN</span><p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-slate-400">Estrofa al azar</p></button>
    </div>
  </div>
);

// ==========================================
// VISTA: CONTROL REMOTO (CELULAR)
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

  if (!appState) return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-10 font-sans text-center text-white"><Wifi size={40} className="mb-4 animate-pulse" /><p className="italic text-slate-500 font-black uppercase text-xs">Conectando...</p></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 flex flex-col items-center justify-center font-sans overflow-hidden">
      <div className="w-full max-w-md bg-slate-900 p-6 rounded-3xl border-2 border-slate-800 shadow-2xl relative text-center">
        <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
          <div className="text-[10px] font-black text-green-400 bg-green-950 px-4 py-2 rounded-full flex items-center gap-2 animate-pulse text-green-400"><Wifi size={12}/> {status}</div>
          <p className="text-[10px] font-black text-slate-500 uppercase italic">REMOTO MARQUITO</p>
        </div>

        <div className="space-y-8 animate-in fade-in">
          {appState.modoActual === 'mundial' ? (
              <div className="space-y-6">
                  {appState.gameState === 'slides' && (
                      <>
                          <div className="bg-white/5 border-2 border-dashed border-white/20 p-6 rounded-3xl mb-4 text-center">
                              <Presentation size={40} className="mx-auto mb-4 text-yellow-400" />
                              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Diapositiva</p>
                              <h3 className="text-white text-2xl font-black">{appState.slideActual} / {appState.slideTotal}</h3>
                          </div>
                          <button onClick={() => sendAction("AVANZAR_SLIDE")} className="w-full bg-yellow-500 text-white py-8 rounded-3xl font-black text-2xl shadow-lg border-b-8 border-yellow-700 active:scale-95 flex items-center justify-center gap-3">SIGUIENTE DIAPOSITIVA</button>
                          <button onClick={() => sendAction("RETROCEDER_SLIDE")} className="w-full bg-slate-700 text-white py-5 rounded-3xl font-black text-lg shadow-lg border-b-8 border-slate-900 active:scale-95 flex items-center justify-center gap-3"><SkipBack size={20}/> DIAPOSITIVA ANTERIOR</button>
                          <button onClick={() => sendAction("FINALIZAR_SLIDES")} className="w-full bg-red-600 text-white py-5 rounded-3xl font-black text-lg shadow-lg border-b-8 border-red-800 active:scale-95 flex items-center justify-center gap-3"><X size={20}/> FINALIZAR PRESENTACIÓN</button>
                      </>
                  )}
                  {appState.gameState === 'question_active' && (
                      <>
                          <div className="bg-white/5 border-2 border-dashed border-white/20 p-6 rounded-3xl mb-4 text-left">
                              <span className="text-6xl mb-4 block text-center animate-bounce">{appState.flagActual}</span>
                              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Pregunta:</p>
                              <h3 className="text-white text-xl font-bold mb-6">{appState.preguntaActual}</h3>
                              <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-1">Respuesta Esperada:</p>
                              <h3 className="text-green-300 text-lg font-bold">{appState.respuestaActual}</h3>
                          </div>
                          <button onClick={() => sendAction("TERMINAR_JUEGO")} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-xl shadow-lg border-b-8 border-blue-800 active:scale-95 flex items-center justify-center gap-3"><Flag size={24}/> TERMINAR JUEGO Y SORTEAR PENAL</button>
                      </>
                  )}
                  {appState.gameState === 'answering' && (
                      <>
                          <div className="bg-white/5 border-2 border-dashed border-white/20 p-6 rounded-3xl mb-4 text-left">
                              <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-1">Pateando el penal:</p>
                              <h3 className="text-white text-2xl font-black uppercase italic mb-4">{appState.estudianteActual}</h3>
                              <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-1">Respuesta Esperada:</p>
                              <h3 className="text-green-300 text-lg font-bold">{appState.respuestaActual}</h3>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                              <button onClick={() => sendAction("REVELAR")} className="w-full bg-slate-100 text-slate-900 py-5 rounded-3xl font-black text-lg shadow-lg border-b-8 border-slate-300 active:scale-95 flex items-center justify-center gap-3"><Eye size={22}/> MOSTRAR RESPUESTA</button>
                              <div className="grid grid-cols-2 gap-4">
                                  <button onClick={() => sendAction("GOL")} className="w-full bg-green-600 text-white py-8 rounded-3xl font-black text-2xl shadow-lg border-b-8 border-green-800 active:scale-95 flex items-center justify-center gap-2">⚽ ¡GOL!</button>
                                  <button onClick={() => sendAction("PALO")} className="w-full bg-red-600 text-white py-8 rounded-3xl font-black text-2xl shadow-lg border-b-8 border-red-800 active:scale-95 flex items-center justify-center gap-2">🥅 AL PALO</button>
                              </div>
                          </div>
                      </>
                  )}
                  {(appState.gameState === 'result_mundial' || appState.gameState === 'summary') && (
                      <button onClick={() => sendAction("SIGUIENTE_PREGUNTA")} className="w-full bg-yellow-500 text-white py-8 rounded-3xl font-black text-2xl shadow-lg border-b-8 border-yellow-700 active:scale-95 flex items-center justify-center gap-3"><Globe size={28}/> SIGUIENTE PREGUNTA</button>
                  )}
              </div>
          ) : appState.modoActual === 'polirritmia' ? (
              <div className="space-y-4 text-white">
                 <p className="text-center text-slate-500 font-black uppercase text-[10px] tracking-widest italic text-slate-500">EVALUACIÓN RÍTMICA</p>
                 <div className="grid grid-cols-2 gap-3">
                    {evalPol.map((row, idx) => (
                       <React.Fragment key={idx}>
                           <button onClick={() => toggleEval(idx, 'L')} className={`py-6 rounded-2xl font-black border-b-8 ${row.L ? 'bg-green-600 border-green-800 text-white' : 'bg-red-600 border-red-800 text-white'}`}>IZQ {idx + 1}</button>
                           <button onClick={() => toggleEval(idx, 'R')} className={`py-6 rounded-2xl font-black border-b-8 ${row.R ? 'bg-green-600 border-green-800 text-white' : 'bg-red-600 border-red-800 text-white'}`}>DER {idx + 1}</button>
                       </React.Fragment>
                    ))}
                 </div>
              </div>
          ) : (
              <div className="space-y-6 text-white">
                  {appState.palabraActual && appState.palabraActual !== "..." && (
                      <div className="bg-white/5 border-2 border-dashed border-white/20 p-6 rounded-3xl mb-4 animate-bounce">
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 text-white">SOPLO (Palabra oculta):</p>
                          <h3 className="text-white text-5xl font-black italic tracking-tighter uppercase text-white">{appState.palabraActual}</h3>
                      </div>
                  )}
                  <div className="grid grid-cols-1 gap-6">
                      <button onClick={() => sendAction("CORRECTO")} className="w-full bg-green-600 text-white py-14 rounded-5xl font-black text-4xl shadow-2xl border-b-[20px] border-green-800 active:scale-95 flex items-center justify-center gap-4 text-white"><ThumbsUp size={64} /> ¡BIEN!</button>
                      <button onClick={() => sendAction("ERROR")} className="w-full bg-red-600 text-white py-14 rounded-5xl font-black text-4xl shadow-2xl border-b-[20px] border-red-800 active:scale-95 flex items-center justify-center gap-4 text-white"><ThumbsDown size={64} /> ERROR</button>
                  </div>
              </div>
          )}
        </div>
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
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [mundialResultType, setMundialResultType] = useState(null);
  const [slideMode, setSlideMode] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  const audioRef = useRef(null);
  const lastProcessedMsgId = useRef(""); 
  const turnStartTime = useRef(Date.now());
  const lyricsContainerRef = useRef(null);

  // Auto-scroll basado en la LÍNEA activa
  useEffect(() => {
      const activeElement = document.getElementById(`line-${activeLineIdx}`);
      if (activeElement && lyricsContainerRef.current) {
          activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  }, [activeLineIdx]);

  // Soplo al Celular
  useEffect(() => {
    if (modo === 'mundial' && slideMode) {
        update(ref(db, 'estado'), { gameState: 'slides', slideActual: slideIndex + 1, slideTotal: MUNDIAL_SLIDES.length });
    } else if (modo === 'mundial' && ['question_active', 'answering', 'result_mundial', 'summary'].includes(gameState)) {
        update(ref(db, 'estado'), {
            gameState,
            preguntaActual: currentQuestion?.question || "",
            respuestaActual: currentQuestion?.answer || "",
            flagActual: currentQuestion?.flag || "",
            estudianteActual: selectedStudent?.name || ""
        });
    } else if (gameState === 'playing' && currentSectionData && modo !== 'polirritmia') {
        let currentWord = "...";
        let found = false;
        currentSectionData.lines.forEach(line => {
            line.forEach(w => {
                if (!found && w.isHidden && !w.isRevealed) {
                    currentWord = w.text;
                    found = true;
                }
            });
        });
        update(ref(db, 'estado'), { palabraActual: currentWord });
    }
  }, [currentSectionData, gameState, modo, currentQuestion, slideMode, slideIndex]);

  const handleWordValidation = useCallback((input) => {
    if (!currentSectionData || gameState !== 'playing') return;
    
    let wordProcessed = false;

    setCurrentSectionData(prev => {
        if (!prev) return prev;
        
        let newLines = [...prev.lines];
        let foundInThisLine = false;

        newLines = newLines.map((line, lIdx) => {
            return line.map(w => {
                if (!wordProcessed && w.isHidden && !w.isRevealed) {
                    wordProcessed = true;
                    foundInThisLine = true;
                    let isCorrect = input === "CORRECTO";
                    return { ...w, isRevealed: true, status: isCorrect ? 'correct' : 'wrong' };
                }
                return w;
            });
        });

        // Verificamos si la línea actual se completó para mover el scroll
        const currentLine = newLines[activeLineIdx];
        const lineComplete = currentLine.every(w => !w.isHidden || w.isRevealed);
        
        if (lineComplete && activeLineIdx < newLines.length - 1) {
            setActiveLineIdx(prevIdx => prevIdx + 1);
        }

        return { ...prev, lines: newLines };
    });
  }, [currentSectionData, gameState, activeLineIdx]);

  const questionBank = curso === "1° Básico" ? MUNDIAL_QUESTIONS_1BASICO : MUNDIAL_QUESTIONS;

  const startSpinFlag = () => {
    if (isSpinning) return;
    remove(ref(db, 'remoto/mensaje'));
    setIsSpinning(true); setGameState('spinning_flag');
    let count = 0;
    const maxTicks = 30;
    const interval = setInterval(() => {
        setCurrentQuestion(questionBank[Math.floor(Math.random() * questionBank.length)]);
        if (count >= maxTicks) {
            clearInterval(interval);
            setCurrentQuestion(questionBank[Math.floor(Math.random() * questionBank.length)]);
            setIsAnswerRevealed(false);
            setGameState('question_active');
            setIsSpinning(false);
        }
        count++;
    }, 80);
  };

  const startSpinStudent = useCallback(() => {
    const available = students.filter(s => !s.played);
    if (available.length === 0) return;
    remove(ref(db, 'remoto/mensaje'));
    setIsSpinning(true); setGameState('spinning_student');
    let count = 0;
    const maxTicks = 40;
    const pool = shuffleArray([...available]);
    const interval = setInterval(() => {
        const studentIndex = Math.floor(Math.random() * pool.length);
        setSelectedStudent(pool[studentIndex]);
        if (count >= maxTicks) {
            clearInterval(interval);
            setSelectedStudent(pool[Math.floor(Math.random() * pool.length)]);
            setIsAnswerRevealed(false);
            setGameState('answering');
            setIsSpinning(false);
        }
        count++;
    }, 70);
  }, [students]);

  const startSpin = () => {
    if (modo === 'mundial') { startSpinFlag(); return; }
    const available = students.filter(s => !s.played);
    if (isSpinning || available.length === 0) return;
    setIsSpinning(true); setGameState('spinning');
    let count = 0;
    const maxTicks = 40;

    // Barajado inicial para azar total REAL
    const pool = shuffleArray([...available]);

    const interval = setInterval(() => {
        const studentIndex = Math.floor(Math.random() * pool.length);
        setSelectedStudent(pool[studentIndex]);
        if (count >= maxTicks) {
            clearInterval(interval);
            // Selección final pura aleatoria
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

  const savePoints = useCallback((overrideScore = null) => {
    let finalScore;
    if (overrideScore !== null) {
        finalScore = overrideScore;
    } else if (modo === 'polirritmia') {
        finalScore = Math.round((evalPol.reduce((acc, r) => acc + (r.L?1:0) + (r.R?1:0), 0) / 8) * 100);
    } else {
        let total = 0, correct = 0;
        currentSectionData?.lines.forEach(l => l.forEach(w => { if (w.isHidden) { total++; if (w.status === 'correct') correct++; } }));
        finalScore = total > 0 ? Math.round((correct / total) * 100) : 100;
    }
    const cursoPath = curso.replace(/ /g, "_").toLowerCase();
    const studentIdx = NOMBRES_ESTUDIANTES[curso].indexOf(selectedStudent.name);
    if (studentIdx !== -1) {
        update(ref(db, `cursos/${cursoPath}/estudiantes/${studentIdx}`), { points: finalScore, played: true });
    }
    setSessionPoints(finalScore); setGameState('summary');
  }, [modo, evalPol, currentSectionData, curso, selectedStudent]);

  const showResultMundial = useCallback((type) => {
    const finalScore = type === 'gol' ? 100 : 0;
    setMundialResultType(type);
    setGameState('result_mundial');

    const cursoPath = curso.replace(/ /g, "_").toLowerCase();
    const studentIdx = NOMBRES_ESTUDIANTES[curso].indexOf(selectedStudent.name);
    if (studentIdx !== -1) {
        update(ref(db, `cursos/${cursoPath}/estudiantes/${studentIdx}`), { points: finalScore, played: true });
    }
    setSessionPoints(finalScore);

    setTimeout(() => setGameState('summary'), 3000);
  }, [curso, selectedStudent]);

  useEffect(() => {
    update(ref(db, 'estado'), { cursoActual: curso, modoActual: modo, gameState: 'lobby' });
    remove(ref(db, 'remoto/mensaje'));
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

  const startSlides = () => {
    remove(ref(db, 'remoto/mensaje'));
    setSlideIndex(0);
    setSlideMode(true);
  };

  const advanceSlide = useCallback(() => {
    setSlideIndex(prev => {
        if (prev >= MUNDIAL_SLIDES.length - 1) {
            setSlideMode(false);
            return 0;
        }
        return prev + 1;
    });
  }, []);

  const retreatSlide = useCallback(() => {
    setSlideIndex(prev => Math.max(0, prev - 1));
  }, []);

  const endSlides = useCallback(() => {
    remove(ref(db, 'remoto/mensaje'));
    setSlideMode(false);
    setSlideIndex(0);
  }, []);

  // Refs siempre actualizadas para evitar closures obsoletas dentro del listener único de abajo
  const modoRef = useRef(modo);
  const handleWordValidationRef = useRef(handleWordValidation);
  const showResultMundialRef = useRef(showResultMundial);
  const startSpinStudentRef = useRef(startSpinStudent);
  const startSpinFlagRef = useRef(startSpinFlag);
  const advanceSlideRef = useRef(advanceSlide);
  const retreatSlideRef = useRef(retreatSlide);
  const endSlidesRef = useRef(endSlides);
  useEffect(() => { modoRef.current = modo; }, [modo]);
  useEffect(() => { handleWordValidationRef.current = handleWordValidation; }, [handleWordValidation]);
  useEffect(() => { showResultMundialRef.current = showResultMundial; }, [showResultMundial]);
  useEffect(() => { startSpinStudentRef.current = startSpinStudent; }, [startSpinStudent]);
  useEffect(() => { startSpinFlagRef.current = startSpinFlag; });
  useEffect(() => { advanceSlideRef.current = advanceSlide; }, [advanceSlide]);
  useEffect(() => { retreatSlideRef.current = retreatSlide; }, [retreatSlide]);
  useEffect(() => { endSlidesRef.current = endSlides; }, [endSlides]);

  const hasSyncedInitialMsg = useRef(false);

  useEffect(() => {
    const unsubEval = onValue(ref(db, 'remoto/evalPol'), (snap) => { if(snap.val()) setEvalPol(snap.val()); });
    const unsubMsg = onValue(ref(db, 'remoto/mensaje'), (snapshot) => {
      const data = snapshot.val();

      // Al montar, ignora cualquier mensaje ya existente (de una sesión anterior) en vez de re-ejecutarlo.
      if (!hasSyncedInitialMsg.current) {
        hasSyncedInitialMsg.current = true;
        lastProcessedMsgId.current = data?.timestamp || "";
        return;
      }

      if (data && data.timestamp && data.timestamp !== lastProcessedMsgId.current) {
        lastProcessedMsgId.current = data.timestamp;
        if (modoRef.current === 'mundial') {
            if (data.texto === "AVANZAR_SLIDE") advanceSlideRef.current();
            else if (data.texto === "RETROCEDER_SLIDE") retreatSlideRef.current();
            else if (data.texto === "FINALIZAR_SLIDES") endSlidesRef.current();
            else if (data.texto === "TERMINAR_JUEGO") startSpinStudentRef.current();
            else if (data.texto === "REVELAR") setIsAnswerRevealed(true);
            else if (data.texto === "SIGUIENTE_PREGUNTA") { setSelectedStudent(null); startSpinFlagRef.current(); }
            else if (data.texto === "GOL") showResultMundialRef.current('gol');
            else if (data.texto === "PALO") showResultMundialRef.current('palo');
        } else {
            handleWordValidationRef.current(data.texto);
        }
      }
    });
    return () => { unsubEval(); unsubMsg(); };
  }, []);

  return (
    <div className="flex flex-col h-full text-slate-900">
      <audio ref={audioRef} src={modo === 'himno' ? "/himno.mp3" : "/Voy Navegando, Navegando.mp3"} onEnded={() => setIsAudioPlaying(false)} />
      
      {modo === 'mundial' && slideMode && (
          <div className="fixed inset-0 z-[9999] flex flex-col text-center overflow-hidden animate-in fade-in duration-300 bg-slate-950 p-6 sm:p-10">
              <div key={slideIndex} className="flex-1 min-h-0 flex flex-col items-center justify-center animate-in zoom-in">
                  <p className="text-yellow-500 text-lg sm:text-xl font-black uppercase tracking-[0.3em] italic mb-6 sm:mb-10">
                      {MUNDIAL_SLIDES[slideIndex]?.title}
                  </p>
                  <p className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight max-w-6xl px-4">
                      {MUNDIAL_SLIDES[slideIndex]?.body}
                  </p>
              </div>
              <div className="pt-6 text-slate-500 text-sm font-black uppercase tracking-[0.4em] italic">
                  Diapositiva {slideIndex + 1} / {MUNDIAL_SLIDES.length}
              </div>
          </div>
      )}

      {modo === 'mundial' && ['question_active', 'answering', 'result_mundial'].includes(gameState) && (
          <div className={`fixed inset-0 z-[9999] flex flex-col text-center overflow-hidden animate-in fade-in duration-300 ${gameState === 'result_mundial' ? (mundialResultType === 'gol' ? 'bg-green-600' : 'bg-red-600') : 'bg-slate-950'}`}>
              <div className="flex-1 flex flex-col items-center justify-center py-[10vh] px-6">
                  {gameState === 'result_mundial' ? (
                      <div className="animate-in zoom-in text-white">
                          <div className="text-[12rem] mb-10 drop-shadow-2xl animate-bounce leading-none">{mundialResultType === 'gol' ? '⚽' : '🥅'}</div>
                          <h2 className="text-6xl sm:text-[8rem] font-black uppercase italic tracking-tighter drop-shadow-2xl">{mundialResultType === 'gol' ? '¡GOLAZO!' : '¡AL PALO!'}</h2>
                          <p className="text-3xl font-black uppercase italic mt-8 opacity-80">{selectedStudent?.name}</p>
                      </div>
                  ) : (
                      <div className="max-w-5xl mx-auto animate-in zoom-in">
                          <div className="text-[10rem] mb-4 animate-bounce leading-none">{currentQuestion?.flag}</div>
                          {gameState === 'answering' && (
                              <div className="bg-blue-600/30 border-4 border-blue-500/50 rounded-full px-12 py-4 mb-8 inline-block animate-in slide-in-from-top">
                                  <span className="text-white text-2xl sm:text-3xl font-black uppercase italic tracking-widest">Penal para: <span className="text-yellow-400">{selectedStudent?.name}</span></span>
                              </div>
                          )}
                          <h2 className="text-5xl sm:text-6xl font-black text-white mb-16 leading-tight tracking-tight px-10">
                              {currentQuestion?.question}
                          </h2>
                          {gameState === 'question_active' && (
                              <div className="bg-white/5 border-4 border-dashed border-white/20 text-slate-400 p-12 rounded-[3rem] animate-pulse">
                                  <p className="text-2xl font-black uppercase tracking-widest italic">{curso === "1° Básico" ? "Dibuja tu respuesta en el cuaderno ✏️" : "Anota tu respuesta en el cuaderno 📝"}</p>
                              </div>
                          )}
                          {gameState === 'answering' && isAnswerRevealed && (
                              <div className="bg-green-500/20 border-4 border-green-500 text-green-300 p-10 rounded-[3rem] animate-in slide-in-from-bottom shadow-2xl">
                                  <h3 className="text-xl font-black uppercase tracking-[0.5em] mb-4 opacity-70">{curso === "1° Básico" ? "Idea de Respuesta" : "Respuesta Correcta"}</h3>
                                  <p className="text-4xl sm:text-5xl font-bold">{currentQuestion?.answer}</p>
                              </div>
                          )}
                      </div>
                  )}
              </div>
          </div>
      )}

      {isAudioPlaying && singingMode === 'completo' && (
          <div className="fixed inset-0 bg-slate-950 z-[9999] flex flex-col text-center overflow-hidden animate-in fade-in">
              <button onClick={() => { if(audioRef.current){audioRef.current.pause(); audioRef.current.currentTime=0;} setIsAudioPlaying(false); }} className="absolute top-8 right-8 text-white/20 hover:text-white p-4 z-[10001] transition-all"><X size={64}/></button>
              <div ref={lyricsContainerRef} className="flex-1 overflow-y-auto scrollbar-hide py-[45vh]">
                  <div className="max-w-7xl mx-auto space-y-12">
                  {currentSectionData?.lines.map((line, lIdx) => {
                      const active = lIdx === activeLineIdx;
                      return (
                          <div key={lIdx} id={`line-${lIdx}`} className={`transition-all duration-1000 px-10 ${active ? 'scale-110 opacity-100' : 'opacity-10'}`}>
                              <p className="text-4xl sm:text-[7vh] font-black flex flex-wrap gap-x-8 justify-center leading-tight tracking-tight text-white">
                                  {line.map((word, wIdx) => (
                                      <span key={wIdx} className={word.isHidden ? (word.isRevealed ? (word.status === 'correct' ? 'text-green-500' : 'text-red-500 opacity-50 line-through') : 'text-transparent border-b-[10px] border-white/20 min-w-[8rem]') : ''}>{word.text}</span>
                                  ))}
                              </p>
                          </div>
                      );
                  })}
                  </div>
              </div>
          </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 order-1">
          {gameState === 'lobby' && modo === 'mundial' && (
            <div className="space-y-8 animate-in zoom-in">
              <button onClick={startSlides} className="w-full text-white text-xl sm:text-2xl font-black px-12 py-8 rounded-[3rem] border-b-8 shadow-2xl active:scale-95 transition-all bg-slate-800 border-slate-950 uppercase italic flex items-center justify-center gap-4"><Presentation size={32}/> VER DIAPOSITIVAS</button>
              <div className="bg-white rounded-[4rem] p-24 text-center shadow-2xl border flex flex-col items-center justify-center min-h-[600px]">
                <div className="bg-yellow-100 p-12 rounded-full mb-10 text-yellow-600"><Globe size={120} /></div>
                <h2 className="text-5xl font-black text-slate-900 mb-16 uppercase italic">¿Qué bandera sale?</h2>
                <button onClick={startSpin} className="text-white text-3xl font-black px-20 py-10 rounded-[3rem] border-b-18 shadow-2xl active:scale-95 transition-all bg-yellow-500 border-yellow-700 uppercase italic">GIRAR RULETA DE PREGUNTAS</button>
              </div>
            </div>
          )}

          {gameState === 'lobby' && modo !== 'mundial' && (
            <div className="bg-white rounded-[4rem] p-24 text-center shadow-2xl border flex flex-col items-center justify-center min-h-[600px] animate-in zoom-in">
              <Star size={120} className="text-red-600 animate-pulse mb-10" fill="currentColor" />
              <h2 className="text-5xl font-black text-slate-900 mb-16 uppercase italic">¿Quién pasa?</h2>
              <button onClick={startSpin} className="text-white text-3xl font-black px-20 py-10 rounded-[3rem] border-b-18 shadow-2xl active:scale-95 transition-all bg-red-600 border-red-900 uppercase italic">GIRAR RULETA</button>
            </div>
          )}

          {gameState === 'spinning' && (
            <div className="bg-slate-900 rounded-[4rem] p-24 text-center flex flex-col items-center justify-center min-h-[600px] border-15 border-slate-800 text-white">
              <h2 key={selectedStudent?.id} className="text-[6rem] font-black italic tracking-tighter animate-in fade-in zoom-in duration-75 uppercase truncate w-full px-10">{selectedStudent?.name}</h2>
            </div>
          )}

          {gameState === 'spinning_flag' && (
            <div className="bg-blue-950 rounded-[4rem] p-24 text-center flex flex-col items-center justify-center min-h-[600px] border-15 border-blue-900 text-white overflow-hidden">
              <h2 key={currentQuestion?.country} className="text-[10rem] animate-in fade-in zoom-in duration-75">{currentQuestion?.flag}</h2>
            </div>
          )}

          {gameState === 'spinning_student' && (
            <div className="bg-slate-900 rounded-[4rem] p-24 text-center flex flex-col items-center justify-center min-h-[600px] border-15 border-slate-800 text-white">
              <h2 key={selectedStudent?.id} className="text-[6rem] font-black italic tracking-tighter animate-in fade-in zoom-in duration-75 uppercase truncate w-full px-10">{selectedStudent?.name}</h2>
            </div>
          )}

          {gameState === 'announced' && (
            <div className={`rounded-[4rem] p-20 text-center text-white shadow-2xl flex flex-col items-center justify-center min-h-[600px] border-b-20 ${modo === 'himno' ? 'bg-red-600 border-red-900' : 'bg-green-600 border-green-900'}`}>
              <p className="text-2xl font-bold opacity-70 uppercase tracking-widest mb-16 italic">Turno de:</p>
              <h2 className="text-7xl font-black mb-20 drop-shadow-2xl uppercase italic">{selectedStudent?.name}</h2>
              <button onClick={startTurn} className="bg-white text-slate-900 px-16 py-10 rounded-3xl font-black text-5xl shadow-2xl hover:scale-105 transition-all italic uppercase">¡A JUGAR!</button>
            </div>
          )}

          {gameState === 'question_active' && modo === 'mundial' && (
            <div className="bg-white p-12 sm:p-20 rounded-[4rem] shadow-2xl border min-h-[600px] text-center flex flex-col items-center justify-center gap-10">
                <div className="bg-yellow-100 p-6 rounded-full text-yellow-600 mb-2 mx-auto w-fit"><Globe size={60} /></div>
                <h3 className="text-3xl font-black uppercase italic">Pregunta {currentQuestion?.flag} en pantalla grande</h3>
                <p className="text-2xl font-black uppercase tracking-widest italic text-slate-400">Cuando terminen de responder, presiona "Terminar Juego" en tu celular para sortear quién patea el penal.</p>
            </div>
          )}

          {gameState === 'answering' && modo === 'mundial' && (
            <div className="bg-white p-12 sm:p-20 rounded-[4rem] shadow-2xl border min-h-[600px] text-center flex flex-col items-center justify-center gap-10">
                <div className="bg-blue-100 p-6 rounded-full text-blue-600 mb-2 mx-auto w-fit"><Flag size={60} /></div>
                <h3 className="text-4xl sm:text-5xl font-black uppercase italic truncate">{selectedStudent?.name}</h3>
                <p className="text-2xl font-black uppercase tracking-widest italic text-slate-400">Pateando el penal en pantalla grande</p>
            </div>
          )}

          {gameState === 'result_mundial' && modo === 'mundial' && (
            <div className={`rounded-[4rem] p-20 text-center text-white shadow-2xl flex flex-col items-center justify-center min-h-[600px] border-b-20 ${mundialResultType === 'gol' ? 'bg-green-600 border-green-900' : 'bg-red-600 border-red-900'}`}>
              <div className="text-9xl mb-8">{mundialResultType === 'gol' ? '⚽' : '🥅'}</div>
              <h2 className="text-6xl font-black uppercase italic">{mundialResultType === 'gol' ? '¡GOLAZO!' : '¡AL PALO!'}</h2>
            </div>
          )}

          {gameState === 'playing' && modo !== 'mundial' && (
            <div className="space-y-12 animate-in fade-in">
              <div className={`p-10 rounded-[3.5rem] flex justify-between items-center border-b-8 shadow-2xl ${modo === 'himno' ? 'bg-slate-900 border-red-600' : 'bg-slate-900 border-green-600'}`}>
                <div className="flex items-center gap-10 text-white">
                    <div className={`${modo === 'himno' ? 'bg-red-600' : 'bg-green-600'} w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl`}>{(modo === 'himno' ? <Music size={56} /> : <Mic size={56}/>)}</div>
                    <div><h3 className="text-4xl sm:text-6xl font-black uppercase italic truncate">{selectedStudent?.name}</h3><span className="text-[10px] font-black uppercase opacity-60 tracking-widest">Control Manual de Avance</span></div>
                </div>
                {singingMode === 'completo' && (<button onClick={() => { if(audioRef.current) { audioRef.current.play(); setIsAudioPlaying(true); } }} className="bg-green-600 text-white p-8 rounded-full border-b-8 border-green-800 hover:scale-110 active:scale-95 transition-all"><PlayCircle size={48}/></button>)}
              </div>

              {modo === 'polirritmia' ? (
                <div className="bg-white p-12 sm:p-20 rounded-[4rem] shadow-2xl border flex flex-col gap-8 text-slate-900">
                    {polyrhythmRows.map((row, rIdx) => (
                        <div key={rIdx} className="flex gap-6 border-b border-slate-100 last:border-0 pb-8 last:pb-0 animate-in slide-in-from-bottom">
                            <div className="bg-slate-800 text-white w-12 h-12 flex items-center justify-center font-black rounded-2xl text-xl shadow-md">{rIdx + 1}</div>
                            <div className={`flex-1 p-6 rounded-[2.5rem] border-4 flex items-center gap-4 transition-all ${evalPol[rIdx]?.L === true ? 'bg-green-50 border-green-500' : evalPol[rIdx]?.L === false ? 'bg-red-50 border-red-500' : 'bg-slate-50 border-slate-200'}`}>
                                <Hand className="text-blue-600 -scale-x-100" size={40}/><div className="flex gap-2 overflow-x-auto">{row.left.map((fig, i) => <MusicNote key={i} type={fig.type} color="#2563eb" />)}</div>
                            </div>
                            <div className={`flex-1 p-6 rounded-[2.5rem] border-4 flex items-center gap-4 transition-all ${evalPol[rIdx]?.R === true ? 'bg-green-50 border-green-500' : evalPol[rIdx]?.R === false ? 'bg-red-50 border-red-500' : 'bg-slate-50 border-slate-200'}`}>
                                <Hand className="text-red-600" size={40}/><div className="flex gap-2 overflow-x-auto">{row.right.map((fig, i) => <MusicNote key={i} type={fig.type} color="#dc2626" />)}</div>
                            </div>
                        </div>
                    ))}
                </div>
              ) : (
                <div className="bg-white p-12 sm:p-20 rounded-[4rem] shadow-2xl border min-h-[450px] text-center">
                   <h4 className="font-black text-sm uppercase tracking-widest flex items-center gap-4 animate-pulse justify-center text-red-600 mb-10"><div className="w-3 h-3 rounded-full bg-red-600"></div> {currentSectionData?.title}</h4>
                   <div ref={lyricsContainerRef} className="max-h-[500px] overflow-y-auto scrollbar-hide space-y-12">
                   {currentSectionData?.lines.map((line, lIdx) => (
                      <div key={lIdx} id={`line-${lIdx}`} className={`transition-all duration-700 ${lIdx === activeLineIdx ? 'scale-105 opacity-100' : 'scale-90 opacity-20 blur-[1px]'}`}>
                          <p className="text-3xl sm:text-5xl font-black flex flex-wrap gap-x-6 justify-center leading-tight">
                              {line.map((word, wIdx) => (<span key={wIdx} className={word.isHidden ? (word.isRevealed ? (word.status === 'correct' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50 line-through opacity-50') : 'bg-slate-100 text-transparent border-b-4 border-slate-200 min-w-[5rem]') : 'text-slate-800'}>{word.text}</span>))}
                          </p>
                      </div>
                   ))}
                   </div>
                </div>
              )}

              <button onClick={() => savePoints()} className={`w-full py-10 rounded-[3rem] font-black text-3xl sm:text-5xl border-b-15 shadow-2xl transition-all italic uppercase text-white ${modo === 'himno' ? 'bg-red-600 border-red-900' : 'bg-blue-600 border-blue-900'}`}>Finalizar Turno</button>
            </div>
          )}

          {gameState === 'summary' && (
            <div className="bg-white rounded-[5rem] p-16 text-center shadow-2xl min-h-[600px] border animate-in zoom-in border-slate-100">
              <Award size={150} className="text-yellow-500 mb-12 mx-auto animate-bounce" />
              <h2 className="text-6xl font-black text-slate-900 mb-12 uppercase italic leading-none">{selectedStudent?.name}</h2>
              <div className="bg-red-600 text-white px-20 py-10 rounded-[4rem] text-[8rem] font-mono font-black mb-16 shadow-2xl leading-none">{sessionPoints}</div>
              {modo === 'mundial' ? (
                <button onClick={() => { setSelectedStudent(null); startSpinFlag(); }} className="bg-yellow-500 text-white px-20 py-10 rounded-2xl font-black text-4xl italic uppercase hover:scale-110 transition-transform border-b-8 border-yellow-700">Siguiente Pregunta</button>
              ) : (
                <button onClick={() => { setGameState('lobby'); setSelectedStudent(null); }} className="bg-slate-900 text-white px-20 py-10 rounded-2xl font-black text-4xl italic uppercase hover:scale-110 transition-transform">Siguiente</button>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 order-2 text-slate-900">
          <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden lg:sticky lg:top-32">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center border-b-8 border-red-600"><h3 className="font-black uppercase text-xl italic flex items-center gap-4"><Trophy className="text-yellow-400" size={32}/> RANKING</h3></div>
            <div className="max-h-125 lg:max-h-[750px] overflow-y-auto scrollbar-hide bg-white">
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