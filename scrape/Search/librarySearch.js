const axios = require('axios')

async function librarySearch(teks) {
    try {
        const response = await axios.get('https://openlibrary.org/search.json', {
            params: { q: teks },
        })
        return response.data.docs.map((book) => ({
            title: book.title,
            author: book.author_name ? book.author_name.join(', ') : 'Unknown',
            cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null,
        }))
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = librarySearch