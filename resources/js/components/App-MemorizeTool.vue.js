import processIt from '../mixins/processTheStrings'

export default {
  name: 'MemorizeTool',
  mixins: [processIt],
  data: () => {
    return {
      inputText: '',
      underlineMode: true,
      loadedText: false
    }
  },

  mounted () {
    if (typeof(window.localStorage) !== 'undefined') {
      this.inputText = localStorage.getItem('vertextappmini-text') ? localStorage.getItem('vertextappmini-text') : ''
      this.loadedText = true
    }
  },

  computed: {
    outputText: function () {
      if (typeof(window.localStorage) !== 'undefined' && this.loadedText) {
        localStorage.setItem('vertextappmini-text', this.inputText)
      }
      if (this.inputText) {
        let lines
        if (this.inputText.length > 5000) {
          lines = this.inputText.split('\n')
          return [
            `Yikes, that's a lot of text (${this.numbersWithCommas(this.inputText.length)} characters or ${this.numbersWithCommas(lines.length)} lines)! Try breaking it into smaller chunks.`
          ]
        }
        lines = this.inputText.split('\n')
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
