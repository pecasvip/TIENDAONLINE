import {useLoaderData} from '@remix-run/react';
import {
  Image,
  Pagination,
  flattenConnection,
  getPaginationVariables,
} from '@shopify/hydrogen';
import {json, type LoaderFunctionArgs} from '@shopify/remix-oxygen';

import {Grid} from '~/components/Grid';
import {Heading, PageHeader, Section} from '~/components/Text';
import {Link} from '~/components/Link';
import {Button} from '~/components/Button';
import {getImageLoadingPriority} from '~/lib/const';
import {routeHeaders} from '~/data/cache';

const PAGINATION_SIZE = 4;

export const headers = routeHeaders;

export async function loader({request, context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const {language, country} = storefront.i18n;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: PAGINATION_SIZE,
  });

  const {collections} = await storefront.query(COLLECTIONS_QUERY, {
    variables: {
      ...paginationVariables,
      country,
      language,
    },
  });

  if (!collections) {
    throw new Response('Not found', {status: 404});
  }

  return json({collections});
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading="Collections" />

      <Section>
        <Pagination connection={collections}>
          {({nodes, isLoading, PreviousLink, NextLink}) => (
            <>
              <div className="flex items-center justify-center mb-10">
                <Button as={PreviousLink} variant="secondary" width="full">
                  {isLoading ? 'Loading...' : 'Previous collections'}
                </Button>
              </div>

              <Grid items={2} data-test="collection-grid">
                {((nodes as Array<Collection | null>) ?? []).map(
                  (collection, i) =>
                    collection ? (
                      <div
                        key={collection.id}
                        className="group transition-all duration-700 ease-out hover:-translate-y-2"
                      >
                        <CollectionCard
                          collection={collection}
                          loading={getImageLoadingPriority(i, 2)}
                        />
                      </div>
                    ) : null,
                )}
              </Grid>

              <div className="flex items-center justify-center mt-12">
                <Button as={NextLink} variant="secondary" width="full">
                  {isLoading ? 'Loading...' : 'Next collections'}
                </Button>
              </div>
            </>
          )}
        </Pagination>
      </Section>
    </>
  );
}

type Collection = {
  id: string;
  handle: string;
  title: string;
  image?: {
    id: string;
    url: string;
    width: number;
    height: number;
    altText?: string | null;
  } | null;
};

type CollectionCardCollection = Pick<
  Collection,
  'id' | 'handle' | 'title' | 'image'
>;

function CollectionCard({
  collection,
  loading,
}: {
  collection: CollectionCardCollection;
  loading?: HTMLImageElement['loading'];
}) {
  return (
    <Link
      prefetch="viewport"
      to={`/collections/${collection.handle}`}
      className="
        group block
        rounded-2xl overflow-hidden
        bg-[#0A0F1E]
        border border-white/5
        hover:border-[#C9A84C]/40
        transition-all duration-700
      "
    >
      <div className="relative aspect-[3/2] overflow-hidden">
        {collection?.image && (
          <Image
            data={collection.image}
            aspectRatio="6/4"
            sizes="(max-width: 32em) 100vw, 45vw"
            loading={loading}
            className="
              w-full h-full object-cover
              scale-105 group-hover:scale-110
              transition-transform duration-1000 ease-out
            "
          />
        )}

        <div
          className="
          absolute inset-0
          bg-gradient-to-t from-black/70 via-black/10 to-transparent
          opacity-80 group-hover:opacity-100
          transition-all duration-700
        "
        />
      </div>

      <div className="p-5">
        <Heading as="h3" size="copy" className="text-white">
          {collection.title}
        </Heading>

        <p
          className="
          text-white/40 text-sm mt-2
          group-hover:text-[#C9A84C]
          transition-colors duration-500
        "
        >
          Ver colección →
        </p>
      </div>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
query CollectionsPageList(
  $country: CountryCode
  $language: LanguageCode
  $first: Int
  $startCursor: String
  $endCursor: String
) @inContext(country: $country, language: $language) {
  collections(
    first: $first
    before: $startCursor
    after: $endCursor
  ) {
    nodes {
      id
      title
      description
      handle
      seo {
        description
        title
      }
      image {
        id
        url
        width
        height
        altText
      }
    }
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
    }
  }
}
`;
