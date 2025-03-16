const axios = require('axios')

async function bratImage(teks) {
    if (!teks) throw Error('Teks tidak boleh kosong')
    if (teks.length > 250) throw Error('Karakter terbatas, max 250!')

    try {
        const res = await axios.get(
            `https://aqul-brat.hf.space/?text=${encodeURIComponent(teks)}`,
            { responseType: "arraybuffer" }
        )

        return { buffer: res.data, type: 'image/png' }
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = bratImage