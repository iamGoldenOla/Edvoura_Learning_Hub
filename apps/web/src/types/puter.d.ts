export {};

declare global {
  type PuterUser = {
    username?: string;
    email?: string;
  };

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
        getUser?: () => Promise<PuterUser | null>;
        signIn?: (options?: {
          attempt_temp_user_creation?: boolean;
        }) => Promise<unknown>;
        signOut?: () => Promise<void> | void;
      };
    };
  }
}
