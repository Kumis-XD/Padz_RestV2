const os = require("os");

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
    diskUsage: "Tidak tersedia di Node.js native", // Butuh library eksternal
    uptime: "0 detik",
  },
  database: {
    status: "Disconnected",
  },
};

// Fungsi middleware untuk mencatat request
function trackRequests(req, res, next) {
  stats.totalRequests++;
  
  // Simpan waktu request untuk hitung RPS
  const now = Date.now();
  stats.recentRequests.push(now);

  // Hapus request yang lebih lama dari 1 detik
  while (stats.recentRequests.length && stats.recentRequests[0] < now - 1000) {
    stats.recentRequests.shift();
  }

  // Hitung requests per second (RPS)
  stats.requestsPerSecond = stats.recentRequests.length;

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
  return stats;
}

// Fungsi format ukuran memori
function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

// Fungsi format waktu uptime
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h} jam ${m} menit ${s} detik`;
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