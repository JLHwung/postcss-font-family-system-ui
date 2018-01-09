import postcss from 'postcss'
import valueParser from 'postcss-value-parser'

const fontFamilySystemUIList = [
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Roboto',
  'Oxygen',
  'Ubuntu',
  'Cantarell',
  'Fira Sans',
  'Droid Sans',
  'Helvetica Neue'
].join(', ');

const transformFontFamilySystemUI = node => {
  if (node.type === 'word' && node.value === 'system-ui') {
    node.value = fontFamilySystemUIList
  }
};

const transform = () => (decl) => {
  if (decl.type === 'decl') {
    if (decl.prop === 'font-family' || decl.prop === 'font') {
      const tree = valueParser(decl.value)
      tree.walk(transformFontFamilySystemUI)
      decl.value = tree.toString()
    }
  }
}

export default postcss.plugin('postcss-font-family-system-ui', () => {
  return (root) => {
    root.walk(transform())
  }
})
