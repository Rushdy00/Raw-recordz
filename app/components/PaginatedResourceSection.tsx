import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

/**
 * <PaginatedResourceSection> encapsulates the previous and next pagination behaviors throughout your application.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  ariaLabel,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  ariaLabel?: string;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        const pagerClassName =
          'block px-5 py-6 text-center text-[11px] tracking-[0.22em] uppercase underline lg:px-8';

        return (
          <div>
            <PreviousLink className={pagerClassName}>
              {isLoading ? 'Loading…' : 'Load previous'}
            </PreviousLink>

            {resourcesClassName ? (
              <div
                aria-label={ariaLabel}
                className={resourcesClassName}
                role={ariaLabel ? 'region' : undefined}
              >
                {resourcesMarkup}
              </div>
            ) : (
              resourcesMarkup
            )}

            <NextLink className={pagerClassName}>
              {isLoading ? 'Loading…' : 'Load more'}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}
