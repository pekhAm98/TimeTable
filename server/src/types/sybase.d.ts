declare module "sybase" {
  class Sybase {
    constructor(
      host: string,
      port: number,
      database: string,
      username: string,
      password: string,
      logTiming?: boolean,
      javaJarPath?: string
    );

    connect(callback: (err: Error | null) => void): void;

    query(
      sql: string,
      callback: (err: Error | null, data: unknown[]) => void
    ): void;

    disconnect(): void;
  }

  export = Sybase;
}