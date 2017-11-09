/* eslint-env jest */
import fs from 'fs'
import postcss from 'postcss'
import plugin from '../src'

function filename (name) { return `test/${name}.css` }
function read (name) { return fs.readFileSync(name, 'utf8') }

describe('font-family-system-ui', function () {
  it('should transform font-family: system-ui', (done) => {
    const name = 'font-family-system-ui'
    const postcssOpts = { from: filename(`fixtures/${name}`) }
    const actual = postcss().use(plugin()).process(read(postcssOpts.from), postcssOpts).css
    const expected = read(filename(`fixtures/${name}.expected`))
    fs.writeFile(filename(`fixtures/${name}.actual`), actual, done)
    expect(actual).toEqual(expected)
  })
})
