const express = require("express");
const fs = require("fs");
const path = require("path");
const os = require("os");
const rateLimit = require("express-rate-limit");
const cache = require("memory-cache");
const { trackRequests, getServerStatus, setDatabaseStatus } = require("./stats");
const crypto = require('crypto');

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

// Variabel untuk total request global
let totalRequests = 0;

// Rate Limiting untuk melindungi server dari DDoS dan spam request
const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 menit
	max: 100, // Maksimum 100 request per menit per IP
	message: "Terlalu banyak permintaan dari IP ini. Silakan coba lagi nanti."
});

// Apply rate limiting ke semua request
app.use(limiter);

app.use((req, res, next) => {
	const nonce = crypto.randomBytes(16).toString('base64');
	res.locals.nonce = nonce;
	res.setHeader("Content-Security-Policy", `default-src 'self'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data:; script-src 'self' https://cdn.jsdelivr.net 'nonce-${nonce}'`);
	res.setHeader("Content-Type", "text/html; charset=UTF-8");
	res.setHeader("Content-Style-Type", "text/css");
	res.setHeader("Content-Script-Type", "text/javascript");
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("X-XSS-Protection", "1; mode=block");
	res.setHeader("Referrer-Policy", "no-referrer");
	res.setHeader("Permissions-Policy", "geolocation=(self), microphone=()");
	next();
});

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
							
							// Menambah total request global
							totalRequests++;

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
  res.json({
    ...getServerStatus(),
    totalRequests, // Menambahkan jumlah request total global
  });
});

// Endpoint Informasi API
app.get("/api/info", (req, res) => {
  res.json({
    server: getServerStatus().server,
    totalRequests, // Menambahkan jumlah request total global
  });
});

// Simulasi Database (contoh MongoDB)
setTimeout(() => {
  setDatabaseStatus("Connected");
}, 1000); // Simulasi koneksi database setelah 5 detik

// Endpoint untuk halaman dokumentasi API
app.get("/docs", (req, res) => {
	res.sendFile(docsPath);
});

// Menjalankan server
const server = app.listen(port, () => {
	console.log(`Server berjalan di http://localhost:${port}`);
});

// Fungsi untuk mematikan dan menyalakan server setelah deteksi DDoS
let serverDown = false;
setInterval(() => {
	// Cek apakah ada IP yang memicu batas rate menggunakan cache
	const ddosDetected = cache.keys().some((key) => {
		return cache.get(key) > Date.now() - 5 * 60 * 1000; // Cek apakah IP aktif dalam 5 menit terakhir
	});

	if (ddosDetected && !serverDown) {
		console.log("DDoS terdeteksi, mematikan server sementara...");
		server.close(() => {
			console.log("Server dimatikan. Menyalakan kembali...");
			setTimeout(() => {
				server.listen(port, () => {
					console.log(`Server kembali berjalan di http://localhost:${port}`);
				});
			}, 30000); // Menunggu 30 detik sebelum menyalakan kembali
		});
		serverDown = true;
	} else if (!ddosDetected && serverDown) {
		serverDown = false;
	}
}, 5000);