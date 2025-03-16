const axios = require('axios')

async function unsplashSearch(query) {
    try {
        const response = await axios.get(`https://unsplash.com/napi/search/photos`, {
            params: { query, per_page: 10 },
        })
        return response.data.results.map((rorr) => ({
            judul: rorr.alt_description,
            gambar: rorr.urls.regular,
            link: rorr.links.html,
        }))
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = unsplashSearch