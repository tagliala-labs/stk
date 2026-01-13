import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  Download, Trash2, AlertCircle, Upload, Settings as SettingsIcon, 
  Image as ImageIcon, Layout, ArrowUp, ArrowDown, ArrowUpDown, Languages, GripVertical, Plus,
  Sun, Moon
} from 'lucide-react';

// --- Localization ---
const translations = {
  en: {
    title: "STK.",
    subtitle: "Creative Stacker",
    addPhoto: "Add Photos",
    dragDrop: "Drag or click",
    options: "Options",
    format: "Canvas Format",
    bgColor: "Background",
    spacing: "Spacing",
    padding: "Margin",
    clear: "Clear All",
    export: "EXPORT JPG",
    warningHeight: "Height exceeds limit of",
    emptyTitle: "Start Stacking",
    emptyDesc: "Drag and drop your photos to compose a vertical stack.",
    res: "Resolution",
    reverse: "Reverse",
    moveUp: "Move Up",
    moveDown: "Move Down",
    remove: "Remove",
    lang: "EN",
    dragToSort: "Drag to reorder",
    image: "Image",
    images: "Images",
    stackList: "Stack Content",
    theme: "Theme"
  },
  it: {
    title: "STK.",
    subtitle: "Creative Stacker",
    addPhoto: "Aggiungi Foto",
    dragDrop: "Trascina o clicca",
    options: "Opzioni",
    format: "Formato Tela",
    bgColor: "Sfondo",
    spacing: "Distanza",
    padding: "Margine",
    clear: "Svuota Tutto",
    export: "ESPORTA JPG",
    warningHeight: "L'altezza supera il limite di",
    emptyTitle: "Crea lo stack",
    emptyDesc: "Trascina le foto per comporre il tuo stack verticale.",
    res: "Risoluzione",
    reverse: "Inverti",
    moveUp: "Sposta Su",
    moveDown: "Sposta Giù",
    remove: "Rimuovi",
    lang: "IT",
    dragToSort: "Trascina per ordinare",
    image: "Immagine",
    images: "Immagini",
    stackList: "Contenuto Stack",
    theme: "Tema"
  }
};

type Language = keyof typeof translations;

// --- Types ---
interface Photo {
  id: string;
  preview: string;
  width: number;
  height: number;
}

interface Settings {
  backgroundColor: string;
  spacing: number;
  padding: number;
  format: keyof typeof FORMATS;
}

const FORMATS = {
  '2:3': { width: 1080, height: 1620, label: '2:3' },
  '3:2': { width: 1620, height: 1080, label: '3:2' },
  '5:4': { width: 1350, height: 1080, label: '5:4' },
  '4:5': { width: 1080, height: 1350, label: '4:5' },
  '16:9': { width: 1920, height: 1080, label: '16:9' },
  '9:16': { width: 1080, height: 1920, label: '9:16' }
};

const getInitialLang = (): Language => {
  const browserLang = navigator.language.split('-')[0];
  return (browserLang === 'it') ? 'it' : 'en';
};

// --- Sub-components ---

const ImageUploader: React.FC<{ onUpload: (photos: Photo[]) => void, t: any }> = ({ onUpload, t }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    const promises = Array.from(files).map(file => {
      return new Promise<Photo>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              preview: e.target?.result as string,
              width: img.width,
              height: img.height
            });
          };
          img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      });
    });
    Promise.all(promises).then((newPhotos) => {
      onUpload(newPhotos);
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); }}
      onClick={() => fileInputRef.current?.click()}
      className={`relative group cursor-pointer border-2 border-dashed rounded-3xl p-5 transition-all duration-300 flex flex-col items-center justify-center text-center ${
        isDragging 
          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20' 
          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
      }`}
    >
      <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => processFiles(e.target.files)} />
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${isDragging ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-500'}`}>
        <Plus size={20} />
      </div>
      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{t.addPhoto}</p>
    </div>
  );
};

const CanvasPreview = forwardRef<HTMLCanvasElement, { photos: Photo[], settings: Settings, onHeightViolation: (v: boolean) => void }>(({ photos, settings, onHeightViolation }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useImperativeHandle(ref, () => canvasRef.current!);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const config = FORMATS[settings.format];
    canvas.width = config.width;
    canvas.height = config.height;
    
    ctx.fillStyle = settings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (photos.length === 0) return;

    let isMounted = true;
    const loadAndDraw = async () => {
      const images = await Promise.all(photos.map(p => {
        return new Promise<{ img: HTMLImageElement, w: number, h: number }>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const drawW = config.width - (settings.padding * 2);
            const drawH = (drawW / img.width) * img.height;
            resolve({ img, w: drawW, h: drawH });
          };
          img.src = p.preview;
        });
      }));

      if (!isMounted) return;

      const totalSpacing = (images.length - 1) * settings.spacing;
      const totalH = images.reduce((s, i) => s + i.h, 0) + totalSpacing;
      
      onHeightViolation(totalH > config.height);

      let y = (config.height - totalH) / 2;
      images.forEach(item => {
        ctx.drawImage(item.img, (config.width - item.w) / 2, y, item.w, item.h);
        y += item.h + settings.spacing;
      });
    };

    loadAndDraw();
    return () => { isMounted = false; };
  }, [photos, settings, onHeightViolation]);

  return (
    <div className="relative shadow-2xl rounded-sm overflow-hidden bg-black border border-white/5 ring-1 ring-black">
      <canvas 
        ref={canvasRef} 
        className="block max-w-full h-auto" 
        style={{ 
          maxHeight: 'calc(100vh - 200px)',
          objectFit: 'contain'
        }} 
      />
    </div>
  );
});

export default function App() {
  const [lang, setLang] = useState<Language>(getInitialLang());
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const t = translations[lang];

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isTooTall, setIsTooTall] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const [settings, setSettings] = useState<Settings>({
    backgroundColor: '#000000',
    spacing: 2,
    padding: 0,
    format: '9:16'
  });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleExport = () => {
    if (!canvasRef.current || isTooTall) return;
    const link = document.createElement('a');
    link.download = `stack-${settings.format.replace(':', '-')}-${Date.now()}.jpg`;
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const removePhoto = (id: string) => setPhotos(prev => prev.filter(p => p.id !== id));
  
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newPhotos = [...photos];
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[index - 1];
    newPhotos[index - 1] = temp;
    setPhotos(newPhotos);
  };

  const moveDown = (index: number) => {
    if (index === photos.length - 1) return;
    const newPhotos = [...photos];
    const temp = newPhotos[index];
    newPhotos[index] = newPhotos[index + 1];
    newPhotos[index + 1] = temp;
    setPhotos(newPhotos);
  };

  const reverseOrder = () => setPhotos(prev => [...prev].reverse());
  const toggleLang = () => setLang(prev => prev === 'en' ? 'it' : 'en');
  const toggleTheme = () => setIsDark(prev => !prev);

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newPhotos = [...photos];
    const draggedItem = newPhotos[draggedIndex];
    newPhotos.splice(draggedIndex, 1);
    newPhotos.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    setPhotos(newPhotos);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#fafafa] dark:bg-slate-950 overflow-hidden transition-colors duration-200">
      
      {/* COLUMN 1: Settings */}
      <aside className="w-full md:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-sm overflow-hidden transition-colors duration-200">
        <div className="p-6 pb-2">
           <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">{t.title}<span className="text-indigo-600">.</span></h1>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">{t.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 transition-colors">
                {isDark ? <Sun size={12} /> : <Moon size={12} />}
              </button>
              <button onClick={toggleLang} className="px-2 py-1 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-slate-500 hover:text-indigo-600">
                {t.lang}
              </button>
            </div>
          </div>
          <ImageUploader onUpload={(newOnes) => setPhotos([...photos, ...newOnes])} t={t} />
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600 border-b border-slate-100 dark:border-slate-800 pb-1">
              <SettingsIcon size={12} />
              <h2 className="text-[10px] font-bold uppercase tracking-widest">{t.options}</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.format}</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(FORMATS) as (keyof typeof FORMATS)[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setSettings({...settings, format: f})}
                      className={`py-2 rounded-xl text-[10px] font-black border transition-all ${
                        settings.format === f 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-500'
                      }`}
                    >
                      {FORMATS[f].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">{t.bgColor}</label>
                <div className="flex items-center gap-2">
                  <div className="relative w-6 h-6 rounded-md overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                    <input 
                      type="color" 
                      value={settings.backgroundColor} 
                      onChange={(e) => setSettings({...settings, backgroundColor: e.target.value})} 
                      className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer" 
                    />
                  </div>
                  <div className="flex gap-1.5">
                    {['#000000', '#ffffff', '#f1f5f9'].map(c => (
                      <button 
                        key={c} 
                        onClick={() => setSettings({...settings, backgroundColor: c})} 
                        className={`w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700 transition-transform ${settings.backgroundColor === c ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`} 
                        style={{backgroundColor: c}} 
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                  <span>{t.spacing}</span>
                  <span className="text-indigo-600 font-mono font-bold">{settings.spacing}px</span>
                </div>
                <input type="range" min="0" max="400" value={settings.spacing} onChange={(e) => setSettings({...settings, spacing: parseInt(e.target.value)})} className="w-full" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">
                  <span>{t.padding}</span>
                  <span className="text-indigo-600 font-mono font-bold">{settings.padding}px</span>
                </div>
                <input type="range" min="0" max="300" value={settings.padding} onChange={(e) => setSettings({...settings, padding: parseInt(e.target.value)})} className="w-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button 
            onClick={handleExport}
            disabled={photos.length === 0 || isTooTall}
            className={`w-full py-4 rounded-3xl font-black text-xs flex items-center justify-center gap-3 transition-all active:scale-95 ${
              photos.length === 0 || isTooTall 
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-300 dark:border-slate-700' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none'
            }`}
          >
            <Download size={18} /> {t.export}
          </button>
        </div>
      </aside>

      {/* COLUMN 2: Canvas Preview */}
      <main className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] dark:bg-slate-950 p-6 relative transition-colors duration-200">
        {isTooTall && (
          <div className="absolute top-6 z-10 flex items-center gap-3 bg-red-600 text-white px-6 py-2.5 rounded-full shadow-2xl text-[10px] font-black animate-pulse">
            <AlertCircle size={14} /> {t.warningHeight} {FORMATS[settings.format].height}px!
          </div>
        )}

        {photos.length > 0 ? (
          <div className="w-full h-full flex items-center justify-center">
             <CanvasPreview photos={photos} settings={settings} onHeightViolation={setIsTooTall} ref={canvasRef} />
          </div>
        ) : (
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm text-slate-200 dark:text-slate-800 border border-slate-100 dark:border-slate-800">
              <Layout size={40} />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 tracking-tight">{t.emptyTitle}</h3>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-2 leading-relaxed">{t.emptyDesc}</p>
          </div>
        )}

        <div className="absolute bottom-6 flex gap-6 text-[10px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.3em]">
          <span>{FORMATS[settings.format].label}</span>
          <span className="opacity-20">•</span>
          <span>{t.res}: {FORMATS[settings.format].width} x {FORMATS[settings.format].height}</span>
        </div>
      </main>

      {/* COLUMN 3: Photo Management List */}
      <aside className="w-full md:w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-sm overflow-hidden transition-colors duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-900/30">
          <div className="flex items-center gap-2">
            <ImageIcon size={14} className="text-slate-400 dark:text-slate-600" />
            <h3 className="text-[10px] font-black text-slate-900 dark:text-slate-200 uppercase tracking-widest">
              {t.stackList} ({photos.length})
            </h3>
          </div>
          {photos.length > 1 && (
            <button onClick={reverseOrder} className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase">
              <ArrowUpDown size={12} />
              {t.reverse}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-slate-50/10 dark:bg-slate-900/10">
          {photos.map((p, idx) => (
            <div 
              key={p.id} 
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`group flex items-center gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-2xl border transition-all cursor-grab active:cursor-grabbing ${
                draggedIndex === idx 
                  ? 'opacity-40 border-indigo-500 scale-95 shadow-none' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 shadow-sm'
              }`}
            >
              <div className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 dark:group-hover:text-slate-500 pl-0.5">
                <GripVertical size={14} />
              </div>

              <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 shadow-inner">
                <img src={p.preview} className="w-full h-full object-cover" />
                <div className="absolute top-0 left-0 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-br-lg">
                  {idx + 1}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono truncate">{p.width}×{p.height}</p>
              </div>

              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                <button 
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className={`p-1 rounded-md ${idx === 0 ? 'text-slate-100 dark:text-slate-800' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600'}`}
                >
                  <ArrowUp size={14} />
                </button>
                <button 
                  onClick={() => moveDown(idx)}
                  disabled={idx === photos.length - 1}
                  className={`p-1 rounded-md ${idx === photos.length - 1 ? 'text-slate-100 dark:text-slate-800' : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600'}`}
                >
                  <ArrowDown size={14} />
                </button>
                <button 
                  onClick={() => removePhoto(p.id)}
                  className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {photos.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={() => setPhotos([])} 
              className="w-full py-2 text-[10px] font-black text-red-400 dark:text-red-500 hover:text-red-600 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-xl transition-colors uppercase tracking-widest"
            >
              {t.clear}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
