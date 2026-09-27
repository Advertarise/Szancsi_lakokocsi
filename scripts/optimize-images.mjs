// A public/camper/ mappa képeit webre méretezi: legfeljebb 2400 px széles, ~80%-os minőségű JPG/WebP.
// Használat: npm run kepek   (a már kicsi képeket nem bántja)
import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const dir = path.join(process.cwd(), "public", "camper")
const MAX_WIDTH = 2400
const MAX_BYTES = 600 * 1024

for (const name of await fs.readdir(dir)) {
  const ext = path.extname(name).toLowerCase()
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue

  const file = path.join(dir, name)
  const input = await fs.readFile(file)
  const { width = 0 } = await sharp(input).metadata()
  if (width <= MAX_WIDTH && input.length <= MAX_BYTES) {
    console.log(`✓ ${name} – rendben (${Math.round(input.length / 1024)} KB)`)
    continue
  }

  const pipeline = sharp(input).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true })
  const output =
    ext === ".webp"
      ? await pipeline.webp({ quality: 80 }).toBuffer()
      : ext === ".png"
        ? await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer()
        : await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer()

  await fs.writeFile(file, output)
  console.log(`↓ ${name}: ${Math.round(input.length / 1024)} KB → ${Math.round(output.length / 1024)} KB`)
}
