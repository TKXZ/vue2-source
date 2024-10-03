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
  } else {
    // 新旧节点标签不一样，直接替换 -- 同级
    if (oldVNode.tag !== vNode.tag) {
      oldVNode.el.parentNode.replaceChild(createEl(vNode), oldVNode.el)
    }

    if (!oldVNode.tag) {
      if (oldVNode.text !== vNode.text) {
        oldVNode.el.textContent = vNode.text
      }
    }

    // 说明标签一样，那就直接赋给新el
    const el = (vNode.el = oldVNode.el)
    // 更新当前节点属性
    updateProperties(vNode, oldVNode.data)

    const oldCh = oldVNode.children || []
    const newCh = vNode.children || []
    // 新旧都有子节点
    if (oldCh.length > 0 && newCh.length > 0) {
      updateChildren(el, oldCh, newCh)
    }
    // 新节点子节点为空
    else if (oldCh.length > 0) {
      el.innerHTML = ''
    }
    // 旧节点子节点为空
    else if (newCh.length > 0) {
      for (let i = 0; i < newCh.length; ++i) {
        const child = newCh[i]
        el.appendChild(createEl(child))
      }
    }
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
function updateProperties(vNode, oldProps = {}) {
  const { data: newProps, el } = vNode || {}

  // 新属性不存在于旧属性 移除
  for (const k of Object.keys(oldProps)) {
    if (!newProps[k]) {
      el.removeAttribute(k)
    }
  }

  // 新样式不存在于旧样式 移除
  const oldSty = oldProps.style || {}
  const newSty = newProps.style || {}
  for (const sk of Object.keys(oldProps)) {
    if (!newSty[sk]) {
      el.style[sk] = ''
    }
  }

  for (const k of Object.keys(newProps)) {
    if (k === 'style') {
      const styleObj = newProps[k]
      for (const sk of Object.keys(styleObj)) {
        el.style[sk] = styleObj[sk]
      }
    } else if (k === 'class') {
      el.className = newProps[k]
    } else {
      el.setAttribute(k, newProps[k])
    }
  }
}

function isSameVNode(oldVNode, newVNode) {
  return oldVNode.tag === newVNode.tag && oldVNode.key === newVNode.key
}

function updateChildren(parent, oldCh, newCh) {
  // 前后双指针策略
  let oldStartIndex = 0
  let oldStartVnode = oldCh[0]
  let oldEndIndex = oldCh.length - 1
  let oldEndVnode = oldCh[oldEndIndex]

  let newStartIndex = 0
  let newStartVnode = newCh[0]
  let newEndIndex = newCh.length - 1
  let newEndVnode = newCh[newEndIndex]

  // 根据key 创建对应的节点index 映射
  function makeIndexByKey(children) {
    let map = {}
    children.forEach((item, index) => {
      map[item.key] = index
    })
    return map
  }

  let map = makeIndexByKey(oldCh)

  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 因为暴力对比后oldStartVnode 可能为 undefined
    if (!oldStartVnode) {
      oldStartVnode = oldCh[++oldStartIndex]
    } else if (!oldEndVnode) {
      oldEndVnode = oldCh[--oldEndIndex]
    } else if (isSameVNode(oldStartVnode, newStartVnode)) {
      // 头头
      patch(oldStartVnode, newStartVnode)
      oldStartVnode = oldCh[++oldStartIndex]
      newStartVnode = newCh[++newStartIndex]
    } else if (isSameVNode(oldEndVnode, newEndVnode)) {
      // 尾尾
      patch(oldEndVnode, newEndVnode)
      oldEndVnode = oldCh[--oldEndIndex]
      newEndVnode = newCh[--newEndIndex]
    } else if (isSameVNode(oldStartVnode, newEndVnode)) {
      // 头尾
      patch(oldStartVnode, newEndVnode)
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
      oldStartVnode = oldCh[++oldEndIndex]
      newEndVnode = newCh[--newEndIndex]
    } else if (isSameVNode(oldEndVnode, newStartVnode)) {
      // 尾头
      patch(oldEndVnode, newStartVnode)
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el)
      oldEndVnode = oldCh[--oldEndIndex]
      newStartVnode = newCh[++newStartIndex]
    } else {
      // 双指针边界都没有就从旧的子节点中查找对应的 key -- 暴力对比
      let moveIndex = map[newStartIndex.key]

      if (!moveIndex) {
        // 没找到旧直接添加
        parent.insertBefore(createEl(moveVnode), oldStartVnode.el)
      } else {
        // 找到就复用
        let moveVnode = oldCh[moveIndex]
        oldCh[moveIndex] = undefined // 防止数组塌陷
        parent.insertBefore(moveVnode.el, oldStartVnode.el)
        patch(moveVnode, newStartVnode)
      }
      newStartIndex++
    }
  }

  // 还有新节点就插入到筛选出来的序列(old)后面
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; ++i) {
      const ele = newCh[newEndIndex + 1].el == null ? null : newCh[newEndIndex].el
      // 当insertBefore 第二个参数为null 时, 相当于appendChild
      parent.insertBefore(createEl(newCh[i]), ele)
    }
  }
  // 还有的旧节点旧直接移除
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; ++i) {
      const childEl = oldCh[i]
      if (typeof childEl !== 'undefined') {
        parent.removeChild(oldCh[i].el)
      }
    }
  }
}
