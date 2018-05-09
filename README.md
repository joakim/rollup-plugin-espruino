# rollup-plugin-espruino

[Rollup](https://github.com/rollup/rollup) plugin for sending bundled code to an
[Espruino](http://www.espruino.com) device.

Rollup produces very lean code from modules, with treeshaking and no overhead if
using `es` as the output format. Perfect for Espruino.

With this plugin, bundled code will be sent to one or more Espruino devices
after the dest file has been written to disk. That means it requires the use of
`bundle.write()` if running Rollup from JavaScript, or `dest` if using a
configuration file. Having the file also written to disk is a good thing, as you
can see exactly what was sent to Espruino.

Any uncaught errors in the code sent to Espruino will be shown in the terminal,
to help with debugging.

The plugin exits the process when done, so it must be the last plugin. It should
be compatible with most other Rollup plugins, here are some that may be useful
in an Espruino project:

- [commonjs](https://github.com/rollup/rollup-plugin-commonjs) - adds support for [Espruino](https://www.espruino.com/Modules)/Node style modules (using `require()`)
- [uglify](https://github.com/TrySound/rollup-plugin-uglify) - ugly minification
- [cleanup](https://github.com/aMarCruz/rollup-plugin-cleanup) - pretty minification
- [eslint](https://github.com/TrySound/rollup-plugin-eslint) - lints your code
- [filesize](https://github.com/ritz078/rollup-plugin-filesize) - displays the size of the code sent to Espruino
- [coffee-script](https://github.com/lautis/rollup-plugin-coffee-script) - `.coffee` lovers can use Espruino too!

[More plugins here](https://github.com/rollup/rollup/wiki/Plugins)


# Install

Using NPM:

    npm install rollup-plugin-espruino --save

Using Yarn:

    yarn add rollup-plugin-espruino

Sending to Espruino devices (like Puck.js) over Bluetooth LE also requires the
[noble](https://github.com/sandeepmistry/noble) package.


# Use

Example configuration file (`rollup.config.js`):

```js
import espruino from 'rollup-plugin-espruino'

export default {
  input: 'src/main.js',
  output: {
    file:   'dist/bundle.js',
    format: 'es',
  },
  plugins: [
    espruino({
      port: 'aa:bb:cc:dd:ee', // or ['/dev/ttyX', 'aa:bb:cc:dd:ee']
      setTime: true,
      save: true,
    }),
  ],
}
```

Make sure the `espruino` plugin is the last.

The above configuration file would run by executing the command `rollup -c` from
the same directory.

It is also possible to use Rollup's [JavaScript API](https://github.com/rollup/rollup/wiki/JavaScript-API).
If you do, you'll have to write the bundle to disk using `bundle.write()` for
this plugin to run.


# Options

All options are optional.

### port

Specify port(s) or device address(es) to connect to. May either be a string or
an array of strings.

Defaults to searching for ports and picking the first found.

### reset

Reset the Espruino device before sending code.

Boolean, defaults to `true`.

### save

Save the code on the Espruino device after sending.

Boolean, defaults to `false`.

### setTime

Set Espruino's clock to the current time when sending code.

Boolean, defaults to `false`.

### BLE

Connect to Espruino devices over Bluetooth LE (requires the [noble](https://www.npmjs.com/package/noble)
package to be installed alongside this plugin).

Boolean, defaults to `true`.

### audio

Connect to Espruino devices over the [headphone jack](http://www.espruino.com/Headphone).

Possible values:

- `0` - Disabled
- `PP` - Normal Signal Polarity
- `NN` - Fully Inverted
- `NP` - Input Inverted
- `PN` - Output Inverted

Defaults to `0` (disabled).

### baudRate

The baud rate that is used when connecting to Espruino devices over serial.

Number, defaults to `9600`, which is the default for Espruino.

### throttle

Throttle code when sending to Espruino. If you are experiencing lost characters
when sending code, this may help.

Boolean, defaults to `false`.

### output

Show output from Espruino while sending code.

Boolean, defaults to `false`.

### verbose

Show verbose output from the underlying `espruino` package. Not pretty, but
sometimes useful.

Boolean, defaults to `false`.


# Tips

## Minification

Using `rollup-plugin-uglify` with ES modules is a little tricky, but
[this forum post](http://forum.espruino.com/comments/13410194/) shows you how.

To achieve maximum minification, enable the `toplevel` mangle option like so:

```js
  ...
  plugins: [
    uglify({
      mangle: {
        toplevel: true,
      },
    }, minify),
    espruino(),
  ],
  ...
```

## Espruino modules

To use [Espruino's modules](http://www.espruino.com/Modules), you have to first
download them to your project's directory and import them as local files.

Hopefully this can be made as easy as in Espruino's Web IDE some day, where
modules are automatically downloaded when `require()`d in code.


# License

MIT © Joakim Stai
