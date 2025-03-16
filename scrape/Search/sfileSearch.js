const cheerio = require('cheerio')
const fetch = require('node-fetch')

async function sfileSearch(query) {
    try {
        const response = await fetch(`https://sfile.mobi/search.php?q=${encodeURIComponent(query)}&search=Search`)
        const html = await response.text()
        const $ = cheerio.load(html)

        const result = $('div.w3-card.white > div.list').map((_, el) => {
            const anchor = $(el).find('a')
            const name = anchor.text()
            const link = anchor.attr('href')
            const sizeText = $(el).text().split('(')[1]
            const size = sizeText ? sizeText.split(')')[0] : 'Unknown'

            return { name, size, link }
        }).get()

        return result
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = sfileSearch