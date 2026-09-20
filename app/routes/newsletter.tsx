import type {Route} from './+types/newsletter';

/**
 * Newsletter signup endpoint.
 *
 * Creates a Storefront customer with marketing consent accepted. If the store
 * also sets `KLAVIYO_API_KEY` / `KLAVIYO_LIST_ID`, the address is forwarded to
 * Klaviyo as well; the Shopify result is what the popup reports either way.
 */
export async function action({request, context}: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();

  if (!email || !email.includes('@')) {
    return {error: 'Enter a valid email address.'};
  }

  try {
    const result = await context.storefront.mutate(CUSTOMER_CREATE_MUTATION, {
      variables: {
        input: {
          email,
          // A random password is required by customerCreate; the customer
          // completes their account through the standard recovery flow.
          password: crypto.randomUUID(),
          acceptsMarketing: true,
        },
      },
    });

    const errors = result?.customerCreate?.customerUserErrors ?? [];
    const taken = errors.some((error) => error.code === 'TAKEN');

    // An already-registered address is a success from the visitor's side.
    if (errors.length && !taken) {
      return {error: errors[0].message};
    }
  } catch (error) {
    console.error('Newsletter signup failed', error);
    return {error: 'Something went wrong. Please try again.'};
  }

  await forwardToKlaviyo(email, context.env);

  return {ok: true};
}

/**
 * Optional Klaviyo forward. No-ops unless both env vars are present, so the
 * storefront runs without a Klaviyo account.
 */
async function forwardToKlaviyo(email: string, env: Env) {
  const {KLAVIYO_API_KEY: apiKey, KLAVIYO_LIST_ID: listId} = env;

  if (!apiKey || !listId) return;

  try {
    await fetch(
      `https://a.klaviyo.com/api/lists/${listId}/relationships/profiles/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          revision: '2024-10-15',
          Authorization: `Klaviyo-API-Key ${apiKey}`,
        },
        body: JSON.stringify({
          data: [{type: 'profile', attributes: {email}}],
        }),
      },
    );
  } catch (error) {
    // Never fail the signup because a downstream ESP is unavailable.
    console.error('Klaviyo forward failed', error);
  }
}

/** Visiting the URL directly is not meaningful; send people home. */
export async function loader() {
  return new Response(null, {status: 302, headers: {Location: '/'}});
}

const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation NewsletterCustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
` as const;
