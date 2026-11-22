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

Only fallbacks that are missing are added, so a hand-written stack, or CSS the
plugin already processed, keeps the families it lists in place. Missing
fallbacks are inserted right after `system-ui`, or after the listed fallbacks
that come before them:

```css
body {
  font-family: system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* becomes */

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Noto Sans, Ubuntu, Cantarell, Helvetica Neue, sans-serif;
}
```

`font-family` descriptors in `@font-face` rules are left alone, as they take a
single family name.

## Usage

Add [postcss-font-family-system-ui] to your build tool:

```bash
npm install postcss postcss-font-family-system-ui --save-dev
```

#### PostCSS

Use [postcss-font-family-system-ui] as a plugin:

```js
import postcss from "postcss";
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
import gulp from "gulp";
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
npm install @lodder/grunt-postcss --save-dev
```

Use [postcss-font-family-system-ui] in your Gruntfile:

```js
const postcssSystemUiFont = require("postcss-font-family-system-ui");

module.exports = (grunt) => {
  grunt.loadNpmTasks("@lodder/grunt-postcss");

  grunt.initConfig({
    postcss: {
      options: {
        processors: [postcssSystemUiFont(/* options */)],
      },
      dist: {
        src: "*.css",
      },
    },
  });
};
```

## Options

### family

The `family` option defines the fallback families used to polyfill `system-ui`.
It accepts a comma-separated string or an array of them. An empty or falsy
value is ignored, as if the option was not set.

```js
import postcssSystemUiFont from "postcss-font-family-system-ui";

postcssSystemUiFont({
  family: "system-ui, Segoe UI, Roboto, Helvetica Neue", // use less fallbacks
});
```

### browsers

Note: if a non-empty `family` option is specified, the `browsers` option and the browserslist configuration are not used.

The `browsers` option determines the supported browsers, which is used to tune levels of polyfill based on the [support matrix] of `system-ui` at caniuse. Browsers that support `system-ui` only on macOS, through `-apple-system` (Firefox 43–91) or `BlinkMacSystemFont` (Chrome 53–55), also get the generic fallbacks for other platforms.

[postcss-font-family-system-ui] supports any standard [browserslist] configuration, which includes a `.browserslistrc` file, a `browserslist` key in `package.json`, or `browserslist` environment variables. The configuration is looked up from the location of each CSS file (the PostCSS `from` option), or from the current working directory when `from` is not set. As with Autoprefixer, CSS from a package with its own `browserslist` configuration, for example in `node_modules`, uses that package's configuration; set the `browsers` option to use the same browsers for every file.

The `browsers` option should only be used when a standard browserslist configuration is not available.

```js
postcssSystemUiFont({
  browsers: ["last 2 versions"],
});
```

If not valid browserslist configuration is specified, the [default browserslist query](https://github.com/browserslist/browserslist#queries) will be used.

### preserve

The `preserve: boolean` option controls whether `system-ui` should be preserved in the transformed CSS output.
It accepts only boolean and the default is `true`. With the `family` option,
`preserve: false` removes `system-ui` from that list, unless it is the only
name.

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

[css-img]: https://cssdb.org/images/badges/system-ui-font-family.svg
[css-url]: https://cssdb.org/#system-ui-font-family
[npm-img]: https://img.shields.io/npm/v/postcss-font-family-system-ui.svg
[npm-url]: https://www.npmjs.com/package/postcss-font-family-system-ui
[git-img]: https://img.shields.io/badge/support-chat-blue.svg
[git-url]: https://gitter.im/postcss/postcss
[css fonts module level 4]: https://drafts.csswg.org/css-fonts-4/#system-ui-def
[gulp postcss]: https://github.com/postcss/gulp-postcss
[grunt postcss]: https://github.com/C-Lodder/grunt-postcss
[postcss-font-family-system-ui]: https://github.com/JLHwung/postcss-font-family-system-ui
[postcss]: https://github.com/postcss/postcss
[browserslist]: https://github.com/browserslist/browserslist#readme
[support matrix]: https://caniuse.com/#feat=font-family-system-ui
