'use strict'

import esp from 'espruino'
import eachSeries from 'async/eachSeries'

const log = console.log

/**
 * A small hack for silencing Espruino's output, disables/enables console.log().
 */
function quiet(on) {
  console.log = console.error = (on || on === undefined ? () => {} : log)
}

/**
 * Sends code to an Espruino device.
 */
function sendCode(port, code, done) {
  let currentLine = ''
  Espruino.Core.Serial.startListening(function(data) {
    data = String.fromCharCode.apply(null, new Uint8Array(data))
    currentLine += data
    while (~currentLine.indexOf('\n')) {
      let i = currentLine.indexOf('\n')
      log(currentLine.substr(0, i))
      currentLine = currentLine.substr(i+1)
    }
  })

  Espruino.Core.Serial.open(port, status => {
    if (!status) return done(`Could not connect to ${port}`)

    log(`Connected to ${port}`)

    Espruino.Core.CodeWriter.writeToEspruino(code, () => {
      setTimeout(() => Espruino.Core.Serial.close(), 500)
    })
  }, () => {
    setTimeout(() => done(), 500)
  })
}

/**
 * Ends the current process when done sending code (otherwise it will hang).
 */
function end(err) {
  if (err) log(err)
  process.exit(0)
}

export default function espruino(options = {}) {
  if (options.port && !Array.isArray(options.port)) {
    options.port = [options.port]
  }

  return {
    name: 'espruino',

    onwrite(bundle, rendered) {
      quiet((options.verbose === undefined && options.quiet) ||
            (options.verbose !== undefined && !options.verbose))

      esp.init(() => {
        Espruino.Config.STORE_LINE_NUMBERS = false
        Espruino.Config.RESET_BEFORE_SEND = (options.reset === undefined || !!options.reset)

        Espruino.Core.Serial.getPorts(ports => {
          if (options.port && options.port.length > 0) {
            eachSeries(options.port, (port, done) => {
              sendCode(port, rendered.code, done)
            }, end)
          }
          else if (ports && ports.length > 0) {
            const port = ports[0].path

            sendCode(port, rendered.code, end)
          }
          else {
            end('No devices found')
          }
        })
      })
    }
  }
}
