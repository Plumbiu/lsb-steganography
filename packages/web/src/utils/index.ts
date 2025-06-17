import { fileTypeFromBuffer } from 'file-type'

export async function arrayBufferToBlobUrl(arrayBuffer: ArrayBuffer) {
  const fileType = await fileTypeFromBuffer(arrayBuffer)

  const mimeType = fileType?.mime || 'application/octet-stream'
  const blob = new Blob([arrayBuffer], { type: mimeType })
  return URL.createObjectURL(blob)
}

export function isArrayBuffer(data: any): data is ArrayBuffer {
  return data instanceof ArrayBuffer
}
