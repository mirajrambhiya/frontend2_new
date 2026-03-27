import { useState, useEffect, useCallback, useRef } from 'react';

const banner1 = "/assets/banner1new1.png";
const banner2 = "/assets/banner2new.png";
const banner3 = "/assets/banner3new.png";
const banner4 = "/assets/banner4new.png"
const banner5 = "/assets/banner5new.png"
const banner6 = "/assets/banner6new.png"

const IMAGES = [
  banner1,
  banner2,
  banner3,
  banner4,
  banner5,
  banner6
];

const SLIDE_DURATION = 5000;
const TRANSITION_DURATION = 1200; // ms

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(-1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex || isTransitioning) return;
    setDirection(index > currentIndex ? 'next' : 'prev');
    setPrevIndex(currentIndex);
    setIsTransitioning(true);
    setCurrentIndex(index);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
      setPrevIndex(-1);
    }, TRANSITION_DURATION);
  }, [currentIndex, isTransitioning]);

  const goNext = useCallback(() => {
    setPrevIndex(currentIndex);
    setDirection('next');
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % IMAGES.length);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
      setPrevIndex(-1);
    }, TRANSITION_DURATION);
  }, [currentIndex]);

  // Auto-advance slides
  useEffect(() => {
    timerRef.current = setInterval(goNext, SLIDE_DURATION);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goNext]);

  // Ken Burns: alternate between different subtle pan+zoom directions per slide
  const getKenBurnsClass = (index: number): string => {
    const variants = [
      'animate-kb-zoom-right',
      'animate-kb-zoom-left',
      'animate-kb-zoom-up',
      'animate-kb-zoom-center',
      'animate-kb-zoom-down',
      'animate-kb-zoom-right',
    ];
    return variants[index % variants.length];
  };

  const getSlideStyle = (index: number): React.CSSProperties => {
    const transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.65, 0, 0.35, 1), opacity ${TRANSITION_DURATION}ms cubic-bezier(0.65, 0, 0.35, 1)`;

    if (index === currentIndex) {
      return {
        opacity: 1,
        transform: 'translateX(0%)',
        transition,
        zIndex: 20,
      };
    }
    if (index === prevIndex && isTransitioning) {
      return {
        opacity: 0.3,
        transform: direction === 'next' ? 'translateX(-15%)' : 'translateX(15%)',
        transition,
        zIndex: 15,
      };
    }
    // Hidden slides pre-positioned off-screen for smooth entry
    return {
      opacity: 0,
      transform: 'translateX(30%)',
      zIndex: 10,
      transition: 'none',
    };
  };

  return (
    <div className="sticky top-0 w-full overflow-hidden bg-black z-10">
      {/* Navigation Dots — vertical, left side with progress bar */}
      <div className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2.5">
        {IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="group relative flex items-center cursor-pointer"
            aria-label={`Go to slide ${index + 1}`}
          >
            {/* Dot */}
            <div
              className={`
                w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-500 ease-out
                ${index === currentIndex
                  ? 'bg-white scale-125'
                  : 'bg-white/30 hover:bg-white/60 hover:scale-110'
                }
              `}
            />
            {/* Active slide progress bar */}
            {index === currentIndex && (
              <div className="absolute left-full ml-2 h-[2px] w-8 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{
                    animation: `progressFill ${SLIDE_DURATION}ms linear forwards`,
                  }}
                />
              </div>
            )}
          </button>
        ))}
      </div>


      {/* Slides */}
      <div className="relative w-full overflow-hidden">
        {IMAGES.map((src, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={index}
              className={`
                ${isActive ? 'relative' : 'absolute inset-0'}
                w-full will-change-transform
              `}
              style={getSlideStyle(index)}
            >
              <div className="w-full overflow-hidden">
                <img
                  src={src}
                  alt={`Slider ${index}`}
                  className={`
                    w-full h-auto md:h-[700px] md:object-cov
          -er block
                    ${isActive ? getKenBurnsClass(index) : ''}
                  `}
                />
              </div>
              {/* Cinematic gradient overlay */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(180deg, rgba(0,0,0,0.08) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.35) 100%)',
              }} />
              {/* Subtle side vignette */}
              <div className="absolute inset-0 pointer-events-none" style={{
                background: 'linear-gradient(90deg, rgba(0,0,0,0.12) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.12) 100%)',
              }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageSlider;