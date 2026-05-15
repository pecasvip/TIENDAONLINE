import type {ProductCardFragment} from 'storefrontapi.generated';
import {Section} from '~/components/Text';
import {ProductCard} from '~/components/ProductCard';

const mockProducts: {nodes: ProductCardFragment[]} = {
  nodes: new Array(12).fill({
    id: '',
    handle: '',
    title: '',
    vendor: '',
    publishedAt: '',
    variants: {
      nodes: [
        {
          id: '',
          availableForSale: false,
          price: {amount: '0', currencyCode: 'USD'},
          compareAtPrice: null,
          selectedOptions: [],
          product: {
            handle: '',
            title: '',
          },
        },
      ],
    },
  }),
};

type ProductSwimlaneProps = {
  title?: string;
  count?: number;
  products?: {nodes: ProductCardFragment[]};
  [key: string]: any;
};

export function ProductSwimlane({
  title = 'Featured Products',
  products = mockProducts,
  count = 12,
  ...props
}: ProductSwimlaneProps) {
  return (
    <Section heading={title} padding="y" {...props}>
      <div className="swimlane hiddenScroll md:pb-8 md:scroll-px-8 lg:scroll-px-12 md:px-8 lg:px-12">
        {products.nodes.map((product) => (
          <ProductCard
            product={product}
            key={product.id}
            className="snap-start w-80"
          />
        ))}
      </div>
    </Section>
  );
}
