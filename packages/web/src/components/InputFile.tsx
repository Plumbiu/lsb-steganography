import { Button } from 'antd'
import { useRef } from 'react'

function InputFile(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <Button onClick={() => inputRef.current?.click()}>
      {props.placeholder}
      <input {...props} type="file" hidden ref={inputRef}></input>
    </Button>
  )
}

export default InputFile
