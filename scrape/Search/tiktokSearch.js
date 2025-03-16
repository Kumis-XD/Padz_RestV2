const axios = require("axios")

async function tiktokSearch(query) {
    return new Promise(async (resolve, reject) => {
        axios("https://tikwm.com/api/feed/search", {
            headers: {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                cookie: "current_language=en",
                "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
            },
            data: {
                keywords: query,
                count: 12,
                cursor: 0,
                web: 1,
                hd: 1,
            },
            method: "POST",
        })
            .then((res) => {
                if (!res.data || !res.data.data || !res.data.data.videos) {
                    return reject(Error("Data tidak ditemukan"))
                }

                const result = res.data.data.videos.map((video) => ({
                    id: video.video_id,
                    title: video.title,
                    cover: `https://tikwm.com${video.cover}`,
                    duration: video.duration,
                    play_url: `https://tikwm.com${video.play}`,
                    wmplay_url: `https://tikwm.com${video.wmplay}`,
                    size: video.size,
                    wm_size: video.wm_size,
                    music_url: `https://tikwm.com${video.music}`,
                    play_count: video.play_count,
                    digg_count: video.digg_count,
                    comment_count: video.comment_count,
                    share_count: video.share_count,
                    download_count: video.download_count,
                    create_time: video.create_time,
                    author_id: video.mentioned_users,
                    region: video.region
                }))

                resolve(result)
            })
            .catch((err) => reject(Error(err.message)))
    })
}

module.exports = tiktokSearch