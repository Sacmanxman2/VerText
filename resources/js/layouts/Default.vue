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
import HeaderBar from '../components/Layout-HeaderBar.vue'
import FooterBar from '../components/Layout-FooterBar.vue'

export default {
  name: 'DefaultLayout',
  components: { FooterBar, HeaderBar }
}
</script>
