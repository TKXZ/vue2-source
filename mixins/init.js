import { initState } from '../src/state.js'
import { compilerToFunction } from '../src/compiler/index.js'
import { mountComponent } from './life-cycle.js'

export function initMixin(Vue) {
  Vue.prototype._init = function () {
    const vm = this
    const options = vm.$options

    // 初始化数据
    initState(vm)

    // 根据render 函数将组件挂载
    // 或 获取(根据)模板, 生成渲染函数 render
    if (options.el) {
      vm.$mount(vm.$options.el)
    }
  }
  Vue.prototype.$mount = function (el) {
    const vm = this
    const options = vm.$options
    const $el = document.querySelector(el)

    if (!options.render) {
      let template = options.template

      if (!template && $el) {
        // 若 $el 为<div id="app"></div> 则template 包含该父级(id=app)标签
        template = $el.outerHTML
      }

      if (template) {
        // 根据 模板生成渲染函数
        const render = compilerToFunction(template)
        options.render = render
      }
    }

    return mountComponent(vm, $el)
  }
}
