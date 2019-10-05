import yaml from 'js-yaml'
import * as json from 'just-json-type'
import { dbg } from 'string-template-format-inspect'

export type Value = json.ReadonlyJsonValue
export interface Dict extends json.ReadonlyJsonObject<Value> {}

export function createFileSystem (dict: Dict) {
  const texts = new Map(
    Object
      .entries(dict)
      .map(([key, value]) => [key, json.dump(value, undefined, 2) + '\n'])
  )

  const snapshot = () => new Map(texts)
  const snapshotObject = () => Object.fromEntries(texts)

  function snapshotYaml (object = snapshotObject()) {
    const yamlText = yaml.dump(object)
    return '\n' + yamlText + '\n'
  }

  const readFile = jest.fn((filename: string) => {
    const content = texts.get(filename)
    if (!content) throw new Error(dbg`File does not exist: ${filename}`)
    return content
  })

  const writeFile = jest.fn((filename: string, content: string) => {
    texts.set(filename, content)
  })

  return { snapshot, snapshotObject, snapshotYaml, readFile, writeFile }
}

export default createFileSystem
