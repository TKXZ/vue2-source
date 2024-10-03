import { initMixin } from './mixins/init.js'
import { lifeCycleMixin } from './mixins/life-cycle.js'
import { renderMixin } from './mixins/render.js'

class Vue {
  constructor(options) {
    this.$options = options
    this._init()
  }
}

renderMixin(Vue)
lifeCycleMixin(Vue)
initMixin(Vue)

export default Vue
