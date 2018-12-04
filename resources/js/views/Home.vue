<template>
  <div>
    <section class="section content">
      <p>
        Looking to memorize some verbatim text? One of the best methods for memorizing anything is to practice recalling it, instead of just repeating it. This app helps you do that by showing you just the first letter of each word. That narrows the options and gives you some structure for your brain to try and remember, without just giving you the answers. Simply copy and paste some text in the box below and hit "memorize"!
      </p>
      <p>
        Sign up if you're interested in saving your text blurbs, and to take advantage of future features, which will include things like:
        <ul>
          <li>A spaced-repetition-system style utility to ensure you ALWAYS remember what you're trying to remember</li>
          <li>More tools to help you memorize, like fill in the blanks and chunking (for longer bits of text)</li>
          <li>Track your progress and view stats</li>
          <li>Easily post updates to social media about what you've been learning</li>
        </ul>
      </p>
    </section>
    <memorize-tool></memorize-tool>
  </div>
</template>

<script>
import MemorizeTool from '../components/App-MemorizeTool.vue'

export default {
  name: 'App',
  components: { MemorizeTool }
}
</script>

<style>
</style>
