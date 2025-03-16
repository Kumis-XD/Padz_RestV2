const axios = require("axios");

async function quotly(
	message,
	username,
	avatar = "https://files.catbox.moe/nwvkbt.png",
) {
	try {
		const json = {
			type: "quote",
			format: "png",
			backgroundColor: "#ffffff",
			width: 512,
			height: 768,
			scale: 2,
			messages: [
				{
					entities: [],
					avatar: true,
					from: {
						id: 1,
						name: username,
						photo: { url: avatar },
					},
					text: message,
					replyMessage: {},
				},
			],
		};

		const response = await axios.post(
			"https://bot.lyo.su/quote/generate",
			json,
			{
				headers: { "Content-Type": "application/json" },
			},
		);

		return response.data.result;
	} catch (err) {
		throw Error(err.message);
	}
}

module.exports = quotly;
