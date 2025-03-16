const fetch = require('node-fetch');
const Buffer = require('buffer').Buffer;

async function carbonV2(input) {
    let Blobs = await fetch("https://carbon-api.vercel.app/api", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "code": input
        })
    })
        .then(response => response.blob())
    let arrayBuffer = await Blobs.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    return { buffer, type: 'image/png' }
}

module.exports = carbonV2