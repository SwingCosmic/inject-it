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
* 支持模块（插件化）注入，暴露一个安装方法，批量注册依赖
* 依赖异步初始化

## 设计理念

inject-it注册的依赖默认采用Singleton模式，即重复获取同一个类型（接口名或者构造函数），始终返回一个实例。这和一些通常在web服务中使用的IoC容器的默认方式不一样，它们可能默认采用的是Transient或者Scoped模式。

这种设计是 **刻意** 的，目的是为了降低单用户/无用户体系的客户端和web应用使用的复杂度，并且更好地和vue等前端框架进行整合。通常在这些框架中，会有较多的在应用生命周期中始终存在的依赖，并且往往以全局状态的方式进行管理和使用，极少涉及作用域和资源释放。

inject-it希望在这些应用中，执行业务逻辑和获取依赖的代码，交由容器来完成，不再依赖全局对象，同时把UI交互和数据逻辑解耦，使得逻辑可以模块化和封装，提升可维护性和扩展性。
## 使用

> ⚠️ 同一个类，只支持构造函数注入和属性注入中的一种。
  推荐使用构造函数注入，这样该类可以在容器以外的地方手动创建实例

> ⚠️ 注入的参数尽量避免包含值类型(Number, Boolean, BigInt), Array, Symbol和String，使用这些参数可能会带来无法预测的结果

### 构造函数注入

`@service`装饰器的参数为该类构造函数的参数对应的依赖类型的数组，可以是类构造函数或者接口名。数组元素的数量和顺序与构造函数参数一一对应，且参数不能是可选的

```typescript
import { ServiceBuilder, service, autowired } from "@lovekicher/inject-it";


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

> ⚠️ 属性注入要求该类有无参构造函数，且构造函数中没有需要清理的副作用代码

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

### 使用容器

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
