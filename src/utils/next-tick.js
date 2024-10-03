let callbacks = []
let pending = false

function flushCallbacks() {
  pending = false

  for (let i = 0; i < callbacks.length; ++i) {
    callbacks[i]()
  }
  callbacks = []
}

let timerFunc = null

// 微服务优先的方式调用callbacks, 采用优雅降级的策略
if (typeof Promise !== 'undefined') {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
  }
} else if (typeof MutationObserver !== 'undefined') {
  let count = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(count))
  observer.observe(textNode, {
    characterData: true,
  })
  timerFunc = () => {
    count = (count + 1) % 2 // 0 1 来回变化
    textNode.data = String(count)
  }
} else if (typeof setImmediate !== 'undefined') {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

export function nextTick(cb) {
  callbacks.push(cb)
  if (!pending) {
    pending = true
    timerFunc()
  }
}
