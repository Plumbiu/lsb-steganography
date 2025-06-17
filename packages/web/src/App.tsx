import { useRef, useState } from 'react'
import { decode, encode } from 'lsb-steganography'
import styles from './App.module.css'
import { Button, Image, Radio } from 'antd'
import InputFile from './components/InputFile'
import TextArea from 'antd/es/input/TextArea'
import { arrayBufferToBlobUrl, isArrayBuffer } from './utils'
import Link from 'antd/es/typography/Link'

function App() {
  const [inputType, setInputType] = useState<'text' | 'file'>('text')
  const [decodedType, setDecodedType] = useState<'text' | 'url'>('text')
  const [originBlobUrl, setOriginBlobUrl] = useState('')
  const [encodedBlobUrl, setEncodedBlobUrl] = useState('')
  const [decodedData, setDecodedData] = useState('')

  const originArrayBuffer = useRef<ArrayBuffer | null>(null)
  const encodedOriginArrayBuffer = useRef<ArrayBuffer | null>(null)
  const inputRef = useRef<ArrayBuffer | string | null>(null)

  const selectOriginImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        if (isArrayBuffer(e.target?.result)) {
          const blobUrl = await arrayBufferToBlobUrl(e.target.result)
          setOriginBlobUrl(blobUrl)
          originArrayBuffer.current = e.target.result
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
    if (inputRef.current && originArrayBuffer.current) {
      const { image } = await encode(inputRef.current, {
        input: originArrayBuffer.current,
      })
      encodedOriginArrayBuffer.current = await image.getBuffer('image/png')
      const blobUrl = await arrayBufferToBlobUrl(encodedOriginArrayBuffer.current)
      setEncodedBlobUrl(blobUrl)
    }
  }

  async function handleDecode() {
    if (encodedOriginArrayBuffer.current) {
      const { data } = await decode(encodedOriginArrayBuffer.current)
      if (decodedType === 'text') {
        const textDecoder = new TextDecoder('utf-8')
        const text = textDecoder.decode(data)
        setDecodedData(text)
      } else if (decodedType === 'url') {
        const blob = new Blob([data.buffer], {
          type: 'application/octet-stream',
        })
        const url = URL.createObjectURL(blob)
        setDecodedData(url)
      }
    }
  }

  return (
    <div className={styles.app}>
      <div className={styles.encodeContainer}>
        <h1>Encode</h1>
        <div className={styles.imageContainer}>
          <div>
            {originBlobUrl && (
              <>
                <div>源图片</div>
                <Image width={360} src={originBlobUrl} />
              </>
            )}
          </div>
          <div>
            {encodedBlobUrl && (
              <>
                <div>加密图片</div>
                <Image width={360} src={encodedBlobUrl} />
              </>
            )}
          </div>
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
          <Button type="primary" onClick={handleDecode}>
            Decode
          </Button>
        </div>
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
        {decodedData && (
          <div>
            {decodedType === 'url' && (
              <Link href={decodedData} target="_blank">
                点击链接访问
              </Link>
            )}
            {decodedType === 'text' && <pre>{decodedData}</pre>}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
