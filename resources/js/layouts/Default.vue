<template>
  <div>
    <header-bar></header-bar>
    <div class="container">
      <slot />
    </div>
    <footer-bar></footer-bar>
  </div>
</template>

<script>
import FooterBar from '../components/Layout-FooterBar.vue'
import HeaderBar from '../components/Layout-HeaderBar.vue'

export default {
  name: 'DefaultLayout',
  components: { FooterBar, HeaderBar }
}
</script>
