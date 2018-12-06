export default {
  name: 'processIt',
  methods: {
    process: function (inputstring) {
      let outputstring = ''
      let ISSplitted = inputstring.split('')
      let ISLength = ISSplitted.length
      for (let i = 0; i < ISLength; i++) {
        let currentISChar = ISSplitted[i]
        let nextISChar
        let prevISChar

        if (currentISChar === ' ') {
          outputstring += ' '
        } else if (i === 0 && (ISLength - 1) > 1) {
          outputstring += currentISChar
          nextISChar = ISSplitted[i + 1]
        } else if (i > 0 && (ISLength - 1) > i) {
          prevISChar = ISSplitted[i - 1]
          nextISChar = ISSplitted[i + 1]

          if (currentISChar.match(/[.?!;,]/)) {
            outputstring += currentISChar
          } else if (currentISChar.match(/['"]/)) {
            if (!prevISChar.match(/[.?!;'",\s]/) && !nextISChar.match(/[.?!;'",\s]/)) {
              outputstring += '_'
            } else {
              outputstring += currentISChar
            }
          } else {
            if (!prevISChar.match(/[.?!;\s]/)) {
              if (prevISChar.match(/['"]/)) {
                // First we'll need to check if we're far enough in to the string that we can go 2 back...
                if (i > 1) { // Ok, we can, so lets see if the char 2 items back is a letter.
                  let prev2ISChar = ISSplitted[i - 2]
                  if (!prev2ISChar.match(/[.?!;\s]/)) { // previous char is not one of our word separators, therefore it must be a letter and part of a word.
                    outputstring += '_'
                  } else {
                    outputstring += currentISChar
                  }
                } else {
                  outputstring += currentISChar
                }
              } else {
                outputstring += '_'
              }
            } else {
              outputstring += currentISChar
            }
          }
        } else {
          prevISChar = ISSplitted[i - 1]
          if (!currentISChar.match(/[.?!;"'\s]/)) {
            outputstring += '_'
          } else {
            outputstring += currentISChar
          }
        }
      }
      return outputstring
    },

    numbersWithCommas (x) {
      x = x.toString()
      const pattern = /(-?\d+)(\d{3})/
      while (pattern.test(x)) {
        x = x.replace(pattern, '$1,$2')
      }
      return x
    }
  }
}
