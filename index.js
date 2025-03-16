const express = require("express");
const fs = require("fs");
const path = require("path");
const os = require("os");

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

// Informasi dasar server
const serverInfo = {
	name: "Padz Dev API",
	version: "1.0.0",
	startedAt: new Date(),
};

// 📌 Endpoint informasi server
app.get("/api/info", (req, res) => {
	const uptimeSeconds = process.uptime();
	const totalEndpoints = app._router.stack.filter((r) => r.route).length;

	res.json({
		status: true,
		author: "Padz Dev",
		server: {
			name: serverInfo.name,
			version: serverInfo.version,
			uptime: `${Math.floor(uptimeSeconds / 60)}m ${Math.floor(uptimeSeconds % 60)}s`,
			totalEndpoints,
			startedAt: serverInfo.startedAt.toISOString(),
		},
	});
});

// 📌 Endpoint status server
app.get("/api/status", (req, res) => {
	const memoryUsage = process.memoryUsage();
	const cpuLoad = os.loadavg(); // Beban CPU dalam 1, 5, dan 15 menit terakhir

	res.json({
		status: true,
		author: "Padz Dev",
		server: {
			uptime: `${Math.floor(process.uptime() / 60)}m ${Math.floor(process.uptime() % 60)}s`,
			memory: {
				rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
				heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
				heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
			},
			cpuLoad: {
				"1m": cpuLoad[0].toFixed(2),
				"5m": cpuLoad[1].toFixed(2),
				"15m": cpuLoad[2].toFixed(2),
			},
			totalMemory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
			freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
		},
	});
});

// Endpoint untuk halaman dokumentasi API
app.get("/docs", (req, res) => {
	res.sendFile(docsPath);
});

// Endpoint untuk mendapatkan statistik
app.get("/api/stats", (req, res) => {
	res.json(endpointStats);
});

// Menjalankan server
app.listen(port, () => {
	console.log(`Server berjalan di http://localhost:${port}`);
});