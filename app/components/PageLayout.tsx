import {useParams, Await, useRouteLoaderData} from '@remix-run/react';
import useWindowScroll from 'react-use/esm/useWindowScroll';
import {Disclosure} from '@headlessui/react';
import {Suspense, useEffect, useMemo} from 'react';
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
      <AnnouncementBar />
      <div className="flex flex-col min-h-screen">
        <a href="#mainContent" className="sr-only">
          Skip to content
        </a>
        {headerMenu && layout?.shop.name && (
          <Header title={layout.shop.name} menu={headerMenu} />
        )}
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      {footerMenu && <Footer menu={footerMenu} />}
    </>
  );
}

function Header({title, menu}: {title: string; menu?: EnhancedMenu}) {
  const isHome = useIsHomePath();
  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();
  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();
  const addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);

  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}
      <DesktopHeader
        isHome={isHome}
        title={title}
        menu={menu}
        openCart={openCart}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
        openCart={openCart}
        openMenu={openMenu}
      />
    </>
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

export function MenuDrawer({
  isOpen,
  onClose,
  menu,
}: {
  isOpen: boolean;
  onClose: () => void;
  menu: EnhancedMenu;
}) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="Menu">
      <div className="grid">
        <MenuMobileNav menu={menu} onClose={onClose} />
      </div>
    </Drawer>
  );
}

function MenuMobileNav({
  menu,
  onClose,
}: {
  menu: EnhancedMenu;
  onClose: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0">
      {(menu?.items || []).map((item) => (
        <div key={item.id}>
          <Link
            to={item.to}
            target={item.target}
            onClick={onClose}
            className={({isActive}) =>
              `block px-6 py-4 border-b border-white/10 uppercase tracking-widest text-sm font-medium transition-colors ${
                isActive
                  ? 'text-[#C9A84C]'
                  : 'text-white/80 hover:text-[#C9A84C]'
              }`
            }
          >
            {item.title}
          </Link>
        </div>
      ))}
    </nav>
  );
}

function MobileHeader({
  title,
  isHome,
  openCart,
  openMenu,
}: {
  title: string;
  isHome: boolean;
  openCart: () => void;
  openMenu: () => void;
}) {
  const params = useParams();
  const {y} = useWindowScroll();
  const scrolled = y > 10;

  return (
    <header
      role="banner"
      className={`flex lg:hidden sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled ? 'bg-[#0A0F1E]/98 backdrop-blur-xl shadow-lg' : 'bg-[#0A0F1E]'
      } border-b border-white/10`}
    >
      <div className="relative flex items-center w-full h-16 px-4">
        <div className="flex items-center w-10">
          <button
            onClick={openMenu}
            className="flex items-center justify-center w-9 h-9 text-white/80 hover:text-[#C9A84C] transition-colors"
            aria-label="Abrir menu"
          >
            <IconMenu />
          </button>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link to="/" prefetch="intent">
            <img
              src="/images/logo.jpg"
              alt={title}
              className="h-10 w-auto object-contain"
            />
          </Link>
        </div>
        <div className="flex items-center justify-end gap-1 ml-auto">
          <Link
            to={params.locale ? `/${params.locale}/search` : '/search'}
            className="flex items-center justify-center w-9 h-9 text-white/80 hover:text-[#C9A84C] transition-colors"
            aria-label="Buscar"
          >
            <IconSearch />
          </Link>
          <CartCount isHome={isHome} openCart={openCart} />
        </div>
      </div>
    </header>
  );
}

function DesktopHeader({
  isHome,
  menu,
  openCart,
  title,
}: {
  isHome: boolean;
  openCart: () => void;
  menu?: EnhancedMenu;
  title: string;
}) {
  const params = useParams();
  const {y} = useWindowScroll();
  const scrolled = y > 10;
  const items = menu?.items || [];

  return (
    <header
      role="banner"
      className={`hidden lg:flex flex-col sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0F1E]/98 backdrop-blur-xl shadow-lg shadow-black/40'
          : 'bg-[#0A0F1E]'
      } border-b border-white/10`}
    >
      <div className="w-full border-b border-white/5">
        <div className="relative max-w-7xl mx-auto px-8 flex items-center justify-center h-20">
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link to="/" prefetch="intent">
              <img
                src="/images/logo.jpg"
                alt={title}
                className={`object-contain transition-all duration-300 ${
                  scrolled ? 'h-12' : 'h-16'
                }`}
              />
            </Link>
          </div>
          <div className="absolute right-8 flex items-center gap-4">
            <Link
              to={params.locale ? `/${params.locale}/search` : '/search'}
              className="flex items-center gap-2 text-white/70 hover:text-[#C9A84C] transition-colors text-sm uppercase tracking-widest"
              aria-label="Buscar"
            >
              <IconSearch />
              <span className="hidden xl:block">Buscar</span>
            </Link>
            <CartCount isHome={isHome} openCart={openCart} />
          </div>
        </div>
      </div>
      <div className="w-full">
        <nav className="max-w-7xl mx-auto px-8 flex items-center justify-center gap-0 h-11">
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              target={item.target}
              prefetch="intent"
              className={({isActive}) =>
                `px-5 py-3 uppercase tracking-[0.15em] text-xs font-medium transition-all duration-200 border-b-2 h-full flex items-center ${
                  isActive
                    ? 'text-[#C9A84C] border-[#C9A84C]'
                    : 'text-white/70 hover:text-[#C9A84C] border-transparent hover:border-[#C9A84C]/50'
                }`
              }
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function CartCount({
  isHome,
  openCart,
}: {
  isHome: boolean;
  openCart: () => void;
}) {
  const rootData = useRouteLoaderData<RootLoader>('root');
  if (!rootData) return null;
  return (
    <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
      <Await resolve={rootData?.cart}>
        {(cart) => (
          <Badge
            dark={isHome}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
          />
        )}
      </Await>
    </Suspense>
  );
}

function Badge({
  openCart,
  dark,
  count,
}: {
  count: number;
  dark: boolean;
  openCart: () => void;
}) {
  const isHydrated = useIsHydrated();
  const BadgeCounter = useMemo(
    () => (
      <>
        <IconBag />
        {count > 0 && (
          <div className="absolute -bottom-1 -right-1 bg-[#C9A84C] text-[#0A0F1E] text-[0.6rem] font-bold h-4 min-w-[1rem] flex items-center justify-center rounded-full px-1">
            {count}
          </div>
        )}
      </>
    ),
    [count],
  );

  return isHydrated ? (
    <button
      onClick={openCart}
      className="relative flex items-center justify-center w-8 h-8 text-white/70 hover:text-[#C9A84C] transition-colors"
      aria-label={`Carrito ${count} items`}
    >
      {BadgeCounter}
    </button>
  ) : (
    <Link
      to="/cart"
      className="relative flex items-center justify-center w-8 h-8 text-white/70 hover:text-[#C9A84C] transition-colors"
    >
      {BadgeCounter}
    </Link>
  );
}

function Footer({menu}: {menu?: EnhancedMenu}) {
  const isHome = useIsHomePath();
  const itemsCount = menu
    ? menu?.items?.length + 1 > 4
      ? 4
      : menu?.items?.length + 1
    : [];

  return (
    <Section
      divider={isHome ? 'none' : 'top'}
      as="footer"
      role="contentinfo"
      className={`grid min-h-[25rem] items-start grid-flow-row w-full gap-6 py-8 px-6 md:px-8 lg:px-12 md:gap-8 lg:gap-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-${itemsCount} bg-[#060912] text-white/60 overflow-hidden border-t border-white/10`}
    >
      <FooterMenu menu={menu} />
      <CountrySelector />
      <div
        className={`self-end pt-8 opacity-40 md:col-span-2 lg:col-span-${itemsCount} text-sm`}
      >
        &copy; {new Date().getFullYear()} Diamond Jewelry Co. Todos los derechos
        reservados.
      </div>
    </Section>
  );
}

function FooterLink({item}: {item: ChildEnhancedMenuItem}) {
  if (item.to.startsWith('http')) {
    return (
      <a href={item.to} target={item.target} rel="noopener noreferrer">
        {item.title}
      </a>
    );
  }
  return (
    <Link to={item.to} target={item.target} prefetch="intent">
      {item.title}
    </Link>
  );
}

function FooterMenu({menu}: {menu?: EnhancedMenu}) {
  const styles = {section: 'grid gap-4', nav: 'grid gap-2 pb-6'};
  return (
    <>
      {(menu?.items || []).map((item) => (
        <section key={item.id} className={styles.section}>
          <Disclosure>
            {({open}) => (
              <>
                <Disclosure.Button className="text-left md:cursor-default">
                  <Heading
                    className="flex justify-between text-white/80 uppercase tracking-widest text-xs"
                    size="lead"
                    as="h3"
                  >
                    {item.title}
                    {item?.items?.length > 0 && (
                      <span className="md:hidden">
                        <IconCaret direction={open ? 'up' : 'down'} />
                      </span>
                    )}
                  </Heading>
                </Disclosure.Button>
                {item?.items?.length > 0 ? (
                  <div
                    className={`${
                      open ? 'max-h-48 h-fit' : 'max-h-0 md:max-h-fit'
                    } overflow-hidden transition-all duration-300`}
                  >
                    <Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop">
                      <Disclosure.Panel static>
                        <nav className={styles.nav}>
                          {item.items.map((subItem: ChildEnhancedMenuItem) => (
                            <FooterLink key={subItem.id} item={subItem} />
                          ))}
                        </nav>
                      </Disclosure.Panel>
                    </Suspense>
                  </div>
                ) : null}
              </>
            )}
          </Disclosure>
        </section>
      ))}
    </>
  );
}
