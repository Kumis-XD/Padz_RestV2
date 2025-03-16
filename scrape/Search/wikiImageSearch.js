const axios = require('axios')

async function wikiImageSearch(teks) {
    try {
        const response = await axios.get('https://en.wikipedia.org/w/api.php', {
            params: {
                action: 'query',
                format: 'json',
                generator: 'search',
                gsrsearch: teks,
                prop: 'pageimages',
                piprop: 'original',
                pilimit: 'max',
            },
        })

        const halaman = response.data.query.pages
        return Object.values(halaman).map((page) => ({
            title: page.title,
            image: page.original ? page.original.source : null,
        }))
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = wikiImageSearch