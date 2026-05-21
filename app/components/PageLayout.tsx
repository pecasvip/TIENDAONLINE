import {useParams, Await, useRouteLoaderData} from '@remix-run/react';
import useWindowScroll from 'react-use/esm/useWindowScroll';
import {Disclosure} from '@headlessui/react';
import {Suspense, useEffect, useMemo, useState} from 'react';
import {CartForm} from '@shopify/hydrogen';

import {type LayoutQuery} from 'storefrontapi.generated';
import {Text, Heading, Section} from '~/components/Text';
import {Link} from '~/components/Link';
import {Cart} from '~/components/Cart';
import {CartLoading} from '~/components/CartLoading';
import {Drawer, useDrawer} from '~/components/Drawer';
import {CountrySelector} from '~/components/CountrySelector';
import {AnnouncementBar} from '~/components/AnnouncementBar';
import {
  IconMenu,
  IconCaret,
  IconBag,
  IconSearch,
  IconLogin,
  IconAccount,
  IconClose,
} from '~/components/Icon';
import {
  type EnhancedMenu,
  type ChildEnhancedMenuItem,
  useIsHomePath,
} from '~/lib/utils';
import {useIsHydrated} from '~/hooks/useIsHydrated';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import type {RootLoader} from '~/root';

// ── Paleta neon tech ──
const C = {
  bg:        '#05071a',
  bgCard:    '#0c0f28',
  bgHeader:  '#080b22',
  purple:    '#8b5cf6',
  magenta:   '#ec4899',
  cyan:      '#06b6d4',
  border:    'rgba(139,92,246,0.22)',
  borderMid: 'rgba(139,92,246,0.12)',
};

type LayoutProps = {
  children: React.ReactNode;
  layout?: LayoutQuery & {
    headerMenu?: EnhancedMenu | null;
    footerMenu?: EnhancedMenu | null;
  };
};

export function PageLayout({children, layout}: LayoutProps) {
  const {headerMenu, footerMenu} = layout || {};
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <a href="#mainContent" className="sr-only">Saltar al contenido</a>
        {headerMenu && layout?.shop.name && (
          <Header title={layout.shop.name} menu={headerMenu} />
        )}
        <main role="main" id="mainContent" className="flex-grow" style={{background: C.bg}}>
          {children}
        </main>
      </div>
      {footerMenu && <Footer menu={footerMenu} />}
      <AnnouncementBar />
    </>
  );
}

// ═══════════════════════════════════════════
// HEADER — estilo Amazon + neon tech
// ═══════════════════════════════════════════
function Header({title, menu}: {title: string; menu?: EnhancedMenu}) {
  const isHome = useIsHomePath();
  const {isOpen: isCartOpen, openDrawer: openCart, closeDrawer: closeCart} = useDrawer();
  const {isOpen: isMenuOpen, openDrawer: openMenu, closeDrawer: closeMenu} = useDrawer();
  const addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);

  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      {menu && <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />}

      {/* ── HEADER PRINCIPAL ── */}
      <header
        role="banner"
        style={{
          position: 'sticky', top: 0, zIndex: 40,
          background: C.bgHeader,
          borderBottom: `1px solid ${C.border}`,
          boxShadow: '0 2px 20px rgba(0,0,0,0.5)',
        }}
      >
        {/* BARRA SUPERIOR: logo | buscador | iconos */}
        <div style={{
          maxWidth: 1400, margin: '0 auto',
          padding: '0 16px',
          height: 68,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>

          {/* Hamburger — solo mobile */}
          <button
            onClick={openMenu}
            aria-label="Abrir menú"
            className="lg:hidden"
            style={{
              background: 'transparent', border: 'none',
              color: 'rgba(255,255,255,0.75)', cursor: 'pointer',
              padding: '8px 6px', flexShrink: 0,
            }}
          >
            <IconMenu />
          </button>

          {/* LOGO */}
          <Link
            to="/" prefetch="intent"
            style={{
              flexShrink: 0, display: 'flex', alignItems: 'center',
              padding: '4px 8px', borderRadius: 6,
              border: '1.5px solid transparent',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e: any) => e.currentTarget.style.borderColor = C.purple}
            onMouseLeave={(e: any) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <img
              src="/images/logo.jpg"
              alt={title}
              style={{height: 44, width: 'auto', objectFit: 'contain'}}
            />
          </Link>

          {/* BUSCADOR — estilo Amazon, oculto en mobile pequeño */}
          <SearchBar />

          {/* ICONOS DERECHA */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 'auto',
          }}>
            {/* Cuenta */}
            <AccountButton />
            {/* Carrito */}
            <CartCount isHome={isHome} openCart={openCart} />
          </div>
        </div>

        {/* BARRA DE NAVEGACIÓN INFERIOR — desktop */}
        <nav
          className="hidden lg:flex"
          style={{
            borderTop: `1px solid ${C.borderMid}`,
            background: 'rgba(0,0,0,0.25)',
          }}
        >
          <div style={{
            maxWidth: 1400, margin: '0 auto',
            padding: '0 24px',
            display: 'flex', alignItems: 'center', gap: 0,
            height: 40,
            overflowX: 'auto',
          }}>
            {/* "Todo" — al estilo Amazon */}
            <Link
              to="/collections/all"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '0 14px', height: '100%',
                color: 'rgba(255,255,255,0.85)',
                fontSize: 13, fontWeight: 700,
                textDecoration: 'none',
                borderRight: `1px solid ${C.borderMid}`,
                whiteSpace: 'nowrap',
                transition: 'color 0.2s, background 0.2s',
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.color = C.purple;
                e.currentTarget.style.background = `${C.purple}11`;
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{fontSize: 16}}>☰</span> Todo
            </Link>

            {(menu?.items || []).map((item) => (
              <Link
                key={item.id}
                to={item.to}
                target={item.target}
                prefetch="intent"
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '0 14px', height: '100%',
                  color: 'rgba(255,255,255,0.75)',
                  fontSize: 13, fontWeight: 600,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s, background 0.2s',
                  borderBottom: '2px solid transparent',
                }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.color = C.purple;
                  e.currentTarget.style.background = `${C.purple}11`;
                  e.currentTarget.style.borderBottomColor = C.purple;
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.color = 'rgba(255,255,255,0.75)';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderBottomColor = 'transparent';
                }}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </nav>
      </header>
    </>
  );
}

// ── Buscador estilo Amazon ──
function SearchBar() {
  const params = useParams();
  const searchPath = params.locale ? `/${params.locale}/search` : '/search';
  const [focused, setFocused] = useState(false);

  return (
    <Link
      to={searchPath}
      style={{
        flex: 1, maxWidth: 780, minWidth: 0,
        display: 'flex', alignItems: 'stretch',
        borderRadius: 8,
        overflow: 'hidden',
        border: `2px solid ${focused ? C.purple : 'rgba(139,92,246,0.35)'}`,
        boxShadow: focused ? `0 0 0 2px ${C.purple}33` : 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        textDecoration: 'none',
        height: 42,
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onMouseEnter={(e: any) => e.currentTarget.style.borderColor = C.purple}
      onMouseLeave={(e: any) => e.currentTarget.style.borderColor = focused ? C.purple : 'rgba(139,92,246,0.35)'}
    >
      {/* Selector de categoría — desktop */}
      <div
        className="hidden md:flex"
        style={{
          alignItems: 'center',
          background: 'rgba(139,92,246,0.12)',
          borderRight: `1px solid rgba(139,92,246,0.25)`,
          padding: '0 12px',
          color: 'rgba(255,255,255,0.6)',
          fontSize: 11, fontWeight: 600,
          whiteSpace: 'nowrap', gap: 4,
          cursor: 'pointer',
        }}
      >
        Todas ▾
      </div>

      {/* Input falso */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        background: 'rgba(255,255,255,0.05)',
        padding: '0 14px',
        color: 'rgba(255,255,255,0.35)',
        fontSize: 13,
      }}>
        Buscar productos, marcas y más...
      </div>

      {/* Botón lupa */}
      <div style={{
        background: `linear-gradient(135deg, ${C.purple} 0%, ${C.magenta} 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 46, flexShrink: 0,
        color: 'white', fontSize: 17,
        cursor: 'pointer',
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={(e: any) => e.currentTarget.style.opacity = '0.85'}
      onMouseLeave={(e: any) => e.currentTarget.style.opacity = '1'}
      >
        <IconSearch />
      </div>
    </Link>
  );
}

// ── Botón de cuenta ──
function AccountButton() {
  return (
    <Link
      to="/account"
      aria-label="Mi cuenta"
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        textDecoration: 'none', padding: '6px 10px', borderRadius: 6,
        border: '1.5px solid transparent',
        transition: 'border-color 0.2s, background 0.2s',
        minWidth: 90,
      }}
      className="hidden lg:flex"
      onMouseEnter={(e: any) => {
        e.currentTarget.style.borderColor = C.purple;
        e.currentTarget.style.background = `${C.purple}11`;
      }}
      onMouseLeave={(e: any) => {
        e.currentTarget.style.borderColor = 'transparent';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <span style={{color: 'rgba(255,255,255,0.5)', fontSize: 10, lineHeight: 1.2}}>Hola, inicia sesión</span>
      <span style={{color: 'white', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4}}>
        Cuenta y listas <span style={{fontSize: 10, color: C.purple}}>▾</span>
      </span>
    </Link>
  );
}

function CartDrawer({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  if (!rootData) return null;
  return (
    <Drawer open={isOpen} onClose={onClose} heading="Carrito" openFrom="right">
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={rootData?.cart}>
            {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  );
}

export function MenuDrawer({isOpen, onClose, menu}: {isOpen: boolean; onClose: () => void; menu: EnhancedMenu}) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="Menú">
      <div className="grid">
        <MenuMobileNav menu={menu} onClose={onClose} />
      </div>
    </Drawer>
  );
}

function MenuMobileNav({menu, onClose}: {menu: EnhancedMenu; onClose: () => void}) {
  return (
    <nav style={{display: 'flex', flexDirection: 'column'}}>
      {(menu?.items || []).map((item) => (
        <div key={item.id}>
          <Link
            to={item.to}
            target={item.target}
            onClick={onClose}
            style={{
              display: 'block',
              padding: '14px 20px',
              borderBottom: `1px solid ${C.borderMid}`,
              color: 'rgba(255,255,255,0.8)',
              textDecoration: 'none',
              fontSize: 14, fontWeight: 600,
              letterSpacing: '0.04em', textTransform: 'uppercase',
              transition: 'color 0.2s, background 0.2s',
            }}
            onMouseEnter={(e: any) => {
              e.currentTarget.style.color = C.purple;
              e.currentTarget.style.background = `${C.purple}11`;
            }}
            onMouseLeave={(e: any) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {item.title}
          </Link>
        </div>
      ))}
    </nav>
  );
}

function MobileHeader({}: {}) { return null; }
function DesktopHeader({}: {}) { return null; }

function CartCount({isHome, openCart}: {isHome: boolean; openCart: () => void}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  if (!rootData) return null;
  return (
    <Suspense fallback={<CartBadge count={0} openCart={openCart} />}>
      <Await resolve={rootData?.cart}>
        {(cart) => <CartBadge openCart={openCart} count={cart?.totalQuantity || 0} />}
      </Await>
    </Suspense>
  );
}

function CartBadge({openCart, count}: {count: number; openCart: () => void}) {
  const isHydrated = useIsHydrated();

  const inner = (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
      textDecoration: 'none', padding: '6px 10px', borderRadius: 6,
      border: '1.5px solid transparent',
      transition: 'border-color 0.2s, background 0.2s',
      position: 'relative', cursor: 'pointer',
    }}>
      {/* Icono bolsa con counter */}
      <div style={{position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 6}}>
        <div style={{position: 'relative'}}>
          <IconBag />
          {count > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: `linear-gradient(135deg, ${C.purple}, ${C.magenta})`,
              color: 'white', fontWeight: 900, fontSize: 10,
              minWidth: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', padding: '0 3px',
              boxShadow: `0 0 8px ${C.purple}80`,
            }}>
              {count}
            </span>
          )}
        </div>
        <span className="hidden lg:block" style={{
          color: 'white', fontSize: 12, fontWeight: 800, lineHeight: 1,
        }}>
          Carrito
        </span>
      </div>
    </div>
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      aria-label={`Carrito ${count} artículos`}
      style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        color: 'white',
      }}
      onMouseEnter={(e: any) => {
        e.currentTarget.querySelector('div').style.borderColor = C.purple;
        e.currentTarget.querySelector('div').style.background = `${C.purple}11`;
      }}
      onMouseLeave={(e: any) => {
        e.currentTarget.querySelector('div').style.borderColor = 'transparent';
        e.currentTarget.querySelector('div').style.background = 'transparent';
      }}
    >
      {inner}
    </button>
  ) : (
    <Link to="/cart" style={{color: 'white', textDecoration: 'none'}}>
      {inner}
    </Link>
  );
}

// ═══════════════════════════════════════════
// FOOTER — estilo Amazon + neon tech
// ═══════════════════════════════════════════
function Footer({menu}: {menu?: EnhancedMenu}) {
  return (
    <footer role="contentinfo" style={{
      background: C.bg,
      borderTop: `1px solid ${C.border}`,
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Orbs de luz de fondo */}
      <div style={{position:'absolute', top:0, left:'8%', width:350, height:250,
        background:`radial-gradient(ellipse, rgba(139,92,246,0.1) 0%, transparent 70%)`, pointerEvents:'none'}} />
      <div style={{position:'absolute', top:0, right:'5%', width:300, height:200,
        background:`radial-gradient(ellipse, rgba(236,72,153,0.08) 0%, transparent 70%)`, pointerEvents:'none'}} />
      <div style={{position:'absolute', bottom:120, left:'45%', width:400, height:180,
        background:`radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 70%)`, pointerEvents:'none'}} />

      {/* Línea neon superior */}
      <div style={{
        height: 2,
        background:`linear-gradient(90deg, transparent 0%, ${C.purple} 25%, ${C.magenta} 50%, ${C.cyan} 75%, transparent 100%)`,
      }} />

      {/* ── BANDA "VOLVER ARRIBA" estilo Amazon ── */}
      <button
        onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
        style={{
          width: '100%', padding: '14px 0',
          background: 'rgba(139,92,246,0.1)',
          borderBottom: `1px solid ${C.borderMid}`,
          color: 'rgba(255,255,255,0.65)',
          fontSize: 13, fontWeight: 600,
          cursor: 'pointer', border: 'none',
          borderTop: 'none',
          transition: 'background 0.2s, color 0.2s',
          letterSpacing: '0.04em',
        }}
        onMouseEnter={(e: any) => {
          e.currentTarget.style.background = `rgba(139,92,246,0.18)`;
          e.currentTarget.style.color = C.purple;
        }}
        onMouseLeave={(e: any) => {
          e.currentTarget.style.background = 'rgba(139,92,246,0.1)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
        }}
      >
        ↑ Volver al inicio
      </button>

      {/* ── CUERPO PRINCIPAL — columnas estilo Amazon ── */}
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '48px 24px 40px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '36px 28px',
      }}>

        {/* Columna marca */}
        <div>
          <img src="/images/logo.jpg" alt="Diamond Jewelry"
            style={{height: 50, objectFit: 'contain', marginBottom: 16}} />
          <p style={{
            color: 'rgba(255,255,255,0.4)', fontSize: 12, lineHeight: 1.75,
            marginBottom: 20, maxWidth: 210,
          }}>
            Accesorios y joyas de calidad premium. Diseñados para brillar en cada momento especial.
          </p>
          {/* Redes */}
          <div style={{display: 'flex', gap: 8}}>
            {[
              {icon: '📸', label: 'Instagram', color: C.magenta},
              {icon: '📘', label: 'Facebook',  color: '#3b82f6'},
              {icon: '🎵', label: 'TikTok',    color: C.purple},
              {icon: '▶️', label: 'YouTube',   color: '#ef4444'},
            ].map((s) => (
              <button key={s.label} aria-label={s.label} style={{
                width: 34, height: 34, borderRadius: 8, cursor: 'pointer',
                border: `1px solid ${s.color}55`,
                background: `${s.color}10`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, transition: 'all 0.2s',
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.background = `${s.color}25`;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${s.color}40`;
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.background = `${s.color}10`;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
                {s.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Columnas menú dinámico de Shopify */}
        <FooterMenu menu={menu} />

        {/* Columna Atención al cliente */}
        <div>
          <h4 style={colTitleStyle(C.cyan)}>
            <NeonDot color={C.cyan} /> Atención al cliente
          </h4>
          <nav style={{display:'flex', flexDirection:'column', gap:2}}>
            {[
              {label:'Centro de ayuda',       href:'#'},
              {label:'Seguimiento de pedido', href:'#'},
              {label:'Política de cambios',   href:'#'},
              {label:'Garantías',             href:'#'},
              {label:'Contáctanos',           href:'#'},
            ].map((l) => (
              <StaticFooterLink key={l.label} label={l.label} href={l.href} />
            ))}
          </nav>
        </div>

        {/* Columna newsletter */}
        <div>
          <h4 style={colTitleStyle(C.magenta)}>
            <NeonDot color={C.magenta} /> Ofertas exclusivas
          </h4>
          <p style={{color:'rgba(255,255,255,0.4)', fontSize:12, marginBottom:14, lineHeight:1.65}}>
            Suscríbete y recibe descuentos antes que nadie.
          </p>
          <div style={{display:'flex', flexDirection:'column', gap:8}}>
            <input
              type="email"
              placeholder="tu@correo.com"
              style={{
                background:'rgba(255,255,255,0.05)',
                border:`1px solid ${C.border}`,
                borderRadius:6, padding:'10px 14px',
                color:'white', fontSize:12, outline:'none',
                width:'100%', boxSizing:'border-box',
                transition:'border-color 0.2s',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = C.magenta}
              onBlur={(e) => e.currentTarget.style.borderColor = C.border}
            />
            <button style={{
              padding:'10px 14px', borderRadius:6, border:'none', cursor:'pointer',
              background:`linear-gradient(135deg, ${C.purple} 0%, ${C.magenta} 100%)`,
              color:'white', fontWeight:800, fontSize:11,
              letterSpacing:'0.08em', textTransform:'uppercase',
              boxShadow:`0 4px 18px rgba(139,92,246,0.4)`,
              transition:'opacity 0.2s',
            }}
            onMouseEnter={(e: any) => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={(e: any) => e.currentTarget.style.opacity = '1'}
            >
              ✦ Suscribirme
            </button>
          </div>
          {/* Selector de país */}
          <div style={{marginTop:16}}>
            <CountrySelector />
          </div>
        </div>
      </div>

      {/* ── SEPARADOR CENTRAL estilo Amazon ── */}
      <div style={{borderTop:`1px solid ${C.borderMid}`}}>
        {/* Logo centrado */}
        <div style={{
          display:'flex', justifyContent:'center', padding:'24px 0 20px',
          borderBottom:`1px solid ${C.borderMid}`,
        }}>
          <Link to="/" prefetch="intent">
            <img src="/images/logo.jpg" alt="Diamond Jewelry"
              style={{height:40, objectFit:'contain', opacity:0.7, filter:'grayscale(0.3)'}} />
          </Link>
        </div>

        {/* Links legales */}
        <div style={{
          display:'flex', flexWrap:'wrap', justifyContent:'center',
          gap:'8px 20px', padding:'16px 24px',
          borderBottom:`1px solid ${C.borderMid}`,
        }}>
          {['Condiciones de uso','Aviso de privacidad','Cookies','Accesibilidad'].map((t) => (
            <a key={t} href="#" style={{
              color:'rgba(255,255,255,0.3)', fontSize:11, textDecoration:'none',
              transition:'color 0.2s',
            }}
            onMouseEnter={(e: any) => e.currentTarget.style.color = C.purple}
            onMouseLeave={(e: any) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >{t}</a>
          ))}
        </div>

        {/* Trust badges — métodos de pago */}
        <div style={{
          display:'flex', justifyContent:'center', flexWrap:'wrap',
          gap:'8px 12px', padding:'16px 24px',
          borderBottom:`1px solid ${C.borderMid}`,
        }}>
          {[
            {label:'💳 Visa'},
            {label:'💳 Mastercard'},
            {label:'🏦 PSE'},
            {label:'💵 Efecty'},
            {label:'🏪 Nequi'},
            {label:'🔒 SSL Seguro'},
          ].map((p) => (
            <span key={p.label} style={{
              background:'rgba(255,255,255,0.04)',
              border:`1px solid rgba(255,255,255,0.1)`,
              borderRadius:5, padding:'4px 10px',
              fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:600,
            }}>
              {p.label}
            </span>
          ))}
        </div>

        {/* Copyright */}
        <p style={{
          textAlign:'center', color:'rgba(255,255,255,0.2)',
          fontSize:11, padding:'16px 24px', margin:0,
        }}>
          © {new Date().getFullYear()}{' '}
          <span style={{color:`${C.purple}88`}}>Diamond Jewelry Co.</span>
          {' '}· Todos los derechos reservados · Cali, Colombia
        </p>
      </div>
    </footer>
  );
}

// ── Helpers de estilo ──
function colTitleStyle(accent: string): React.CSSProperties {
  return {
    color:'white', fontSize:11, fontWeight:800,
    letterSpacing:'0.14em', textTransform:'uppercase',
    marginBottom:16, paddingBottom:10,
    borderBottom:`1px solid ${accent}30`,
    display:'flex', alignItems:'center', gap:8,
  };
}

function NeonDot({color}: {color: string}) {
  return (
    <span style={{
      display:'inline-block', width:6, height:6, borderRadius:'50%',
      background:`linear-gradient(135deg, ${color}, #fff)`,
      boxShadow:`0 0 8px ${color}`,
      flexShrink:0,
    }} />
  );
}

function StaticFooterLink({label, href}: {label: string; href: string}) {
  return (
    <a href={href} style={{
      color:'rgba(255,255,255,0.45)', fontSize:12,
      textDecoration:'none', padding:'4px 0', display:'block',
      transition:'color 0.2s, padding-left 0.2s',
    }}
    onMouseEnter={(e: any) => {
      e.currentTarget.style.color = '#a78bfa';
      e.currentTarget.style.paddingLeft = '6px';
    }}
    onMouseLeave={(e: any) => {
      e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
      e.currentTarget.style.paddingLeft = '0';
    }}
    >{label}</a>
  );
}

function FooterLink({item}: {item: ChildEnhancedMenuItem}) {
  const baseStyle: React.CSSProperties = {
    color:'rgba(255,255,255,0.45)', fontSize:12,
    textDecoration:'none', padding:'4px 0', display:'block',
    transition:'color 0.2s, padding-left 0.2s',
  };
  const enter = (e: any) => {
    e.currentTarget.style.color = '#a78bfa';
    e.currentTarget.style.paddingLeft = '6px';
  };
  const leave = (e: any) => {
    e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
    e.currentTarget.style.paddingLeft = '0';
  };
  if (item.to.startsWith('http')) {
    return <a href={item.to} target={item.target} rel="noopener noreferrer"
      style={baseStyle} onMouseEnter={enter} onMouseLeave={leave}>{item.title}</a>;
  }
  return <Link to={item.to} target={item.target} prefetch="intent"
    style={baseStyle} onMouseEnter={enter} onMouseLeave={leave}>{item.title}</Link>;
}

function FooterMenu({menu}: {menu?: EnhancedMenu}) {
  return (
    <>
      {(menu?.items || []).map((item) => (
        <div key={item.id}>
          {/* Desktop */}
          <div className="hidden md:block">
            <h4 style={colTitleStyle(C.purple)}>
              <NeonDot color={C.purple} /> {item.title}
            </h4>
            <nav style={{display:'flex', flexDirection:'column', gap:2}}>
              {item.items?.map((sub: ChildEnhancedMenuItem) => (
                <FooterLink key={sub.id} item={sub} />
              ))}
            </nav>
          </div>
          {/* Mobile — acordeón */}
          <div className="md:hidden">
            <Disclosure>
              {({open}) => (
                <>
                  <Disclosure.Button style={{
                    width:'100%', background:'none', border:'none',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'12px 0', cursor:'pointer',
                    borderBottom:`1px solid ${C.borderMid}`,
                  }}>
                    <span style={{color:'white', fontSize:12, fontWeight:700,
                      textTransform:'uppercase', letterSpacing:'0.1em'}}>
                      {item.title}
                    </span>
                    <IconCaret direction={open ? 'up' : 'down'} />
                  </Disclosure.Button>
                  <div className={`${open ? 'max-h-48' : 'max-h-0'} overflow-hidden transition-all duration-300`}>
                    <Suspense>
                      <Disclosure.Panel static>
                        <nav style={{display:'flex', flexDirection:'column', gap:2, paddingTop:8}}>
                          {item.items?.map((sub: ChildEnhancedMenuItem) => (
                            <FooterLink key={sub.id} item={sub} />
                          ))}
                        </nav>
                      </Disclosure.Panel>
                    </Suspense>
                  </div>
                </>
              )}
            </Disclosure>
          </div>
        </div>
      ))}
    </>
  );
}