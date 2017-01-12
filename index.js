'use strict'

import esp from 'espruino'
import chalk from 'chalk'
import eachSeries from 'async/eachSeries'

const log = console.log
const info = (...args) => log(chalk.yellow('info'), ...args)
const error = (...args) => {
  log(chalk.red('error'), ...args)
  hasErrors = true
}

/**
 * A small hack for silencing Espruino's logging.
 *
 * Disables/enables console.log() and console.error().
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
    if (!status) {
      error('Could not connect to', chalk.bold(port))
      done()
    }

    info('Connected to ' + chalk.bold(port) + ', sending code...')

    Espruino.Core.CodeWriter.writeToEspruino(code, () => {
      setTimeout(() => Espruino.Core.Serial.close(), 500)
    })
  }, () => {
    setTimeout(() => done(), 500)
  })
}

/**
 * Exits the current process when done.
 *
 * Otherwise the process will hang. TODO: Fix that instead of doing this.
 */
function exit(err) {
  if (err || hasErrors) {
    if (err) log(chalk.red(err))
    process.exit(1)
  }
  else {
    process.exit(0)
  }
}

export default function espruino(options = {}) {
  if (options.port && !Array.isArray(options.port)) {
    options.port = [options.port]
  }

  return {
    name: 'espruino',

    onwrite(bundle, rendered) {
      quiet(!options.verbose)

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
          }
        })
      })
    }
  }
}
