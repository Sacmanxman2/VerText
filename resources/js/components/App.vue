<template>
  <div>
    <div class="field">
      <div class="control">
        <input class="input is-primary is-rounded" placeholder="Type something" type="text" v-model="output">
      </div>
    </div>
    <p>
      {{ outputChanged }}
    </p>
    <p class="is-italic">Not every form has a submit button :P</p>
  </div>
</template>

<script>
export default {
  name: 'App',
  data: () => {
    return {
      output: ''
    }
  },
  computed: {
    outputChanged: function () {
      return this.output.split('').reverse().join('')
    }
  }

}
</script>
