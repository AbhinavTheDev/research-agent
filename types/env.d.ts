export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CF_ACCOUNT_ID: string;
      CF_GATEWAY: string;
      CF_API_KEY: string;
      CF_WORKER_API_KEY: string;
      AI: Ai;
      ENV: 'test' | 'dev' | 'prod';
    }
  }
}
