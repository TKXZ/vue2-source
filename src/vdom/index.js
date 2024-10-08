export class VNode {
  constructor(tag, data, key, children, text) {
    this.tag = tag
    this.data = data
    this.key = key
    this.children = children
    this.text = text
  }
}

export function createElement(tag, data, ...children) {
  const key = data.key
  return new VNode(tag, data, key, children)
}
export function createTextElement(text) {
  return new VNode(undefined, undefined, undefined, undefined, text)
}
