import { VNode } from '../vdom/index.js'

export function patch(oldVNode, vNode) {
  // 是否为真实DOM
  // 因为第一次调用是没有旧的VNode 的
  const isRealElement = !(oldVNode instanceof VNode) && oldVNode.nodeType

  if (isRealElement) {
    const oldEl = oldVNode
    const parentEl = oldEl.parentNode

    let el = createEl(vNode)

    // 插入到 老的el节点下一个节点的前面 就相当于插入到老的el节点的后面
    // 这里不直接使用父元素appendChild是为了不破坏替换的位置 (如果模板外还有其他的元素)
    // 例如当前模板为:
    // <body>
    //    <div id="app">我是模板</div>
    //    <span>我是模板外的元素, 渲染出来的内容要到我的上面</span>
    // </body>
    parentEl?.insertBefore(el, oldEl.nextSibling)
    parentEl?.removeChild(oldEl)

    return el
  }
}

function createEl(vNode) {
  const { tag, data, key, children, text } = vNode
  if (typeof tag === 'string') {
    vNode.el = document.createElement(tag)

    // 为DOM 元素设置属性
    updateProperties(vNode)

    // 递归创建元素
    children.forEach((child) => {
      vNode.el.appendChild(createEl(child))
    })
  } else {
    if (text) {
      vNode.el = document.createTextNode(text)
    }
  }
  // 返回真实DOM根节点
  return vNode.el
}

// 处理元素属性
function updateProperties(vNode) {
  const { data, el } = vNode
  for (const k of Object.keys(data)) {
    if (k === 'style') {
      const styleObj = data[k]
      for (const sk of Object.keys(styleObj)) {
        el.style[sk] = styleObj[sk]
      }
    } else if (k === 'class') {
      el.className = data[k]
    } else {
      el.setAttribute(k, data[k])
    }
  }
}
