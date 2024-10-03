import { NodeType } from '../constants/index.js'

const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` //匹配标签名 形如 abc-123
const qnameCapture = `((?:${ncname}\\:)?${ncname})` //匹配特殊标签 形如 abc:234 前面的abc:可有可无
const startTagOpen = new RegExp(`^<${qnameCapture}`) // 匹配标签开始 形如 <abc-123 捕获里面的标签名
const startTagClose = /^\s*(\/?)>/ // 匹配标签结束  > />
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`) // 匹配标签结尾 如 </abc-123> 捕获里面的标签名
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性  形如 id="app"

let root = null,
  currentParent = null
let stack = []

// AST 元素
function createASTElement(tagName, attrs = []) {
  return {
    tag: tagName,
    type: NodeType.ELEMENT,
    children: [],
    attrs,
    parent: null,
  }
}

function handleStartTag({ tagName, attrs = [] }) {
  let element = createASTElement(tagName, attrs)
  // 设置该组件根标签
  if (!root) {
    root = element
  }
  currentParent = element
  stack.push(element)
}

function handleEndTag(tagName) {
  // 弹出最后一项，即当前最新未闭合标签
  const element = stack.pop()
  // 当前栈中最后一项就是父级未闭合标签了, 因为其他子标签已被pop 出去了
  const currentParent = stack[stack.length - 1]

  if (currentParent) {
    element.parent = currentParent
    currentParent.children.push(element)
  }
}

function handleChars(text) {
  text = text.replace(/\s+/g, '')
  if (text) {
    currentParent.children.push({
      type: NodeType.TEXT,
      text,
    })
  }
}

// 解析template 模板字符串到AST
export function parse(template) {
  while (template) {
    let textEnd = template.indexOf('<')
    // 一开始就是标签
    if (textEnd === 0) {
      const startTagMatch = parseStartTag()
      // 是开始标签 <
      if (startTagMatch) {
        handleStartTag(startTagMatch)
        continue
      }

      // 是结束
      const endTagMatch = template.match(endTag)
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        handleEndTag(endTagMatch[1])
        continue
      }
    }

    // 处理标签区间的文本
    let text
    if (textEnd > 0) {
      text = template.substring(0, textEnd)
    }
    if (text) {
      advance(text.length)
      handleChars(text)
    }
  }

  function parseStartTag() {
    const start = template.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1], // 标签名
        attrs: [],
      }
      advance(start[0].length)

      let end, attr
      while (!(end = template.match(startTagClose)) && (attr = template.match(attribute))) {
        // 没有匹配到标签结束符号，但是匹配到了属性
        advance(attr[0].length)
        attr = {
          name: attr[1],
          value: attr[3] || attr[4] || attr[5],
        }
        match.attrs.push(attr)
      }

      // 没属性了 匹配到了 >
      if (end) {
        advance(end[0].length)
        return match
      }
    }
  }

  // 分割已解析模板字符串
  function advance(length) {
    template = template.substring(length)
  }

  return root
}
