import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  Download,
  Trash2,
  AlertCircle,
  Upload,
  Settings as SettingsIcon,
  Image as ImageIcon,
  Layout,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Languages,
  GripVertical,
  Plus,
  Sun,
  Moon,
  Github,
  ChevronDown,
} from 'lucide-react';

// --- Localization ---
const translations = {
  en: {
    title: 'STK.',
    subtitle: 'Creative Stacker',
    addPhoto: 'Add Photos',
    dragDrop: 'Drag or click',
    options: 'Options',
    format: 'Canvas Format',
    bgColor: 'Background',
    spacing: 'Spacing',
    padding: 'Margin',
    clear: 'Clear All',
    export: 'EXPORT JPG',
    warningHeight: 'Height exceeds limit of',
    warningCrop: 'Image will be cropped to fit',
    emptyTitle: 'Start Stacking',
    emptyDesc: 'Drag and drop your photos to compose a vertical stack.',
    res: 'Resolution',
    reverse: 'Reverse',
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    remove: 'Remove',
    lang: 'EN',
    dragToSort: 'Drag to reorder',
    image: 'Image',
    images: 'Images',
    stackList: 'Stack Content',
    theme: 'Theme',
    github: 'View on GitHub',
    copiedToClipboard: 'Copied to clipboard!',
    copyFailed: 'Copy failed',
    longPressToCopy: 'Long press to copy',
  },
  it: {
    title: 'STK.',
    subtitle: 'Creative Stacker',
    addPhoto: 'Aggiungi Foto',
    dragDrop: 'Trascina o clicca',
    options: 'Opzioni',
    format: 'Formato Tela',
    bgColor: 'Sfondo',
    spacing: 'Distanza',
    padding: 'Margine',
    clear: 'Svuota Tutto',
    export: 'ESPORTA JPG',
    warningHeight: "L'altezza supera il limite di",
    warningCrop: "L'immagine sarà ritagliata",
    emptyTitle: 'Crea lo stack',
    emptyDesc: 'Trascina le foto per comporre il tuo stack verticale.',
    res: 'Risoluzione',
    reverse: 'Inverti',
    moveUp: 'Sposta Su',
    moveDown: 'Sposta Giù',
    remove: 'Rimuovi',
    lang: 'IT',
    dragToSort: 'Trascina per ordinare',
    image: 'Immagine',
    images: 'Immagini',
    stackList: 'Contenuto Stack',
    theme: 'Tema',
    github: 'Vedi su GitHub',
    copiedToClipboard: 'Copiato negli appunti!',
    copyFailed: 'Copia fallita',
    longPressToCopy: 'Tieni premuto per copiare',
  },
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
  '9:16': { width: 1080, height: 1920, label: '9:16' },
};

const MOBILE_CANVAS_OFFSET = 300; // Offset for mobile canvas height calculation

const getInitialLang = (): Language => {
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'it' ? 'it' : 'en';
};

// --- Sub-components ---

const ImageUploader: React.FC<{
  onUpload: (photos: Photo[]) => void;
  t: any;
  compact?: boolean;
}> = ({ onUpload, t, compact = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    const promises = Array.from(files).map((file) => {
      return new Promise<Photo>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            resolve({
              id: Math.random().toString(36).substr(2, 9),
              preview: e.target?.result as string,
              width: img.width,
              height: img.height,
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

  const getContainerClasses = () => {
    const baseClasses = 'group relative flex cursor-pointer';

    if (compact) {
      return `${baseClasses} flex-row items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 transition-colors hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800`;
    }

    const layoutClasses =
      'flex-col items-center justify-center rounded-3xl border-2 border-dashed p-5 text-center transition-all duration-300';
    const dragClasses = isDragging
      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
      : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-indigo-500 dark:hover:bg-slate-800/50';

    return `${baseClasses} ${layoutClasses} ${dragClasses}`;
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
      }}
      onClick={() => fileInputRef.current?.click()}
      className={`${getContainerClasses()} select-none`}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => processFiles(e.target.files)}
      />
      {compact ? (
        <>
          <Plus
            size={14}
            className="text-slate-600 select-none dark:text-slate-400"
          />
          <span className="text-[10px] font-bold text-slate-600 select-none dark:text-slate-400">
            {t.addPhoto}
          </span>
        </>
      ) : (
        <>
          <div
            className={`mb-2 flex h-10 w-10 items-center justify-center rounded-2xl transition-transform select-none group-hover:scale-110 ${isDragging ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-500 dark:bg-slate-800 dark:group-hover:bg-indigo-900/50'}`}
          >
            <Plus size={20} />
          </div>
          <p className="text-[11px] font-bold text-slate-700 select-none dark:text-slate-300">
            {t.addPhoto}
          </p>
        </>
      )}
    </div>
  );
};

const CanvasPreview = forwardRef<
  HTMLCanvasElement,
  {
    photos: Photo[];
    settings: Settings;
    onHeightViolation: (v: boolean) => void;
  }
>(({ photos, settings, onHeightViolation }, ref) => {
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
      const images = await Promise.all(
        photos.map((p) => {
          return new Promise<{ img: HTMLImageElement; w: number; h: number }>(
            (resolve) => {
              const img = new Image();
              img.onload = () => {
                const drawW = config.width - settings.padding * 2;
                const drawH = (drawW / img.width) * img.height;
                resolve({ img, w: drawW, h: drawH });
              };
              img.src = p.preview;
            }
          );
        })
      );

      if (!isMounted) return;

      const totalSpacing = (images.length - 1) * settings.spacing;
      const totalH = images.reduce((s, i) => s + i.h, 0) + totalSpacing;

      onHeightViolation(totalH > config.height);

      let y = (config.height - totalH) / 2;
      images.forEach((item) => {
        ctx.drawImage(item.img, (config.width - item.w) / 2, y, item.w, item.h);
        y += item.h + settings.spacing;
      });
    };

    loadAndDraw();
    return () => {
      isMounted = false;
    };
  }, [photos, settings, onHeightViolation]);

  return (
    <div className="relative h-full overflow-hidden rounded-sm border-4 border-indigo-400/80 bg-black select-none dark:border-indigo-600/80">
      <canvas ref={canvasRef} className="block h-full w-full object-contain" />
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
  const [showMobileSettings, setShowMobileSettings] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchCurrentY, setTouchCurrentY] = useState<number | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const [settings, setSettings] = useState<Settings>({
    backgroundColor: '#000000',
    spacing: 4,
    padding: 0,
    format: '9:16',
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
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `stack-${settings.format.replace(':', '-')}-${Date.now()}.jpg`;
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const removePhoto = (id: string) =>
    setPhotos((prev) => prev.filter((p) => p.id !== id));

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

  const reverseOrder = () => setPhotos((prev) => [...prev].reverse());
  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'it' : 'en'));
  const toggleTheme = () => setIsDark((prev) => !prev);

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

  // Touch event handlers for iOS support
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    setDraggedIndex(index);
    setTouchStartY(e.touches[0].clientY);
    setTouchCurrentY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIndex === null || touchStartY === null) return;
    const currentY = e.touches[0].clientY;
    setTouchCurrentY(currentY);

    // Find the element under the touch point
    const touch = e.touches[0];
    const elementAtPoint = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );

    if (elementAtPoint) {
      // Find the closest photo container
      const photoElement = elementAtPoint.closest('[data-photo-index]');
      if (photoElement) {
        const targetIndex = parseInt(
          photoElement.getAttribute('data-photo-index') || '',
          10
        );
        if (!isNaN(targetIndex) && targetIndex !== draggedIndex) {
          const newPhotos = [...photos];
          const draggedItem = newPhotos[draggedIndex];
          newPhotos.splice(draggedIndex, 1);
          newPhotos.splice(targetIndex, 0, draggedItem);
          setDraggedIndex(targetIndex);
          setPhotos(newPhotos);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    setDraggedIndex(null);
    setTouchStartY(null);
    setTouchCurrentY(null);
  };

  // Canvas long-press to copy functionality
  const copyCanvasToClipboard = async () => {
    if (!canvasRef.current) return;

    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvasRef.current?.toBlob((b) => resolve(b), 'image/png');
      });

      if (!blob) {
        setCopyFeedback(t.copyFailed);
        setTimeout(() => setCopyFeedback(null), 2000);
        return;
      }

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);

      setCopyFeedback(t.copiedToClipboard);
      setTimeout(() => setCopyFeedback(null), 2000);
    } catch (err) {
      console.error('Failed to copy canvas:', err);
      setCopyFeedback(t.copyFailed);
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  };

  const handleCanvasLongPressStart = (e: React.TouchEvent) => {
    if (photos.length === 0) return;

    const timer = setTimeout(() => {
      copyCanvasToClipboard();
      // Provide haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);

    setLongPressTimer(timer);
  };

  const handleCanvasLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleCanvasLongPressMove = () => {
    // Cancel long press if user moves finger
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <div className="flex h-full flex-1 flex-col overflow-auto bg-[#fafafa] transition-colors duration-200 select-none lg:h-screen lg:flex-row lg:overflow-hidden dark:bg-slate-950">
      {/* COLUMN 1: Settings */}
      <aside className="flex w-full flex-col overflow-hidden border-b border-slate-200 bg-white shadow-sm transition-colors duration-200 lg:w-72 lg:border-r lg:border-b-0 dark:border-slate-800 dark:bg-slate-900">
        <div className="p-4 pb-2 lg:p-6 lg:pb-2">
          <div className="mb-3 flex items-start justify-between lg:mb-4">
            <div>
              <h1 className="text-2xl leading-none font-black tracking-tighter text-slate-900 italic select-none lg:text-3xl dark:text-white">
                {t.title}
                <span className="text-indigo-600">.</span>
              </h1>
              <p className="mt-1 text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase select-none dark:text-slate-500">
                {t.subtitle}
              </p>
            </div>
            <div className="flex gap-2">
              <a
                href="https://github.com/tagliala-labs/stk"
                target="_blank"
                rel="noopener noreferrer"
                title={t.github}
                className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-500 transition-colors select-none hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800"
              >
                <Github size={12} />
              </a>
              <button
                onClick={toggleTheme}
                className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-500 transition-colors select-none hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800"
              >
                {isDark ? <Sun size={12} /> : <Moon size={12} />}
              </button>
              <button
                onClick={toggleLang}
                className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-500 select-none hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800"
              >
                {t.lang}
              </button>
            </div>
          </div>
          {/* Desktop: Full ImageUploader */}
          <div className="hidden lg:block">
            <ImageUploader
              onUpload={(newOnes) => setPhotos([...photos, ...newOnes])}
              t={t}
            />
          </div>

          {/* Mobile: Side-by-side Add Image and Options */}
          <div className="flex gap-2 lg:hidden">
            <div className="flex-1">
              <ImageUploader
                onUpload={(newOnes) => setPhotos([...photos, ...newOnes])}
                t={t}
                compact
              />
            </div>
            <button
              onClick={() => setShowMobileSettings(!showMobileSettings)}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[10px] font-bold text-slate-600 transition-colors select-none hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
            >
              <SettingsIcon size={14} />
              <span>{t.options}</span>
              <ChevronDown
                size={12}
                className={`transition-transform ${showMobileSettings ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

        <div
          className={`custom-scrollbar space-y-6 overflow-y-auto p-4 pt-2 transition-all lg:block lg:flex-1 lg:p-6 lg:pt-2 ${
            showMobileSettings ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-1 text-slate-400 dark:border-slate-800 dark:text-slate-600">
              <SettingsIcon size={12} />
              <h2 className="text-[10px] font-bold tracking-widest uppercase select-none">
                {t.options}
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase select-none dark:text-slate-500">
                  {t.format}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(FORMATS) as (keyof typeof FORMATS)[]).map(
                    (f) => (
                      <button
                        key={f}
                        onClick={() => setSettings({ ...settings, format: f })}
                        className={`rounded-xl border py-2 text-[10px] font-black transition-all select-none ${
                          settings.format === f
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-indigo-500'
                        }`}
                      >
                        {FORMATS[f].label}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black tracking-wider text-slate-400 uppercase select-none dark:text-slate-500">
                  {t.bgColor}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative h-6 w-6 overflow-hidden rounded-md border border-slate-200 shadow-sm dark:border-slate-700">
                    <input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          backgroundColor: e.target.value,
                        })
                      }
                      className="absolute inset-0 h-[200%] w-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                    />
                  </div>
                  <div className="flex gap-1.5">
                    {['#000000', '#ffffff', '#f1f5f9'].map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          setSettings({ ...settings, backgroundColor: c })
                        }
                        className={`h-4 w-4 rounded-full border border-slate-200 transition-transform select-none dark:border-slate-700 ${settings.backgroundColor === c ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase select-none dark:text-slate-500">
                  <span>{t.spacing}</span>
                  <span className="font-mono font-bold text-indigo-600">
                    {settings.spacing}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="400"
                  value={settings.spacing}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      spacing: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase select-none dark:text-slate-500">
                  <span>{t.padding}</span>
                  <span className="font-mono font-bold text-indigo-600">
                    {settings.padding}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={settings.padding}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      padding: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Export Button - Hidden on Mobile */}
        <div className="hidden border-t border-slate-100 bg-slate-50/50 p-4 lg:block lg:p-6 dark:border-slate-800 dark:bg-slate-900/50">
          {isTooTall && photos.length > 0 && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-[10px] font-bold text-amber-700 select-none dark:bg-amber-900/30 dark:text-amber-400">
              <AlertCircle size={12} /> {t.warningCrop}
            </div>
          )}
          <button
            onClick={handleExport}
            disabled={photos.length === 0}
            className={`flex w-full items-center justify-center gap-3 rounded-3xl py-4 text-xs font-black transition-all select-none active:scale-95 ${
              photos.length === 0
                ? 'cursor-not-allowed border border-slate-300 bg-slate-200 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600'
                : 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 dark:shadow-none'
            }`}
          >
            <Download size={18} /> {t.export}
          </button>
        </div>
      </aside>

      {/* MOBILE: Combined Canvas and Photo List - Desktop: Canvas Only */}
      <main className="relative flex flex-1 flex-col overflow-auto bg-[#f0f2f5] transition-colors duration-200 lg:flex-row lg:items-center lg:justify-center lg:overflow-hidden lg:p-6 dark:bg-slate-950">
        {/* Mobile Two Column Layout - min-height accounts for header (~180px) */}
        <div className="flex flex-1 flex-row gap-2 p-2 lg:hidden">
          {/* Left Column: Canvas + Export */}
          <div className="flex flex-1 flex-col">
            {isTooTall && (
              <div className="mb-2 flex items-center gap-1.5 rounded-xl bg-red-600 px-2 py-1.5 text-[8px] font-black text-white shadow-lg select-none">
                <AlertCircle size={10} /> {t.warningCrop}
              </div>
            )}

            {photos.length > 0 ? (
              <div
                className="relative mb-2 flex flex-1 items-center justify-center overflow-hidden rounded-lg"
                onTouchStart={handleCanvasLongPressStart}
                onTouchEnd={handleCanvasLongPressEnd}
                onTouchMove={handleCanvasLongPressMove}
                onContextMenu={(e) => e.preventDefault()}
              >
                <CanvasPreview
                  photos={photos}
                  settings={settings}
                  onHeightViolation={setIsTooTall}
                  ref={canvasRef}
                />
                {/* Copy feedback overlay */}
                {copyFeedback && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-xl select-none dark:bg-slate-800 dark:text-white">
                      {copyFeedback}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-2 flex flex-1 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-slate-200 select-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-700">
                  <Layout size={24} />
                </div>
                <h3 className="text-xs font-black text-slate-800 select-none dark:text-slate-200">
                  {t.emptyTitle}
                </h3>
                <p className="mt-1 text-[9px] leading-relaxed text-slate-400 select-none dark:text-slate-500">
                  {t.emptyDesc}
                </p>
              </div>
            )}

            <button
              onClick={handleExport}
              disabled={photos.length === 0}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[10px] font-black transition-all select-none active:scale-95 ${
                photos.length === 0
                  ? 'cursor-not-allowed border border-slate-300 bg-slate-200 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-600'
                  : 'bg-indigo-600 text-white shadow-lg hover:bg-indigo-700'
              }`}
            >
              <Download size={14} /> {t.export}
            </button>
          </div>

          {/* Right Column: Thumbnails */}
          <div className="flex w-24 flex-col gap-2 overflow-y-auto rounded-lg bg-white p-2 dark:bg-slate-900">
            {photos.length > 0 ? (
              <>
                {photos.map((p, idx) => (
                  <div
                    key={p.id}
                    data-photo-index={idx}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    onTouchStart={(e) => handleTouchStart(e, idx)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={`draggable-item group relative cursor-grab rounded-lg border active:cursor-grabbing ${
                      draggedIndex === idx
                        ? 'dragging-active border-indigo-500'
                        : 'border-slate-200 transition-all hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-500'
                    }`}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                      <img
                        src={p.preview}
                        className="h-full w-full object-cover select-none"
                        alt={`Photo ${idx + 1}`}
                      />
                      <div className="absolute top-0 left-0 rounded-br-md bg-indigo-600 px-1 py-0.5 text-[8px] font-black text-white select-none">
                        {idx + 1}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition-colors group-hover:bg-slate-900/50">
                        <GripVertical
                          size={16}
                          className="text-white opacity-0 transition-opacity group-hover:opacity-100"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removePhoto(p.id)}
                      className="absolute -top-1 -right-1 rounded-full bg-red-500 p-0.5 text-white opacity-0 shadow-md transition-opacity select-none group-hover:opacity-100 hover:bg-red-600"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
                {photos.length > 1 && (
                  <button
                    onClick={reverseOrder}
                    className="mt-1 flex items-center justify-center gap-1 rounded-lg bg-slate-100 py-2 text-[8px] font-black text-indigo-600 transition-colors select-none hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-900/30"
                  >
                    <ArrowUpDown size={10} />
                  </button>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-center text-[8px] font-bold text-slate-400 select-none dark:text-slate-600">
                  {t.stackList}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Canvas View */}
        <div className="hidden lg:flex lg:h-full lg:w-full lg:items-center lg:justify-center">
          {isTooTall && (
            <div className="absolute top-6 z-10 flex animate-pulse items-center gap-3 rounded-full bg-red-600 px-6 py-2.5 text-[10px] font-black text-white shadow-2xl select-none">
              <AlertCircle size={14} /> {t.warningHeight}{' '}
              {FORMATS[settings.format].height}px!
            </div>
          )}

          {photos.length > 0 ? (
            <div className="flex h-full w-full items-center justify-center">
              <CanvasPreview
                photos={photos}
                settings={settings}
                onHeightViolation={setIsTooTall}
                ref={canvasRef}
              />
            </div>
          ) : (
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2.5rem] border border-slate-100 bg-white text-slate-200 shadow-sm select-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-800">
                <Layout size={40} />
              </div>
              <h3 className="text-lg font-black tracking-tight text-slate-800 select-none dark:text-slate-200">
                {t.emptyTitle}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-400 select-none dark:text-slate-500">
                {t.emptyDesc}
              </p>
            </div>
          )}

          <div className="absolute bottom-6 flex gap-6 text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase select-none dark:text-slate-600">
            <span>{FORMATS[settings.format].label}</span>
            <span className="opacity-20">•</span>
            <span>
              {t.res}: {FORMATS[settings.format].width} x{' '}
              {FORMATS[settings.format].height}
            </span>
          </div>
        </div>
      </main>

      {/* COLUMN 3: Photo Management List - Desktop Only */}
      <aside className="hidden w-80 flex-col overflow-hidden border-l border-slate-200 bg-white shadow-sm transition-colors duration-200 lg:flex dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/30 p-6 dark:border-slate-800 dark:bg-slate-900/30">
          <div className="flex items-center gap-2">
            <ImageIcon
              size={14}
              className="text-slate-400 dark:text-slate-600"
            />
            <h3 className="text-[10px] font-black tracking-widest text-slate-900 uppercase select-none dark:text-slate-200">
              {t.stackList} ({photos.length})
            </h3>
          </div>
          {photos.length > 1 && (
            <button
              onClick={reverseOrder}
              className="flex items-center gap-1.5 text-[10px] font-black text-indigo-600 uppercase select-none hover:text-indigo-700"
            >
              <ArrowUpDown size={12} />
              {t.reverse}
            </button>
          )}
        </div>

        <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto bg-slate-50/10 p-4 dark:bg-slate-900/10">
          {photos.map((p, idx) => (
            <div
              key={p.id}
              data-photo-index={idx}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              onTouchStart={(e) => handleTouchStart(e, idx)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className={`draggable-item group flex cursor-grab items-center gap-3 rounded-2xl border bg-white p-2.5 active:cursor-grabbing dark:bg-slate-800 ${
                draggedIndex === idx
                  ? 'dragging-active border-indigo-500'
                  : 'border-slate-200 shadow-sm transition-all hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-500'
              }`}
            >
              <div className="pl-0.5 text-slate-300 group-hover:text-slate-400 dark:text-slate-600 dark:group-hover:text-slate-500">
                <GripVertical size={14} />
              </div>

              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-900">
                <img
                  src={p.preview}
                  className="h-full w-full object-cover select-none"
                />
                <div className="absolute top-0 left-0 rounded-br-lg bg-indigo-600 px-1.5 py-0.5 text-[8px] font-black text-white select-none">
                  {idx + 1}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[10px] font-bold text-slate-400 select-none dark:text-slate-500">
                  {p.width}×{p.height}
                </p>
              </div>

              <div className="flex items-center pr-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  className={`rounded-md p-1 select-none ${idx === 0 ? 'text-slate-100 dark:text-slate-800' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-500 dark:hover:bg-slate-700'}`}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === photos.length - 1}
                  className={`rounded-md p-1 select-none ${idx === photos.length - 1 ? 'text-slate-100 dark:text-slate-800' : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-500 dark:hover:bg-slate-700'}`}
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  onClick={() => removePhoto(p.id)}
                  className="rounded-md p-1 text-slate-400 select-none hover:bg-red-50 hover:text-red-500 dark:text-slate-500 dark:hover:bg-red-900/30"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {photos.length > 0 && (
          <div className="border-t border-slate-100 p-4 dark:border-slate-800">
            <button
              onClick={() => setPhotos([])}
              className="w-full rounded-xl py-2 text-[10px] font-black tracking-widest text-red-400 uppercase transition-colors select-none hover:bg-red-50/50 hover:text-red-600 dark:text-red-500 dark:hover:bg-red-900/20"
            >
              {t.clear}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
