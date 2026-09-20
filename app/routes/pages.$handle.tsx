import {useLoaderData} from 'react-router';
import type {Route} from './+types/pages.$handle';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {BackToTop} from '~/components/SeasonConcept';
import {PAGE_FALLBACKS} from '~/lib/vestige';

export const meta: Route.MetaFunction = ({data}) => {
  return [{title: `VESTIGE — ${data?.title ?? ''}`}];
};

export async function loader(args: Route.LoaderArgs) {
  const criticalData = await loadCriticalData(args);
  return {...criticalData};
}

async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const {handle} = params;

  if (!handle) {
    throw new Error('Missing page handle');
  }

  const {page} = await context.storefront
    .query(PAGE_QUERY, {variables: {handle}})
    .catch(() => ({page: null}));

  if (page) {
    redirectIfHandleIsLocalized(request, {handle, data: page});

    return {
      title: page.title,
      bodyHtml: page.body,
      paragraphs: null,
    };
  }

  // The storefront's own policy and information pages are part of the design,
  // so they render from written copy on stores that have not created them.
  const fallback = PAGE_FALLBACKS[handle];

  if (!fallback) {
    throw new Response('Not Found', {status: 404});
  }

  return {
    title: fallback.title,
    bodyHtml: null,
    paragraphs: fallback.body,
  };
}

export default function Page() {
  const {title, bodyHtml, paragraphs} = useLoaderData<typeof loader>();

  return (
    <div>
      <header className="border-b border-ink px-5 py-14 lg:px-8 lg:py-20">
        <h1 className="text-[13px] tracking-[0.3em] uppercase">{title}</h1>
      </header>

      <div className="px-5 py-[100px] lg:px-8 lg:py-[120px]">
        <div className="max-w-[640px] text-[14px] leading-[1.85]">
          {bodyHtml ? (
            <div
              className="space-y-6 [&_a]:underline"
              dangerouslySetInnerHTML={{__html: bodyHtml}}
            />
          ) : (
            <div className="space-y-6">
              {paragraphs?.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      <BackToTop />
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page(
    $language: LanguageCode,
    $country: CountryCode,
    $handle: String!
  )
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
` as const;
