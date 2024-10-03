import { NodeType } from '../constants/index.js'

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g //匹配花括号 {{  }} 捕获花括号里面的内容

function gen(node) {
  if (node.type === NodeType.ELEMENT) {
    return generate(node)
  } else {
    let text = node.text

    // 纯文本
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`
    }

    // 这里需要置于 0, 因为全局正则式在上一步判断后其中的lastIndex 就指向了字符串的最后了
    let lastIndex = (defaultTagRE.lastIndex = 0)
    let tokens = []
    let match, index

    // 既处理了文本，又处理了变量
    while ((match = defaultTagRE.exec(text))) {
      // 找到一个 {{ (xxx) }} 的匹配
      index = match.index
      if (index > lastIndex) {
        // 放入非变量
        tokens.push(JSON.stringify(text.slice(lastIndex, index)))
      }
      // 模板中的变量名 - {{}} 中的内容
      // _s 表示处理变量
      tokens.push(`_s(${match[1].trim()})`)
      lastIndex = index + match[0].length
    }

    // 还有文本
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)))
    }

    // _v 表示处理文本
    return `_v(${tokens.join('+')})`
  }
}

function genProps(attrs) {
  let str = ''
  attrs.forEach((attr) => {
    if (attr.name === 'style') {
      let obj = {}
      attr.value.split(';').forEach((styleItem) => {
        let [key, value] = styleItem.split(':')
        obj[key.trim()] = value.trim()
      })
      attr.value = obj
    }
    str += `'${attr.name}':${JSON.stringify(attr.value)},`
  })
  return `{${str}}`
}

function getChildren(root) {
  const children = root.children
  if (Array.isArray(children) && children.length > 0) {
    return `${children.map((child) => gen(child)).join(',')}`
  }
}

export function generate(root) {
  const children = getChildren(root)
  let code = ''
  code += `_c('${root.tag}'${root.attrs.length > 0 ? `,${genProps(root.attrs)}` : ',undefined'}${
    children ? `,${children}` : `,''`
  })`
  return code
}
