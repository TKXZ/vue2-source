import { pushTarget, popTarget } from './dep.js'
import { queueWatcher } from './scheduler.js'

let id = 0
export class Watcher {
  constructor(vm, exprOrFn, cb, options) {
    this.vm = vm
    this.exprOrFn = exprOrFn
    this.cb = cb // 回调函数, 例如 beforeUpdate
    this.options = options
    this.id = id++
    this.deps = [] // 依赖
    this.depsId = new Set()

    if (typeof this.exprOrFn === 'function') {
      this.getter = exprOrFn
    }
    this.get() // 形成视图时收集一次依赖
  }
  get() {
    pushTarget(this) // 调用前将Dep.target 赋值
    this.getter() // 更新
    popTarget() // 调用后将watcher 从 Dep.target 移除
  }
  addDep(dep) {
    let id = dep.id
    // 不重复收集依赖
    if (!this.depsId.has(id)) {
      this.deps.push(dep)
      this.depsId.add(id)
      dep.addSub(this)
    }
  }
  update() {
    queueWatcher(this)
  }
  run() {
    this.get()
  }
}
