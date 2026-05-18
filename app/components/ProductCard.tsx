import clsx from 'clsx';
import {flattenConnection, Image, Money, useMoney} from '@shopify/hydrogen';
import type {MoneyV2, Product} from '@shopify/hydrogen/storefront-api-types';
import {useState} from 'react';

import type {ProductCardFragment} from 'storefrontapi.generated';
import {Link} from '~/components/Link';
import {AddToCartButton} from '~/components/AddToCartButton';
import {isDiscounted, isNewArrival} from '~/lib/utils';
import {getProductPlaceholder} from '~/lib/placeholders';

export function ProductCard({
  product,
  label,
  className,
  loading,
  onClick,
  quickAdd,
}: {
  product: ProductCardFragment;
  label?: string;
  className?: string;
  loading?: HTMLImageElement['loading'];
  onClick?: () => void;
  quickAdd?: boolean;
}) {
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);

  const cardProduct: Product = product?.variants
    ? (product as Product)
    : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const firstVariant = flattenConnection(cardProduct.variants)[0];
  if (!firstVariant) return null;

  const {image, price, compareAtPrice} = firstVariant;
  const isOnSale = isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2);
  const isNew = isNewArrival(product.publishedAt);

  let cardLabel = label;
  if (!cardLabel) {
    if (isOnSale) cardLabel = 'OFERTA';
    else if (isNew) cardLabel = 'NUEVO';
  }

  const discount =
    isOnSale && compareAtPrice
      ? Math.round(
          (1 - parseFloat(price.amount) / parseFloat(compareAtPrice.amount)) *
            100,
        )
      : null;

  return (
    <div
      className={clsx(
        'group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300',
        className,
      )}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {cardLabel && (
          <span className="bg-[#0A0F1E] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
            {cardLabel}
          </span>
        )}
        {discount && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            -{discount}%
          </span>
        )}
      </div>

      {/* Botón wishlist */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setWished(!wished);
        }}
        className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow hover:scale-110 transition-transform"
        aria-label="Agregar a favoritos"
      >
        <svg
          viewBox="0 0 24 24"
          fill={wished ? '#C9A84C' : 'none'}
          stroke={wished ? '#C9A84C' : '#555'}
          strokeWidth="2"
          className="w-4 h-4"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Imagen */}
      <Link
        onClick={onClick}
        to={`/products/${product.handle}`}
        prefetch="viewport"
        className="block overflow-hidden bg-gray-50"
      >
        <div className="aspect-square overflow-hidden">
          {image ? (
            <Image
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(min-width: 64em) 25vw, (min-width: 48em) 30vw, 50vw"
              aspectRatio="1/1"
              data={image}
              alt={image.altText || product.title}
              loading={loading}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-300 text-4xl">💎</span>
            </div>
          )}
        </div>

        {/* Overlay con botón vista previa */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white text-[#0A0F1E] text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full shadow-lg">
            Ver producto
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col gap-3 p-4 flex-1">
        <Link
          onClick={onClick}
          to={`/products/${product.handle}`}
          prefetch="viewport"
        >
          <h3 className="text-sm font-medium text-[#0A0F1E] leading-snug line-clamp-2 hover:text-[#C9A84C] transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Precios */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#C9A84C] font-bold text-base">
            <Money withoutTrailingZeros data={price!} />
          </span>
          {isOnSale && compareAtPrice && (
            <span className="text-gray-400 line-through text-sm">
              <Money withoutTrailingZeros data={compareAtPrice as MoneyV2} />
            </span>
          )}
        </div>

        {/* Botón agregar al carrito */}
        {firstVariant.availableForSale ? (
          <AddToCartButton
            lines={[{quantity: 1, merchandiseId: firstVariant.id}]}
            className="w-full mt-auto bg-[#0A0F1E] hover:bg-[#C9A84C] text-white hover:text-[#0A0F1E] text-xs font-bold uppercase tracking-widest py-3 rounded-full transition-all duration-300"
          >
            Agregar al carrito
          </AddToCartButton>
        ) : (
          <button
            disabled
            className="w-full mt-auto bg-gray-200 text-gray-400 text-xs font-bold uppercase tracking-widest py-3 rounded-full cursor-not-allowed"
          >
            Agotado
          </button>
        )}
      </div>
    </div>
  );
}

function CompareAtPrice({
  data,
  className,
}: {
  data: MoneyV2;
  className?: string;
}) {
  const {currencyNarrowSymbol, withoutTrailingZerosAndCurrency} =
    useMoney(data);
  return (
    <span className={clsx('line-through text-gray-400', className)}>
      {currencyNarrowSymbol}
      {withoutTrailingZerosAndCurrency}
    </span>
  );
}
