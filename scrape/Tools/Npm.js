const axios = require("axios");

async function npmStalk(packageName) {
	return new Promise((resolve, reject) => {
		axios
			.get(
				`https://api.siputzx.my.id/api/stalk/npm?packageName=${encodeURIComponent(
					packageName,
				)}`,
			)
			.then(({ data }) => {
				if (data.status && data.data) {
					const hasil = {
						name: data.data.name,
						versionLatest: data.data.versionLatest,
						versionPublish: data.data.versionPublish,
						versionUpdate: data.data.versionUpdate,
						latestDependencies: data.data.latestDependencies,
						publishDependencies: data.data.publishDependencies,
						publishTime: new Date(
							data.data.publishTime,
						).toLocaleString(),
						latestPublishTime: new Date(
							data.data.latestPublishTime,
						).toLocaleString(),
					};
					resolve(hasil);
				} else {
					reject({
						status: false,
						message:
							"Package tidak ditemukan atau terjadi kesalahan.",
					});
				}
			})
			.catch((error) => {
				reject({
					status: false,
					message: `Gagal mendapatkan data: ${error.message}`,
				});
			});
	});
}

module.exports = npmStalk;
