const external = Object.keys(require('./package.json').dependencies).concat('path')

export default {
  entry: 'src/index.js',
  external,
}
