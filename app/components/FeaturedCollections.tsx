import {Image} from '@shopify/hydrogen';

import {Heading, Section} from '~/components/Text';
import {Grid} from '~/components/Grid';
import {Link} from '~/components/Link';

type FeaturedCollectionsProps = {
  collections?: {
    nodes?: Array<{
      id: string;
      handle: string;
      title: string;
      image?: {
        altText?: string | null;
        url: string;
        width?: number | null;
        height?: number | null;
      } | null;
    } | null>;
  };
  title?: string;
  [key: string]: any;
};

export function FeaturedCollections({
  collections,
  title = 'Collections',
  ...props
}: FeaturedCollectionsProps) {
  const collectionsWithImage =
    collections?.nodes?.filter(
      (item): item is NonNullable<typeof item> => !!item && !!item.image,
    ) ?? [];

  if (!collectionsWithImage.length) return null;

  return (
    <Section {...props} heading={title}>
      <Grid items={collectionsWithImage.length}>
        {collectionsWithImage.map((collection) => {
          return (
            <Link key={collection.id} to={`/collections/${collection.handle}`}>
              <div className="grid gap-4">
                <div className="card-image bg-primary/5 aspect-[3/2]">
                  {collection?.image && (
                    <Image
                      alt={`Image of ${collection.title}`}
                      data={collection.image}
                      sizes="(max-width: 32em) 100vw, 33vw"
                      aspectRatio="3/2"
                    />
                  )}
                </div>
                <Heading size="copy">{collection.title}</Heading>
              </div>
            </Link>
          );
        })}
      </Grid>
    </Section>
  );
}
