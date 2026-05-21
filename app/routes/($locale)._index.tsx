import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Suspense, useEffect, useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import {Autoplay, FreeMode, Pagination, EffectFade} from 'swiper/modules';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';
import {motion, AnimatePresence} from 'framer-motion';

import {MEDIA_FRAGMENT} from '~/data/fragments';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';

export const headers = routeHeaders;

export async function loader(args: LoaderFunctionArgs) {
  const {params, context} = args;
  const {language, country} = context.storefront.i18n;
  if (
    params.locale &&
    params.locale.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    throw new Response(null, {status: 404});
  }
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return defer({...deferredData, ...criticalData});
}

async function loadCriticalData({context, request}: LoaderFunctionArgs) {
  const {language, country} = context.storefront.i18n;
  const seoResult = await context.storefront
    .query(HOMEPAGE_SEO_QUERY, {variables: {handle: 'frontpage', country, language}})
    .catch(() => ({shop: null, hero: null}));
  return {
    shop: seoResult?.shop ?? null,
    primaryHero: seoResult?.hero ?? null,
    seo: seoPayload.home({url: request.url}),
  };
}

function loadDeferredData({context}: LoaderFunctionArgs) {
  const {language, country} = context.storefront.i18n;
  const featuredProducts = context.storefront
    .query(HOMEPAGE_FEATURED_PRODUCTS_QUERY, {variables: {country, language}})
    .catch(() => null);
  const collections = context.storefront
    .query(FEATURED_COLLECTIONS_QUERY, {variables: {country, language}})
    .catch(() => null);
  return {featuredProducts, collections};
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  const seoData = matches.map((m) => (m.data as any).seo).filter(Boolean);
  if (seoData.length === 0) return {title: 'Diamond Jewelry | Accesorios y Joyas'};
  return getSeoMeta(...seoData);
};

// ── Paleta neon tech ──
const C = {
  bg:       '#05071a',
  bgCard:   '#0c0f28',
  purple:   '#8b5cf6',
  magenta:  '#ec4899',
  cyan:     '#06b6d4',
  purpleGlow: 'rgba(139,92,246,0.35)',
  magentaGlow:'rgba(236,72,153,0.3)',
  cyanGlow:   'rgba(6,182,212,0.25)',
};

// ── Variantes de animación ──
const fadeUp = {
  hidden: {opacity: 0, y: 28},
  show:   {opacity: 1, y: 0, transition: {duration: 0.5, ease: 'easeOut'}},
};
const fadeIn = {
  hidden: {opacity: 0},
  show:   {opacity: 1, transition: {duration: 0.45}},
};
const stagger = {
  hidden: {},
  show: {transition: {staggerChildren: 0.07}},
};
const cardVar = {
  hidden: {opacity: 0, y: 20, scale: 0.97},
  show:   {opacity: 1, y: 0, scale: 1, transition: {duration: 0.4, ease: 'easeOut'}},
};
const popIn = {
  hidden: {opacity: 0, scale: 0.75},
  show:   {opacity: 1, scale: 1, transition: {type: 'spring', stiffness: 320, damping: 22}},
};

// ── Contador regresivo ──
const OFFER_END = new Date();
OFFER_END.setHours(OFFER_END.getHours() + 6);

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, target.getTime() - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(Math.max(0, target.getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);
  return {
    h: Math.floor(timeLeft / 3_600_000),
    m: Math.floor((timeLeft % 3_600_000) / 60_000),
    s: Math.floor((timeLeft % 60_000) / 1_000),
    done: timeLeft === 0,
  };
}

// ── Datos estáticos ──
const CATEGORIES = [
  {handle: 'anillos',          emoji: '💍', label: 'Anillos',     color: C.purple},
  {handle: 'collares',         emoji: '📿', label: 'Collares',    color: C.magenta},
  {handle: 'pulseras-tejidas', emoji: '🔗', label: 'Pulseras',    color: C.cyan},
  {handle: 'topos',            emoji: '✨', label: 'Aretes',      color: C.purple},
  {handle: 'relojes',          emoji: '⌚', label: 'Relojes',     color: C.magenta},
  {handle: 'dijes',            emoji: '🏅', label: 'Dijes',       color: C.cyan},
  {handle: 'sets',             emoji: '🎁', label: 'Sets regalo', color: C.purple},
  {handle: 'all',              emoji: '💛', label: 'Oro 18k',     color: C.magenta},
];

const HERO_SLIDES = [
  {
    img: '/images/banner1.jpg', imgMobile: '/images/banner1-mobile.jpg',
    tag: 'Nueva colección', tagColor: C.purple,
    title: 'Accesorios que', titleAccent: 'brillan',
    sub: 'Envío gratis en pedidos desde $150.000',
    cta: 'Ver colección', href: '/collections/all',
  },
  {
    img: '/images/banner2.jpg', imgMobile: '/images/banner2-mobile.jpg',
    tag: 'Hasta 60% OFF', tagColor: C.magenta,
    title: 'Joyas de', titleAccent: 'oro 18k',
    sub: 'Calidad garantizada · Precio justo',
    cta: 'Ver ofertas', href: '/collections/anillos',
  },
  {
    img: '/images/banner3.jpg', imgMobile: '/images/banner3-mobile.jpg',
    tag: 'Sets de regalo', tagColor: C.cyan,
    title: 'El regalo', titleAccent: 'perfecto',
    sub: 'Cajas especiales para cada ocasión',
    cta: 'Ver sets', href: '/collections/all',
  },
];

const BENEFITS = [
  {icon: '🚚', title: 'Envío gratis',       sub: 'En pedidos +$150.000',   color: C.purple},
  {icon: '🔒', title: 'Pago 100% seguro',   sub: 'SSL · PSE · Efecty',      color: C.magenta},
  {icon: '💎', title: 'Calidad garantizada', sub: 'Certificado 18k',         color: C.cyan},
  {icon: '↩️', title: 'Cambios fáciles',    sub: '30 días para devolver',   color: C.purple},
];

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────
export default function Homepage() {
  const {featuredProducts, collections} = useLoaderData<typeof loader>();

  return (
    <main style={{background: C.bg, minHeight: '100vh', overflowX: 'hidden'}}>

      {/* ══════════════════════════════════
          HERO SLIDER
      ══════════════════════════════════ */}
      <section style={{position: 'relative'}}>
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{delay: 4800, disableOnInteraction: false}}
          pagination={{clickable: true}}
          loop
          style={{
            '--swiper-pagination-color': C.purple,
            '--swiper-pagination-bullet-inactive-color': 'rgba(255,255,255,0.3)',
            '--swiper-pagination-bullet-inactive-opacity': '1',
            '--swiper-pagination-bullet-size': '8px',
          } as any}
        >
          {HERO_SLIDES.map((slide, i) => (
            <SwiperSlide key={i}>
              <div style={{
                position: 'relative',
                width: '100%',
                height: 'clamp(320px, 58vw, 640px)',
                overflow: 'hidden',
              }}>
                {/* Imagen */}
                <picture style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
                  <source media="(max-width:768px)" srcSet={slide.imgMobile} />
                  <img src={slide.img} alt={slide.title}
                    style={{width:'100%', height:'100%', objectFit:'cover', objectPosition:'top'}} />
                </picture>

                {/* Overlay gradient neon */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(110deg,
                    rgba(5,7,26,0.88) 0%,
                    rgba(5,7,26,0.55) 50%,
                    transparent 100%)`,
                }} />
                {/* Glow orb de color */}
                <div style={{
                  position: 'absolute', top: -80, left: -80,
                  width: 400, height: 400,
                  background: `radial-gradient(circle, ${slide.tagColor}22 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }} />

                {/* Contenido */}
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 2,
                  display: 'flex', alignItems: 'center',
                  padding: 'clamp(28px,6vw,72px) clamp(20px,6vw,88px)',
                }}>
                  <motion.div
                    key={i}
                    initial="hidden" animate="show"
                    variants={stagger}
                    style={{maxWidth: 580}}
                  >
                    {/* Tag */}
                    <motion.span variants={fadeUp} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: `${slide.tagColor}22`,
                      border: `1px solid ${slide.tagColor}60`,
                      color: slide.tagColor,
                      fontSize: 10, fontWeight: 800,
                      padding: '5px 14px', borderRadius: 20,
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      marginBottom: 18,
                      backdropFilter: 'blur(8px)',
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: slide.tagColor,
                        boxShadow: `0 0 8px ${slide.tagColor}`,
                        display: 'inline-block',
                      }} />
                      {slide.tag}
                    </motion.span>

                    {/* Título */}
                    <motion.h1 variants={fadeUp} style={{
                      color: 'white', fontWeight: 900,
                      fontSize: 'clamp(28px, 5.5vw, 58px)',
                      lineHeight: 1.08, margin: '0 0 14px',
                      textShadow: '0 2px 24px rgba(0,0,0,0.9)',
                    }}>
                      {slide.title}<br />
                      <span style={{
                        background: `linear-gradient(135deg, ${slide.tagColor}, ${
                          slide.tagColor === C.purple ? C.magenta : slide.tagColor === C.magenta ? C.cyan : C.purple
                        })`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}>
                        {slide.titleAccent}
                      </span>
                    </motion.h1>

                    {/* Subtítulo */}
                    <motion.p variants={fadeUp} style={{
                      color: 'rgba(255,255,255,0.75)',
                      fontSize: 'clamp(12px,1.4vw,15px)',
                      marginBottom: 28, fontWeight: 500,
                      textShadow: '0 1px 8px rgba(0,0,0,0.9)',
                    }}>
                      {slide.sub}
                    </motion.p>

                    {/* CTA */}
                    <motion.div variants={fadeUp}>
                      <motion.div whileTap={{scale: 0.95}} whileHover={{scale: 1.04}}>
                        <Link to={slide.href} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 10,
                          padding: '13px 30px',
                          background: `linear-gradient(135deg, ${slide.tagColor} 0%, ${
                            slide.tagColor === C.purple ? C.magenta : slide.tagColor === C.magenta ? C.cyan : C.purple
                          } 100%)`,
                          color: 'white', fontWeight: 800, fontSize: 12,
                          borderRadius: 6, textDecoration: 'none',
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          boxShadow: `0 4px 24px ${slide.tagColor}55`,
                        }}>
                          {slide.cta}
                          <span style={{fontSize: 16}}>→</span>
                        </Link>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ══════════════════════════════════
          PROMO STRIP — COUNTDOWN
      ══════════════════════════════════ */}
      <PromoStrip />

      {/* ══════════════════════════════════
          CATEGORÍAS
      ══════════════════════════════════ */}
      <SectionWrapper title="Categorías" seeAllHref="/collections/all">
        <motion.div
          initial="hidden" whileInView="show" viewport={{once: true, amount: 0.2}}
          variants={stagger}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
            gap: 12,
            padding: '0 16px 20px',
          }}
        >
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.handle} variants={popIn}>
              <motion.div whileHover={{scale: 1.07, y: -3}} whileTap={{scale: 0.95}}>
                <Link to={`/collections/${cat.handle}`} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  textDecoration: 'none', padding: '12px 4px',
                }}>
                  {/* Círculo neon */}
                  <div style={{
                    width: 62, height: 62, borderRadius: '50%',
                    background: `radial-gradient(circle at 35% 35%, ${cat.color}33, ${cat.color}11)`,
                    border: `1.5px solid ${cat.color}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26,
                    boxShadow: `0 0 18px ${cat.color}30, inset 0 0 12px ${cat.color}15`,
                    transition: 'all 0.25s',
                  }}>
                    {cat.emoji}
                  </div>
                  <span style={{
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: 11, fontWeight: 600,
                    textAlign: 'center', lineHeight: 1.2,
                  }}>
                    {cat.label}
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </SectionWrapper>

      {/* ══════════════════════════════════
          PRODUCTOS DESTACADOS
      ══════════════════════════════════ */}
      <SectionWrapper title="🔥 Más vendidos" seeAllHref="/collections/all" accent={C.magenta}>
        <Suspense fallback={<ProductsSkeleton />}>
          <Await resolve={featuredProducts}>
            {(res: any) => {
              if (!res?.products?.nodes) return null;
              const products = res.products.nodes.slice(0, 10);
              return (
                <motion.div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 12, padding: '0 16px 20px',
                  }}
                  initial="hidden" whileInView="show"
                  viewport={{once: true, amount: 0.05}}
                  variants={stagger}
                >
                  {products.map((product: any) => (
                    <ProductCard key={product.id} product={product} accentColor={C.purple} />
                  ))}
                </motion.div>
              );
            }}
          </Await>
        </Suspense>
      </SectionWrapper>

      {/* ══════════════════════════════════
          OFERTA ESPECIAL — MID BANNER
      ══════════════════════════════════ */}
      <OfferBanner />

      {/* ══════════════════════════════════
          COLECCIONES SWIPER
      ══════════════════════════════════ */}
      <SectionWrapper title="Nuestras colecciones" seeAllHref="/collections/all" accent={C.cyan}>
        <Suspense fallback={<div style={{height: 220, margin: '0 16px', background: '#0c0f28', borderRadius: 12}} />}>
          <Await resolve={collections}>
            {(res: any) => {
              const nodes = res?.collections?.nodes ?? [];
              if (!nodes.length) return null;
              return (
                <div style={{paddingBottom: 20}}>
                  <Swiper
                    modules={[Autoplay, FreeMode]}
                    autoplay={{delay: 3200, disableOnInteraction: false}}
                    loop freeMode
                    spaceBetween={12}
                    slidesPerView={1.7}
                    style={{paddingLeft: 16, paddingRight: 16}}
                    breakpoints={{
                      480: {slidesPerView: 2.4},
                      768: {slidesPerView: 3.3},
                      1024: {slidesPerView: 4.6},
                    }}
                  >
                    {nodes.map((col: any) => (
                      <SwiperSlide key={col.handle}>
                        <Link to={`/collections/${col.handle}`} style={{display: 'block', textDecoration: 'none'}}>
                          <motion.div
                            whileHover={{scale: 1.03, y: -4}}
                            transition={{duration: 0.3}}
                            style={{
                              position: 'relative', borderRadius: 12,
                              overflow: 'hidden', aspectRatio: '3/4',
                              border: '1px solid rgba(139,92,246,0.2)',
                              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                            }}
                          >
                            {col.image?.url ? (
                              <img src={col.image.url} alt={col.title}
                                style={{width:'100%', height:'100%', objectFit:'cover'}} />
                            ) : (
                              <div style={{
                                width:'100%', height:'100%',
                                background: 'linear-gradient(135deg, #0c0f28, #1a0533)',
                                display:'flex', alignItems:'center', justifyContent:'center',
                              }}>
                                <span style={{fontSize: 40}}>💍</span>
                              </div>
                            )}
                            {/* Overlay */}
                            <div style={{
                              position:'absolute', inset: 0,
                              background:'linear-gradient(to top, rgba(5,7,26,0.85) 0%, transparent 55%)',
                            }} />
                            {/* Borde neon bottom */}
                            <div style={{
                              position:'absolute', bottom: 0, left: 0, right: 0,
                              height: 2,
                              background: `linear-gradient(90deg, ${C.purple}, ${C.magenta})`,
                            }} />
                            <p style={{
                              position:'absolute', bottom: 12, left: 12, right: 12,
                              color:'white', fontWeight: 800, fontSize: 13, margin: 0,
                            }}>{col.title}</p>
                          </motion.div>
                        </Link>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              );
            }}
          </Await>
        </Suspense>
      </SectionWrapper>

      {/* ══════════════════════════════════
          SEGUNDA GRID — ACCESIBLES
      ══════════════════════════════════ */}
      <SectionWrapper title="💜 Por menos de $500.000" seeAllHref="/collections/all" accent={C.cyan}>
        <Suspense fallback={<ProductsSkeleton />}>
          <Await resolve={featuredProducts}>
            {(res: any) => {
              if (!res?.products?.nodes) return null;
              const affordable = res.products.nodes
                .filter((p: any) => parseFloat(p.priceRange.minVariantPrice.amount) < 500000)
                .slice(0, 8);
              if (!affordable.length) return (
                <p style={{color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'24px 0', fontSize:13}}>
                  Próximamente productos en esta categoría
                </p>
              );
              return (
                <motion.div
                  style={{
                    display:'grid',
                    gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: 12, padding: '0 16px 20px',
                  }}
                  initial="hidden" whileInView="show"
                  viewport={{once: true, amount: 0.05}}
                  variants={stagger}
                >
                  {affordable.map((product: any) => (
                    <ProductCard key={product.id} product={product} accentColor={C.cyan} />
                  ))}
                </motion.div>
              );
            }}
          </Await>
        </Suspense>
      </SectionWrapper>

      {/* ══════════════════════════════════
          BANNER BENEFICIOS
      ══════════════════════════════════ */}
      <BenefitsBanner />

    </main>
  );
}

// ─────────────────────────────────────────────
// SUB-COMPONENTES
// ─────────────────────────────────────────────

/** Wrapper con título y "ver más" */
function SectionWrapper({
  title, seeAllHref, accent = C.purple, children,
}: {
  title: string; seeAllHref: string; accent?: string; children: React.ReactNode;
}) {
  return (
    <section style={{
      background: C.bgCard,
      marginBottom: 6,
      paddingTop: 20,
      borderTop: `1px solid ${accent}22`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow detrás del título */}
      <div style={{
        position:'absolute', top: -40, left: -40,
        width: 220, height: 120,
        background: `radial-gradient(ellipse, ${accent}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <motion.div
        initial="hidden" whileInView="show" viewport={{once: true, amount: 0.4}}
        variants={fadeIn}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px 14px',
        }}
      >
        <h2 style={{
          color: 'white', fontWeight: 800,
          fontSize: 16, margin: 0,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            display: 'inline-block', width: 3, height: 18, borderRadius: 2,
            background: `linear-gradient(180deg, ${accent}, ${C.magenta})`,
            boxShadow: `0 0 8px ${accent}`,
          }} />
          {title}
        </h2>
        <Link to={seeAllHref} style={{
          color: accent,
          fontSize: 12, fontWeight: 700,
          textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: 4,
          border: `1px solid ${accent}44`,
          padding: '4px 12px', borderRadius: 20,
          background: `${accent}11`,
          transition: 'all 0.2s',
        }}>
          Ver todo →
        </Link>
      </motion.div>
      {children}
    </section>
  );
}

/** Card de producto */
function ProductCard({product, accentColor}: {product: any; accentColor: string}) {
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const compareAt = product.priceRange.maxVariantPrice
    ? parseFloat(product.priceRange.maxVariantPrice.amount)
    : null;
  const discount = compareAt && compareAt > price
    ? Math.round((1 - price / compareAt) * 100)
    : null;

  return (
    <motion.div
      variants={cardVar}
      whileHover={{y: -5, boxShadow: `0 16px 40px rgba(0,0,0,0.5), 0 0 20px ${accentColor}25`}}
      transition={{duration: 0.22}}
      style={{
        background: '#0a0d20',
        borderRadius: 10,
        overflow: 'hidden',
        border: `1px solid ${accentColor}20`,
        display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Badge descuento */}
      {discount && (
        <div style={{
          position: 'absolute', top: 8, left: 8, zIndex: 2,
          background: `linear-gradient(135deg, ${C.magenta}, ${C.purple})`,
          color: 'white', fontWeight: 900, fontSize: 10,
          padding: '3px 8px', borderRadius: 4,
          boxShadow: `0 2px 10px ${C.magentaGlow}`,
          letterSpacing: '0.04em',
        }}>
          -{discount}%
        </div>
      )}

      {/* Imagen */}
      <Link to={`/products/${product.handle}`} style={{
        display: 'block', aspectRatio: '1/1',
        overflow: 'hidden', position: 'relative',
      }}>
        {product.featuredImage?.url ? (
          <img
            src={product.featuredImage.url}
            alt={product.title}
            style={{width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s'}}
            loading="lazy"
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.07)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <div style={{
            width:'100%', height:'100%',
            background: `linear-gradient(135deg, #0c0f28, #1a0533)`,
            display:'flex', alignItems:'center', justifyContent:'center', fontSize: 36,
          }}>💎</div>
        )}
        {/* Shimmer overlay on hover */}
        <div style={{
          position:'absolute', inset:0,
          background:`linear-gradient(to top, ${accentColor}22 0%, transparent 50%)`,
        }} />
      </Link>

      {/* Info */}
      <div style={{padding: '10px 10px 4px', flex: 1}}>
        <Link to={`/products/${product.handle}`} style={{textDecoration:'none'}}>
          <p style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 12, fontWeight: 600,
            margin: '0 0 6px',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {product.title}
          </p>
        </Link>

        {/* Estrellas */}
        <div style={{color: '#fbbf24', fontSize: 11, marginBottom: 6, letterSpacing: 1}}>
          ★★★★<span style={{color:'rgba(255,255,255,0.15)'}}>★</span>
          <span style={{color:'rgba(255,255,255,0.35)', fontSize:10, marginLeft: 4}}>(24)</span>
        </div>

        {/* Precios */}
        {compareAt && compareAt > price && (
          <p style={{
            color:'rgba(255,255,255,0.3)', fontSize:11,
            textDecoration:'line-through', margin:'0 0 2px',
          }}>
            ${compareAt.toLocaleString('es-CO')}
          </p>
        )}
        <p style={{
          color: accentColor, fontSize: 15, fontWeight: 900, margin: '0 0 8px',
          textShadow: `0 0 12px ${accentColor}55`,
        }}>
          ${price.toLocaleString('es-CO')}
          <span style={{fontSize: 10, fontWeight: 600, color:'rgba(255,255,255,0.4)', marginLeft: 3}}>
            {product.priceRange.minVariantPrice.currencyCode}
          </span>
        </p>
      </div>

      {/* Botón */}
      <motion.div whileTap={{scale: 0.96}} style={{padding: '0 10px 10px'}}>
        <Link to={`/products/${product.handle}`} style={{
          display: 'block', textAlign: 'center', textDecoration: 'none',
          padding: '9px',
          background: `linear-gradient(135deg, ${accentColor} 0%, ${
            accentColor === C.purple ? C.magenta : C.purple
          } 100%)`,
          color: 'white', fontWeight: 800, fontSize: 11,
          borderRadius: 6, letterSpacing: '0.06em', textTransform: 'uppercase',
          boxShadow: `0 3px 14px ${accentColor}40`,
        }}>
          Ver producto →
        </Link>
      </motion.div>
    </motion.div>
  );
}

/** Promo strip con countdown */
function PromoStrip() {
  const {h, m, s, done} = useCountdown(OFFER_END);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <motion.div
      initial={{opacity:0, y:-8}} animate={{opacity:1, y:0}}
      transition={{duration:0.4, delay:0.15}}
      style={{
        background: 'linear-gradient(90deg, #0c0f28 0%, #130a2e 50%, #0c0f28 100%)',
        borderBottom: '1px solid rgba(139,92,246,0.2)',
        padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexWrap: 'wrap', gap: '8px 16px',
        overflowX: 'auto',
      }}
    >
      {/* Countdown */}
      {!done ? (
        <div style={{
          display:'inline-flex', alignItems:'center', gap: 8,
          background: 'rgba(236,72,153,0.12)',
          border: '1px solid rgba(236,72,153,0.35)',
          borderRadius: 20, padding: '5px 14px',
        }}>
          <span style={{fontSize:13}}>🔥</span>
          <span style={{color:'rgba(255,255,255,0.7)', fontSize:11, fontWeight:600}}>Oferta termina en</span>
          <div style={{display:'flex', gap: 4, alignItems:'center'}}>
            {[{v:h,l:'H'},{v:m,l:'M'},{v:s,l:'S'}].map(({v,l}, i) => (
              <span key={l} style={{display:'flex', alignItems:'center', gap: i < 2 ? 4 : 0}}>
                <span style={{
                  background:'rgba(236,72,153,0.2)', border:'1px solid rgba(236,72,153,0.4)',
                  borderRadius:4, padding:'2px 6px',
                  color: C.magenta, fontWeight:900, fontSize:13,
                  fontVariantNumeric:'tabular-nums', minWidth:26, textAlign:'center',
                }}>
                  {pad(v)}
                </span>
                <span style={{color:'rgba(255,255,255,0.3)',fontSize:10}}>{l}</span>
                {i < 2 && <span style={{color:C.magenta,fontWeight:900,fontSize:13,marginLeft:-2}}>:</span>}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <span style={{color:C.magenta, fontSize:12, fontWeight:700}}>🔥 Oferta terminada</span>
      )}

      {[
        {icon:'✈️', text:'Envío gratis',   color: C.purple},
        {icon:'⚡', text:'Pago SSL seguro', color: C.cyan},
        {icon:'🏆', text:'Calidad 18k',     color: C.magenta},
      ].map((pill, i) => (
        <div key={i} style={{
          display:'inline-flex', alignItems:'center', gap: 6,
          background:`${pill.color}12`,
          border:`1px solid ${pill.color}30`,
          borderRadius: 20, padding: '5px 14px',
          color:'rgba(255,255,255,0.7)', fontSize:11, fontWeight:600,
          whiteSpace:'nowrap',
        }}>
          <span>{pill.icon}</span> {pill.text}
        </div>
      ))}
    </motion.div>
  );
}

/** Banner oferta especial */
function OfferBanner() {
  return (
    <motion.div
      initial="hidden" whileInView="show" viewport={{once:true, amount:0.4}}
      variants={fadeUp}
      style={{padding:'6px 16px', marginBottom:6}}
    >
      <div style={{
        borderRadius: 12,
        background: 'linear-gradient(135deg, #1a0533 0%, #0a0d2e 40%, #001a2e 100%)',
        border: '1px solid rgba(139,92,246,0.3)',
        padding: 'clamp(20px,4vw,32px) clamp(20px,4vw,36px)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 20,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(139,92,246,0.15)',
      }}>
        {/* Orbs decorativos */}
        <div style={{position:'absolute', top:-40, right:60, width:160, height:160,
          background:'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
          pointerEvents:'none'}} />
        <div style={{position:'absolute', bottom:-30, left:40, width:120, height:120,
          background:'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
          pointerEvents:'none'}} />

        <div style={{position:'relative', zIndex:1}}>
          <p style={{
            color:C.purple, fontSize:11, fontWeight:800,
            letterSpacing:'0.12em', textTransform:'uppercase', margin:'0 0 6px',
          }}>
            ✦ Oferta especial
          </p>
          <h3 style={{color:'white', fontWeight:900, fontSize:'clamp(18px,3vw,26px)', margin:'0 0 6px'}}>
            🎁 Sets de regalo especiales
          </h3>
          <p style={{color:'rgba(255,255,255,0.5)', fontSize:13, margin:0}}>
            Perfectos para San Valentín · Aniversarios · Cumpleaños
          </p>
        </div>
        <motion.div whileTap={{scale:0.95}} whileHover={{scale:1.04}} style={{position:'relative', zIndex:1}}>
          <Link to="/collections/all" style={{
            display:'inline-flex', alignItems:'center', gap:8,
            padding:'13px 26px',
            background:`linear-gradient(135deg, ${C.purple} 0%, ${C.magenta} 100%)`,
            color:'white', fontWeight:800, fontSize:12,
            borderRadius:6, textDecoration:'none',
            letterSpacing:'0.08em', textTransform:'uppercase',
            boxShadow:`0 4px 20px ${C.purpleGlow}`,
            whiteSpace:'nowrap',
          }}>
            Ver sets →
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}

/** Banner de beneficios */
function BenefitsBanner() {
  return (
    <motion.section
      initial="hidden" whileInView="show" viewport={{once:true, amount:0.25}}
      variants={fadeIn}
      style={{
        background:'linear-gradient(135deg, #0c0f28 0%, #130a2e 50%, #001a2e 100%)',
        padding:'40px 20px 44px',
        borderTop:`1px solid rgba(139,92,246,0.2)`,
        position:'relative', overflow:'hidden',
      }}
    >
      {/* Fondo decorativo */}
      <div style={{position:'absolute', inset:0, opacity:0.04,
        backgroundImage:`repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(255,255,255,0.5) 30px, rgba(255,255,255,0.5) 31px),
          repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(255,255,255,0.5) 30px, rgba(255,255,255,0.5) 31px)`,
        pointerEvents:'none'}} />

      <motion.h2 variants={fadeUp} style={{
        color:'white', fontWeight:900, fontSize:'clamp(16px,3vw,22px)',
        textAlign:'center', marginBottom:32,
        display:'flex', alignItems:'center', justifyContent:'center', gap:10,
      }}>
        <span style={{
          display:'inline-block', width:28, height:2,
          background:`linear-gradient(90deg, transparent, ${C.purple})`,
        }} />
        ¿Por qué comprar con nosotros?
        <span style={{
          display:'inline-block', width:28, height:2,
          background:`linear-gradient(90deg, ${C.magenta}, transparent)`,
        }} />
      </motion.h2>

      <motion.div
        variants={stagger}
        style={{display:'flex', justifyContent:'center', flexWrap:'wrap', gap:'20px 40px', maxWidth:800, margin:'0 auto'}}
      >
        {BENEFITS.map((item, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            whileHover={{scale:1.07, y:-4}}
            style={{textAlign:'center', minWidth:140}}
          >
            {/* Icono con glow */}
            <div style={{
              width:60, height:60, borderRadius:'50%',
              background:`radial-gradient(circle, ${item.color}22, ${item.color}08)`,
              border:`1.5px solid ${item.color}44`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:26, margin:'0 auto 12px',
              boxShadow:`0 0 20px ${item.color}30`,
            }}>
              {item.icon}
            </div>
            <p style={{color:'white', fontWeight:800, fontSize:13, margin:'0 0 4px'}}>{item.title}</p>
            <p style={{color:'rgba(255,255,255,0.4)', fontSize:11}}>{item.sub}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}

/** Skeleton de carga */
function ProductsSkeleton() {
  return (
    <div style={{
      display:'grid',
      gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))',
      gap:12, padding:'0 16px 20px',
    }}>
      {Array.from({length:8}).map((_,i) => (
        <div key={i} style={{
          borderRadius:10, height:280,
          background:'linear-gradient(135deg, #0c0f28, #111428)',
          border:'1px solid rgba(139,92,246,0.1)',
          animation:'pulse 1.8s ease-in-out infinite',
          animationDelay:`${i*0.08}s`,
        }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// GRAPHQL
// ─────────────────────────────────────────────
const COLLECTION_CONTENT_FRAGMENT = `#graphql
  fragment CollectionContent on Collection {
    id handle title descriptionHtml
    heading: metafield(namespace: "hero", key: "title") { value }
    byline: metafield(namespace: "hero", key: "byline") { value }
    cta: metafield(namespace: "hero", key: "cta") { value }
    spread: metafield(namespace: "hero", key: "spread") { reference { ...Media } }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") { reference { ...Media } }
  }
  ${MEDIA_FRAGMENT}
` as const;

const HOMEPAGE_SEO_QUERY = `#graphql
  query seoCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) { ...CollectionContent }
    shop { name description }
  }
  ${COLLECTION_CONTENT_FRAGMENT}
` as const;

export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  query HomeProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 20, sortKey: BEST_SELLING) {
      nodes {
        id title handle publishedAt
        featuredImage { url altText }
        priceRange {
          minVariantPrice { amount currencyCode }
          maxVariantPrice { amount currencyCode }
        }
      }
    }
  }
` as const;

export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query HomeCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: 12, sortKey: UPDATED_AT) {
      nodes { id title handle image { url altText } }
    }
  }
` as const;