import {useParams, Await, useRouteLoaderData} from '@remix-run/react';
import {Suspense, useEffect, useMemo} from 'react';
import {CartForm} from '@shopify/hydrogen';

import {type LayoutQuery} from 'storefrontapi.generated';
import {Link} from '~/components/Link';
import {Cart} from '~/components/Cart';
import {CartLoading} from '~/components/CartLoading';
import {Drawer, useDrawer} from '~/components/Drawer';
import {AnnouncementBar} from '~/components/AnnouncementBar';
import {
  type EnhancedMenu,
  type ChildEnhancedMenuItem,
  useIsHomePath,
} from '~/lib/utils';
import {useIsHydrated} from '~/hooks/useIsHydrated';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import type {RootLoader} from '~/root';

type LayoutProps = {
  children: React.ReactNode;
  layout?: LayoutQuery & {
    headerMenu?: EnhancedMenu | null;
    footerMenu?: EnhancedMenu | null;
  };
};

/* ── ICONS ── */
function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  );
}
function IconCart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}
function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}
function IconHome() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}
function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

export function PageLayout({children, layout}: LayoutProps) {
  const {headerMenu, footerMenu} = layout || {};
  return (
    <>
      <AnnouncementBar />
      <div className="flex flex-col min-h-screen">
        <a href="#mainContent" className="sr-only">Saltar al contenido</a>
        {headerMenu && layout?.shop.name && (
          <Header title={layout.shop.name} menu={headerMenu} />
        )}
        <main role="main" id="mainContent" className="flex-grow bg-[#f5f5f5]">
          {children}
        </main>
      </div>
      {footerMenu && <Footer menu={footerMenu} />}
      <MobileBottomNav />
    </>
  );
}

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
      <header role="banner" className="sticky top-0 z-50">
        {/* TOP BAR */}
        <div className="linio-header-top">
          {/* Mobile: hamburger */}
          <button
            onClick={openMenu}
            className="linio-action-btn lg:hidden"
            aria-label="Abrir menú"
          >
            <IconMenu />
          </button>

          {/* Logo */}
          <Link to="/" prefetch="intent" className="linio-logo">
            DIA<em>M</em>
          </Link>

          {/* Search */}
          <form action="/search" method="get" className="linio-search flex-1">
            <input
              type="text"
              name="q"
              placeholder="Buscar accesorios, joyas, relojes..."
              autoComplete="off"
            />
            <button type="submit" aria-label="Buscar">🔍</button>
          </form>

          {/* Actions */}
          <div className="linio-header-actions">
            <Link to="/account" className="linio-action-btn hidden sm:flex" aria-label="Mi cuenta">
              <IconUser />
              <span>Cuenta</span>
            </Link>
            <CartCount isHome={isHome} openCart={openCart} />
          </div>
        </div>

        {/* CATEGORY NAV — desktop */}
        {menu && (
          <nav className="linio-cat-nav hidden lg:flex">
            {(menu.items || []).map((item) => (
              <Link
                key={item.id}
                to={item.to}
                target={item.target}
                prefetch="intent"
                className={({isActive}) => isActive ? 'active' : ''}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}

function CartDrawer({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  if (!rootData) return null;
  return (
    <Drawer open={isOpen} onClose={onClose} heading="Mi Carrito" openFrom="right">
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
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="Categorías">
      <nav className="flex flex-col gap-0">
        {(menu?.items || []).map((item) => (
          <Link
            key={item.id}
            to={item.to}
            target={item.target}
            onClick={onClose}
            className={({isActive}) =>
              `block px-6 py-4 border-b border-gray-100 text-sm font-bold transition-colors ${
                isActive ? 'text-red-600 bg-red-50' : 'text-gray-800 hover:text-red-600 hover:bg-gray-50'
              }`
            }
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </Drawer>
  );
}

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
  const btn = (
    <div className="linio-cart-wrap">
      <button onClick={openCart} className="linio-action-btn" aria-label={`Carrito ${count} productos`}>
        <IconCart />
        <span>Carrito</span>
      </button>
      {count > 0 && <span className="linio-cart-badge">{count}</span>}
    </div>
  );
  return isHydrated ? btn : (
    <div className="linio-cart-wrap">
      <Link to="/cart" className="linio-action-btn">
        <IconCart />
        <span>Carrito</span>
      </Link>
      {count > 0 && <span className="linio-cart-badge">{count}</span>}
    </div>
  );
}

function MobileBottomNav() {
  const params = useParams();
  const searchPath = params.locale ? `/${params.locale}/search` : '/search';
  return (
    <nav className="linio-bottom-nav" role="navigation" aria-label="Navegación principal">
      <Link to="/" className="linio-bottom-nav-item active">
        <IconHome /><span>Inicio</span>
      </Link>
      <Link to="/collections/all" className="linio-bottom-nav-item">
        <IconGrid /><span>Catálogo</span>
      </Link>
      <Link to={searchPath} className="linio-bottom-nav-item">
        <IconSearch /><span>Buscar</span>
      </Link>
      <Link to="/wishlist" className="linio-bottom-nav-item">
        <IconHeart /><span>Guardados</span>
      </Link>
      <Link to="/account" className="linio-bottom-nav-item">
        <IconUser /><span>Cuenta</span>
      </Link>
    </nav>
  );
}

/* ── FOOTER ── */
function Footer({menu}: {menu?: EnhancedMenu}) {
  return (
    <footer role="contentinfo" className="linio-footer">
      <div style={{maxWidth: 1200, margin: '0 auto'}}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand col */}
          <div>
            <div className="linio-logo mb-3" style={{fontSize: 22}}>DIA<em style={{color: '#FFD600', fontStyle: 'normal'}}>M</em></div>
            <p style={{fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6}}>
              Accesorios y joyería de calidad para cada momento especial.
            </p>
            <div style={{display: 'flex', gap: 10, marginTop: 14}}>
              {['📘','📸','🎵'].map((icon, i) => (
                <span key={i} style={{fontSize: 18, cursor: 'pointer'}}>{icon}</span>
              ))}
            </div>
          </div>
          {/* Menu cols */}
          {(menu?.items || []).slice(0, 3).map((item) => (
            <div key={item.id}>
              <p className="linio-footer-title">{item.title}</p>
              <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                {(item.items || []).map((sub: ChildEnhancedMenuItem) => (
                  <Link key={sub.id} to={sub.to} target={sub.target} prefetch="intent">
                    {sub.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div style={{display: 'flex', gap: 24, flexWrap: 'wrap', padding: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 20}}>
          {[
            {icon: '🚚', text: 'Envío gratis +$150k'},
            {icon: '🔒', text: 'Pago seguro'},
            {icon: '↩️', text: 'Devoluciones fáciles'},
            {icon: '🏆', text: 'Calidad garantizada'},
          ].map((b, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'rgba(255,255,255,0.65)'}}>
              <span style={{fontSize: 18}}>{b.icon}</span>{b.text}
            </div>
          ))}
        </div>

        <div className="linio-footer-bottom">
          <span>© {new Date().getFullYear()} Diamond Jewelry Co. Todos los derechos reservados.</span>
          <span style={{display: 'flex', gap: 16}}>
            <a href="/policies/privacy-policy">Privacidad</a>
            <a href="/policies/terms-of-service">Términos</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({item}: {item: ChildEnhancedMenuItem}) {
  if (item.to.startsWith('http')) {
    return <a href={item.to} target={item.target} rel="noopener noreferrer">{item.title}</a>;
  }
  return <Link to={item.to} target={item.target} prefetch="intent">{item.title}</Link>;
}
