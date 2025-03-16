const fetch = require('node-fetch')

async function appstoreSearch(query) {
    try {
        const res = await fetch(`https://www.apple.com/us/search/${encodeURIComponent(query)}?src=globalnav`)
        const html = await res.text()
        const obj = html.split('window.pageLevelData.searchResults.searchData = ')[1].split('};\n')[0]
        const data = JSON.parse(obj + '}')

        const searchResults = data.results.explore.exploreCurated.tiles.items.map(item => ({
            title: item.value.title,
            description: item.value.description || 'Tidak ada deskripsi',
            url: item.value.navLinks[0]?.url || null,
            image: item.imageURL || null,
            rank: item.value.resultRank || 'Tidak ada rank'
        }))

        return {
            total_results: data.totalCountText || 'Tidak ada hasil',
            search_term: data.searchTerm || query,
            first_result_link: searchResults[0]?.url || null,
            results: searchResults
        }
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = appstoreSearch