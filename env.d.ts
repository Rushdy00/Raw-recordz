/// <reference types="vite/client" />
/// <reference types="react-router" />
/// <reference types="@shopify/oxygen-workers-types" />
/// <reference types="@shopify/hydrogen/react-router-types" />

// Enhance TypeScript's built-in typings.
import '@total-typescript/ts-reset';

declare global {
  /**
   * Optional integration credentials. When absent, the newsletter route
   * subscribes through Shopify alone and skips the Klaviyo forward.
   */
  interface Env {
    KLAVIYO_API_KEY?: string;
    KLAVIYO_LIST_ID?: string;
  }
}
