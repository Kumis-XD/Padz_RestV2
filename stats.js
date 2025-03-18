const os = require("os");
const { networkInterfaces } = require("os");

const stats = {
	totalRequests: 0,
	startTime: Date.now(),
	requestsPerSecond: 0,
	recentRequests: [],
	server: {
		name: "API Documentation",
		version: "1.0.0",
		hostname: os.hostname(),
		port: process.env.PORT || 3000,
		totalEndpoints: 10, // Ganti dengan jumlah endpoint sebenarnya
		cpuLoad: {
			"1m": 0,
			"5m": 0,
			"15m": 0,
		},
		totalMemory: formatBytes(os.totalmem()),
		freeMemory: formatBytes(os.freemem()),
		uptime: "0 detik",
		speed: 0, // Kecepatan server dalam milidetik
		platform: os.platform(),
		architecture: os.arch(),
		cpuCores: os.cpus().length,
		cpuUsagePerCore: [],
		localIP: getLocalIP(),
		activeThreads: os.loadavg()[0] * os.cpus().length, // Perkiraan jumlah thread aktif
		nodeVersion: process.version,
		currentTime: new Date().toLocaleString(),
	},
	database: {
		status: "Disconnected",
	},
};

// Middleware untuk mencatat request dan waktu respons
function trackRequests(req, res, next) {
	const start = Date.now();
	stats.totalRequests++;

	// Simpan waktu request untuk hitung RPS
	stats.recentRequests.push(start);

	// Hapus request yang lebih lama dari 1 detik
	while (
		stats.recentRequests.length &&
		stats.recentRequests[0] < start - 1000
	) {
		stats.recentRequests.shift();
	}

	// Hitung requests per second (RPS)
	stats.requestsPerSecond = stats.recentRequests.length;

	res.on("finish", () => {
		const duration = Date.now() - start;
		stats.server.speed = calculateSpeed(duration);
	});

	next();
}

// Fungsi untuk menghitung uptime
function updateUptime() {
	const elapsedTime = Math.floor((Date.now() - stats.startTime) / 1000);
	stats.server.uptime = formatTime(elapsedTime);
}

// Fungsi untuk mengambil status server
function getServerStatus() {
	updateUptime();
	const loadAvg = os.loadavg();
	stats.server.cpuLoad["1m"] = loadAvg[0].toFixed(2);
	stats.server.cpuLoad["5m"] = loadAvg[1].toFixed(2);
	stats.server.cpuLoad["15m"] = loadAvg[2].toFixed(2);
	stats.server.totalMemory = formatBytes(os.totalmem());
	stats.server.freeMemory = formatBytes(os.freemem());
	stats.server.cpuUsagePerCore = getCPUUsagePerCore();
	stats.server.currentTime = new Date().toLocaleString();
	return stats;
}

// Fungsi untuk mendapatkan penggunaan CPU per core
function getCPUUsagePerCore() {
	return os.cpus().map((cpu, index) => ({
		core: index + 1,
		model: cpu.model,
		speed: cpu.speed + " MHz",
	}));
}

// Fungsi untuk mendapatkan alamat IP lokal server
function getLocalIP() {
	const nets = networkInterfaces();
	let localIP = "Tidak diketahui";

	for (const name of Object.keys(nets)) {
		for (const net of nets[name]) {
			if (net.family === "IPv4" && !net.internal) {
				localIP = net.address;
				break;
			}
		}
	}

	return localIP;
}

// Fungsi untuk format ukuran memori
function formatBytes(bytes) {
	if (bytes === 0) return "0 B";
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));
	return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

// Fungsi untuk format waktu uptime
function formatTime(seconds) {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	return `${h > 0 ? `${h} jam ` : ""}${m > 0 ? `${m} menit ` : ""}${s} detik`;
}

// Fungsi untuk menghitung rata-rata kecepatan respons
function calculateSpeed(duration) {
	return duration > 1000 ? 1000 : duration; // Batasi maksimum kecepatan untuk stabilitas grafik
}

// Fungsi untuk set status database
function setDatabaseStatus(status) {
	stats.database.status = status;
}

module.exports = {
	trackRequests,
	getServerStatus,
	setDatabaseStatus,
};
