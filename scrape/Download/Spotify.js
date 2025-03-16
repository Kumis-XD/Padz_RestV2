const axios = require('axios')

async function spotify(url) {
	const hai = await axios.get(`https://api.fabdl.com/spotify/get?url=${encodeURIComponent(url)}`)
	const hao = await axios.get(`https://api.fabdl.com/spotify/mp3-convert-task/${hai.data.result.gid}/${hai.data.result.id}`)
	return {
		title: hai.data.result.name,
		download: `https://api.fabdl.com${hao.data.result.download_url}`,
		image: hai.data.result.image,
		duration: hai.data.result.duration_ms
	}
}

module.exports = spotify