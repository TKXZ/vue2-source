import { nextTick } from '../utils/next-tick.js'

let queue = []
let has = {}

function flushSchedulerQueue() {
  for (let index = 0; index < queue.length; ++index) {
    queue[index].run()
  }
  queue = []
  has = {}
}

export function queueWatcher(watcher) {
  const id = watcher.id
  // 不重复收集watcher, 保证一个循环周期更新完毕
  if (typeof has[id] === 'undefined') {
    queue.push(watcher)
    has[id] = true
    nextTick(flushSchedulerQueue)
  }
}
