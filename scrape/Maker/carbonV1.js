const fetch = require('node-fetch');
const Buffer = require('buffer').Buffer;

async function carbonV1(input) {
    let Blobs = await fetch("https://carbonara.solopov.dev/api/cook", {
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

module.exports = carbonV1