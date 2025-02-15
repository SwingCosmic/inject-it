# inject-it

基于TypeScript强类型的轻量级依赖注入容器，支持node.js和浏览器环境

## 特性

* 支持node.js和浏览器环境
* 非常轻量，除了polyfill，没有其他依赖
* 采用 [reflect-metadata](https://github.com/rbuckton/ReflectDecorators) 通过装饰器为类型声明注入依赖
* 如果`tsconfig.json`中设置`emitDecoratorMetadata`为true，则支持根据tsc 编译器生成的元数据自动获取依赖信息
* 可以通过依赖的接口名称来注入依赖，支持非构造函数和类的依赖，例如普通对象实例
* 支持构造函数注入，通过`@service`装饰器
* 支持属性注入，通过`@autowired`装饰器
* 支持工厂方法和单实例
* 依赖异步初始化

## 使用

> ⚠️ 同一个类，只支持构造函数注入和属性注入中的一种。
推荐使用构造函数注入，这样该类可以在容器以外的地方手动创建实例

### 构造函数注入

`@service`装饰器的参数为该类构造函数的参数对应的依赖类型的数组，可以是类构造函数或者接口名，数组元素的数量和顺序与构造函数参数一一对应

```typescript
import { ServiceBuilder, service, autowired } from "inject-it";


interface TimeoutConfig {
  timeout: number;
}

interface IDataService {
  getData(): Promise<number[]>;
}

// 声明依赖，可以是接口
@service(["TimeoutConfig"])
class DataService implements IDataService {

  private readonly config: TimeoutConfig;
  constructor(config: TimeoutConfig) {
    this.config = config;
  }

  async getData(): Promise<number[]> {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, this.config.timeout);
    });
    return [1, 2, 3];
  }
}

```

### 属性注入

`@autowired`装饰器的参数为该属性对应的依赖类型的构造函数或者接口名

可以将属性声明为`private readonly`。由于js的限制，真正的私有属性（以#开头）无法通过外部写入，请不要注入这些属性。

```typescript

class DataService implements IDataService {

  @autowired("TimeoutConfig")
  private readonly config!: TimeoutConfig;

  async getData(): Promise<number[]> {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, this.config.timeout);
    });
    return [1, 2, 3];
  }
}

```

### 使用

```typescript

// 注册依赖
const container = new ServiceBuilder()
  .instance({ timeout: 1000 }, "TimeoutConfig")
  .constructorInject(DataService, "IDataService")
  .build();

// 使用容器
const service = container.resolve<IDataService>("IDataService");
await service.getData();

```
