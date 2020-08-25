import path from 'path'
import { readFile } from 'fs-extra'
import { parseSrcInfo } from '@khai96x/srcinfo'

function loadAsset(basename: string) {
  const filename = path.resolve(__dirname, 'assets', basename)
  return readFile(filename, 'utf8')
}

it('valid', async () => {
  expect(parseSrcInfo(await loadAsset('valid.SRCINFO'))).toMatchSnapshot()
})

it('invalid', async () => {
  expect(parseSrcInfo(await loadAsset('invalid.SRCINFO'))).toMatchSnapshot()
})
