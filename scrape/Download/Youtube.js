const axios = require("axios");

async function ytdl(url) {
	if (!url) {
		return { status: false, error: "URL is required" };
	}

	try {
		const apiBase = "https://ytdl.apizell.web.id";
		const infoUrl = `${apiBase}/info?url=${url}`;

		const { data } = await axios.get(infoUrl);
		if (!data) {
			return { status: false, error: "Failed to fetch YouTube content" };
		}

		return {
			title: data.title,
			thumbnail: data.thumbnail,
			duration: data.duration,
			video: data.resolutions.map(({ height, size }) => ({
				height,
				size,
				urlVideo: `${apiBase}/download?url=${encodeURIComponent(
					url,
				)}&resolution=${height}`,
			})),
			audio: data.audioBitrates.map(({ bitrate, size }) => ({
				bitrate,
				size,
				urlAudio: `${apiBase}/audio?url=${encodeURIComponent(
					url,
				)}&bitrate=${bitrate}`,
			})),
		};
	} catch (error) {
		return { error: error.message };
	}
}

module.exports = ytdl;
