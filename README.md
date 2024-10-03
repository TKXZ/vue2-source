### Vue 响应式数据

在 initData 函数中, 对对象和数组做了不同的处理,因为改变一个数组通常是使用其方法进行数据的更换

- 对象，递归式的使用 Object.defineProperty 对 get 和 set 进行代理,可以响应属性值的更变

  - 缺点, 无法监听到数据的增加与删除

- 数组, 重写修改数组的所有方法, 在修改时进行视图更新,并对其中的数组或对象进行递归式的监听

  - 缺点, 无法监听通过下标更改数据

- 总体缺陷: 总是递归式的进行数据的监听, 较为浪费性能,且无法对全部的数据更改方式进行响应

TODO: Vue.$set 是如何实现的

### Vue2 模板编译原理

1. 通过接收用户传来的 options 提取其中的 el, template, render; 若 存在 render 则直接使用, 否则使用 template, 若 template 不存在则 template 为 el.outerHTML
2. 通过 template 结合各种正则生成元素的 AST

```js
const AST = {
  tag: 'div',
  type: 1, // 1 表示这是一个原生HTML 元素标签
  attrs: [{ name, value }],
  children: [...childrenAST],
  parent: null | ASTElement,
}
```

3. 根据生成的 AST, 提取其中的 tag, attrs, 根据 parent 递归解析 children, 生成类似 `_c('div',{id:"app"},_c('div',undefined,_v("hello"+_s(name)),_c('span',undefined,_v("world"))))` 的代码, 最终生成 render 函数

### Vue2 模板初次渲染原理

1. 在 Vue 原型上创建`_render` 函数和使用到的`_c, _s, _v`, 函数, 分别用于处理 `render` 函数中的标签, 组件变量(with 指向的 this 更变，里面出现的变量都隐式来源于 this), 文本, 最终返回一个 VNode
2. 创建 VNode 类用于创建各种 Vnode 实例
3. Vue 原型上的`_update` 函数根据`_render` 返回的 VNode, 通过 `patch` 函数生成真实 DOM,并挂载到页面上

### Vue2 渲染更新原理

> [!TIP]
> 在初次渲染地源码中我们已经知道了要想从 data(数据) -> view(视图) 我们只需要调用 render 后将 `VNode` 传入 update 即可通过 VDOM 生成真实 DOM 并挂载
> 但我们不能手动调用该方法, 因此 Vue 使用观察者模式进行了解决

- 什么是观察者模式
  是设计模式之一，每一个观察者(可以理解为一个组件)有其对应的观察对象(被观察者, 也就是组件的数据 data 中每一个值), 当被观察者发生变化就通知观察者做些什么(更新视图)

1. 为每一个组件在挂载前创建一个 `Watcher` 实例来收集依赖
2. 在定义响应式数据的 `defineReactive` 处为每一个数据创建一个 dep, 即依赖, 在 `get` 中将 `dep` 添加对应的 `watcher` 中,同时 `watcher` 中也保留一份 `dep`
3. 针对数组的方法修改, 我们需要在 `Observer` 实例上也创建一个 `Dep` 实例, 这样调用方法后也可以获取数组的 `observer` 的 `dep` 来通知 `watcher`

### Vue2 异步更新原理

由上面的更新渲染我们就可以更新数据的同时更新视图, 但当高频次更新数据时,每一次都要更新一次视图, 我们可不可以等最后一次(同步)更新数据完毕后统一更新视图？

> [!TIP]
> 当然！想一下任务循环中的微任务和宏任务

1. 修改 Watcher, 我们需要在更新视图的方法中先保存 `watcher` 实例(用 ID 筛选出重复的)
2. 定义`nextTick` 函数, 接受一个回调函数,通过微任务优先和优雅降级的方式定义出一个 `timerFunc` 函数，`timerFunc` 函数用于执行 `nextTick` 收集到的所有回调
3. 将收集到所有 `wathcher` 的更新函数组合成一个函数，将该函数传递给 `nextTick`

至此，当同步连续更新数次组件数据后,仅触发一次更新, 因为最终调用更新函数是一个微任务(或宏任务),调用时同步代码一定是走完了的
