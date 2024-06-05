import child_process from 'child_process'
import { promisify } from 'util'

export const OutputFormats = {
    HTML: ['HTML', 'HTML'],
    XML: ['XML', 'XML'],
    OLDXML: ['OLDXML', 'XML'],
    JSON: ['JSON', 'JSON'],
    EBUCore: ['EBUCore','XML'],
    EBUCore_JSON: ['EBUCore_JSON','JSON'],
    PBCore: ['PBCore','XML'],
    PBCore2: ['PBCore2','XML']
 } as const;

export type OutputFormatKeys = keyof typeof OutputFormats
export const MEDIAINFO_CMD = 'mediainfo'


interface NestedRecord { [k: string]: string | NestedRecord | NestedRecord[] };

// Standard Json
//TODO: does anyone maintain the types for mediainfo? - should we?
export interface MediaInfoJson {
  media: {
    track: Record<string, string>[];
  },
  creatingLibrary: Record<string, string>;
}

// EBUCoreJson
export type MediaInfoEbuCoreJson = Record<string, NestedRecord>;

export type MediaInfo =  | MediaInfoJson;


// xml and json types - type specifically
export const mediainfoVersion = async () : Promise<string> => {
  const execFile = promisify(child_process.execFile)

  const { stdout, stderr } = await execFile(MEDIAINFO_CMD, ['--version'])

  if (stderr) {
    console.error('exec stderr', stderr)
    throw new Error(stderr)
  }

  return stdout
}

export async function getMediainfo(file: string, outputFormatKey: OutputFormatKeys) : Promise<MediaInfo | string>{
    const [value, format] = OutputFormats[outputFormatKey]
	console.log('Getting MediaInfo for: ' + file)

	const execFile = promisify(child_process.execFile)

	const { stdout, stderr } = await execFile(MEDIAINFO_CMD, [`--Output=${value}`, file])

	if (stderr) {
		console.error('exec stderr', stderr)
        throw new Error(stderr)
    }

	if (format == 'JSON') {
		return JSON.parse(stdout) as MediaInfo
	}

	return stdout
}
