import "disposablestack/auto";
import "reflect-metadata";

import { test, expect, jest, describe, beforeAll } from "@jest/globals";
import { ServiceBuilder } from "@/di/ServiceBuilder";
import { service } from "@/di/decorator/service";
import { autowired } from "@/di/decorator/autowired";
import { IAsyncInitialize } from "@/resource";

interface TimeoutConfig {
  timeout: number;
}

@service(["TimeoutConfig"])
class AsyncInit implements IAsyncInitialize {
  isInitialized = false;

  private config: TimeoutConfig;
  constructor(config: TimeoutConfig) {
    this.config = config;
  }

  value = 0;
  initializeAsync(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isInitialized = true;
        this.value = 1;
        resolve();
      }, this.config.timeout);
    });
  }

}

describe("高级注入用法", () => {
  test("异步初始化", async () => {

    const container = new ServiceBuilder()
      .instance({ timeout: 1000 }, "TimeoutConfig")
      .constructorInject(AsyncInit, "IAsyncInit")
      .build();

    const a1 = await container.resolveInitialized<AsyncInit>("IAsyncInit");
    expect(a1.value).toBe(1);
  });
});