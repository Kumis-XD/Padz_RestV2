const axios = require('axios')

async function mediafire(url) {
    try {
        const { data: text } = await axios.get('https://r.jina.ai/' + url)

        const result = {
            title: (text.match(/Title: (.+)/) || [])[1]?.trim() || '',
            filename: '',
            extension: '',
            size: '',
            download: '',
            repair: '',
            url: (text.match(/URL Source: (.+)/) || [])[1]?.trim() || ''
        }

        const matches = [...text.matchAll(/\[(.*?)\]\((https:\/\/[^\s]+)\)/g)]
        for (const match of matches) {
            const desc = match[1].trim()
            const link = match[2].trim()

            if (desc.toLowerCase().includes('download') && desc.match(/\((\d+(\.\d+)?[KMGT]B)\)/)) {
                result.url = link
                result.size = (desc.match(/\((\d+(\.\d+)?[KMG]?B)\)/) || [])[1] || ''
            }
            if (desc.toLowerCase().includes('repair')) {
                result.repair = link
            }
        }

        if (result.url) {
            const decodedUrl = decodeURIComponent(result.url)
            const fileMatch = decodedUrl.match(/\/([^\/]+\.[a-zA-Z0-9]+)(?:\?|$)/)
            if (fileMatch) {
                result.filename = fileMatch[1]
                result.extension = result.filename.split('.').pop().toLowerCase()
            }
        }

        return result
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = mediafire