import { test } from 'tap'
import fs from 'fs'
import postcss from 'postcss'
import plugin from '../src'

function filename (name) { return `test/${name}.css` }
function read (name) { return fs.readFileSync(name, 'utf8') }

function compareFixtures (t, name, msg) {
  const postcssOpts = { from: filename(`fixtures/${name}`) }
  const actual = postcss().use(plugin()).process(read(postcssOpts.from), postcssOpts).css
  const expected = read(filename(`fixtures/${name}.expected`))
  fs.writeFileSync(filename(`fixtures/${name}.actual`), actual)
  t.equal(actual, expected, msg)
}

test('font-family-system-ui', function (t) {
  compareFixtures(t, 'font-family-system-ui', 'should transform font-family: system-ui')
  t.end()
})
