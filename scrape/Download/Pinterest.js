const axios = require('axios')
const cheerio = require('cheerio')

async function pinterest(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
        })
        const $ = cheerio.load(response.data)

        const title = $('meta[property="og:title"]').attr('content') || '-'
        const description = $('meta[name="description"]').attr('content') || '-'
        const uploaded = $('meta[property="og:updated_time"]').attr('content') || '-'

        const height = $('meta[property="og:image:height"]').attr('content') || '-'
        const width = $('meta[property="og:image:width"]').attr('content') || '-'
        const fullsource = $('meta[property="pinterestapp:pinboard"]').attr('content') || '-'
        const source = fullsource ? new URL(fullsource).hostname : '-'

        const { data } = await axios.get(url)
        const img = []
        const $$ = cheerio.load(data)
        $$('img').each((i, el) => {
            img.push($$(el).attr('src'))
        })

        return {
            title,
            description,
            uploaded,
            height,
            width,
            source,
            fullsource,
            url,
            img,
        }
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = pinterest