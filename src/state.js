import { observe } from './observer/index.js'

export function initState(vm) {
  const opts = vm.$options

  if (opts.data) {
    initData(vm)
  }
}

function initData(vm) {
  let data = vm.$options.data

  // 判断 data 是函数返回值还是对象
  data = vm._data = typeof data === 'function' ? data.call(vm) : data || {}

  for (const k in data) {
    // 这里做一层代理的目的是我们需要在组件内使用this.xxx来获取组件的data中的值
    proxy(vm, '_data', k)
  }

  observe(data)
}

function proxy(object, sourceKey, key) {
  Object.defineProperty(object, key, {
    get() {
      // 这里不直接使用key 是因为直接使用会导致循环get
      return object[sourceKey][key]
    },
    set(val) {
      object[sourceKey][key] = val
    },
  })
}
