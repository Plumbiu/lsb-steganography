import { Jimp, type JimpInstance } from 'jimp'

type Input = string | ArrayBuffer

interface EncodeOptions {
  input?: Input
}

const MASK_0F = 0x0f
const MASK_F0 = 0xf0
const MASK_FF = 0xff

export async function encode(
  str: Input,
  { input }: EncodeOptions,
): Promise<{
  image: JimpInstance
}> {
  const textEncoder = new TextEncoder()
  const buffer = typeof str === 'string' ? textEncoder.encode(str) : new Uint8Array(str)
  let image: JimpInstance | null = null
  let width = 0
  let height = 0

  async function getJimpInstance() {
    if (typeof input === 'string') {
      return await Jimp.read(input)
    }
    if (input instanceof ArrayBuffer) {
      return Jimp.fromBuffer(input)
    }
  }
  if (input) {
    const jimp = await getJimpInstance()
    if (!jimp) {
      throw new Error('Invalid input')
    }
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
      color: 0xf0f0f0f0,
      width,
      height,
    })
  }
  if (!image) {
    throw new Error('Invalid input')
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
    image,
  }
}

export async function decode(input: Input) {
  const textDecoder = new TextDecoder('utf-8')
  const jimpInput =
    typeof input === 'string'
      ? await Jimp.read(input)
      : await Jimp.fromBuffer(input)
  const buffer = jimpInput.bitmap.data
  const array = new Uint8Array(buffer.length)
  for (let i = 0; i < buffer.length; i += 2) {
    array[i] = ((buffer[i] & MASK_0F) << 4) + (buffer[i + 1] & MASK_0F)
  }
  const data = textDecoder.decode(array)
  return {
    data,
  }
}
