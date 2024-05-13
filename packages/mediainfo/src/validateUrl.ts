import url from 'url'

export const stringIsAValidUrl = (s: string, protocols: string[]) : boolean => {
    try {
        new url.URL(s)
        const parsed = url.parse(s)
        return protocols
            ? parsed.protocol
                ? protocols.map((x) => `${x.toLowerCase()}:`).includes(parsed.protocol)
                : false
            : true
    } catch (_err) {
        return false
    }
}