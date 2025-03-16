const axios = require("axios")
const cheerio = require("cheerio")

async function soundcloud(url) {
    try {
        const getToken = await axios.get("https://soundcloudmp3.org/", {
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0",
            },
        })
        const dom = getToken.data
        const a = cheerio.load(dom)
        const token = a("input").attr("value")
        const config = {
            _token: token,
            lang: "en",
            url: url,
            submit: "",
        }

        const { data, status } = await axios.post("https://soundcloudmp3.org/converter", new URLSearchParams(config), {
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:108.0) Gecko/20100101 Firefox/108.0",
            },
        })

        if (status === 200) {
            const $ = cheerio.load(data)
            const result = {}
            $(".info > p").each((a, i) => {
                let name = $(i).find("b").text()
                let key = $(i).text().trim().replace(name, "").trim()
                result[name.split(":")[0].trim().toLowerCase()] = key
            })
            result.thumbnail = $(".info img").attr("src")
            result.download = $("#ready-group a").attr("href")
            return result
        }
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = soundcloud