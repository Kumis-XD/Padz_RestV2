const axios = require("axios");
const cheerio = require("cheerio");

async function hariLibur(tahun) {
	try {
		const url = `https://publicholidays.co.id/id/${tahun}-dates/`;
		const { data } = await axios.get(url);
		const $ = cheerio.load(data);
		const results = [];

		$("tr").each((index, element) => {
			const columns = $(element).find("td");
			if (columns.length >= 2) {
				const tanggal = $(columns[0]).text().trim();
				const hari = $(columns[1]).text().trim();
				const keterangan = $(columns[2]).text().trim();

				results.push({
					tanggal,
					hari,
					keterangan,
				});
			}
		});

		return results;
	} catch (error) {
		console.log("Error:", error);
		throw error;
	}
}

module.exports = hariLibur;
