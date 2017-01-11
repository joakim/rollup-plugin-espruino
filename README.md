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

The plugin exits the process when done, so it must be the last plugin. It should
be compatible with most Rollup plugins, here are some that may be useful in an
Espruino project:

- [commonjs](https://github.com/rollup/rollup-plugin-commonjs) - adds support for [Espruino](https://www.espruino.com/Modules)/Node style modules (using `require()`)
- [uglify](https://github.com/TrySound/rollup-plugin-uglify) - ugly minification
- [cleanup](https://github.com/aMarCruz/rollup-plugin-cleanup) - pretty minification
- [eslint](https://github.com/TrySound/rollup-plugin-eslint) - lints your code
- [filesize](https://github.com/ritz078/rollup-plugin-filesize) - displays the size of the code sent to Espruino
- [coffee-script](https://github.com/lautis/rollup-plugin-coffee-script) - `.coffee` lovers can use Espruino too!

[More plugins here](https://github.com/rollup/rollup/wiki/Plugins)


# Install

Using NPM:

    npm install --save rollup-plugin-espruino

Using Yarn:

    yarn add rollup-plugin-espruino

Sending to Espruino devices (like Puck.js) over Bluetooth LE also requires the
[noble](https://github.com/sandeepmistry/noble) package.


# Use

Example configuration file (`rollup.config.js`):

```js
import espruino from 'rollup-plugin-espruino'

export default {
  entry: 'src/main.js',
  dest: 'dist/bundle.js',
  format: 'es',
  plugins: [
    espruino({
      port: 'aa:bb:cc:dd:ee', // or ['/dev/ttyX', 'aa:bb:cc:dd:ee']
    })
  ],
}
```

The above configuration would used by executing the command `rollup -c`. See
Rollup's documentation on its [CLI](https://github.com/rollup/rollup/wiki/Command-Line-Interface)
for more.

It is also possible to use Rollup's [JavaScript API](https://github.com/rollup/rollup/wiki/JavaScript-API).
If you do, you have to write the bundle to disk using `bundle.write()` for this
plugin to run.


# Options

### port

Specify port(s) or device address(es) to connect to. May be specified as a
string or an array of strings. Optional, defaults to the first port found.

### reset

Whether to reset the Espruino device before sending code. Optional, defaults to
`true`.

### verbose

Verbose output. Optional, defaults to `false`.


# License

MIT © Joakim Stai
