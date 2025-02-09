import { IAsyncDisposable, IDisposable, isAsyncDispose, isDisposable } from ".";

export type DisposableLike =
  | IDisposable
  | IAsyncDisposable
  | Disposable
  | AsyncDisposable;
export async function disposeObject(obj: DisposableLike) {
  if (!dispose(obj as any)) {
    await disposeAsync(obj as any);
  }
}

export function dispose(obj: IDisposable | Disposable): boolean {
  if (isDisposable(obj)) {
    obj.dispose();
    return true;
  } else if (Symbol.dispose in obj) {
    // 包括DisposableStack
    obj[Symbol.dispose]();
    return true;
  }
  return false;
}

export async function disposeAsync(
  obj: IAsyncDisposable | AsyncDisposable
): Promise<boolean> {
  if (isAsyncDispose(obj)) {
    await obj.disposeAsync();
    return true;
  } else if (Symbol.asyncDispose in obj) {
    await obj[Symbol.asyncDispose]();
    return true;
  }
  return false;
}

export function toNativeDisposable(obj: IDisposable | Disposable): Disposable;
export function toNativeDisposable(
  obj: IAsyncDisposable | AsyncDisposable
): AsyncDisposable;
export function toNativeDisposable(obj: DisposableLike): DisposableLike {
  if (isDisposable(obj)) {
    return {
      [Symbol.dispose]() {
        return obj.dispose();
      },
    };
  } else if (isAsyncDispose(obj)) {
    return {
      [Symbol.asyncDispose]() {
        return obj.disposeAsync();
      },
    };
  }
  return obj;
}
