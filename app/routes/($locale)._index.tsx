import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useEffect, useRef} from 'react';
import {Suspense} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import {Autoplay, FreeMode, Navigation} from 'swiper/modules';
import {Await, useLoaderData} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';
import {motion} from 'framer-motion';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

import CouponRevealViral from '~/components/CouponRevealViral';
import Reveal from '~/components/Reveal';
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
    .query(HOMEPAGE_SEO_QUERY, {
      variables: {handle: 'frontpage', country, language},
    })
    .catch((error) => {
      console.error('Homepage SEO query failed:', error);
      return {shop: null, hero: null};
    });

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
    .catch((error) => {
      console.error(error);
      return null;
    });
  const collections = context.storefront
    .query(FEATURED_COLLECTIONS_QUERY, {variables: {country, language}})
    .catch((error) => {
      console.error(error);
      return null;
    });
  return {featuredProducts, collections};
}

export const meta = ({matches}: MetaArgs<typeof loader>) => {
  const seoData = matches
    .map((match) => (match.data as any).seo)
    .filter(Boolean);

  if (seoData.length === 0) {
    return {
      title: 'Diamond Jewelry Co',
      description: 'Tienda online de joyería de lujo',
    };
  }

  return getSeoMeta(...seoData);
};

const COLLECTIONS = [
  {handle: 'pulseras-tejidas', title: 'Pulseras Tejidas'},
  {handle: 'anillos', title: 'Anillos'},
  {handle: 'cadenas', title: 'Cadenas'},
  {handle: 'topos', title: 'Topos'},
  {handle: 'candongas', title: 'Candongas'},
  {handle: 'dijes', title: 'Dijes'},
  {handle: 'pulsos', title: 'Pulsos'},
];

export default function Homepage() {
  const {featuredProducts, collections} = useLoaderData<typeof loader>();

  const productsRef = useRef<HTMLDivElement>(null);
  const affordableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const timer = setTimeout(() => {
      // Productos
      if (productsRef.current) {
        ScrollTrigger.create({
          trigger: productsRef.current,
          start: 'top 85%',
          onEnter: () => {
            const cards = productsRef.current!.querySelectorAll('.product-card');
            if (cards.length > 0) {
              gsap.fromTo(
                cards,
                {opacity: 0, y: 50, scale: 0.95},
                {opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out'},
              );
            }
          },
        });
      }

      // Affordable
      if (affordableRef.current) {
        const cards = affordableRef.current.querySelectorAll('.affordable-card');
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            {opacity: 0, y: 40},
            {
              opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
              scrollTrigger: {trigger: affordableRef.current, start: 'top 80%'},
            },
          );
        }
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <main className="bg-[#0A0F1E] text-[#F8F6F0CF] min-h-screen overflow-hidden">

      {/* ── HERO SLIDER ── */}
      <section className="relative min-h-screen">
        <Swiper
          modules={[Autoplay]}
          autoplay={{delay: 4000, disableOnInteraction: false}}
          loop
          className="h-screen"
        >
          <SwiperSlide>
            <div className="relative h-screen">
              <picture className="absolute inset-0 w-full h-full">
                <source media="(max-width: 768px)" srcSet="/images/banner1-mobile.jpg" />
                <img src="/images/banner1.jpg" alt="Banner de joyería" className="w-full h-full object-cover object-top" />
              </picture>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative h-screen">
              <picture className="absolute inset-0 w-full h-full">
                <source media="(max-width: 768px)" srcSet="/images/banner2-mobile.jpg" />
                <img src="/images/banner2.jpg" alt="Colección de joyería" className="w-full h-full object-cover object-top" />
              </picture>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative h-screen">
              <picture className="absolute inset-0 w-full h-full">
                <source media="(max-width: 768px)" srcSet="/images/banner3-mobile.jpg" />
                <img src="/images/banner3.jpg" alt="Joyas exclusivas" className="w-full h-full object-cover object-top" />
              </picture>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* ── PRODUCTOS DESTACADOS ── */}
      <Reveal>
        <section className="py-32 px-6 bg-[#0D1527]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center">
              <p className="uppercase tracking-[0.3em] text-[#C9A84C] text-sm">Luxury Collection</p>
              <h2 className="text-5xl md:text-7xl font-bold text-[#F8F6F0] mt-6">Productos Destacados</h2>
            </div>
            <div ref={productsRef} className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <Suspense fallback={<div className="text-white">Cargando...</div>}>
                <Await resolve={featuredProducts}>
                  {(response: any) => {
                    if (!response?.products?.nodes) return null;
                    return response.products.nodes.map((product: any) => (
                      <div key={product.id} className="product-card group relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                        <a href={`/products/${product.handle}`} className="block overflow-hidden bg-gray-50 aspect-square relative">
                          <img
                            src={product.featuredImage?.url}
                            alt={product.title}
                            width="400"
                            height="400"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </a>
                        <div className="flex flex-col gap-3 p-4 flex-1">
                          <a href={`/products/${product.handle}`}>
                            <h3 className="text-sm font-medium text-[#0A0F1E] leading-snug line-clamp-2 hover:text-[#C9A84C] transition-colors">
                              {product.title}
                            </h3>
                          </a>
                          <span className="text-[#C9A84C] font-bold text-base">
                            ${parseFloat(product.priceRange.minVariantPrice.amount).toLocaleString('es-CO')}{' '}
                            {product.priceRange.minVariantPrice.currencyCode}
                          </span>
                          <a
                            href={`/products/${product.handle}`}
                            className="w-full mt-auto bg-[#0A0F1E] hover:bg-[#C9A84C] text-white hover:text-[#0A0F1E] text-xs font-bold uppercase tracking-widest py-3 rounded-full transition-all duration-300 text-center"
                          >
                            Ver producto
                          </a>
                        </div>
                      </div>
                    ));
                  }}
                </Await>
              </Suspense>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── CUPÓN VIRAL ── */}
      <Reveal><CouponRevealViral /></Reveal>

      {/* ── CARRUSEL DE COLECCIONES ── */}
      <Reveal>
        <section className="py-20 px-6 bg-[#0A0F1E]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              <p className="uppercase tracking-[0.3em] text-[#C9A84C] text-sm">Explora</p>
              <h2 className="text-4xl md:text-6xl font-bold text-[#F8F6F0] mt-4">Nuestras Colecciones</h2>
            </div>
            <div className="relative">
              {/* Botones prev/next */}
              <button
                id="col-prev"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-[#C9A84C] text-[#0A0F1E] flex items-center justify-center shadow-lg hover:bg-white transition-colors duration-300 hidden md:flex"
                aria-label="Anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                id="col-next"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-[#C9A84C] text-[#0A0F1E] flex items-center justify-center shadow-lg hover:bg-white transition-colors duration-300 hidden md:flex"
                aria-label="Siguiente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <Suspense fallback={<div className="text-white text-center">Cargando colecciones...</div>}>
                <Await resolve={collections}>
                  {(response: any) => {
                    const nodes = response?.collections?.nodes ?? [];
                    const ordered = COLLECTIONS.map((col) => {
                      const found = nodes.find((n: any) => n.handle === col.handle);
                      return found ? {...found} : {...col, image: null};
                    });
                    return (
                      <Swiper
                        modules={[Autoplay, FreeMode, Navigation]}
                        navigation={{
                          prevEl: '#col-prev',
                          nextEl: '#col-next',
                        }}
                        autoplay={{delay: 3000, disableOnInteraction: false}}
                        loop
                        freeMode
                        spaceBetween={20}
                        slidesPerView={1.3}
                        breakpoints={{
                          640: {slidesPerView: 2.3},
                          1024: {slidesPerView: 3.5},
                        }}
                      >
                        {ordered.map((col: any) => (
                          <SwiperSlide key={col.handle}>
                            <a
                              href={`/collections/${col.handle}`}
                              className="block group relative overflow-hidden rounded-[30px] aspect-[4/5]"
                            >
                              {col.image?.url ? (
                                <img
                                  src={col.image.url}
                                  alt={col.title}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#0D1527] flex items-center justify-center">
                                  <span className="text-[#C9A84C] text-lg font-bold">{col.title}</span>
                                </div>
                              )}
                            </a>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    );
                  }}
                </Await>
              </Suspense>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── PRODUCTOS ACCESIBLES ── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <picture className="absolute inset-0 w-full h-full">
          <source media="(max-width: 768px)" srcSet="/images/banner4-mobile.jpg" />
          <img src="/images/banner4.jpg" className="w-full h-full object-cover" alt="background" />
        </picture>
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[#C9A84C] uppercase tracking-[0.4em] text-sm mb-4">Accesible para ti</p>
              <h2 className="text-4xl md:text-6xl font-bold text-white">
                Por menos de <span className="text-[#C9A84C]">$800.000</span>
              </h2>
              <p className="text-white/50 mt-4 text-sm">Joyería de lujo al alcance de todos</p>
            </div>
            <div ref={affordableRef} className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Suspense fallback={<div className="text-white col-span-4 text-center">Cargando...</div>}>
                <Await resolve={featuredProducts}>
                  {(response: any) => {
                    if (!response?.products?.nodes) return null;
                    const affordable = response.products.nodes.filter(
                      (p: any) => parseFloat(p.priceRange.minVariantPrice.amount) < 800000,
                    );
                    if (affordable.length === 0)
                      return (
                        <div className="col-span-4 text-center text-white/40 py-12">
                          Próximamente productos en esta categoría
                        </div>
                      );
                    return affordable.map((product: any) => (
                      <a
                        key={product.id}
                        href={`/products/${product.handle}`}
                        className="affordable-card group bg-[#0A0F1E] border border-white/10 rounded-2xl overflow-hidden hover:border-[#C9A84C] transition-all duration-500"
                      >
                        <div className="overflow-hidden aspect-square">
                          <img
                            src={product.featuredImage?.url}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                          />
                        </div>
                        <div className="p-5">
                          <h3 className="text-white font-medium text-base leading-tight">{product.title}</h3>
                          <p className="mt-2 text-[#C9A84C] font-bold text-lg">
                            ${parseFloat(product.priceRange.minVariantPrice.amount).toLocaleString('es-CO')}
                          </p>
                          <span className="mt-4 block text-center w-full bg-[#C9A84C] text-[#0A0F1E] py-2 rounded-full text-sm font-bold hover:bg-white transition-colors">
                            Ver producto
                          </span>
                        </div>
                      </a>
                    ));
                  }}
                </Await>
              </Suspense>
            </div>
            <div className="text-center mt-12">
              <motion.a
                href="/collections/all"
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                className="inline-block px-10 py-3 border border-[#C9A84C] text-[#C9A84C] uppercase tracking-[0.3em] text-xs hover:bg-[#C9A84C] hover:text-[#0A0F1E] transition-all duration-300"
              >
                Explorar colección
              </motion.a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const COLLECTION_CONTENT_FRAGMENT = `#graphql
  fragment CollectionContent on Collection {
    id
    handle
    title
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") { value }
    byline: metafield(namespace: "hero", key: "byline") { value }
    cta: metafield(namespace: "hero", key: "cta") { value }
    spread: metafield(namespace: "hero", key: "spread") {
      reference { ...Media }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
      reference { ...Media }
    }
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
  query HomeProducts ($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 20) {
      nodes {
        id
        title
        handle
        featuredImage { url altText }
        priceRange {
          minVariantPrice { amount currencyCode }
        }
      }
    }
  }
` as const;

export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query HomeCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: 20) {
      nodes {
        id
        title
        handle
        image { url altText }
      }
    }
  }
` as const;