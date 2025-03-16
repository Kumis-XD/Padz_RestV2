const axios = require('axios')
const cheerio = require('cheerio')

async function getTokenFB() {
    const { data: html } = await axios.get("https://fbdown.me/")
    const $ = cheerio.load(html)
    return $("#token").val()
}

async function fbdl(url) {
    try {
        const token = await getTokenFB()
        const formData = new FormData()
        formData.append("url", url)
        formData.append("token", token)

        const { data } = await axios.post(
            "https://fbdown.me/wp-json/aio-dl/video-data",
            formData,
            { headers: { ...formData.getHeaders() } }
        )

        return {
            title: data.title,
            thumbnail: data.thumbnail,
            videos: data.medias.map(v => ({
                url: v.url,
                quality: v.quality,
                size: v.formattedSize
            }))
        }
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = fbdl