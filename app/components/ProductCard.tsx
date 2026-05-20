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
  const [addedMsg, setAddedMsg] = useState(false);

  const cardProduct: Product = product?.variants
    ? (product as Product)
    : getProductPlaceholder();
  if (!cardProduct?.variants?.nodes?.length) return null;

  const firstVariant = flattenConnection(cardProduct.variants)[0];
  if (!firstVariant) return null;

  const {image, price, compareAtPrice} = firstVariant;
  const isOnSale = isDiscounted(price as MoneyV2, compareAtPrice as MoneyV2);
  const isNew = isNewArrival(product.publishedAt);

  const discount =
    isOnSale && compareAtPrice
      ? Math.round((1 - parseFloat(price.amount) / parseFloat(compareAtPrice.amount)) * 100)
      : null;

  let cardLabel = label;
  if (!cardLabel) {
    if (isOnSale) cardLabel = 'OFERTA';
    else if (isNew) cardLabel = 'NUEVO';
  }

  return (
    <div className={clsx('linio-product-card', className)}>
      {/* Badges */}
      {discount && <span className="linio-discount-badge">-{discount}%</span>}
      {!discount && isNew && <span className="linio-new-badge">NUEVO</span>}

      {/* Wishlist */}
      <button
        className="linio-wish-btn"
        onClick={(e) => { e.preventDefault(); setWished(!wished); }}
        aria-label="Guardar en favoritos"
      >
        <svg viewBox="0 0 24 24" width="15" height="15"
          fill={wished ? '#e53935' : 'none'}
          stroke={wished ? '#e53935' : '#bbb'}
          strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      {/* Image */}
      <Link
        onClick={onClick}
        to={`/products/${product.handle}`}
        prefetch="viewport"
        className="linio-product-img"
      >
        {image ? (
          <Image
            className="w-full h-full object-cover"
            sizes="(min-width: 64em) 20vw, (min-width: 48em) 30vw, 50vw"
            aspectRatio="1/1"
            data={image}
            alt={image.altText || product.title}
            loading={loading}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span style={{fontSize: 40}}>💎</span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="linio-product-info">
        <Link onClick={onClick} to={`/products/${product.handle}`} prefetch="viewport">
          <p className="linio-product-name">{product.title}</p>
        </Link>

        <div className="linio-stars">
          ★★★★<span style={{color:'#ddd'}}>★</span>
          <span> (24)</span>
        </div>

        <div style={{display:'flex', alignItems:'baseline', gap:6, flexWrap:'wrap'}}>
          {isOnSale && compareAtPrice && (
            <span className="linio-price-old">
              <Money withoutTrailingZeros data={compareAtPrice as MoneyV2} />
            </span>
          )}
          <span className="linio-price-new">
            <Money withoutTrailingZeros data={price!} />
          </span>
        </div>
      </div>

      {/* CTA */}
      {firstVariant.availableForSale ? (
        <AddToCartButton
          lines={[{quantity: 1, merchandiseId: firstVariant.id}]}
          className="linio-add-btn"
        >
          {addedMsg ? '✓ Agregado' : '+ Agregar al carrito'}
        </AddToCartButton>
      ) : (
        <button disabled className="linio-add-btn" style={{background:'#bdbdbd',cursor:'not-allowed'}}>
          Agotado
        </button>
      )}
    </div>
  );
}
