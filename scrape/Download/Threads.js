const axios = require('axios')

async function threads(url) {
    try {
        const { data } = await axios.get('https://threads.snapsave.app/api/action', {
            params: { url: url },
            headers: {
                'accept': 'application/json, text/plain, */*',
                'referer': 'https://threads.snapsave.app/',
                'user-agent': 'Postify/1.0.0',
            },
            timeout: 10000,
        })

        const type = (type) => ({
            GraphImage: 'Photo',
            GraphVideo: 'Video',
            GraphSidecar: 'Gallery',
        }[type] || type)

        return {
            postInfo: {
                id: data.postinfo.id,
                username: data.postinfo.username,
                avatarUrl: data.postinfo.avatar_url,
                mediaTitle: data.postinfo.media_title,
                type: type(data.postinfo.__type),
            },
            media: data.items.map((item) => ({
                type: type(item.__type),
                id: item.id,
                url: item.url,
                width: item.width,
                height: item.height,
                ...(item.__type === 'GraphVideo' && {
                    thumbnailUrl: item.display_url,
                    videoUrl: item.video_url,
                    duration: item.video_duration,
                }),
            })),
        }
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = threads