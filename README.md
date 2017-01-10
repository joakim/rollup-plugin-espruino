# rollup-plugin-espruino (WIP)


[Rollup](https://github.com/rollup/rollup) plugin for sending bundled code to an
[Espruino](http://www.espruino.com) device.

Produces very small code from modules, with treeshaking and no overhead when
using the `es` module format.

Bundled code is sent to the Espruino device after the file has been written to
disk (on `bundle.write()` or if using `dest` in a configuration file). Expects
only one bundle.

Minification is recommended, which can be done with the [Uglify](https://github.com/TrySound/rollup-plugin-uglify)
plugin. See also [this list](https://github.com/rollup/rollup/wiki/Plugins) for
more Rollup plugins.


# Install

Using [NPM](https://docs.npmjs.com/getting-started/installing-npm-packages-locally)
or [Yarn](https://yarnpkg.com/en/docs/managing-dependencies#toc-adding-a-dependency),
install the package `rollup-plugin-espruino`.

Sending to Espruino devices over Bluetooth LE also requires the `noble` package.


# Usage

```js
import espruino from 'rollup-plugin-espruino'

export default {
  entry: 'src/main.js',
  dest: 'dist/bundle.js',
  format: 'es',
  plugins: [
    espruino({
      port: 'aa:bb:cc:dd:ee',
      save: true,
    })
  ],
}
```

The above example configuration would used by Rollup's CLI command `rollup -c`
if named `rollup.config.js`. See Rollup's documentation on its
[CLI](https://github.com/rollup/rollup/wiki/Command-Line-Interface) and
[JavaScript API](https://github.com/rollup/rollup/wiki/JavaScript-API) for more.


# Options

### port

Specify port or device address to connect to. Required.

### save

Whether to save the code on the Espruino device after sending. Optional,
defaults to `false`.

### reset

Whether to reset the Espruino device before sending. Optional, defaults to
`true`.

### quiet

Silence Espruino's output. Optional, defaults to `true`.


# License

MIT © Joakim Stai
