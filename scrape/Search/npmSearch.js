const fetch = require('node-fetch')

async function npmSearch(query) {
    try {
        let res = await fetch(`http://registry.npmjs.com/-/v1/search?text=${encodeURIComponent(query)}`)
        let { objects } = await res.json()

        return objects.map(({ package: pkg }) => ({
            package: pkg.name,
            version: pkg.version,
            url: pkg.links.npm,
            description: pkg.description || '-'
        }))
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = npmSearch