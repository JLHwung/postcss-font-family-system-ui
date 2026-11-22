## 6.0.0 (2026-11-22)

##### Behavior Changes

- `system-ui` fallbacks are inserted among the families already listed instead of replacing the stack: listed families keep their position and spelling, missing fallbacks go right after `system-ui` (before any generic family), and running the plugin again changes nothing (#587) (5a1924e9)
- `preserve: false` also removes `system-ui` from an explicit `family` list, which used to ignore it (#587) (5a1924e9)
- Firefox 43–91, KaiOS and Chrome 53–55, whose `system-ui` support is Mac-only, also get the generic fallbacks; Safari 9 also gets `-apple-system` (#587) (5a1924e9)
- the browserslist config is looked up for each CSS file, as Autoprefixer does, instead of once from the working directory, so CSS in a package with its own config uses that config (#587) (5a1924e9)

##### Bug Fixes

- polyfill browsers whose `system-ui` support is unknown in caniuse, such as Safari 9 (#585) (039452ea)
- treat special characters in `family` names literally, and quote names that aren't valid unquoted CSS (e.g. `M+ 1p`, `O'Reilly Sans`) while keeping `var()` (#587) (5a1924e9)
- keep the order of the `family` option around `system-ui`, add repeated names once, ignore an empty or falsy `family`, and reject non-string entries (#587) (5a1924e9)
- find the family in the `font` shorthand after any size or line height, such as `calc()`, `var()`, `700 large` or `12px / normal` (#587) (5a1924e9)
- leave `system-ui` alone inside quoted or multi-word family names, and in `@font-face` descriptors (#587) (5a1924e9)
- polyfill `system-ui` next to a comment, and keep line breaks and the author's comma spacing (#587) (5a1924e9)

##### Documentation Changes

- fix the PostCSS, Gulp and Grunt usage examples and the cssdb badge, and update CONTRIBUTING links (#585) (039452ea)
- describe how existing fallbacks, `preserve` with `family` and per-file browserslist configs are handled (#587) (5a1924e9)
- add a security policy (#586) (a2802d45)
- remove outdated Node.js usage (c3683b22)

##### Chores

- fix a duplicate test key that hid a test, and lint `lib/` (#585) (039452ea)
- remove stale Yarn config and the unused `ajv`, and update Yarn to 4.19.0 (#585) (039452ea)
- restore `@babel/eslint-parser` (#584) (fae7cbc9)
- drop `pre-commit` and disable dependency install scripts (#586) (a2802d45)
- adopt Renovate's recommended config, with automerge after a 3-day minimum release age (#585, #586) (a2802d45)
- **ci:**
  - update to Yarn 4 and current GitHub Actions, and test Node.js 20, 22 and 24 (#487) (d92eefcc)
  - run on pull requests, pin actions to commit SHAs, restrict permissions, and test Node.js 20–26 on Linux, Windows and macOS (#586) (a2802d45)
  - publish to npm from version tags with trusted publishing and provenance (#586) (a2802d45)
  - update actions/checkout to v7 (#525), actions/setup-node to v7 (#531), and the GitHub artifact actions (#498)
- **deps:**
  - update dependency browserslist to v4.28.7 [security] (#488)
  - update dependency caniuse-lite to v1.0.30001826 (#489, #494)
  - update babel monorepo to v8 (#476, #493, #501, #513, #517, #520, #524, #548, #575, #578)
  - update dependency @rollup/plugin-babel to v7 (#500)
  - update dependency rollup to v4.68.8, including a security update (#481, #490, #491, #492, #496, #497, #502, #503, #505, #508, #516, #518, #521, #522, #523, #526, #536, #539, #542, #543, #544, #546, #547, #549, #550, #551, #552, #554, #555, #556, #557, #558, #560, #561, #562, #563, #565, #566, #568, #570, #571, #572, #573, #574, #576, #577, #579, #581, #582, #583)
  - update dependency postcss to v8.5.33, including a security update (#477, #499, #506, #507, #510, #514, #515, #519, #527, #528, #529, #530, #532, #533, #534, #535, #537, #538, #540, #545, #553, #559, #564, #569, #580)
  - update dependency postcss-tape to v6.0.1 (446625e9)
  - update dependency eslint to v10 (#483, #484)
  - update dependency eslint-config-dev to v3 (#428)
  - update dependency ajv to v8.20.0 (#480, #495, #509), since removed
  - update dependency pre-commit to v2 (#512), since removed
  - update dependency yaspeller to v9 (6bbe5446), since removed

## 5.0.0 (2020-09-22)

##### Breaking Changes

- Support PostCSS 8 (#328) (e4a3d588)

##### Chores

- remove unmaintained echint (#333) (48906720)
- change artifact layout (#332) (eade9143)
- remove unused @rollup/plugin-json (491973b5)

### 4.3.0 (2020-07-05)

##### New Features

- `preserve: boolean` option support (#252, #284) (84be581b) (186632cf)

##### Chores

- **workflow** update GitHub workflow (#283) (5c396e4f)
- **deps:** update dependency eslint to v7.4.0 (#282) (367c74ae)

### 4.2.0 (2019-12-19)

##### Chores

- 100% ESM ready (fa7fdfcd)
- shrink code size from 6K to 4K (52c06a10)

#### 4.1.1 (2019-08-06)

##### Bug Fixes

- ignore browser when version does not exist in caniuse (#198) (6c592cbf)

### 4.1.0 (2018-08-25)

##### New Features

- **main:** polyfill system-ui in custom properties (783e6883)

#### 4.0.1 (2018-08-25)

## 4.0.0 (2018-08-25)

##### Breaking Changes

- **main:**

* Remove `Oxygen` in favor of `Noto Sans`, the default font in KDE Plasma 5.5
* Remove `Droid Sans` since Android < 4 is not supported
* Use default browserslist config to shrink polyfill font sets.

- **travis:** drop node 4 target (3acab0d1)

##### Chores

- **package:**
  - update rollup to version 0.64.0 (e3f3dc62)
  - update dev dependencies (35a8142e)
  - update rollup-plugin-babel to version 3.0.6 (b22ebc41)
  - update rollup to version 0.61.1 (9cff2612)
  - update rollup to version 0.58.1 (4d89147e)
  - update rollup to version 0.57.1 (aeb7a332)
  - update rollup to version 0.57.1 (75b5ef00)
  - update rollup to version 0.56.2 (2b5c850f)
  - update rollup to version 0.56.2 (2bdfabc6)
  - update rollup to version 0.55.0 (#43) (a2829d49)
  - update rollup to version 0.55.0 (5b49b377)

##### Documentation Changes

- **readme:** update css-url (5699543e)

##### New Features

- **package:** update postcss to 7.0.2 (62f67a52)

# Changes to postcss-font-family-system-ui

## 3.0.0 (2018-01-20)

##### Breaking Changes

- **main:** removes `Fira Sans` as Firefox OS is dead
  - if you relies on the 2.x behavior, you can use the newly introduced `family` option
  ```js
  postcssSystemUiFont({
    family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI','Roboto','Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue'
  })
  ```

##### Refactors

- **package:** es6 + rollup + babel - postcss-value-parser

##### New Features

- **main:** adds `family` option to specify polyfill font-family stack

#### 2.1.4 (2018-01-17)

##### Chores

- **package:** update @std/esm to version 0.19.5 (0723f986)

#### 2.1.3 (2018-01-13)

##### Chores

- **package:** update @std/esm to version 0.19.2 (dee84838)

#### 2.1.2 (2018-01-09)

##### Chores

- **package:** update @std/esm to version 0.19.1 (#35)

##### Refactors

- **main:** simplify value parsing (#36) (7d970e9c)

#### 2.1.1 (2017-11-20)

##### Bug Fixes

- **package:** add @std/esm to dependencies (15a32854)

### 2.1.0 (2017-11-20)

##### Chores

- **package:**
  - use @std/esm as module loader (1691c6d7)
    - `@std/esm` enable us to add an ES `module` build of the package
  - ignore test files in npm package (9dfa7921)
  - use yaspeller-ci for spell check (e49a3e83)
  - remove unused clean scripts (77b36b67)
  - remove package-lock in favor of yarn lockfile (e95bb29c)
  - update yarn.lock (795b879f)
  - update lockfile (452e89b2)
  - update yaspeller to version 4.0.0 (3dfe2fe2)
  - update tap to version 10.6.0 (0d3fa960)
  - update nyc to version 11.0.2 (344b6cf8)
  - add npm package lock (50dbe1dc)
  - upgrade dependencies (134e89fe)
  - update cross-env to version 5.0.0 (5d6b9884)
- **test:** use jest as test runner (#22) (f8d483c0)
- **travis:** add greenkeeper lockfile (26500e85)

##### Documentation Changes

- **readme:**
  - reveal master branch build status (cbc3c5a1)
  - update CSS Fonts Module Level 4 draft link (ef8c1d02)

#### 2.0.1 (2017-5-8)

##### Chores

- **babelrc:** drops node 0.12 support (f1c88a74)

## 2.0.0 (2017-5-8)

##### Chores

- **package:**
  - update nyc to latest version (32b6c515)
  - upgrade dependencies (5a6924da)
  - update standard to version 10.0.0 (f9e3996d)
  - update cross-env to version 4.0.0 (7c079fc9)
  - update babel-preset-env to version 1.3.2 (0d398ac1)
  - update babel-plugin-istanbul to version 4.0.0 (f24a2407)
  - update standard to version 9.0.0 (7803b7e5)
  - update cross-env to version 3.2.3 (ed6a6017)

##### Documentation Changes

- **readme:**
  - add version table (b7ba613b)
  - minor adjustment on install process and snippet code styles (d20ffa05)

##### Bug Fixes

- **package:** update postcss to version 6.0.1 (460f7fd1)

##### Tests

- **index:** fix test title (63b21796)

#### 1.0.2 (2017-2-6)

##### Chores

- **package:**
  - update postcss to version 5.2.12 (22a4c13b)
  - remove unused babel-preset-babili (419a2207)
  - add babel-register to devDependencies (4fd6756e)
  - add keywords (ceb3ee60)

##### Refactors

- **main:** declare tree locally (569c552f)

#### 1.0.1 (2017-2-2)

##### Documentation Changes

- **readme:**
  - add missing semicolon to sample (7caa4897)
  - add Greenkeeper badge (a45179e3)
  - add badges (f8d2be69)

##### Tests

- **yaspeller:** ignore CHANGELOG.md (533a37a3)
- **travis:** drop node_js 0.12 in support matrix (b71e98cb)

## 1.0.0 (2017-2-2)

##### New Features

- **readme:** add basic readme (17b4eb5b)
- **main:** initial release (1c75288b)
