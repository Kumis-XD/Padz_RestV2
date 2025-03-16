const axios = require("axios");
const cheerio = require("cheerio");

const headers = {
	"User-Agent":
		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
	Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
	"Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
	Referer: "https://www.capcut.com/",
};

async function ccdl(url) {
	try {
		if (!url.includes("capcut.com")) {
			throw new Error(
				"URL CapCut tidak valid. Pastikan URL berasal dari CapCut.",
			);
		}

		const response = await axios.get(url, { headers });
		const $ = cheerio.load(response.data);
		const videoName = $("img").attr("alt") || "CapCut Video";
		const thumbnail = $("img").attr("src");
		const videoUrl = $("video").attr("src");

		if (!videoUrl) {
			throw new Error(
				"Tidak dapat menemukan URL video. Mungkin CapCut telah memperbarui sistemnya.",
			);
		}

		const timestamp = Date.now();
		const safeFileName = videoName
			.replace(/[^a-z0-9]/gi, "_")
			.toLowerCase();

		return {
			platform: "CapCut",
			caption: videoName,
			author: "CapCut",
			username: "",
			thumbnail,
			like: 0,
			views: 0,
			comments: 0,
			date: new Date().toLocaleString("id-ID", {
				day: "numeric",
				month: "long",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			}),
			downloads: [
				{
					type: "video",
					url: videoUrl,
					filename: `capcut_${safeFileName}_${timestamp}.mp4`,
				},
			],
		};
	} catch (error) {
		console.error("CapCut Download Error:", error);
		if (error.response) {
			console.error("Response Error:", error.response.data);
		}
		throw new Error("Gagal mengunduh dari CapCut: " + error.message);
	}
}

module.exports = ccdl;
