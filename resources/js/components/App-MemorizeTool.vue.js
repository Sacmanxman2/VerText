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
            return this.joinFancy(line.replace(/[^\w\s]|_/g, function ($1) { return ' ' + $1 + ' ' }).replace(/[ ]+/g, ' ').split(' ').map((word) => {
              if (word.length > 1 && this.underlineMode) {
                let wordStart = word.slice(0, 1)
                let wordEnd = this.repeatChar('_', word.length - 1)
                return wordStart + wordEnd
              } else {
                return word.slice(0, 1)
              }
            }))
        })
        return linesArray
      } else {
        return ['']
      }
    },

    displayText: function () {
      var formatted = this.outputText.join('<br>')
      if (formatted !== '') {
        return formatted
      } else {
        return 'Type Something!<br><--'
      }
    },

    formattedText: function () {
      return this.outputText.join('\n')
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
      var outputString = ''
      arrayThing.forEach((thing, i) => {
        // put a space after UNLESS the next item is a punctuation mark
        if (i === (arrayThing.length - 1)) {
          // It's the last item, so we can't check the next thing
          outputString += thing
        } else {
          var nextThing = arrayThing[i+1].slice(0,1)
          if (nextThing.match(/[?!.,]/)) {
            outputString += thing
          } else {
            outputString += thing + ' '
          }
        }
      })
      return outputString
    },

    copyText () {
      var dummy = document.createElement('textarea')
      document.body.appendChild(dummy)
      dummy.value = this.formattedText
      dummy.select()
      document.execCommand('copy')
      document.body.removeChild(dummy)
    }
  }
}
