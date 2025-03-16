const ytSearch = require('yt-search')

async function youtubeSearch(query) {
    try {
        const searchResults = await ytSearch.search(query)
        const videos = searchResults.videos.map(video => ({
            title: video.title,
            description: video.description,
            url: video.url,
            videoId: video.videoId,
            timestamp: video.timestamp,
            duration: video.duration,
            ago: video.ago,
            views: video.views,
            author: {
                name: video.author.name,
                url: video.author.url,
                verified: video.author.verified
            },
            image: video.image,
            thumbnail: video.thumbnail
        }))
        return videos
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = youtubeSearch