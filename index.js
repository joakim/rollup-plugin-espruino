'use strict'

const esp = require('espruino')

const consoleLog = global.console.log

/**
 * A small hack for silencing Espruino's output, disables/enables console.log().
 */
function quiet(on) {
  global.console.log = (on || on === undefined ? () => {} : consoleLog)
}

export default function espruino(options = {}) {
  return {
    name: 'espruino',

    onwrite(bundle, out) {
      quiet(options.quiet)

      esp.init(() => {
        Espruino.Config.STORE_LINE_NUMBERS = false
        Espruino.Config.RESET_BEFORE_SEND = (options.reset === undefined || !!options.reset)
        Espruino.Config.SAVE_ON_SEND = !!options.save

        Espruino.Core.Serial.startListening((data) => {})

        Espruino.Core.Serial.open(options.port, (status) => {
          if (status === undefined) return

          Espruino.Core.CodeWriter.writeToEspruino(out.code, () => {
            setTimeout(() => Espruino.Core.Serial.close(), 500)
          })
        }, () => console.info('Disconnected'))

        quiet(false)
      })
    }
  }
}
