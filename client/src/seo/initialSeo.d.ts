export {};

declare global {
  interface Window {
    MoneyCalciInitialSEO?: {
      routes: Record<string, { title: string; description: string }>;
      apply: () => void;
    };
  }
}
