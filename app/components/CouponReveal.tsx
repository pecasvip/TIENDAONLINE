import {useState} from 'react';

export default function CouponReveal() {
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);

  const coupon = 'DIAMOND15';

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(coupon);
    setCopied(true);
  };

  return (
    <section className="py-32 px-6 bg-[#0A0F1E] text-center">
      <p className="text-[#C9A84C] uppercase tracking-[0.4em] text-xs mb-6">
        Regalo exclusivo
      </p>

      <h2 className="text-4xl md:text-6xl font-bold text-white">
        Gira el regalo y obtén tu descuento
      </h2>

      <p className="text-white/60 mt-4">
        Solo por tiempo limitado en Diamond Jewelri Co
      </p>

      {/* BOX INTERACTIVO */}
      <div className="mt-12 flex justify-center">
        {!opened ? (
          <button
            onClick={() => setOpened(true)}
            className="w-64 h-64 rounded-3xl bg-gradient-to-br from-[#1B3A6B] to-[#C9A84C] text-black font-bold text-xl shadow-2xl hover:scale-105 transition-all"
          >
            🎁 ABRIR REGALO
          </button>
        ) : (
          <div className="w-80 p-8 rounded-3xl bg-[#0D1527] border border-[#C9A84C]/40">
            <p className="text-[#C9A84C] uppercase tracking-[0.3em] text-sm">
              Tu cupón
            </p>

            <h3 className="text-4xl font-bold text-white mt-4">{coupon}</h3>

            <button
              onClick={copyToClipboard}
              className="mt-6 w-full bg-[#C9A84C] text-black py-3 rounded-full font-bold hover:bg-white transition"
            >
              {copied ? 'Copiado ✓' : 'Copiar código'}
            </button>

            <p className="text-white/40 text-xs mt-4">Úsalo en checkout</p>
          </div>
        )}
      </div>
    </section>
  );
}
