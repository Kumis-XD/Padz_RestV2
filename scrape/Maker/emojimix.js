const axios = require('axios')

async function emojimix(emoji1, emoji2) {
    try {
        let hex1 = emoji1.codePointAt(0).toString(16)
        let hex2 = emoji2.codePointAt(0).toString(16)

        let url = `https://emojik.vercel.app/s/${hex1}_${hex2}?size=512`
        let { data } = await axios.get(url, { responseType: 'arraybuffer' })

        return { buffer: data, type: 'image/png' }
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = emojimix