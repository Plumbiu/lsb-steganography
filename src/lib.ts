import { writeFile } from 'node:fs/promises'
import { Jimp, type JimpInstance } from 'jimp'

interface EncodeOptions {
  input?: string
}

const MASK_0F = 0x0f
const MASK_F0 = 0xf0
const MASK_FF = 0xff

export async function encode(str: string, { input }: EncodeOptions) {
  const buffer = Buffer.from(str)
  let image: JimpInstance
  let width = 0
  let height = 0
  if (input) {
    const jimp = await Jimp.read(input)
    const size = jimp.width * jimp.height * 4
    const pixelApset = Math.sqrt(size / (buffer.length * 2))
    width = Math.ceil(jimp.width / pixelApset)
    height = Math.ceil(jimp.height / pixelApset)
    // @ts-ignore
    image = jimp.resize({
      w: width,
      h: height,
    })
  } else {
    const Sqrt3Div2 = Math.sqrt(3 / 2)
    width = Math.ceil(Math.sqrt(buffer.length) / Sqrt3Div2)
    height = width
    image = new Jimp({
      color: 0xf0f0f0,
      width,
      height,
    })
  }

  for (let i = 0; i < buffer.length; i++) {
    image.bitmap.data[i * 2] =
      ((image.bitmap.data[i * 2] ?? MASK_FF) & MASK_F0) +
      ((buffer[i] >> 4) & MASK_0F)
    image.bitmap.data[i * 2 + 1] =
      ((image.bitmap.data[i * 2 + 1] ?? MASK_FF) & MASK_F0) +
      (buffer[i] & MASK_0F)
  }
  for (let i = 2 * buffer.length; i < width * height * 4; i++) {
    image.bitmap.data[i] = (image.bitmap.data[i] ?? MASK_FF) & MASK_F0
  }
  return {
    data: image.bitmap.data,
    async writeFile(path: string) {
      return image.write(`${path}.png`)
    },
  }
}

export async function decode(imagePath: string) {
  const jimpInput = await Jimp.read(imagePath)
  const buffer = jimpInput.bitmap.data
  let data = ''
  for (let i = 0; i < buffer.length; i++) {
    data += buffer[i].toString(16)[1]
  }
  data = Buffer.from(data, 'hex').toString('utf-8')
  return {
    data,
    writeFile(output: string) {
      return writeFile(data, output)
    },
  }
}
