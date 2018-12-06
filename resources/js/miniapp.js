/* eslint-disable no-unused-vars */
import Vue from 'vue'
import MemorizeTool from './components/App-MemorizeTool'
import Buefy from 'buefy'

Vue.use(Buefy)

Vue.config.productionTip = false

const miniapp = new Vue({
  el: '#miniapp',
  render: h => h(MemorizeTool)
})
