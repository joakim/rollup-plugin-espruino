'use strict'

import esp from 'espruino'
import chalk from 'chalk'
import defaults from 'lodash.defaults'
import forEach from 'lodash.forEach'
import eachSeries from 'async/eachSeries'

const defaultOptions = {
  port: undefined,
  output: false,
  verbose: false,
}

const optionAliases = {
  reset: 'RESET_BEFORE_SEND', // default: true
  save: 'SAVE_ON_SEND', // default: 0
  setTime: 'SET_TIME_ON_WRITE', // default: false
  BLE: 'BLUETOOTH_LOW_ENERGY', // default: true
  audio: 'SERIAL_AUDIO', // default: 0
  baudRate: 'BAUD_RATE', // default: 9600
  throttle: 'SERIAL_THROTTLE_SEND', // default: false
}

const errorTypes = [
  'Uncaught Error',
  'Uncaught InternalError',
  'Uncaught RangeError',
  'Uncaught ReferenceError',
  'Uncaught SyntaxError',
  'Uncaught TypeError',
  'Uncaught Warning',
]

let hasErrors = false

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
 * Sends code to an Espruino device over a serial port.
 */
function sendCode(port, code, done) {
  Espruino.Core.Serial.open(port, status => {
    if (!status) {
      error('Could not connect to', chalk.bold(port))
      done()
    }

    info('Connected to ' + chalk.bold(port) + ', sending code...')

    Espruino.callProcessor('transformForEspruino', code, transformed => {
      Espruino.Core.CodeWriter.writeToEspruino(transformed, () => {
        setTimeout(Espruino.Core.Serial.close, 500)
      })
    })
  }, () => setTimeout(done, 500))
}

/**
 * Starts listening to serial output, optionally outputting data to terminal.
 */
function startListening(output) {
  let buffer = ''

  Espruino.Core.Serial.startListening(data => {
    data = String.fromCharCode.apply(null, new Uint8Array(data))

    buffer += data
    while (~buffer.indexOf('\n')) {
      let i = buffer.indexOf('\n')
      let line = buffer.substr(0, i)

      if (output) {
        log(line)
      }
      else if (~line.indexOf('Uncaught')) {
        forEach(errorTypes, type => {
          if (~line.indexOf(type)) {
            error(line.slice(line.indexOf('Uncaught')))
          }
        })
      }

      buffer = buffer.substr(i + 1)
    }
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
  defaults(options, defaultOptions)

  // Ensure that the port option, if set, is an array
  if (options.port && !Array.isArray(options.port)) {
    options.port = [options.port]
  }

  return {
    name: 'espruino',

    onwrite(bundle, rendered) {
      quiet(!options.verbose)

      esp.init(() => {
        // Disable some Espruino features not relevant for this plugin
        Espruino.Config.set('ENV_ON_CONNECT', false)
        Espruino.Config.set('STORE_LINE_NUMBERS', false)

        // Set any Espruino options specified using aliases or uppercase keys
        forEach(options, (value, key) => {
          if (optionAliases[key]) {
            Espruino.Config.set(optionAliases[key], value)
          }
          else if (key === key.toUpperCase()) {
            Espruino.Config.set(key, value)
          }
        })

        if (options.port && options.port.length > 0) {
          eachSeries(options.port, (port, done) => {
            startListening(options.output)
            sendCode(port, rendered.code, done)
          }, exit)
        }
        else {
          Espruino.Core.Serial.getPorts(ports => {
            if (ports && ports.length > 0) {
              info('Found', chalk.bold(ports[0].type), 'device',
                   chalk.bold(ports[0].path),
                   '(' + ports[0].description + ')')
              startListening(options.output)
              sendCode(ports[0].path, rendered.code, exit)
            }
            else {
              exit('No devices found')
            }
          })
        }
      })
    }
  }
}
