export interface BenchmarkHooksOptions {
  setProductCount(count: number): void | Promise<void>;
  reset(): void | Promise<void>;
  navigate(path: string): void | Promise<unknown>;
}
export function installBenchmarkHooks(options: BenchmarkHooksOptions): void;
