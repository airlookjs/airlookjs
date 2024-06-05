import fs from 'node:fs'

export const readCached = <T>(path: string) : T => {
  return JSON.parse(fs.readFileSync(path, 'utf8')) as T
}

export const writeCached = <T>(path: string, data: T) : void => {
  fs.writeFileSync(path, JSON.stringify(data, null, 2))
}
