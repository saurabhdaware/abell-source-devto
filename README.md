# abell-devto-source-plugin
EXPERIMENTAL dev.to source plugin for [Abell](https://abelljs.org)

## Usage

Don't really use this yet, it is nowhere close to stable and neither Abell is.

But here's a documentation if you want to play around it (Actually Don't)

```
npm install --save-dev abell-source-devto
```

```js
// In abell.config.js
module.exports = {
  plugins: ['abell-source-devto'],
  pluginConfig: {
    devUsername: 'saurabhdaware',
    articleCount: 4
  }
}
```