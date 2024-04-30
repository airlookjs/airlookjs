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
const cmd = 'mediainfo'

type MediaInfo = object/*{
    version: string
    media: {
        track: {
            [key: string]: string
        }[]
    }[]
}*/

export async function getMediainfo(file: string, outputFormatKey: OutputFormatKeys) {

    const [value, format] = OutputFormats[outputFormatKey]
	console.log('Getting MediaInfo for: ' + file)

	const execFile = promisify(child_process.execFile)

	const { stdout, stderr } = await execFile(cmd, [`--Output=${value}`, file])

	if (stderr) {
		console.error('exec stderr', stderr)
        throw new Error(stderr)
    }

	if (format == 'JSON') {
		return JSON.parse(stdout) as MediaInfo
	}
	return stdout
	
}
