/* eslint-disable no-unused-vars */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Buefy from 'buefy'
import Ads from 'vue-google-adsense'

import Default from './layouts/Default.vue'

Vue.use(Buefy)

Vue.use(require('vue-script2'))
Vue.use(Ads.Adsense)

Vue.component('default-layout', Default)

Vue.config.productionTip = false

const app = new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
