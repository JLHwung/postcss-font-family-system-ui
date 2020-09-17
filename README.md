# postcss-font-family-system-ui [<img src="https://postcss.github.io/postcss/logo.svg" alt="PostCSS Logo" width="90" height="90" align="right">][postcss]

[![NPM Version][npm-img]][npm-url]
[![CSS Standard][css-img]][css-url]
[![Gitter Chat][git-img]][git-url]

[postcss-font-family-system-ui] lets you use `system-ui` in CSS, following the
[CSS Fonts Module Level 4] specification.

[!['Can I use' table](https://caniuse.bitsofco.de/image/font-family-system-ui.png)](https://caniuse.com/#feat=font-family-system-ui)

```css
body {
  font: 100%/1.5 system-ui;
}

/* becomes */

body {
  font: 100%/1.5 system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Ubuntu,
    Cantarell, Helvetica Neue;
}
```

## Usage

Add [postcss-font-family-system-ui] to your build tool:

```bash
npm install postcss postcss-font-family-system-ui --save-dev
```

#### Node

Use [postcss-font-family-system-ui] to process your CSS:

```js
import postcssSystemUiFont from "postcss-font-family-system-ui";

postcssSystemUiFont.process(YOUR_CSS);
```

#### PostCSS

Add [PostCSS] to your build tool:

```bash
npm install postcss --save-dev
```

Use [postcss-font-family-system-ui] as a plugin:

```js
import postcss from "gulp-postcss";
import postcssSystemUiFont from "postcss-font-family-system-ui";

postcss([postcssSystemUiFont(/* options */)]).process(YOUR_CSS);
```

#### Gulp

Add [Gulp PostCSS] to your build tool:

```bash
npm install gulp-postcss --save-dev
```

Use [postcss-font-family-system-ui] in your Gulpfile:

```js
import postcss from "gulp-postcss";
import postcssSystemUiFont from "postcss-font-family-system-ui";

gulp.task("css", () =>
  gulp
    .src("./src/*.css")
    .pipe(postcss([postcssSystemUiFont(/* options */)]))
    .pipe(gulp.dest("."))
);
```

#### Grunt

Add [Grunt PostCSS] to your build tool:

```bash
npm install grunt-postcss --save-dev
```

Use [postcss-font-family-system-ui] in your Gruntfile:

```js
import postcssSystemUiFont from "postcss-font-family-system-ui";

grunt.loadNpmTasks("grunt-postcss");

grunt.initConfig({
  postcss: {
    options: {
      use: [postcssSystemUiFont(/* options */)],
    },
    dist: {
      src: "*.css",
    },
  },
});
```

## Options

### family

The `family` option defines the fallback families used to polyfill `system-ui`.
It accepts an array or a comma-separated string.

```js
import postcssSystemUiFont from "postcss-font-family-system-ui";

postcssSystemUiFont({
  family: "system-ui, Segoe UI, Roboto, Helvetica Neue", // use less fallbacks
});
```

### browsers

Note: if `family` option is specified, the `browsers` option will not be activated.

The `browsers` option determines the supported browsers, which is used to tune levels of polyfill based on the [support matrix] of `system-ui` at caniuse.

[postcss-font-family-system-ui] supports any standard [browserslist] configuration, which includes a `.browserslistrc` file, a `browserslist` key in `package.json`, or `browserslist` environment variables.

The `browsers` option should only be used when a standard browserslist configuration is not available.

```js
postcssSystemUiFont({
  browsers: ["last 2 versions"],
});
```

If not valid browserslist configuration is specified, the [default browserslist query](https://github.com/browserslist/browserslist#queries) will be used.

### preserve

The `preserve: boolean` option controls whether `system-ui` should be preserved in the transformed CSS output.
It accepts only boolean and the default is `true`

```js
postcssSystemUiFont({
  preserve: true, // preserve `system-ui` in the transpiled output
});
```

Note that if your `browserslist` config targets to browsers which have native support of `system-ui`, this option will be a no-op.

```js
postcssSystemUiFont({
  browsers: ["Chrome 60"], // Chrome 60 has native system-ui support
  preserve: false, // the `system-ui` will still be preserved when it is not polyfilled
});
```

[css-img]: https://csstools.github.io/cssdb/badge/system-ui-font-family.svg
[css-url]: https://csstools.github.io/cssdb/#system-ui-font-family
[npm-img]: https://img.shields.io/npm/v/postcss-font-family-system-ui.svg
[npm-url]: https://www.npmjs.com/package/postcss-font-family-system-ui
[git-img]: https://img.shields.io/badge/support-chat-blue.svg
[git-url]: https://gitter.im/postcss/postcss
[css fonts module level 4]: https://drafts.csswg.org/css-fonts-4/#system-ui-def
[gulp postcss]: https://github.com/postcss/gulp-postcss
[grunt postcss]: https://github.com/nDmitry/grunt-postcss
[postcss-font-family-system-ui]: https://github.com/JLHwung/postcss-font-family-system-ui
[postcss]: https://github.com/postcss/postcss
[browserslist]: https://github.com/browserslist/browserslist#readme
[support matrix]: https://caniuse.com/#feat=font-family-system-ui
