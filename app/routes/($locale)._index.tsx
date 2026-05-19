import {
  defer,
  type MetaArgs,
  type LoaderFunctionArgs,
} from '@shopify/remix-oxygen';
import {useEffect, useRef} from 'react';
import {Suspense} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import 'swiper/css';
import {Autoplay} from 'swiper/modules';
import {Await, useLoaderData} from '@remix-run/react';
import {getSeoMeta} from '@shopify/hydrogen';
import {motion} from 'framer-motion';
import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

import {ProductCard} from '~/components/ProductCard';
import CouponRevealViral from '~/components/CouponRevealViral';
import Reveal from '~/components/Reveal';
import {MEDIA_FRAGMENT} from '~/data/fragments';
import {seoPayload} from '~/lib/seo.server';
import {routeHeaders} from '~/data/cache';
import {PRODUCTS_QUERY} from '~/queries/products';

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

export default function Homepage() {
  const {featuredProducts, collections} = useLoaderData<typeof loader>();

  const heroTextRef = useRef<HTMLDivElement>(null);
  const productsRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const affordableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Delay para esperar que Swiper monte el DOM
    const timer = setTimeout(() => {
      // Hero
      if (heroTextRef.current) {
        const eyebrow = heroTextRef.current.querySelector('.hero-eyebrow');
        const title = heroTextRef.current.querySelector('.hero-title');
        const subtitle = heroTextRef.current.querySelector('.hero-subtitle');
        const cta = heroTextRef.current.querySelector('.hero-cta');

        if (eyebrow && title && subtitle && cta) {
          const tl = gsap.timeline();
          tl.fromTo(eyebrow, {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 1, ease: 'power3.out'})
            .fromTo(title, {opacity: 0, y: 60}, {opacity: 1, y: 0, duration: 1.2, ease: 'power3.out'}, '-=0.6')
            .fromTo(subtitle, {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 0.8, ease: 'power2.out'}, '-=0.5')
            .fromTo(cta, {opacity: 0, scale: 0.9}, {opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)'}, '-=0.3');
        }
      }

      // Productos
      if (productsRef.current) {
        ScrollTrigger.create({
          trigger: productsRef.current,
          start: 'top 85%',
          onEnter: () => {
            const cards = productsRef.current!.querySelectorAll('.product-card');
            if (cards.length > 0) {
              gsap.fromTo(cards, {opacity: 0, y: 50, scale: 0.95}, {opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out'});
            }
          },
        });
      }

      // Categorías
      if (categoriesRef.current) {
        const cards = categoriesRef.current.querySelectorAll('.category-card');
        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            {opacity: 0, x: i === 0 ? -80 : i === 2 ? 80 : 0, y: i === 1 ? 60 : 0},
            {opacity: 1, x: 0, y: 0, duration: 0.9, ease: 'power3.out',
              scrollTrigger: {trigger: card, start: 'top 85%'},
            },
          );
        });
      }

      // Affordable
      if (affordableRef.current) {
        const cards = affordableRef.current.querySelectorAll('.affordable-card');
        if (cards.length > 0) {
          gsap.fromTo(cards, {opacity: 0, y: 40}, {opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
            scrollTrigger: {trigger: affordableRef.current, start: 'top 80%'},
          });
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
              <div className="absolute inset-0 bg-black/40" />
              <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
                <div ref={heroTextRef}>
                  <p className="hero-eyebrow uppercase tracking-[0.4em] text-[#C9A84C] text-sm mb-4 opacity-0">Colección Exclusiva</p>
                  <h1 className="hero-title text-6xl md:text-8xl font-bold text-white mt-4 leading-tight opacity-0">Diamond<br />Jewelry Co</h1>
                  <p className="hero-subtitle text-white/70 mt-6 text-lg opacity-0">Joyería de lujo hecha para ti</p>
                  <a href="/collections/all" className="hero-cta opacity-0 inline-block mt-8 px-10 py-3 border border-[#C9A84C] text-[#C9A84C] uppercase tracking-[0.3em] text-xs hover:bg-[#C9A84C] hover:text-[#0A0F1E] transition-all duration-300">Ver colección</a>
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative h-screen">
              <picture className="absolute inset-0 w-full h-full">
                <source media="(max-width: 768px)" srcSet="/images/banner2-mobile.jpg" />
                <img src="/images/banner2.jpg" alt="Colección de joyería" className="w-full h-full object-cover object-top" />
              </picture>
              <div className="absolute inset-0 bg-black/0" />
            </div>
          </SwiperSlide>
          <SwiperSlide>
            <div className="relative h-screen">
              <picture className="absolute inset-0 w-full h-full">
                <source media="(max-width: 768px)" srcSet="/images/banner3-mobile.jpg" />
                <img src="/images/banner3.jpg" alt="Joyas exclusivas" className="w-full h-full object-cover object-top" />
              </picture>
              <div className="absolute inset-0 bg-black/0" />
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

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
                          <img src={product.featuredImage?.url} alt={product.title} width="400" height="400" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        </a>
                        <div className="flex flex-col gap-3 p-4 flex-1">
                          <a href={`/products/${product.handle}`}>
                            <h3 className="text-sm font-medium text-[#0A0F1E] leading-snug line-clamp-2 hover:text-[#C9A84C] transition-colors">{product.title}</h3>
                          </a>
                          <span className="text-[#C9A84C] font-bold text-base">${parseFloat(product.priceRange.minVariantPrice.amount).toLocaleString('es-CO')}{' '}{product.priceRange.minVariantPrice.currencyCode}</span>
                          <a href={`/products/${product.handle}`} className="w-full mt-auto bg-[#0A0F1E] hover:bg-[#C9A84C] text-white hover:text-[#0A0F1E] text-xs font-bold uppercase tracking-widest py-3 rounded-full transition-all duration-300 text-center">Agregar al carrito</a>
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

      <Reveal><CouponRevealViral /></Reveal>

      <Reveal>
        <section className="py-32 px-6 bg-[#0A0F1E]">
          <div className="max-w-7xl mx-auto">
            <div ref={categoriesRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="category-card group relative overflow-hidden rounded-[40px] h-[300px] md:h-[500px]">
                <picture className="absolute inset-0 w-full h-full">
                  <source media="(max-width: 768px)" srcSet="/images/chain-mobile.jpg" />
                  <img src="/images/chain.jpg" alt="Cadena de joyería" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                </picture>
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 h-full flex items-end p-10">
                  <div><p className="text-[#C9A84C] uppercase tracking-[0.3em] text-sm">Luxury</p><h2 className="text-5xl font-bold text-white mt-4">Cadenas</h2></div>
                </div>
              </div>
              <div className="category-card group relative overflow-hidden rounded-[40px] h-[300px] md:h-[500px]">
                <picture className="absolute inset-0 w-full h-full">
                  <source media="(max-width: 768px)" srcSet="/images/ring-mobile.jpg" />
                  <img src="/images/ring.jpg" alt="Anillo de lujo" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                </picture>
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 h-full flex items-end p-10">
                  <div><p className="text-[#C9A84C] uppercase tracking-[0.3em] text-sm">Premium</p><h2 className="text-5xl font-bold text-white mt-4">Anillos</h2></div>
                </div>
              </div>
              <div className="category-card group relative overflow-hidden rounded-[40px] h-[300px] md:h-[500px]">
                <picture className="absolute inset-0 w-full h-full">
                  <source media="(max-width: 768px)" srcSet="/images/watch-mobile.jpg" />
                  <img src="/images/watch.jpg" alt="Reloj exclusivo" className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                </picture>
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 h-full flex items-end p-10">
                  <div><p className="text-[#C9A84C] uppercase tracking-[0.3em] text-sm">Exclusive</p><h2 className="text-5xl font-bold text-white mt-4">Relojes</h2></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

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
              <h2 className="text-4xl md:text-6xl font-bold text-white">Por menos de <span className="text-[#C9A84C]">$800.000</span></h2>
              <p className="text-white/50 mt-4 text-sm">Joyería de lujo al alcance de todos</p>
            </div>
            <div ref={affordableRef} className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Suspense fallback={<div className="text-white col-span-4 text-center">Cargando...</div>}>
                <Await resolve={featuredProducts}>
                  {(response: any) => {
                    if (!response?.products?.nodes) return null;
                    const affordable = response.products.nodes.filter((p: any) => parseFloat(p.priceRange.minVariantPrice.amount) < 800000);
                    if (affordable.length === 0) return <div className="col-span-4 text-center text-white/40 py-12">Próximamente productos en esta categoría</div>;
                    return affordable.map((product: any) => (
                      <a key={product.id} href={`/products/${product.handle}`} className="affordable-card group bg-[#0A0F1E] border border-white/10 rounded-2xl overflow-hidden hover:border-[#C9A84C] transition-all duration-500">
                        <div className="overflow-hidden aspect-square">
                          <img src={product.featuredImage?.url} alt={product.title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                        </div>
                        <div className="p-5">
                          <h3 className="text-white font-medium text-base leading-tight">{product.title}</h3>
                          <p className="mt-2 text-[#C9A84C] font-bold text-lg">${parseFloat(product.priceRange.minVariantPrice.amount).toLocaleString('es-CO')}</p>
                          <span className="mt-4 block text-center w-full bg-[#C9A84C] text-[#0A0F1E] py-2 rounded-full text-sm font-bold hover:bg-white transition-colors">Ver producto</span>
                        </div>
                      </a>
                    ));
                  }}
                </Await>
              </Suspense>
            </div>
            <div className="text-center mt-12">
              <motion.a href="/collections/all" whileHover={{scale: 1.05}} whileTap={{scale: 0.95}} className="inline-block px-10 py-3 border border-[#C9A84C] text-[#C9A84C] uppercase tracking-[0.3em] text-xs hover:bg-[#C9A84C] hover:text-[#0A0F1E] transition-all duration-300">Explorar colección</motion.a>
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

const COLLECTION_HERO_QUERY = `#graphql
  query heroCollectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) { ...CollectionContent }
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
    collections(first: 10) {
      nodes {
        id
        title
        handle
        image { url altText }
      }
    }
  }
` as const;

export const COLLECTION_PRODUCTS_QUERY = `#graphql
  query CollectionsPageHome
    collection(handle: $handle) {
      title
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
  }
` as const;
