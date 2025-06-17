import { fileTypeFromBuffer, type FileTypeResult } from 'file-type'

export async function arrayBufferToBlobUrl(
  arrayBuffer: ArrayBuffer,
  mime?: string,
) {
  const blob = new Blob([arrayBuffer], {
    type: mime || 'application/octet-stream',
  })
  return URL.createObjectURL(blob)
}

export async function getFileType(
  arrayBuffer: ArrayBuffer,
): Promise<FileTypeResult> {
  const fileType = await fileTypeFromBuffer(arrayBuffer)
  if (fileType == null) {
    return {
      ext: 'txt',
      mime: 'application/octet-stream',
    }
  }
  return fileType
}

export function isArrayBuffer(data: any): data is ArrayBuffer {
  return data instanceof ArrayBuffer
}

export function getDownloadName(blobUrl: string) {
  const slashIndex = blobUrl.lastIndexOf('/')
  if (slashIndex === -1) {
    return blobUrl
  }
  return blobUrl.slice(slashIndex + 1)
}
