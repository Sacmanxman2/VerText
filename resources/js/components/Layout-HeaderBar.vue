<template>
  <div class="hero is-dark vheader">
    <Navbar></Navbar>
    <div class="hero-body has-text-centered">
      <h1 class="title is-1">VerText</h1>
      <h2 class="subtitle">The tool to memorize any text...<span class="is-italic">Verbatim</span></h2>
    </div>
  </div>
</template>

<script>
import Navbar from './Layout-Navbar'

export default {
  name: 'Header',
  components: { Navbar }
}
</script>

<style lang="scss">
@import '../../sass/app.scss';

.title, .subtitle, .navbar-item {
  text-shadow: 0 0 1em black;
}
</style>
