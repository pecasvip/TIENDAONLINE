import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import {Autoplay, FreeMode, Pagination} from 'swiper/modules';
import 'swiper/css/pagination';
import {Await, useLoaderData, Link} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';

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

const CATEGORIES = [
  {handle: 'anillos',    emoji: '💍', label: 'Anillos'},
  {handle: 'collares',   emoji: '📿', label: 'Collares'},
  {handle: 'pulseras-tejidas', emoji: '🔗', label: 'Pulseras'},
  {handle: 'topos',      emoji: '✨', label: 'Aretes'},
  {handle: 'relojes',    emoji: '⌚', label: 'Relojes'},
  {handle: 'dijes',      emoji: '🏅', label: 'Dijes'},
  {handle: 'sets',       emoji: '🎁', label: 'Sets regalo'},
  {handle: 'all',        emoji: '💛', label: 'Oro 18k'},
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
    <main style={{background:'#f5f5f5', minHeight:'100vh'}}>

      {/* ── HERO SLIDER ── */}
      <section style={{position:'relative'}}>
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{delay: 4500, disableOnInteraction: false}}
          pagination={{clickable: true}}
          loop
          style={{'--swiper-pagination-color':'#FFD600', '--swiper-pagination-bullet-inactive-color':'rgba(255,255,255,0.5)'} as any}
        >
          {HERO_SLIDES.map((slide, i) => (
            <SwiperSlide key={i}>
  <div style={{
    position: 'relative',
    width: '100%',
    aspectRatio: '5/2',
    minHeight: 180,
    overflow: 'hidden'
  }}>
    <picture style={{position:'absolute', inset:0, width:'100%', height:'100%'}}>
      <source media="(max-width:768px)" srcSet={slide.imgMobile} />
      <img
        src={slide.img}
        alt={slide.title}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'top'
        }}
      />
    </picture>
    <div style={{position:'absolute', inset:0, background:'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)'}} />
    <div style={{position:'relative', zIndex:2, padding:'clamp(28px,6vw,60px) clamp(20px,5vw,80px)', maxWidth:560}}>
      <span style={{background:'#FFD600', color:'#1a1a1a', fontSize:11, fontWeight:900, padding:'4px 12px', borderRadius:3, letterSpacing:'0.05em', textTransform:'uppercase'}}>
        {slide.tag}
      </span>
      <h1 style={{color:'white', fontWeight:900, fontSize:'clamp(26px,5vw,52px)', lineHeight:1.1, margin:'12px 0 10px'}}>
        {slide.title}<br/>
        <em style={{color:'#FFD600', fontStyle:'normal'}}>{slide.titleAccent}</em>
      </h1>
      <p style={{color:'rgba(255,255,255,0.8)', fontSize:13, marginBottom:20}}>{slide.sub}</p>
      <Link to={slide.href} className="linio-hero-cta">{slide.cta} →</Link>
    </div>
  </div>
</SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* ── PROMO STRIP ── */}
      <div className="promo-strip">
        <span className="promo-pill red">🔥 Hasta 60% OFF</span>
        <span className="promo-pill amber">✈️ Envío gratis</span>
        <span className="promo-pill blue">⚡ Pago seguro SSL</span>
        <span className="promo-pill green">🏆 Garantía de calidad</span>
      </div>

      {/* ── CATEGORÍAS ── */}
      <section className="linio-section" style={{background:'white', marginBottom:8}}>
        <div className="linio-section-title">
          Categorías
          <Link to="/collections/all" className="linio-see-all">Ver todas →</Link>
        </div>
        <div className="linio-cat-icons">
          {CATEGORIES.map((cat) => (
            <Link key={cat.handle} to={`/collections/${cat.handle}`} className="linio-cat-icon">
              <div className="linio-cat-icon-circle">{cat.emoji}</div>
              <span>{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── PRODUCTOS DESTACADOS ── */}
      <section className="linio-section" style={{background:'white', marginBottom:8}}>
        <div className="linio-section-title">
          Más vendidos
          <Link to="/collections/all" className="linio-see-all">Ver más →</Link>
        </div>
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
                <div className="linio-products-grid">
                  {products.map((product: any) => {
                    const price = parseFloat(product.priceRange.minVariantPrice.amount);
                    const compareAt = product.priceRange.maxVariantPrice
                      ? parseFloat(product.priceRange.maxVariantPrice.amount)
                      : null;
                    const discount = compareAt && compareAt > price
                      ? Math.round((1 - price / compareAt) * 100)
                      : null;
                    return (
                      <div key={product.id} className="linio-product-card">
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
                        <Link
                          to={`/products/${product.handle}`}
                          className="linio-add-btn"
                          style={{display:'block', textAlign:'center', textDecoration:'none'}}
                        >
                          Ver producto →
                        </Link>
                      </div>
                    );
                  })}
                </div>
              );
            }}
          </Await>
        </Suspense>
      </section>

      {/* ── MID BANNER SETS ── */}
      <div style={{padding:'0 16px 8px'}}>
        <div className="linio-mid-banner">
          <div>
            <h3>🎁 Sets de regalo especiales</h3>
            <p>Perfectos para San Valentín · Aniversarios · Cumpleaños</p>
          </div>
          <Link to="/collections/all" className="linio-mid-banner-btn">Ver sets →</Link>
        </div>
      </div>

      {/* ── COLECCIONES SWIPER ── */}
      <section className="linio-section" style={{background:'white', marginBottom:8}}>
        <div className="linio-section-title">
          Nuestras colecciones
          <Link to="/collections/all" className="linio-see-all">Ver todas →</Link>
        </div>
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
                        <div style={{position:'relative', borderRadius:12, overflow:'hidden', aspectRatio:'3/4'}}>
                          {col.image?.url ? (
                            <img
                              src={col.image.url}
                              alt={col.title}
                              style={{width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s'}}
                              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.07)')}
                              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            />
                          ) : (
                            <div style={{width:'100%', height:'100%', background:'#e8e8e8', display:'flex', alignItems:'center', justifyContent:'center'}}>
                              <span style={{fontSize:40}}>💍</span>
                            </div>
                          )}
                          <div style={{position:'absolute', bottom:0, left:0, right:0, background:'linear-gradient(transparent, rgba(0,0,0,0.7))', padding:'24px 14px 14px'}}>
                            <p style={{color:'white', fontWeight:900, fontSize:14, margin:0}}>{col.title}</p>
                          </div>
                        </div>
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
      <section className="linio-section" style={{background:'white', marginBottom:8}}>
        <div className="linio-section-title">
          Por menos de $500.000
          <Link to="/collections/all" className="linio-see-all">Ver más →</Link>
        </div>
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
                <div className="linio-products-grid">
                  {affordable.map((product: any) => {
                    const price = parseFloat(product.priceRange.minVariantPrice.amount);
                    return (
                      <div key={product.id} className="linio-product-card">
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
                        <Link to={`/products/${product.handle}`} className="linio-add-btn" style={{display:'block', textAlign:'center', textDecoration:'none'}}>Ver producto →</Link>
                      </div>
                    );
                  })}
                </div>
              );
            }}
          </Await>
        </Suspense>
      </section>

      {/* ── BANNER ENVÍO ── */}
      <section style={{background:'#212121', padding:'32px 20px', textAlign:'center'}}>
        <h2 style={{color:'white', fontWeight:900, fontSize:20, marginBottom:20}}>¿Por qué comprar con nosotros?</h2>
        <div style={{display:'flex', justifyContent:'center', flexWrap:'wrap', gap:32}}>
          {[
            {icon:'🚚', title:'Envío gratis', sub:'En pedidos +$150.000'},
            {icon:'🔒', title:'Pago 100% seguro', sub:'SSL y PSE'},
            {icon:'💎', title:'Calidad garantizada', sub:'Oro certificado 18k'},
            {icon:'↩️', title:'Cambios fáciles', sub:'30 días para devolver'},
          ].map((item, i) => (
            <div key={i} style={{textAlign:'center', minWidth:120}}>
              <div style={{fontSize:32, marginBottom:8}}>{item.icon}</div>
              <p style={{color:'white', fontWeight:800, fontSize:13, marginBottom:3}}>{item.title}</p>
              <p style={{color:'rgba(255,255,255,0.5)', fontSize:11}}>{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

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
