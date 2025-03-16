const express = require("express");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { trackRequests, getServerStatus, setDatabaseStatus } = require("./stats");

const app = express();
const port = 4000;

// Middleware untuk JSON & menyajikan file statis
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Path untuk file HTML
const indexPath = path.join(__dirname, "public/index.html");
const docsPath = path.join(__dirname, "public/docs.html");

const basePath = path.join(__dirname, "scrape");

// Penyimpanan untuk statistik
let endpointStats = {
	Download: {},
	Maker: {},
	Search: {},
	Information: {},
	Tools: {},
};

// Fungsi untuk memuat semua endpoint dari folder
const loadRoutes = (category) => {
	const categoryPath = path.join(basePath, category);

	if (fs.existsSync(categoryPath)) {
		fs.readdirSync(categoryPath).forEach((file) => {
			if (file.endsWith(".js")) {
				const routeName = file.replace(".js", "");
				const routeModule = require(path.join(categoryPath, file));

				if (typeof routeModule === "function") {
					// Validasi parameter untuk masing-masing endpoint
					app.get(
						`/api/${category.toLowerCase()}/${routeName}`,
						async (req, res) => {
							// Catat statistik jumlah request
							if (!endpointStats[category][routeName]) {
								endpointStats[category][routeName] = 0;
							}
							endpointStats[category][routeName]++;

							try {
								// Validasi parameter berdasarkan kategori
								if (category === "Search" && !req.query.query) {
									return res.status(400).json({
										status: false,
										author: "Padz Dev",
										error: `Parameter 'query' diperlukan untuk endpoint ${routeName}`,
									});
								}

								if (category === "Information" && !req.query.tahun) {
									return res.status(400).json({
										status: false,
										author: "Padz Dev",
										error: `Parameter 'tahun' diperlukan untuk endpoint ${routeName}`,
									});
								}

								if (category === "Tools" && !req.query.user) {
									return res.status(400).json({
										status: false,
										author: "Padz Dev",
										error: `Parameter 'username' diperlukan untuk endpoint ${routeName}`,
									});
								}

								if (category === "Download" && !req.query.url) {
									return res.status(400).json({
										status: false,
										author: "Padz Dev",
										error: `Parameter 'url' diperlukan untuk endpoint ${routeName}`,
									});
								}

								if (category === "Maker") {
									// Validasi untuk kategori Maker
									if (
										routeName === "bratImage" ||
										routeName === "bratVideo"
									) {
										if (!req.query.text) {
											return res.status(400).json({
												status: false,
												author: "Padz Dev",
												error: `Parameter 'text' diperlukan untuk endpoint ${routeName}`,
											});
										}
									}

									if (
										routeName === "carbonV1" ||
										routeName === "carbonV2"
									) {
										if (!req.query.code) {
											return res.status(400).json({
												status: false,
												author: "Padz Dev",
												error: `Parameter 'code' diperlukan untuk endpoint ${routeName}`,
											});
										}
									}

									if (routeName === "emojimix") {
										if (
											!req.query.emoji1 ||
											!req.query.emoji2
										) {
											return res.status(400).json({
												status: false,
												author: "Padz Dev",
												error: `Parameter 'emoji1' dan 'emoji2' diperlukan untuk endpoint ${routeName}`,
											});
										}
									}

									if (routeName === "quotly") {
										if (
											!req.query.message ||
											!req.query.username ||
											!req.query.avatarurl
										) {
											return res.status(400).json({
												status: false,
												author: "Padz Dev",
												error: `Parameter 'message', 'username', dan 'avatarurl' diperlukan untuk endpoint ${routeName}`,
											});
										}
									}
								}

								// Jika parameter valid, proses dan kirim hasil
								const result = await routeModule(
									req.query.url ||
									req.query.tahun ||
									req.query.package||
									req.query.user ||
									req.query.judul ||
										req.query.query ||
										req.query.text ||
										req.query.code ||
										req.query.emoji1 ||
										req.query.emoji2 ||
										req.query.message ||
										req.query.username ||
										req.query.avatarurl,
								);
								res.json({
									status: true,
									author: "Padz Dev",
									result,
								});
							} catch (error) {
								res.status(500).json({
									status: false,
									author: "Padz Dev",
									error: error.message,
								});
							}
						},
					);
				}
			}
		});
	}
};

// Muat kategori Download, Maker, dan Search
["Download", "Maker", "Search", "Information", "Tools"].forEach(loadRoutes);

// Endpoint JSON untuk daftar endpoint
app.get("/api/docs", (req, res) => {
	const docs = {
		Download: [],
		Maker: [],
		Search: [],
		Information: [],
		Tools: [],
	};

	app._router.stack.forEach((middleware) => {
		if (middleware.route) {
			const method = Object.keys(
				middleware.route.methods,
			)[0].toUpperCase();
			const path = middleware.route.path;

			if (path.startsWith("/api/download/"))
				docs.Download.push({
					method,
					path: path.replace(/^\/api/, ""),
				});
			if (path.startsWith("/api/maker/"))
				docs.Maker.push({ method, path: path.replace(/^\/api/, "") });
			if (path.startsWith("/api/search/"))
				docs.Search.push({ method, path: path.replace(/^\/api/, "") });
			if (path.startsWith("/api/information/"))
				docs.Information.push({ method, path: path.replace(/^\/api/, "") });
			if (path.startsWith("/api/tools/"))
				docs.Tools.push({ method, path: path.replace(/^\/api/, "") });
		}
	});

	res.json(docs);
});

// Endpoint untuk halaman utama (landing page)
app.get("/", (req, res) => {
	res.sendFile(indexPath);
});

app.use(trackRequests);

// Endpoint Statistik API
app.get("/api/status", (req, res) => {
  res.json(getServerStatus());
});

// Endpoint Informasi API
app.get("/api/info", (req, res) => {
  res.json({
    server: getServerStatus().server,
  });
});

// Simulasi Database (contoh MongoDB)
setTimeout(() => {
  setDatabaseStatus("Connected");
}, 5000); // Simulasi koneksi database setelah 5 detik
// Endpoint untuk halaman dokumentasi API
app.get("/docs", (req, res) => {
	res.sendFile(docsPath);
});

// Menjalankan server
app.listen(port, () => {
	console.log(`Server berjalan di http://localhost:${port}`);
});