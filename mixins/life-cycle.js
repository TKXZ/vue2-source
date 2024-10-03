import { patch } from '../src/vdom/patch.js'
import { Watcher } from '../src/observer/watcher.js'

export function mountComponent(vm, el) {
  vm.$el = el

  function updateComponent() {
    const vNode = vm._render()
    vm._update(vNode)
  }
  // 每一个组件实例一个watcher, 由watcher 调用更新视图的函数
  new Watcher(vm, updateComponent, null, true)
}

export function lifeCycleMixin(Vue) {
  Vue.prototype._update = function (vNode) {
    const vm = this
    // 将VDOM 渲染为真实DOM
    vm.$el = patch(vm.$el, vNode)
  }
}
