import { useRef, useState } from 'react'
import { decode, encode } from 'lsb-steganography'
import styles from './App.module.css'
import { Button, Image, Radio } from 'antd'
import InputFile from './components/InputFile'
import TextArea from 'antd/es/input/TextArea'
import {
  arrayBufferToBlobUrl,
  getDownloadName,
  getFileType,
  isArrayBuffer,
} from './utils'
import Link from 'antd/es/typography/Link'
import { Jimp } from 'jimp'

function App() {
  const [inputType, setInputType] = useState<'text' | 'file'>('file')
  const [decodedType, setDecodedType] = useState<'text' | 'url'>('url')
  const [originBlobUrl, setOriginBlobUrl] = useState('')
  const [encodedBlobUrl, setEncodedBlobUrl] = useState('')
  const [decodedData, setDecodedData] = useState('')
  const [fileExt, setFileExt] = useState('')

  const originArrayBufferRef = useRef<ArrayBuffer | null>(null)
  const encodedOriginArrayBufferRef = useRef<ArrayBuffer | null>(null)
  const inputRef = useRef<ArrayBuffer | string | null>(null)

  const selectOriginImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        if (isArrayBuffer(e.target?.result)) {
          if (originBlobUrl) {
            URL.revokeObjectURL(originBlobUrl)
          }
          const blobUrl = await arrayBufferToBlobUrl(e.target.result)
          setOriginBlobUrl(blobUrl)
          originArrayBufferRef.current = e.target.result
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const selectEncodedImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const result = e.target?.result
        if (isArrayBuffer(result)) {
          const image = await Jimp.fromBuffer(result)
          if (originBlobUrl) {
            URL.revokeObjectURL(originBlobUrl)
          }
          encodedOriginArrayBufferRef.current = await image.getBuffer(
            'image/png',
          )
          const blobUrl = await arrayBufferToBlobUrl(result)
          setEncodedBlobUrl(blobUrl)
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const selectInputFileData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const buffer = e.target?.result as ArrayBuffer | string
        inputRef.current = buffer
      }
      if (inputType === 'text') {
        reader.readAsText(file)
        setDecodedType('text')
      } else if (inputType === 'file') {
        reader.readAsArrayBuffer(file)
        setDecodedType('url')
      }
    }
  }

  async function handleEncode() {
    if (inputRef.current && originArrayBufferRef.current) {
      const { image } = await encode(inputRef.current, {
        input: originArrayBufferRef.current,
      })
      encodedOriginArrayBufferRef.current = await image.getBuffer('image/png')
      if (encodedBlobUrl) {
        URL.revokeObjectURL(encodedBlobUrl)
      }
      const blobUrl = await arrayBufferToBlobUrl(
        encodedOriginArrayBufferRef.current,
      )
      setEncodedBlobUrl(blobUrl)
    }
  }

  async function handleDecode() {
    if (encodedOriginArrayBufferRef.current) {
      const { data } = await decode(encodedOriginArrayBufferRef.current)
      if (decodedType === 'text') {
        const textDecoder = new TextDecoder('utf-8')
        const text = textDecoder.decode(data)
        setFileExt('.txt')
        setDecodedData(text)
      } else if (decodedType === 'url') {
        const url = await arrayBufferToBlobUrl(data)
        const { ext } = await getFileType(data)
        console.log({ ext })
        setFileExt('.' + ext)
        setDecodedData(url)
      }
    }
  }

  return (
    <div className={styles.app}>
      <div className={styles.encodeContainer}>
        <h1>Encode</h1>
        <div>
          {originBlobUrl && (
            <>
              <h3>源图片</h3>
              <Image width={360} src={originBlobUrl} />
            </>
          )}
        </div>
        <div>
          <h3>选择源图片</h3>
          <InputFile
            hidden
            placeholder="选择源图片"
            onChange={selectOriginImage}
          />
        </div>
        <div>
          <h3>选择加密数据</h3>
          <Radio.Group
            value={inputType}
            onChange={(e) => setInputType(e.target.value)}
          >
            <Radio value="text">文本</Radio>
            <Radio value="file">文件</Radio>
          </Radio.Group>
          <div className={styles.inputDataContainer}>
            {inputType === 'text' ? (
              <TextArea
                placeholder="加密数据"
                autoSize={{ minRows: 6, maxRows: 6 }}
                onChange={(e) => (inputRef.current = e.target.value)}
              />
            ) : (
              <InputFile
                placeholder="上传加密数据文件"
                onChange={selectInputFileData}
              />
            )}
          </div>
        </div>
        <div>
          <Button type="primary" onClick={handleEncode}>
            Encode
          </Button>
        </div>
      </div>
      <div className={styles.decodeContainer}>
        <h2>Decode</h2>

        <div>
          <h3>选择Decode类型</h3>
          <Radio.Group
            value={decodedType}
            onChange={(e) => setDecodedType(e.target.value)}
          >
            <Radio value="text">文本</Radio>
            <Radio value="url">下载</Radio>
          </Radio.Group>
        </div>
        <div>
          {encodedBlobUrl && (
            <>
              <h3>加密图片</h3>
              <Image width={360} src={encodedBlobUrl} />
            </>
          )}
        </div>
        <div>
          <h3>选择加密文件</h3>
          <InputFile
            placeholder="上传加密数据文件"
            onChange={selectEncodedImage}
          />
        </div>
        {decodedData && (
          <div>
            {decodedType === 'url' && (
              <Link
                href={decodedData}
                download={`${getDownloadName(decodedData)}${fileExt}`}
                target="_blank"
              >
                点击链接访问
              </Link>
            )}
            {decodedType === 'text' && <pre>{decodedData}</pre>}
          </div>
        )}

        <div>
          <Button type="primary" onClick={handleDecode}>
            Decode
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App
