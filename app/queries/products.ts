export const PRODUCTS_QUERY = `#graphql
query ProductsIndex {
  products(first: $first) {
    nodes {
      id
      title
      handle
      featuredImage {
        url
        altText
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
    }
  }
}
`;
