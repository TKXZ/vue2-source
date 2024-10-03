import { createElement, createTextElement } from '../src/vdom/index.js'

export function renderMixin(Vue) {
  Vue.prototype._render = function () {
    const vm = this
    const { render } = vm.$options
    const vNode = render.call(this)
    return vNode
  }
  // 针对DOM元素
  Vue.prototype._c = function (...args) {
    const [tag, props, children] = args
    return createElement(tag, props, children)
  }
  // 针对文本
  Vue.prototype._v = function (text) {
    return createTextElement(text)
  }
  // 针对文本中{{}}变量
  Vue.prototype._s = function (value) {
    return value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : value
  }
}
