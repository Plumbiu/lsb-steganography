import { useRef, useState } from 'react'
import { decode, encode } from 'lsb-steganography'

function App() {
  const [base64, setBase64] = useState('')
  const [decodedData, setDecodedData] = useState('')
  const originArrayBuffer = useRef<ArrayBuffer | null>(null)
  const inputRef = useRef('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        originArrayBuffer.current = e.target?.result as ArrayBuffer
      }
      reader.readAsArrayBuffer(file)
    }
  }

  function handleDataChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        inputRef.current = e.target?.result as string
      }
      reader.readAsText(file)
    }
  }

  async function handleEncode() {
    console.log(inputRef.current, originArrayBuffer.current)
    if (inputRef.current && originArrayBuffer.current) {
      const { image } = await encode(inputRef.current, {
        input: originArrayBuffer.current,
      })
      const base64 = await image.getBase64('image/png')
      setBase64(base64)
    }
  }

  function handleDecode() {
    if (originArrayBuffer.current) {
      decode(originArrayBuffer.current).then(({ data }) => {
        setDecodedData(data)
      })
    }
  }

  return (
    <>
      <div>
        <h2>Encode</h2>
        {!!base64 && <img src={base64} />}
        <input
          placeholder="选择加密图片"
          type="file"
          onChange={handleFileChange}
        />
        <input placeholder="加密数据" type="file" onChange={handleDataChange} />
        <button onClick={handleEncode}>encode</button>
      </div>
      <div>
        <h2>Decode</h2>
        <button onClick={handleDecode}>decode</button>
        <pre>{decodedData}</pre>
      </div>
    </>
  )
}

export default App
