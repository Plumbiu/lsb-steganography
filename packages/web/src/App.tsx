import { useRef, useState } from 'react'
import { decode, encode } from 'lsb-steganography'
import styles from './App.module.css'
import { Button, Radio } from 'antd'
import InputFile from './components/InputFile'
import TextArea from 'antd/es/input/TextArea'

function App() {
  const [inputType, setInputType] = useState<'text' | 'file'>('text')
  const [decodedType, setDecodedType] = useState<'text' | 'file'>('text')

  const [originBase64, setOriginBase64] = useState('')
  const [encodedBase64, setEncodedBase64] = useState('')
  const [decodedData, setDecodedData] = useState('')
  const originArrayBuffer = useRef<ArrayBuffer | null>(null)
  const encodedOriginArrayBuffer = useRef<ArrayBuffer | null>(null)

  const inputRef = useRef<ArrayBuffer | string | null>(null)

  const selectOriginImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const buffer = e.target?.result as ArrayBuffer
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
        setOriginBase64(base64)
        originArrayBuffer.current = buffer
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const selectInputData = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        // 图片文件
        if (
          file.type === 'image/png' ||
          file.type === 'image/jpeg' ||
          file.type === 'image/jpg' ||
          file.type === 'image/gif' ||
          file.type === 'image/bmp' ||
          file.type === 'image/webp' ||
          file.type === 'image/svg+xml'
        ) {
          reader.readAsArrayBuffer(file)
          setDecodedType('file')
        } else {
          reader.readAsText(file)
          setDecodedType('text')
        }
      }
    }
  }

  async function handleEncode() {
    if (inputRef.current && originArrayBuffer.current) {
      const { image } = await encode(inputRef.current, {
        input: originArrayBuffer.current,
      })
      encodedOriginArrayBuffer.current = await image.getBuffer('image/png')
      const base64 = await image.getBase64('image/png')
      setEncodedBase64(base64)
    }
  }

  async function handleDecode() {
    if (encodedOriginArrayBuffer.current) {
      const { data } = await decode(encodedOriginArrayBuffer.current)
      if (decodedType === 'text') {
        const textDecoder = new TextDecoder('utf-8')
        const text = textDecoder.decode(data)
        setDecodedData(text)
      } else if (decodedType === 'file') {
        const blob = new Blob([data.buffer], {
          type: 'application/octet-stream',
        })
        const url = URL.createObjectURL(blob)
        setDecodedData(url)
      }
    }
  }

  return (
    <>
      <div className={styles.encodeContainer}>
        <h2>Encode</h2>
        <div className={styles.imageContainer}>
          <div>
            {originBase64 && (
              <>
                <div>源图片</div>
                <img
                  width={100}
                  src={`data:image/png;base64,${originBase64}`}
                />
              </>
            )}
          </div>
          <div>
            {encodedBase64 && (
              <>
                <div>加密图片</div>
                <img width={100} src={encodedBase64} />
              </>
            )}
          </div>
        </div>
        <div>
          <InputFile
            hidden
            placeholder="选择源图片"
            onChange={selectOriginImage}
          />
        </div>
        <div>
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
                onChange={(e) => (inputRef.current = e.target.value)}
              />
            ) : (
              <InputFile
                placeholder="上传加密数据文件"
                onChange={selectInputData}
              />
            )}
          </div>
        </div>
        <div>
          <Button type="primary" onClick={handleEncode}>
            encode
          </Button>
        </div>
      </div>
      <div>
        <h2>Decode</h2>
        <button onClick={handleDecode}>decode</button>
        {decodedType === 'text' ? (
          <pre>{decodedData}</pre>
        ) : (
          <div>
            <img width={100} src={decodedData} />
          </div>
        )}
      </div>
    </>
  )
}

export default App
