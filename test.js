import Vue from './vue.js'

const app = new Vue({
  el: '#app',
  data: () => ({
    count: { value: 1 },
    list: [1, 2],
  }),
})

export default app
