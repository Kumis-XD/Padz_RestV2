const axios = require('axios')

async function bratVideo(teks) {
    if (!teks) throw Error('Teks tidak boleh kosong')
    if (teks.length > 250) throw Error('Karakter terbatas, max 250!')

    const words = teks.split(" ")
    const framePaths = []

    try {
        for (let i = 0; i < words.length; i++) {
            const currentText = words.slice(0, i + 1).join(" ")

            const res = await axios.get(
                `https://aqul-brat.hf.space/?text=${encodeURIComponent(currentText)}`,
                { responseType: "arraybuffer" }
            ).catch((e) => e.response)

            const framePath = `./frame${i}.mp4`
            fs.writeFileSync(framePath, res.data)
            framePaths.push(framePath)
        }

        const fileListPath = "./filelist.txt"
        let fileListContent = ""

        for (let i = 0; i < framePaths.length; i++) {
            fileListContent += `file '${framePaths[i]}'\n`
            fileListContent += `duration 0.5\n`
        }

        fileListContent += `file '${framePaths[framePaths.length - 1]}'\n`
        fileListContent += `duration 1.5\n`

        fs.writeFileSync(fileListPath, fileListContent)
        const outputVideoPath = "./output.mp4"

        execSync(
            `ffmpeg -y -f concat -safe 0 -i ${fileListPath} -vf "fps=30" -c:v libx264 -preset superfast -pix_fmt yuv420p ${outputVideoPath}`
        )

        const buffer = fs.readFileSync(outputVideoPath)

        framePaths.forEach((frame) => {
            if (fs.existsSync(frame)) fs.unlinkSync(frame)
        })
        if (fs.existsSync(fileListPath)) fs.unlinkSync(fileListPath)
        if (fs.existsSync(outputVideoPath)) fs.unlinkSync(outputVideoPath)

        return { buffer, type: 'video/mp4' }
    } catch (err) {
        throw Error(err.message)
    }
}

module.exports = bratVideo