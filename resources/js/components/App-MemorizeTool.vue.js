import processIt from '../mixins/processTheStrings'

export default {
  name: 'MemorizeTool',
  mixins: [processIt],
  data: () => {
    return {
      inputText: '',
      underlineMode: true
    }
  },

  computed: {
    outputText: function () {
      if (this.inputText) {
        if (this.inputText.length > 5000) {
          return [
            `Yikes, that's a lot of text (${this.numbersWithCommas(this.inputText.length)} characters)! Try breaking it into smaller chunks.`,
            "",
            "Alternatively, you could sign up and take advantage of our chunking feature!"
          ]
        }
        let lines = this.inputText.split('\n')
        let linesArray = lines.map((line) => {
          if (this.underlineMode) {
            return this.process(line)
          } else {
            return this.process(line).replace(/_/g,'')
          }
        })
        return linesArray
      } else {
        return ['']
      }
    },

    displayText: function () {
      let formatted = this.outputText.join('<br>')
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
    copyText () {
      let dummy = document.createElement('textarea')
      document.body.appendChild(dummy)
      dummy.value = this.formattedText
      dummy.select()
      document.execCommand('copy')
      document.body.removeChild(dummy)
    }
  }
}
