import { parse } from '../ast/template.js'
import { generate } from '../generate/index.js'

export function compilerToFunction(template) {
  // 1. 通过template 模板解析出AST
  const ast = parse(template)
  // 2. 通过 AST 解析出对应的render 函数体 类似 '_c('div', { 'id': 'app'}, _c('span', '', 'abc'))'
  const code = generate(ast)
  // 3. 生成渲染函数
  const render = new Function(`with(this){return ${code}}`)

  return render
}
