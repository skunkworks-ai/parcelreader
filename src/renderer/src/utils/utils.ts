export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const getParcelByWeight = (weight, parcelRanges): any => {
  return (
    parcelRanges.find((p) => {
      const minOK = p.min_inclusive ? weight >= p.min : weight > p.min

      const maxOK =
        p.max === null
          ? true // open-ended
          : p.max_inclusive
            ? weight <= p.max
            : weight < p.max

      return minOK && maxOK
    }) || null
  ) // no match
}

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
  })

// Utility to fetch a frame from a stream URL and return as File
export async function getBaseImageFileFromStream(streamUrl: string): Promise<File> {
  // Create an offscreen image and canvas to grab a frame
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('No 2D context')
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Failed to get blob'))
            const file = new File([blob], 'frame.jpg', { type: 'image/jpeg' })
            resolve(file)
          },
          'image/jpeg',
          0.92
        )
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = (err) => reject(err)
    img.src = streamUrl + (streamUrl.includes('?') ? '&' : '?') + 't=' + Date.now()
  })
}
