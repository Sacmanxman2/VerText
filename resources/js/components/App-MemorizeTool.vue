<template>
  <div class="columns">
    <div class="column">
      <b-field>
        <b-input type="textarea" v-model="inputText"></b-input>
      </b-field>
    </div>
    <div class="column">
      <div class="card">
        <p class="card-content" v-html="outputText">
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MemorizeTool',
  data: () => {
    return {
      inputText: '',
      underlineMode: true
    }
  },

  computed: {
    outputText: function () {
      if (this.inputText) {
        var lines = this.inputText.split('\n')

        var linesArray = lines.map((line) => {
          if (this.underlineMode) {
            return this.joinFancy(line.replace(/[^\w\s]|_/g, function ($1) { return ' ' + $1 + ' ' }).replace(/[ ]+/g, ' ').split(' ').map((word) => {
              if (word.length > 1) {
                let wordStart = word.slice(0, 1)
                let wordEnd = this.repeatChar('_', word.length - 1)
                return wordStart + wordEnd
              } else {
                return word.split(0, 1)
              }
            }))
          } else {
            return line ? line.match(/\b\w/g).join(' ') : ''
          }
        })

        return linesArray.join('<br>')
      } else {
        return 'Type something!'
      }
    }
  },

  methods: {
    repeatChar (pattern, count) {
      if (count < 1) return ''
      var result = ''
      while (count > 1) {
        if (count & 1) result += pattern
        // eslint-disable-next-line
        count >>= 1, pattern += pattern
      }
      return result + pattern
    },

    joinFancy (arrayThing) {
      for (let i in arrayThing) {
        var prevThing = ''
        var thing = ''
        var nextThing = ''
        if (i > 1 && i == (arrayThing.length - 1)) {
          prevThing = arrayThing[i-1]
        } else if (i > 1 && i < (arrayThing.length - 1)) {
          prevThing = arrayThing[i-1]
          thing = arrayTHing[i]
          nextThing = arrayThing[i+1]
        } else {
          thing = arrayTHing[i]
          nextThing = arrayThing[i+1]
        }
      }
    }
  }
}
</script>
