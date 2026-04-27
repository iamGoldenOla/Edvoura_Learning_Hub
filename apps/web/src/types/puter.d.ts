export {};

declare global {
  interface Window {
    puter?: {
      ai?: {
        chat?: (
          prompt: string,
          options?: {
            model?: string;
            stream?: boolean;
          },
        ) => Promise<unknown> | AsyncIterable<{ text?: string }>;
      };
      auth?: {
        isSignedIn?: () => boolean;
        getUser?: () => Promise<unknown>;
      };
    };
  }
}
