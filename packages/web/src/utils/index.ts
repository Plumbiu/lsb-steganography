export function arrayBufferToBlobUrl(arrayBuffer: ArrayBuffer) {
  const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' })
  return URL.createObjectURL(blob)
}

export function isArrayBuffer(data: any): data is ArrayBuffer {
  return data instanceof ArrayBuffer
}