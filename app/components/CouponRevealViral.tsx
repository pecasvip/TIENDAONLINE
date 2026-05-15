import {useState} from 'react';
import confetti from 'canvas-confetti';

export default function CouponRevealViral() {
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);

  const coupon = 'DIAMOND25';

  const triggerExplosion = () => {
    setOpened(true);

    // 💥 confetti explosión
    confetti({
      particleCount: 150,
      spread: 80,
      origin: {y: 0.6},
    });

    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 120,
      });
    }, 300);
  };

  const copyCoupon = async () => {
    await navigator.clipboard.writeText(coupon);
    setCopied(true);
  };

  return (
    <section className="py-32 px-6 bg-[#0A0F1E] text-center">
      <p className="text-[#C9A84C] uppercase tracking-[0.4em] text-xs mb-6">
        regalo sorpresa
      </p>

      <h2 className="text-4xl md:text-6xl font-bold text-white">
        Abre la caja y gana tu descuento
      </h2>

      <p className="text-white/60 mt-4">Solo hoy disponible</p>

      <div className="mt-16 flex justify-center">
        {!opened ? (
          <button
            onClick={triggerExplosion}
            className="relative w-72 h-72 rounded-3xl bg-gradient-to-br from-[#1B3A6B] to-[#C9A84C] text-black text-2xl font-bold shadow-2xl transition-all hover:scale-105 active:scale-95"
          >
            🎁 TOCA PARA ABRIR
            {/* glow animado */}
            <div className="absolute inset-0 rounded-3xl animate-pulse bg-white/10" />
          </button>
        ) : (
          <div className="w-80 p-8 rounded-3xl bg-[#0D1527] border border-[#C9A84C] animate-bounce">
            <p className="text-[#C9A84C] uppercase tracking-[0.3em] text-sm">
              CUPÓN GANADO
            </p>

            <h3 className="text-5xl font-bold text-white mt-4">{coupon}</h3>

            <button
              onClick={copyCoupon}
              className="mt-6 w-full bg-[#C9A84C] text-black py-3 rounded-full font-bold hover:bg-white transition"
            >
              {copied ? 'Copiado ✓' : 'Copiar cupón'}
            </button>

            <p className="text-white/40 text-xs mt-4">úsalo en checkout</p>
          </div>
        )}
      </div>
    </section>
  );
}
