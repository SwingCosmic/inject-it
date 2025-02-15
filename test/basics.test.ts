import "disposablestack/auto";
import "reflect-metadata";

import { test, expect, jest, describe, beforeAll } from "@jest/globals";
import { ServiceBuilder } from "@/di/ServiceBuilder";
import { service } from "@/di/decorator/service";
import { autowired } from "@/di/decorator/autowired";
interface IConfig {
  value: number;
}

class A implements IConfig {
  value = 1;
}


class Config implements IConfig {
  value = 1;
}

@service([Config])
class AWithParams {
  readonly config: Config;
  constructor(config: Config) {
    this.config = config;
  }
}

@service()
class BWithParams {
  readonly config: Config;
  constructor(config: Config) {
    this.config = config;
  }
}


class P1 {
  
  @autowired(Config)
  readonly config!: Config;
}

class P2 {
  
  @autowired("IConfig")
  readonly config!: IConfig;
}

class P3 {
  
  @autowired()
  readonly config!: Config;
}

describe("基本注入方式", () => {
  
  test("无参数类", () => {

    const container = new ServiceBuilder()
      .class(A)
      .class(A, "IA")
      .build();

    const a1 = container.resolve<A>("IA");
    expect(a1).toBeInstanceOf(A);

    const a2 = container.resolve(A);
    expect(a2).toBeInstanceOf(A);
    a2.value = 2;

    // 指定名称的实例和指定构造函数的注入应该是不同的实例
    expect(a1.value).toBe(1);
    expect(a2.value).toBe(2);

    // 使用同样的名称的实例重复解析应该返回同一个实例
    const a3 = container.resolve<A>("IA");
    expect(a3).toBe(a1);
    const a4 = container.resolve(A);
    expect(a4).toBe(a2);
  });

  test("构造函数注入--手动指定", () => {

    const container = new ServiceBuilder()
      .class(Config)
      .constructorInject(AWithParams)
      .constructorInject(AWithParams, "IAWithParams")
      .build();

    const a1 = container.resolve<AWithParams>("IAWithParams");
    expect(a1).toBeInstanceOf(AWithParams);
    expect(a1.config).toBeDefined();
    expect(a1.config.value).toBe(1);

    const a2 = container.resolve<AWithParams>(AWithParams);
    expect(a2).toBeInstanceOf(AWithParams);

    // 被注入的依赖应该指向同一个对象
    const params = container.resolve<Config>(Config);
    params.value = 2;
    expect(a1.config.value).toBe(2);
    expect(a2.config.value).toBe(2);
    
  });

  test("构造函数注入--装饰器元数据", () => {

    const container = new ServiceBuilder()
      .class(Config)
      .constructorInject(BWithParams)
      .constructorInject(BWithParams, "IBWithParams")
      .build();

    const a1 = container.resolve<BWithParams>("IBWithParams");
    expect(a1).toBeInstanceOf(BWithParams);
    expect(a1.config).toBeDefined();
    expect(a1.config.value).toBe(1);
    
  });

  test("属性注入--手动&元数据", () => {

    const container = new ServiceBuilder()
      .class(Config)
      .class(Config, "IConfig")
      .propertyInject(P1)
      .propertyInject(P2)
      .propertyInject(P3, "IP3")
      .build();

    const p1 = container.resolve(P1);
    const p2 = container.resolve(P2);
    const p3 = container.resolve<P3>("IP3");

    expect(p1.config).toBeDefined();
    expect(p2.config).toBeDefined();
    expect(p3.config).toBeDefined();

    // p1和p3的config应该是一个对象，p2不是（声明为IConfig）
    p1.config.value = 2;
    expect(p2.config.value).toBe(1);
    expect(p3.config.value).toBe(2);
  });

  test("单实例", () => {
    const container = new ServiceBuilder()
      .instance({ a: 1, b: 2 }, "SimpleObject")
      .build();

    const instance = container.resolve<{ a: number, b: number }>("SimpleObject");
    const instance2 = container.resolve<{ a: number, b: number }>("SimpleObject");

    expect(instance).toBe(instance2);
  });

  test("工厂方法", () => {
    const nowConfig = {
      year: 1919,
      month: 8,
      day: 10,
      hour: 11,
      minute: 45,
      second: 14
    };

    const container = new ServiceBuilder()
      .instance(nowConfig, "NowConfig")
      .factory("Today", c => {
        const config = c.resolve<{ year: number, month: number, day: number }>("NowConfig");
        return new Date(config.year, config.month - 1, config.day);
      })
      .factory("Yesterday", c => {
        const now = c.resolve<Date>("Today");
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      })
      .build();

    const yesterday = container.resolve<Date>("Yesterday");
    expect(yesterday.getDate()).toBe(9);
  });

});