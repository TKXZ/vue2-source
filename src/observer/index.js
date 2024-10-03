import { arrayMethods } from './array.js'
import Dep from './dep.js'

class Observer {
  constructor(value) {
    this.dep = new Dep()
    // 对数组和对象做不同的观察, 因为数组有许多方法需要重写
    if (Array.isArray(value)) {
      Object.defineProperty(value, '__ob__', {
        value: this,
        enumerable: false,
        writable: true,
        configurable: true,
      })
      value.__proto__ = arrayMethods
      // 数组中可能存在对象
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }

  walk(value) {
    for (const [k, v] of Object.entries(value)) {
      defineReactive(value, k, v)
    }
  }

  // 对数组中每一项进行观测, 因为数组每一项可能都是数组或对象
  observeArray(value) {
    for (const v of value) {
      observe(v)
    }
  }
}

function defineReactive(target, key, value) {
  const childOb = observe(value)

  const dep = new Dep()

  Object.defineProperty(target, key, {
    get() {
      console.log('获取值')
      if (Dep.target) {
        dep.depend()
        // 这里要对当值还是个 数组/对象 时要对其收集整个Observer 示例的依赖 - 为什么？不是已经递归地通过dep.depend() 收集过依赖了嘛
        // 提示 - 这里其实是对Vue.$set 方法做了铺垫
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(value)) {
            dependArray(value)
          }
        }
      }
      return value
    },
    set(val) {
      if (val === value) return
      // 这里可以执行更新视图的逻辑
      // 后续在watcher 部分会有涉及
      // 暂且log一下
      console.log('设置值')
      value = val
      dep.notify()
    },
  })
}

export function observe(target) {
  if (Array.isArray(target) || Object.prototype.toString.call(target) === '[object Object]') {
    return new Observer(target)
  }
}

function dependArray(value) {
  for (let e, i = 0, l = value.length; i < l; ++i) {
    e = value[i]
    e?.__ob__?.dep.depend()
    if (Array.isArray(e)) {
      // 数组套数组，递归收集依赖,为$set 和方法调用更新视图做铺垫
      dependArray(e)
    }
  }
}
