import cac from 'cac'
import { encode, decode } from './lib'
import { readFile, writeFile } from 'node:fs/promises'

const cli = cac('lsb')

cli
  .command('encode [data]', '加密数据')
  .option('-i, --input [input]', '源图片地址')
  .option('-o, --output <output>', '加密图片保存地址')
  .option('-f, --file [file]', '源数据文件地址')
  .action(async (data, options) => {
    try {
      const { file, input, output } = options
      if (file) {
        data = await readFile(file)
      }
      if (!data) {
        throw new Error('加密数据不存在')
      }
      const { image } = await encode(data, { input })

      await image.write(`${output}.png`)
    } catch (error) {
      console.log(error)
    }
  })

cli
  .command('decode <input>', '解密图片地址')
  .option('-o, --output [output]', '源数据保存地址')
  .option('--log', '仅打印，不保存源数据')
  .action(async (input, options) => {
    const { output, log } = options
    const {data } = await decode(input)
    if (log) {
      console.log(data)
    } else {
      await writeFile(output, data, {
        encoding: 'utf-8',
      })
    }
  })

cli.help()

cli.parse()
