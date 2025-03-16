const fetch = require('node-fetch')

async function wikipediaSearch(teks) {
    try {
        const response = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=${teks}`
        )
        const data = await response.json()
        return data.query.search.map((item) => ({
            judul: item.title,
            desk: item.snippet.replace(/<\/?[^>]+(>|$)/g, ''),
            link: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
        }))
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = wikipediaSearch