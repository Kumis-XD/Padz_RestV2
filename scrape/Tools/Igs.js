const axios = require("axios");

async function instagramStalk(username) {
	return new Promise((resolve, reject) => {
		const apiUrl = `https://api.vreden.my.id/api/igstalk?query=${encodeURIComponent(
			username,
		)}`;

		axios
			.get(apiUrl)
			.then(({ data }) => {
				if (!data.status || !data.result || !data.result.user) {
					return reject({
						status: false,
						message:
							"Gagal mendapatkan data! Cek username yang diberikan.",
					});
				}

				const user = data.result.user;

				const hasil = {
					username,
					full_name: user.full_name || "Tidak ada",
					bio: user.biography || "Tidak ada",
					account_category: user.account_category || "Tidak ada",
					is_private: user.is_private,
					is_verified: user.is_verified,
					follower_count: user.follower_count,
					following_count: user.following_count,
					media_count: user.media_count,
					external_url: user.external_url || "Tidak ada",
					profile_pic_url_hd: user.profile_pic_url_hd,
				};

				resolve(hasil);
			})
			.catch((error) => {
				reject({
					status: false,
					message: `Gagal mendapatkan data: ${error.message}`,
				});
			});
	});
}

module.exports = instagramStalk;
