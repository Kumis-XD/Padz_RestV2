const axios = require('axios')

async function spotifySearch(query) {
    try {
        const { data } = await axios.get(`https://www.bhandarimilan.info.np/spotisearch?query=${query}`);
        const results = data.map(ft => ({
            nama: ft.name,
            artis: ft.artist,
            rilis: ft.release_date,
            durasi: ft.duration,
            link: ft.link,
            image: ft.image_url
        }))
        return results
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = spotifySearch