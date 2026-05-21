import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Suspense, useEffect, useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import {Autoplay, FreeMode, Pagination} from 'swiper/modules';
import 'swiper/css/pagination';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';
import {motion} from 'framer-motion';

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

// ── Variantes de animación ──
const fadeUp = {
  hidden: {opacity: 0, y: 32},
  show:   {opacity: 1, y: 0, transition: {duration: 0.55, ease: 'easeOut'}},
};
const fadeIn = {
  hidden: {opacity: 0},
  show:   {opacity: 1, transition: {duration: 0.5, ease: 'easeOut'}},
};
const staggerContainer = {
  hidden: {},
  show: {transition: {staggerChildren: 0.08}},
};
const cardVariant = {
  hidden: {opacity: 0, y: 24, scale: 0.97},
  show:   {opacity: 1, y: 0, scale: 1, transition: {duration: 0.45, ease: 'easeOut'}},
};
const popIn = {
  hidden: {opacity: 0, scale: 0.8},
  show:   {opacity: 1, scale: 1, transition: {type: 'spring', stiffness: 300, damping: 20}},
};

// ── Contador regresivo ──
const OFFER_END = new Date();
OFFER_END.setHours(OFFER_END.getHours() + 6); // 6 horas desde que carga la página

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = target.getTime() - Date.now();
    return diff > 0 ? diff : 0;
  });
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = target.getTime() - Date.now();
      setTimeLeft(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);
  const h = Math.floor(timeLeft / 3_600_000);
  const m = Math.floor((timeLeft % 3_600_000) / 60_000);
  const s = Math.floor((timeLeft % 60_000) / 1_000);
  return {h, m, s, done: timeLeft === 0};
}

function CountdownTimer() {
  const {h, m, s, done} = useCountdown(OFFER_END);
  if (done) return <span className="promo-pill red">🔥 Oferta terminada</span>;
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <span className="promo-pill red" style={{display:'inline-flex', alignItems:'center', gap:4}}>
      🔥 Oferta termina en&nbsp;
      <motion.span
        key={s}
        initial={{opacity: 0, y: -6}}
        animate={{opacity: 1, y: 0}}
        style={{
          fontWeight: 900,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: '0.05em',
        }}
      >
        {pad(h)}:{pad(m)}:{pad(s)}
      </motion.span>
    </span>
  );
}

const CATEGORIES = [
  {handle: 'anillos',          emoji: '💍', label: 'Anillos'},
  {handle: 'collares',         emoji: '📿', label: 'Collares'},
  {handle: 'pulseras-tejidas', emoji: '🔗', label: 'Pulseras'},
  {handle: 'topos',            emoji: '✨', label: 'Aretes'},
  {handle: 'relojes',          emoji: '⌚', label: 'Relojes'},
  {handle: 'dijes',            emoji: '🏅', label: 'Dijes'},
  {handle: 'sets',             emoji: '🎁', label: 'Sets regalo'},
  {handle: 'all',              emoji: '💛', label: 'Oro 18k'},
];

const HERO_SLIDES = [
  {
    img: '/images/banner1.jpg',
    imgMobile: '/images/banner1-mobile.jpg',
    tag: 'Nueva colección',
    title: 'Accesorios que',
    titleAccent: 'brillan',
    sub: 'Envío gratis en pedidos desde $150.000',
    cta: 'Ver colección',
    href: '/collections/all',
  },
  {
    img: '/images/banner2.jpg',
    imgMobile: '/images/banner2-mobile.jpg',
    tag: 'Hasta 60% OFF',
    title: 'Joyas de',
    titleAccent: 'oro 18k',
    sub: 'Calidad garantizada · Precio justo',
    cta: 'Ver ofertas',
    href: '/collections/anillos',
  },
  {
    img: '/images/banner3.jpg',
    imgMobile: '/images/banner3-mobile.jpg',
    tag: 'Sets de regalo',
    title: 'El regalo',
    titleAccent: 'perfecto',
    sub: 'Cajas especiales para cada ocasión',
    cta: 'Ver sets',
    href: '/collections/all',
  },
];

export default function Homepage() {
  const {featuredProducts, collections} = useLoaderData<typeof loader>();

  return (
    <main style={{background: '#f5f5f5', minHeight: '100vh'}}>

      {/* ── HERO SLIDER ── */}
      <section style={{position: 'relative'}}>
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{delay: 4500, disableOnInteraction: false}}
          pagination={{clickable: true}}
          loop
          style={{'--swiper-pagination-color': '#FFD600', '--swiper-pagination-bullet-inactive-color': 'rgba(255,255,255,0.5)'} as any}
        >
          {HERO_SLIDES.map((slide, i) => (
            <SwiperSlide key={i}>
              <div style={{
                position: 'relative',
                width: '100%',
                height: 'clamp(300px, 55vw, 620px)',
                overflow: 'hidden',
              }}>
                <picture style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
                  <source media="(max-width:768px)" srcSet={slide.imgMobile} />
                  <img
                    src={slide.img}
                    alt={slide.title}
                    style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}}
                  />
                </picture>

                <div style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 2,
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'clamp(28px,6vw,60px) clamp(20px,5vw,80px)',
                }}>
                  <motion.div
                    key={i}
                    initial="hidden"
                    animate="show"
                    variants={staggerContainer}
                    style={{maxWidth: 560}}
                  >
                    <motion.span variants={fadeUp} style={{
                      background: '#FFD600',
                      color: '#1a1a1a',
                      fontSize: 11,
                      fontWeight: 900,
                      padding: '4px 12px',
                      borderRadius: 3,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      display: 'inline-block',
                      marginBottom: 12,
                    }}>
                      {slide.tag}
                    </motion.span>

                    <motion.h1 variants={fadeUp} style={{
                      color: 'white',
                      fontWeight: 900,
                      fontSize: 'clamp(26px,5vw,52px)',
                      lineHeight: 1.1,
                      margin: '0 0 10px',
                      textShadow: '0 2px 20px rgba(0,0,0,0.85), 0 0 60px rgba(0,0,0,0.6)',
                    }}>
                      {slide.title}<br/>
                      <em style={{color: '#FFD600', fontStyle: 'normal', textShadow: '0 2px 20px rgba(0,0,0,0.9)'}}>
                        {slide.titleAccent}
                      </em>
                    </motion.h1>

                    <motion.p variants={fadeUp} style={{
                      color: 'white',
                      fontSize: 13,
                      marginBottom: 24,
                      fontWeight: 600,
                      textShadow: '0 1px 10px rgba(0,0,0,0.95)',
                    }}>
                      {slide.sub}
                    </motion.p>

                    <motion.div variants={fadeUp}>
                      <motion.div whileTap={{scale: 0.96}} whileHover={{scale: 1.03}}>
                        <Link to={slide.href} style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '13px 28px',
                          background: 'linear-gradient(135deg, #FFD600 0%, #FF8C00 100%)',
                          color: '#1a1a1a',
                          fontWeight: 900,
                          fontSize: 13,
                          borderRadius: 4,
                          textDecoration: 'none',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          boxShadow: '0 4px 20px rgba(255,214,0,0.45)',
                        }}>
                          {slide.cta} →
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

      {/* ── PROMO STRIP con contador ── */}
      <motion.div
        className="promo-strip"
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.4, delay: 0.2}}
      >
        <CountdownTimer />
        <span className="promo-pill amber">✈️ Envío gratis</span>
        <span className="promo-pill blue">⚡ Pago seguro SSL</span>
        <span className="promo-pill green">🏆 Garantía de calidad</span>
      </motion.div>

      {/* ── CATEGORÍAS ── */}
      <section className="linio-section" style={{background: 'white', marginBottom: 8}}>
        <motion.div
          className="linio-section-title"
          initial="hidden" whileInView="show" viewport={{once: true, amount: 0.3}}
          variants={fadeIn}
        >
          Categorías
          <Link to="/collections/all" className="linio-see-all">Ver todas →</Link>
        </motion.div>
        <motion.div
          className="linio-cat-icons"
          initial="hidden" whileInView="show" viewport={{once: true, amount: 0.2}}
          variants={staggerContainer}
        >
          {CATEGORIES.map((cat) => (
            <motion.div key={cat.handle} variants={popIn}>
              <motion.div whileHover={{scale: 1.08}} whileTap={{scale: 0.94}}>
                <Link to={`/collections/${cat.handle}`} className="linio-cat-icon">
                  <div className="linio-cat-icon-circle">{cat.emoji}</div>
                  <span>{cat.label}</span>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── PRODUCTOS DESTACADOS ── */}
      <section className="linio-section" style={{background: 'white', marginBottom: 8}}>
        <motion.div
          className="linio-section-title"
          initial="hidden" whileInView="show" viewport={{once: true, amount: 0.3}}
          variants={fadeIn}
        >
          Más vendidos
          <Link to="/collections/all" className="linio-see-all">Ver más →</Link>
        </motion.div>
        <Suspense fallback={
          <div className="linio-products-grid">
            {[...Array(8)].map((_,i) => (
              <div key={i} style={{background:'#f5f5f5', borderRadius:8, height:280, animation:'pulse 1.5s ease-in-out infinite'}} />
            ))}
          </div>
        }>
          <Await resolve={featuredProducts}>
            {(response: any) => {
              if (!response?.products?.nodes) return null;
              const products = response.products.nodes.slice(0, 10);
              return (
                <motion.div
                  className="linio-products-grid"
                  initial="hidden" whileInView="show" viewport={{once: true, amount: 0.1}}
                  variants={staggerContainer}
                >
                  {products.map((product: any) => {
                    const price = parseFloat(product.priceRange.minVariantPrice.amount);
                    const compareAt = product.priceRange.maxVariantPrice
                      ? parseFloat(product.priceRange.maxVariantPrice.amount)
                      : null;
                    const discount = compareAt && compareAt > price
                      ? Math.round((1 - price / compareAt) * 100)
                      : null;
                    return (
                      <motion.div
                        key={product.id}
                        className="linio-product-card"
                        variants={cardVariant}
                        whileHover={{y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.12)'}}
                        transition={{duration: 0.25}}
                      >
                        {discount && <span className="linio-discount-badge">-{discount}%</span>}
                        <Link to={`/products/${product.handle}`} className="linio-product-img">
                          {product.featuredImage?.url ? (
                            <img
                              src={product.featuredImage.url}
                              alt={product.title}
                              style={{width:'100%', height:'100%', objectFit:'cover'}}
                              loading="lazy"
                            />
                          ) : (
                            <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:40}}>💎</div>
                          )}
                        </Link>
                        <div className="linio-product-info">
                          <Link to={`/products/${product.handle}`}>
                            <p className="linio-product-name">{product.title}</p>
                          </Link>
                          <div className="linio-stars">★★★★<span style={{color:'#eee'}}>★</span> <span>(24)</span></div>
                          {compareAt && compareAt > price && (
                            <div className="linio-price-old">
                              ${compareAt.toLocaleString('es-CO')} {product.priceRange.minVariantPrice.currencyCode}
                            </div>
                          )}
                          <div className="linio-price-new">
                            ${price.toLocaleString('es-CO')} {product.priceRange.minVariantPrice.currencyCode}
                          </div>
                        </div>
                        <motion.div whileTap={{scale: 0.96}}>
                          <Link
                            to={`/products/${product.handle}`}
                            style={{
                              display: 'block',
                              textAlign: 'center',
                              textDecoration: 'none',
                              margin: '8px 12px 12px',
                              padding: '10px 16px',
                              background: 'linear-gradient(135deg, #FFD600 0%, #FF8C00 100%)',
                              color: '#1a1a1a',
                              fontWeight: 900,
                              fontSize: 12,
                              borderRadius: 4,
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                              boxShadow: '0 2px 10px rgba(255,140,0,0.3)',
                            }}
                          >
                            Ver producto →
                          </Link>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              );
            }}
          </Await>
        </Suspense>
      </section>

      {/* ── MID BANNER SETS ── */}
      <motion.div
        style={{padding: '0 16px 8px'}}
        initial="hidden" whileInView="show" viewport={{once: true, amount: 0.4}}
        variants={fadeUp}
      >
        <div className="linio-mid-banner">
          <div>
            <h3>🎁 Sets de regalo especiales</h3>
            <p>Perfectos para San Valentín · Aniversarios · Cumpleaños</p>
          </div>
          <motion.div whileTap={{scale: 0.96}} whileHover={{scale: 1.04}}>
            <Link to="/collections/all" style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #FFD600 0%, #FF8C00 100%)',
              color: '#1a1a1a',
              fontWeight: 900,
              fontSize: 13,
              borderRadius: 4,
              textDecoration: 'none',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 16px rgba(255,140,0,0.35)',
              whiteSpace: 'nowrap',
            }}>
              Ver sets →
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* ── COLECCIONES SWIPER ── */}
      <section className="linio-section" style={{background: 'white', marginBottom: 8}}>
        <motion.div
          className="linio-section-title"
          initial="hidden" whileInView="show" viewport={{once: true, amount: 0.3}}
          variants={fadeIn}
        >
          Nuestras colecciones
          <Link to="/collections/all" className="linio-see-all">Ver todas →</Link>
        </motion.div>
        <Suspense fallback={<div style={{height:200, background:'#f5f5f5', borderRadius:8}} />}>
          <Await resolve={collections}>
            {(response: any) => {
              const nodes = response?.collections?.nodes ?? [];
              if (!nodes.length) return null;
              return (
                <Swiper
                  modules={[Autoplay, FreeMode]}
                  autoplay={{delay: 3000, disableOnInteraction: false}}
                  loop
                  freeMode
                  spaceBetween={12}
                  slidesPerView={1.6}
                  breakpoints={{
                    480: {slidesPerView: 2.3},
                    768: {slidesPerView: 3.2},
                    1024: {slidesPerView: 4.5},
                  }}
                >
                  {nodes.map((col: any) => (
                    <SwiperSlide key={col.handle}>
                      <Link to={`/collections/${col.handle}`} style={{display:'block', textDecoration:'none'}}>
                        <motion.div
                          style={{position:'relative', borderRadius:12, overflow:'hidden', aspectRatio:'3/4'}}
                          whileHover={{scale: 1.03}}
                          transition={{duration: 0.35}}
                        >
                          {col.image?.url ? (
                            <img src={col.image.url} alt={col.title} style={{width:'100%', height:'100%', objectFit:'cover'}} />
                          ) : (
                            <div style={{width:'100%', height:'100%', background:'#e8e8e8', display:'flex', alignItems:'center', justifyContent:'center'}}>
                              <span style={{fontSize:40}}>💍</span>
                            </div>
                          )}
                          <div style={{position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(transparent, rgba(0,0,0,0.7))', padding:'24px 14px 14px'}}>
                            <p style={{color:'white', fontWeight:900, fontSize:14, margin:0}}>{col.title}</p>
                          </div>
                        </motion.div>
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
              );
            }}
          </Await>
        </Suspense>
      </section>

      {/* ── SEGUNDO GRID: ACCESIBLES ── */}
      <section className="linio-section" style={{background: 'white', marginBottom: 8}}>
        <motion.div
          className="linio-section-title"
          initial="hidden" whileInView="show" viewport={{once: true, amount: 0.3}}
          variants={fadeIn}
        >
          Por menos de $500.000
          <Link to="/collections/all" className="linio-see-all">Ver más →</Link>
        </motion.div>
        <Suspense fallback={<div style={{height:200}} />}>
          <Await resolve={featuredProducts}>
            {(response: any) => {
              if (!response?.products?.nodes) return null;
              const affordable = response.products.nodes.filter(
                (p: any) => parseFloat(p.priceRange.minVariantPrice.amount) < 500000
              ).slice(0, 8);
              if (!affordable.length) return (
                <p style={{color:'#bbb', textAlign:'center', padding:24, fontSize:13}}>Próximamente productos en esta categoría</p>
              );
              return (
                <motion.div
                  className="linio-products-grid"
                  initial="hidden" whileInView="show" viewport={{once: true, amount: 0.1}}
                  variants={staggerContainer}
                >
                  {affordable.map((product: any) => {
                    const price = parseFloat(product.priceRange.minVariantPrice.amount);
                    return (
                      <motion.div
                        key={product.id}
                        className="linio-product-card"
                        variants={cardVariant}
                        whileHover={{y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.12)'}}
                        transition={{duration: 0.25}}
                      >
                        <Link to={`/products/${product.handle}`} className="linio-product-img">
                          {product.featuredImage?.url ? (
                            <img src={product.featuredImage.url} alt={product.title} style={{width:'100%', height:'100%', objectFit:'cover'}} loading="lazy" />
                          ) : (
                            <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', fontSize:40}}>💎</div>
                          )}
                        </Link>
                        <div className="linio-product-info">
                          <Link to={`/products/${product.handle}`}>
                            <p className="linio-product-name">{product.title}</p>
                          </Link>
                          <div className="linio-stars">★★★★<span style={{color:'#eee'}}>★</span></div>
                          <div className="linio-price-new">${price.toLocaleString('es-CO')}</div>
                        </div>
                        <motion.div whileTap={{scale: 0.96}}>
                          <Link
                            to={`/products/${product.handle}`}
                            style={{
                              display: 'block',
                              textAlign: 'center',
                              textDecoration: 'none',
                              margin: '8px 12px 12px',
                              padding: '10px 16px',
                              background: 'linear-gradient(135deg, #FFD600 0%, #FF8C00 100%)',
                              color: '#1a1a1a',
                              fontWeight: 900,
                              fontSize: 12,
                              borderRadius: 4,
                              letterSpacing: '0.04em',
                              textTransform: 'uppercase',
                              boxShadow: '0 2px 10px rgba(255,140,0,0.3)',
                            }}
                          >
                            Ver producto →
                          </Link>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              );
            }}
          </Await>
        </Suspense>
      </section>

      {/* ── BANNER ENVÍO ── */}
      <motion.section
        style={{background:'#212121', padding:'32px 20px', textAlign:'center'}}
        initial="hidden" whileInView="show" viewport={{once: true, amount: 0.3}}
        variants={fadeIn}
      >
        <h2 style={{color:'white', fontWeight:900, fontSize:20, marginBottom:20}}>¿Por qué comprar con nosotros?</h2>
        <motion.div
          style={{display:'flex', justifyContent:'center', flexWrap:'wrap', gap:32}}
          variants={staggerContainer}
        >
          {[
            {icon:'🚚', title:'Envío gratis', sub:'En pedidos +$150.000'},
            {icon:'🔒', title:'Pago 100% seguro', sub:'SSL y PSE'},
            {icon:'💎', title:'Calidad garantizada', sub:'Oro certificado 18k'},
            {icon:'↩️', title:'Cambios fáciles', sub:'30 días para devolver'},
          ].map((item, i) => (
            <motion.div
              key={i}
              style={{textAlign:'center', minWidth:120}}
              variants={fadeUp}
              whileHover={{scale: 1.08}}
            >
              <div style={{fontSize:32, marginBottom:8}}>{item.icon}</div>
              <p style={{color:'white', fontWeight:800, fontSize:13, marginBottom:3}}>{item.title}</p>
              <p style={{color:'rgba(255,255,255,0.5)', fontSize:11}}>{item.sub}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

    </main>
  );
}

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