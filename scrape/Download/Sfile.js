const axios = require('axios');
const cheerio = require('cheerio');

async function sfileDl(url) {
    return new Promise(async (resolve, reject) => {
        try {
            const headers = {
                'referer': url,
                'user-Agent': 'Mozilla/5.0 (Linux; Android 14; NX769J Build/UKQ1.230917.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/130.0.6723.107 Mobile Safari/537.36',
            };

            let getPage = await axios.get(url, { headers });
            let $ = cheerio.load(getPage.data);
            let safelink = $("#safe_link").attr("href");

            headers.cookie = getPage.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
            headers.referer = safelink;

            let resPage = await axios.get(safelink, { headers });
            let s, f = cheerio.load(resPage.data);

            const [dl, [name, ext, size], downloaded, uploaded, mime, author] = [
                f("#download").attr("href") + '&k=' + f("#download").attr("onclick").match(/&k='\+(.*?)';/)?.[1].replace("'", ''),
                (() => { s = f('.w3-text-blue b').text().match(/^(.+?)(?:\.([^.\s()]+))?(?:\s*\(([^)]*)\))?$/); return [s[1].trim(), s[2], s[3]] })(),
                $('.icon-cloud-download').parent().text().split(':')[1].trim(),
                $('.icon-upload').parent().text().split(':')[1].trim(),
                $('.list:nth-child(2)').eq(0).text().slice(3).trim(),
                $('.list a').first().text().trim(),
            ]

            resolve({
                name,
                size,
                author,
                uploaded,
                downloaded,
                mime,
                ext,
                dl
            });
        } catch (e) {
            reject(e);
        }
    })
}

module.exports = sfileDl