const axios = require('axios')
const cheerio = require('cheerio')

async function soundcloudSearch(search) {
    try {
        const { data } = await axios.get(`https://soundcloud.com/search?q=${search}`)
        const $ = cheerio.load(data)
        const ajg = []
        $("#app > noscript").each((u, i) => {
            ajg.push($(i).html())
        })
        const _$ = cheerio.load(ajg[1])
        const hasil = []
        _$("ul > li > h2 > a").each((i, u) => {
            if ($(u).attr("href").split("/").length === 3) {
                const linkk = $(u).attr("href")
                const judul = $(u).text()
                hasil.push({
                    url: `https://soundcloud.com${linkk || "-"}`,
                    title: judul || '-',
                })
            }
        })
        return hasil
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = soundcloudSearch