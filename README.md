# postcss-font-family-system-ui
> [PostCSS](https://github.com/postcss/postcss) plugin to transform W3C CSS generic font-family [system-ui](https://drafts.csswg.org/css-fonts-4/#valdef-font-family-system-ui) to a practical font-family list

## Installation
```bash
yarn add postcss-font-family-system-ui
```

## Usage
```js
// dependencies
import postcss from 'postcss'
import fontFamilySystemUI from 'postcss-font-family-system-ui'

// css to be processed
const css = fs.readFileSync("input.css", "utf8")

// process css using postcss-font-family-system-ui
const out = postcss()
  .use(fontFamilySystemUI())
  .process(css)
  .css
```

Using this `input.css`:

```css
body {
  font-family: system-ui;
}

```

you will get:

```css
body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue
}
```

Checkout [tests](test) for examples.

## FAQ

### Can I use `require('postcss-font-family-system-ui')`?
Yes
