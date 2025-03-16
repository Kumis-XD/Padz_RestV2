const axios = require("axios");

async function transcribe(url) {
	return new Promise((resolve, reject) => {
		axios
			.get(`https://yts.kooska.xyz/?url=${encodeURIComponent(url)}`)
			.then(({ data }) => {
				const hasil = {
					video_id: data.video_id,
					summarize: data.ai_response,
					transcript: data.transcript,
				};
				resolve(hasil);
			})
			.catch((error) => {
				reject({
					msg: `Gagal mendapatkan respon, dengan pesan: ${error.message}`,
				});
			});
	});
}

module.exports = transcribe;
