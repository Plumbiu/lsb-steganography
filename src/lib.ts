import { writeFile } from 'node:fs/promises'
import sharp from 'sharp'

interface EncodeOptions {
  input?: sharp.SharpInput
}

const MASK_0F = 0x0f
const MASK_F0 = 0xf0
const MASK_FF = 0xff

export async function encode(str: string, { input }: EncodeOptions) {
  const buffer = Buffer.from(str)
  let originImageBuffer: Buffer<ArrayBufferLike> | null = null
  let width = 0
  let height = 0
  if (input) {
    const imageSharp = sharp(input)
    const metadata = await imageSharp.metadata()
    const pixelApset = Math.sqrt(
      (metadata.width * metadata.height * 3) / (buffer.length * 2),
    )
    width = Math.ceil(metadata.width / pixelApset)
    height = Math.ceil(metadata.height / pixelApset)
    originImageBuffer = await sharp(input)
      .resize({ width, height })
      .raw()
      .toBuffer()
  } else {
    const Sqrt3Div2 = Math.sqrt(3 / 2)
    width = Math.ceil(Math.sqrt(buffer.length) / Sqrt3Div2)
    height = width
  }

  const size = width * height * 3
  const arrayBuffer = new Uint8Array(size)

  let originIndex = 0
  for (let i = 0; i < buffer.length; i++) {
    arrayBuffer[i * 2] =
      ((originImageBuffer?.[originIndex++] ?? MASK_FF) & MASK_F0) +
      ((buffer[i] >> 4) & MASK_0F)
    arrayBuffer[i * 2 + 1] =
      ((originImageBuffer?.[originIndex++] ?? MASK_FF) & MASK_F0) +
      (buffer[i] & MASK_0F)
  }
  for (let i = 0; i < size - buffer.length * 2; i++) {
    arrayBuffer[buffer.length * 2 + i] =
      (originImageBuffer?.[originIndex++] ?? MASK_FF) & MASK_F0
  }

  return {
    data: arrayBuffer,
    writeFile(path: string) {
      return sharp(arrayBuffer, {
        raw: { width, height, channels: 3 },
      }).toFile(path + '.png')
    },
  }
}

export async function decode(imagePath: string) {
  const buffer = await sharp(imagePath)
    .raw()
    .toBuffer({ resolveWithObject: true })
  let data = ''
  for (let i = 0; i < buffer.data.length; i++) {
    data += buffer.data[i].toString(16)[1]
  }
  data = Buffer.from(data, 'hex').toString('utf-8')
  return {
    data,
    writeFile(output: string) {
      return writeFile(data, output)
    },
  }
}
