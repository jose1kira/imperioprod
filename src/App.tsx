import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Loader2, Image as ImageIcon, MonitorPlay, Speaker, Lightbulb, Keyboard, Drum, Mic, Wind, Disc3, Tent, Minus, Plus, Eye, Box, Calendar, Package, Wand2, ShoppingCart, Ticket, MapPin, Clock, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: import meta.env.VITE_API_KEY });

const EQUIPMENT_OPTIONS = [
  { id: 'luces', label: 'Luces Móviles', icon: Lightbulb },
  { id: 'pantallas', label: 'Pantallas LED', icon: MonitorPlay },
  { id: 'bateria', label: 'Batería Acústica', icon: Drum },
  { id: 'piano', label: 'Piano / Teclado', icon: Keyboard },
  { id: 'bafles', label: 'Sistema de Audio (Line Array)', icon: Speaker },
  { id: 'microfonos', label: 'Micrófonos', icon: Mic },
  { id: 'humo', label: 'Máquina de Humo', icon: Wind },
  { id: 'dj', label: 'Cabina DJ', icon: Disc3 },
  { id: 'truss', label: 'Estructura Truss', icon: Tent },
];

const THEMES = [
  'Boda Elegante',
  'Concierto de Rock',
  'Fiesta Electrónica (EDM)',
  'Evento Corporativo',
  'Fiesta Neón',
  'Festival al Aire Libre',
  'Teatro / Obra',
  'Desfile de Modas',
  'Conferencia / Charla TED',
  'Fiesta Temática de los 80s',
  'Cyberpunk / Futurista',
  'Concierto Acústico / Íntimo',
  'Gala de Premiación',
  'Set de Televisión'
];

const COLORS = [
  { id: 'azul', label: 'Azul Profundo', value: '#1e3a8a' },
  { id: 'rojo', label: 'Rojo Pasión', value: '#991b1b' },
  { id: 'morado', label: 'Morado Neón', value: '#6b21a8' },
  { id: 'dorado', label: 'Dorado Elegante', value: '#ca8a04' },
  { id: 'verde', label: 'Verde Esmeralda', value: '#065f46' },
  { id: 'naranja', label: 'Naranja Fuego', value: '#ea580c' },
  { id: 'rosa', label: 'Rosa / Magenta', value: '#db2777' },
  { id: 'cian', label: 'Cian / Hielo', value: '#06b6d4' },
  { id: 'blanco', label: 'Blanco Puro', value: '#f8fafc' },
  { id: 'ambar', label: 'Ámbar Cálido', value: '#d97706' },
  { id: 'monocromo', label: 'Blanco y Negro', value: '#52525b' },
  { id: 'multicolor', label: 'Multicolor', value: 'linear-gradient(to right, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7)' },
];

const COMBOS = [
  {
    id: 1,
    title: "Experiencia Neón",
    price: "$7.500.000",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
    equipment: ["4x Pantallas LED", "8x Luces Móviles", "2x Máquinas de Humo", "Sistema de Audio Line Array"]
  },
  {
    id: 2,
    title: "Festival Mainstage",
    price: "$10.200.000",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800",
    equipment: ["8x Pantallas LED", "16x Luces Móviles", "4x Láseres", "Estructura Truss Completa"]
  },
  {
    id: 3,
    title: "Gala Premium",
    price: "$12.800.000",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
    equipment: ["6x Pantallas LED", "12x Luces Móviles", "Tarima VIP", "Iluminación Arquitectónica"]
  }
];

const UPCOMING_EVENTS = [
  {
    id: 1,
    title: "Sunset Electronic Fest",
    date: "15 de Abril, 2026",
    location: "Playa Central",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=800",
    status: "Montaje en progreso"
  },
  {
    id: 2,
    title: "Conferencia Tech Future",
    date: "22 de Mayo, 2026",
    location: "Centro de Convenciones",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800",
    status: "Planificación"
  },
  {
    id: 3,
    title: "Premios Nacionales de Música",
    date: "10 de Junio, 2026",
    location: "Teatro Metropolitano",
    image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800",
    status: "Confirmado"
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [currentView, setCurrentView] = useState<'generator' | 'experiencias' | 'events'>('generator');

  const [equipmentQuantities, setEquipmentQuantities] = useState<Record<string, number>>({
    luces: 4,
    bafles: 2
  });
  const [selectedTheme, setSelectedTheme] = useState<string>(THEMES[0]);
  const [selectedColor, setSelectedColor] = useState<string>(COLORS[0].label);
  
  const [generatedImages, setGeneratedImages] = useState<{ frontal: string | null, cenital: string | null }>({ frontal: null, cenital: null });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const updateQuantity = (id: string, delta: number) => {
    setEquipmentQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const totalItems = Object.values(equipmentQuantities).reduce((a: number, b: number) => a + b, 0);

  const handleGenerate = async () => {
    if (totalItems === 0) {
      setError("Por favor selecciona al menos un equipo.");
      return;
    }

    setIsGenerating(true);
    setGenerationStep('Diseñando distribución espacial (1/2)...');
    setError(null);
    setGeneratedImages({ frontal: null, cenital: null });

    try {
      const equipmentNames = Object.entries(equipmentQuantities)
        .map(([id, qty]) => {
          const eq = EQUIPMENT_OPTIONS.find(e => e.id === id);
          return `${qty}x ${eq?.label}`;
        })
        .join(', ');
      
      // 1. Generate Layout Description using a text model
      const layoutPrompt = `Eres un director de arte y diseñador de escenarios. Diseña la distribución espacial exacta para un escenario con temática "${selectedTheme}" usando EXACTAMENTE estos equipos: ${equipmentNames}.
Describe con precisión geométrica dónde está ubicado cada elemento en el escenario (ej. "Las 2 pantallas LED están a los lados izquierdo y derecho, las 4 luces móviles están en el borde frontal equidistantes...").
Sé muy conciso, máximo 4 líneas. Esta descripción se usará para renderizar las vistas.`;

      const layoutResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: layoutPrompt
      });
      const layoutDescription = layoutResponse.text;

      setGenerationStep('Renderizando vistas coherentes simultáneamente (2/2)...');

      // 2. Generate Images in Parallel using the layout description
      const frontalPrompt = `Una imagen fotorrealista de alta calidad de un escenario para un evento. 
Ángulo de cámara: Vista frontal espectacular desde la perspectiva de la audiencia mirando hacia el escenario.
DISTRIBUCIÓN ESPACIAL ESTRICTA: ${layoutDescription}
REGLA ABSOLUTA Y ESTRICTA: El escenario DEBE incluir EXACTAMENTE los siguientes equipos en estas cantidades precisas: ${equipmentNames}. 
ES CRUCIAL QUE EL NÚMERO DE ELEMENTOS SEA EXACTO. Si dice "2x Pantallas LED", solo debe haber 2 pantallas en toda la imagen. Si dice "4x Luces Móviles", solo dibuja 4 luces. Cuenta cuidadosamente cada elemento. No agregues ni un elemento más, ni un elemento menos de los solicitados.
El esquema de iluminación y color general debe ser predominantemente: ${selectedColor}. 
La temática y atmósfera del evento es: ${selectedTheme}. 
El escenario debe verse profesional, listo para un show, con iluminación dramática y alto valor de producción. Sin personas en la imagen, solo el escenario y los equipos.`;

      const cenitalPrompt = `Un dibujo técnico, plano o bosquejo (sketch) arquitectónico de un escenario para un evento.
Ángulo de cámara: Vista cenital estricta (plano de planta, top-down bird's-eye view) directamente desde arriba mirando hacia abajo al escenario.
DISTRIBUCIÓN ESPACIAL ESTRICTA: ${layoutDescription}
REGLA ABSOLUTA Y ESTRICTA: El plano DEBE mostrar la distribución de EXACTAMENTE los siguientes equipos en estas cantidades precisas: ${equipmentNames}. 
ES CRUCIAL QUE EL NÚMERO DE ELEMENTOS SEA EXACTO. Si dice "2x Pantallas LED", solo debe haber 2 pantallas en todo el dibujo. Si dice "4x Luces Móviles", solo dibuja 4 luces. Cuenta cuidadosamente cada elemento. No agregues ni un elemento más, ni un elemento menos de los solicitados.
La temática del evento es: ${selectedTheme}.
El estilo debe ser un boceto a mano alzada o un plano técnico claro (blueprint), mostrando la disposición espacial de los equipos. Sin personas en el dibujo, solo el escenario y los equipos vistos desde arriba.`;

      const [frontalResponse, cenitalResponse] = await Promise.all([
        ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: frontalPrompt,
          config: {
            imageConfig: {
              aspectRatio: "16:9"
            }
          }
        }),
        ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: cenitalPrompt,
          config: {
            imageConfig: {
              aspectRatio: "16:9"
            }
          }
        })
      ]);

      let frontalUrl = null;
      for (const part of frontalResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          frontalUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      let cenitalUrl = null;
      for (const part of cenitalResponse.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          cenitalUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (frontalUrl && cenitalUrl) {
        setGeneratedImages({ frontal: frontalUrl, cenital: cenitalUrl });
      } else {
        throw new Error("No se pudieron generar las imágenes.");
      }
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al generar las imágenes. Intenta de nuevo.");
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Andres' && password === 'aideas') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Usuario o contraseña incorrectos');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 selection:bg-indigo-500/30">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-indigo-500/20 blur-[60px] pointer-events-none" />
          
          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center mb-5 border border-zinc-800 shadow-inner">
              <Tent className="text-indigo-500" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white text-center tracking-tight">AiDeas para Imperio Producciones</h1>
            <p className="text-zinc-400 text-sm mt-2">Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-3.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-600"
                placeholder="Ingresa tu usuario"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-3.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-600"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <AnimatePresence>
              {loginError && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs text-center font-medium"
                >
                  {loginError}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] active:scale-[0.98]"
            >
              <Lock size={16} />
              Acceder
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-indigo-500/30">
      {/* Top Navigation */}
      <nav className="w-full bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 z-30 shrink-0">
        <div className="flex items-center gap-2">
          <Tent className="text-indigo-500" size={24} />
          <span className="text-xl font-bold text-white tracking-tight">AiDeas Imperios</span>
        </div>
        <div className="flex items-center gap-1 bg-zinc-950/50 p-1 rounded-xl border border-zinc-800 overflow-x-auto w-full sm:w-auto">
          <button 
            onClick={() => setCurrentView('generator')} 
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap ${currentView === 'generator' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Wand2 size={16} /> Generador
          </button>
          <button 
            onClick={() => setCurrentView('experiencias')} 
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap ${currentView === 'experiencias' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Package size={16} /> Combos
          </button>
          <button 
            onClick={() => setCurrentView('events')} 
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap ${currentView === 'events' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Calendar size={16} /> Eventos
          </button>
        </div>
        <div className="w-8 hidden sm:block"></div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {currentView === 'generator' && (
          <>
            {/* Left Panel - Controls */}
            <div className="w-full md:w-[450px] lg:w-[500px] bg-zinc-900 border-r border-zinc-800 p-6 md:p-8 overflow-y-auto flex flex-col gap-8 z-20 shadow-2xl shrink-0">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-2">
                  <Wand2 className="text-indigo-500" size={28} />
                  Generador Experiencias 
                </h1>
                <p className="text-sm text-zinc-400">Diseñador de Entables Audiovisuales</p>
              </div>

        {/* Equipment Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">1. Equipos</h2>
            <span className="text-xs text-zinc-500">{totalItems} en total</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EQUIPMENT_OPTIONS.map(eq => {
              const qty = equipmentQuantities[eq.id] || 0;
              const isSelected = qty > 0;
              const Icon = eq.icon;
              return (
                <div
                  key={eq.id}
                  className={`flex flex-col gap-3 p-3 rounded-xl border transition-all duration-200 ${
                    isSelected 
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]' 
                      : 'bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={18} className={isSelected ? "text-indigo-400" : "text-zinc-500"} />
                    <span className="text-xs font-medium leading-tight">{eq.label}</span>
                  </div>
                  <div className="flex items-center justify-between bg-zinc-900/80 rounded-lg p-1 border border-zinc-800 w-full">
                    <button 
                      onClick={() => updateQuantity(eq.id, -1)}
                      disabled={qty === 0}
                      className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-zinc-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-mono w-4 text-center text-zinc-200">{qty}</span>
                    <button 
                      onClick={() => updateQuantity(eq.id, 1)}
                      className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-zinc-700 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Theme Selection */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">2. Temática</h2>
          <div className="relative">
            <select 
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value)}
              className="w-full bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-3.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none cursor-pointer"
            >
              {THEMES.map(theme => (
                <option key={theme} value={theme} className="bg-zinc-900">{theme}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">3. Color Principal</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {COLORS.map(color => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.label)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                  selectedColor === color.label
                    ? 'bg-zinc-800 border-zinc-500 shadow-md'
                    : 'bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div 
                  className="w-8 h-8 rounded-full shadow-inner border border-white/10" 
                  style={{ background: color.value }}
                />
                <span className="text-[10px] font-medium text-zinc-400 text-center leading-tight">{color.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-6 mt-auto border-t border-zinc-800/80">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || totalItems === 0}
            className="w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Generando Escenario...
              </>
            ) : (
              <>
                <ImageIcon size={18} />
                Generar Vistas
              </>
            )}
          </button>
          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-xs mt-3 text-center font-medium"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Panel - Preview */}
      <div className="flex-1 bg-zinc-950 p-6 md:p-8 flex flex-col items-center justify-center relative overflow-y-auto min-h-[50vh]">
        {/* Atmospheric background */}
        <div className="absolute inset-0 opacity-30 pointer-events-none fixed">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px]" />
        </div>

        <div className="w-full max-w-6xl z-10 flex flex-col gap-8">
          <AnimatePresence mode="wait">
            {isGenerating || generatedImages.frontal || generatedImages.cenital ? (
              <motion.div 
                key="images"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full"
              >
                {/* Frontal View */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Eye size={18} className="text-indigo-400" />
                    <h3 className="font-medium text-sm tracking-wide uppercase">Vista Frontal</h3>
                  </div>
                  <div className="w-full aspect-video bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl relative group">
                    {generatedImages.frontal ? (
                      <img 
                        src={generatedImages.frontal} 
                        alt="Vista Frontal del Escenario" 
                        className="w-full h-full object-cover"
                      />
                    ) : isGenerating ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800/30 relative overflow-hidden">
                        <motion.div 
                          animate={{ opacity: [0.3, 0.7, 0.3] }} 
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10"
                        />
                        <Loader2 size={32} className="text-indigo-500/50 animate-spin mb-3 relative z-10" />
                        <p className="text-sm text-indigo-400/70 font-medium relative z-10 text-center px-4">
                          {generationStep || "Generando vista frontal..."}
                        </p>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    {generatedImages.frontal && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <div className="text-white">
                          <p className="font-medium text-sm">{selectedTheme}</p>
                          <p className="text-xs text-zinc-300 opacity-80 mt-1">
                            {Object.entries(equipmentQuantities).map(([id, qty]) => `${qty}x ${EQUIPMENT_OPTIONS.find(e => e.id === id)?.label}`).join(' • ')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cenital View */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Box size={18} className="text-indigo-400" />
                    <h3 className="font-medium text-sm tracking-wide uppercase">Vista Cenital (Planta)</h3>
                  </div>
                  <div className="w-full aspect-video bg-zinc-900/40 border border-zinc-800/60 rounded-2xl overflow-hidden backdrop-blur-md shadow-2xl relative group">
                    {generatedImages.cenital ? (
                      <img 
                        src={generatedImages.cenital} 
                        alt="Vista Cenital del Escenario" 
                        className="w-full h-full object-cover"
                      />
                    ) : isGenerating ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-800/30 relative overflow-hidden">
                        <motion.div 
                          animate={{ opacity: [0.3, 0.7, 0.3] }} 
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute inset-0 bg-gradient-to-bl from-purple-500/10 to-indigo-500/10"
                        />
                        <Loader2 size={32} className="text-purple-500/50 animate-spin mb-3 relative z-10" />
                        <p className="text-sm text-purple-400/70 font-medium relative z-10 text-center px-4">
                          {generationStep || "Generando vista cenital..."}
                        </p>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <ImageIcon size={32} />
                      </div>
                    )}
                    {generatedImages.cenital && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <div className="text-white">
                          <p className="font-medium text-sm">{selectedTheme}</p>
                          <p className="text-xs text-zinc-300 opacity-80 mt-1">
                            {Object.entries(equipmentQuantities).map(([id, qty]) => `${qty}x ${EQUIPMENT_OPTIONS.find(e => e.id === id)?.label}`).join(' • ')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-zinc-500 flex flex-col items-center gap-5 p-8 my-auto"
              >
                <div className="w-24 h-24 rounded-full bg-zinc-800/50 flex items-center justify-center border border-zinc-700/50 shadow-inner relative">
                  <ImageIcon size={40} className="text-zinc-600" />
                </div>
                <div className="max-w-sm">
                  <h3 className="text-lg font-medium text-zinc-300 mb-2">
                    {isGenerating ? generationStep : 'Lienzo en blanco'}
                  </h3>
                  <p className="text-sm leading-relaxed">
                    Selecciona tus equipos, temática y color en el panel izquierdo para generar visualizaciones simultáneas (frontal y cenital) de tu próximo evento.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
          </>
        )}

        {currentView === 'experiencias' && (
          <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-zinc-950">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Combos de Experiencias</h2>
                <p className="text-zinc-400">Presets de equipos optimizados para tu próximo evento, listos para reservar.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {COMBOS.map(combo => (
                  <div key={combo.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col group hover:border-zinc-700 transition-colors">
                    <div className="aspect-video relative overflow-hidden">
                      <img src={combo.image} alt={combo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-4 right-4 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800">
                        <span className="text-indigo-400 font-mono font-bold">{combo.price}</span>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-white mb-4">{combo.title}</h3>
                      <div className="space-y-2 mb-6 flex-1">
                        {combo.equipment.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                            <CheckCircle2 size={14} className="text-indigo-500" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                      <button className="w-full py-3 rounded-xl font-medium text-sm bg-zinc-800 text-zinc-300 flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors">
                        <ShoppingCart size={16} />
                        Adquirir Combo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'events' && (
          <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-zinc-950">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Próximos Eventos</h2>
                <p className="text-zinc-400">Experiencias y montajes programados para las próximas fechas.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {UPCOMING_EVENTS.map(event => (
                  <div key={event.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col sm:flex-row group hover:border-zinc-700 transition-colors">
                    <div className="w-full sm:w-2/5 aspect-video sm:aspect-auto relative overflow-hidden">
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-6 flex flex-col flex-1 justify-center">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {event.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">{event.title}</h3>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-zinc-400">
                          <Calendar size={16} className="text-zinc-500" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-400">
                          <MapPin size={16} className="text-zinc-500" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      <button className="w-full sm:w-auto mt-auto py-2.5 px-4 rounded-xl font-medium text-sm bg-zinc-800 text-zinc-300 flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors self-start">
                        <Ticket size={16} />
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
