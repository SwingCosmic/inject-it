export interface IDisposable {
  readonly disposed?: boolean;
  dispose(): any;
}

export function isDisposable(obj: any): obj is IDisposable {
  return obj && typeof obj.dispose === "function";
}



export interface IAsyncInitialize {
  readonly isInitialized: boolean;
  initializeAsync(): Promise<void>;
}

export function isAsyncInitialize(obj: any): obj is IAsyncInitialize {
  return obj && typeof obj.initializeAsync === "function";
}

export interface IAsyncDisposable {
  readonly disposed?: boolean;
  disposeAsync(): Promise<void>;
}

export function isAsyncDispose(obj: any): obj is IAsyncDisposable {
  return obj && typeof obj.disposeAsync === "function";
}
