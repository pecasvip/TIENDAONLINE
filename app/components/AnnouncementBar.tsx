import {useEffect, useRef, useCallback} from 'react';

const MESSAGES = [
  {text: '✦  ENVÍOS NACIONALES E INTERNACIONALES', gold: false},
  {text: '✦  ORO CERTIFICADO 18K & ITALIANO', gold: true},
];

export function AnnouncementBar({speed = 40}: {speed?: number}) {
  const barRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const buildSpan = useCallback((msg: {text: string; gold: boolean}) => {
    const span = document.createElement('span');
    Object.assign(span.style, {
      display: 'inline-block',
      whiteSpace: 'nowrap',
      paddingRight: '72px',
      color: msg.gold ? '#C9A84C' : '#F8F6F0',
      fontFamily: "'Cormorant Garamond', Garamond, Georgia, serif",
      fontSize: '0.8rem',
      fontWeight: '500',
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
    });
    span.textContent = msg.text;
    return span;
  }, []);

  const init = useCallback(() => {
    const bar = barRef.current;
    const track = trackRef.current;
    if (!bar || !track) return;
    track.innerHTML = '';
    const probe = document.createElement('div');
    Object.assign(probe.style, {
      visibility: 'hidden',
      position: 'absolute',
      whiteSpace: 'nowrap',
      top: '-9999px',
    });
    MESSAGES.forEach((m) => probe.appendChild(buildSpan(m)));
    document.body.appendChild(probe);
    const blockWidth = probe.offsetWidth;
    document.body.removeChild(probe);
    if (blockWidth === 0) return;
    const copies = Math.max(2, Math.ceil(bar.offsetWidth / blockWidth) + 2);
    for (let i = 0; i < copies; i++) {
      MESSAGES.forEach((m) => track.appendChild(buildSpan(m)));
    }
    const duration = blockWidth / speed;
    bar.style.setProperty('--ann-speed', `${duration}s`);
    bar.style.setProperty('--ann-width', `-${blockWidth}px`);
    track.style.animation = 'none';
    void track.offsetWidth;
    track.style.animation = '';
  }, [speed, buildSpan]);

  useEffect(() => {
    const href =
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&display=swap';
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = Object.assign(document.createElement('link'), {
        rel: 'stylesheet',
        href,
      });
      document.head.appendChild(link);
    }
    init();
    const onResize = () => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(init, 250);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timerRef.current);
    };
  }, [init]);

  return (
    <>
      <style>{`
        .ann-luxury {
          width: 100%;
          height: 44px;
          background: #0A0F1E;
          overflow: hidden;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(201,168,76,0.25);
          --ann-speed: 30s;
          --ann-width: -400px;
        }
        .ann-luxury-track {
          display: inline-block;
          white-space: nowrap;
          will-change: transform;
          animation: annLuxury var(--ann-speed) linear infinite;
        }
        .ann-luxury:hover .ann-luxury-track {
          animation-play-state: paused;
        }
        @keyframes annLuxury {
          from { transform: translateX(0); }
          to   { transform: translateX(var(--ann-width)); }
        }
      `}</style>
      <div
        ref={barRef}
        className="ann-luxury"
        role="region"
        aria-label="Anuncio de la tienda"
      >
        <div ref={trackRef} className="ann-luxury-track" />
      </div>
    </>
  );
}
