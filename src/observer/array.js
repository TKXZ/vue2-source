const origin = Array.prototype
export const arrayMethods = Object.create(origin)
const methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']

methods.forEach((method) => {
  arrayMethods[method] = function (...args) {
    // 先调用原始方法
    const result = origin[method].apply(this, args)

    // 通知更新视图(先log)
    console.log('数组变化了')

    // 获取自身的观察者
    const ob = this.__ob__

    // 如果是插入了新元素,则提取出来新元素,并对他们进行观察
    // 因为我们不知道插入的元素是否是个数组,对象还是普通数据类型
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) {
      ob.observeArray(inserted)
    }

    ob?.dep.notify()

    return result
  }
})
