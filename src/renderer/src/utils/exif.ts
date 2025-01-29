// import Exif from 'exif-js'
import ExifReader from 'exifreader';
// import piexif from 'piexifjs';
export { ImageIFD, TAGS, type ExifDict } from 'piexifjs';
// export type ExifDict = piexif.ExifDict

// window.n = window.n ?? undefined

export async function getExif(file: File) {
  // console.log(ExifReader.load(file))
  // console.log(piexif.load(Buffer.from(await file.arrayBuffer()).toString('binary')))

  // const reader = new FileReader()
  // // return new Promise<piexif.ExifDict>((resolve) => {
  //   reader.onload = (e) => {
  //     const data = e.target!.result as string
  //     // console.log(data)

  //     const exifData = piexif.load(data)
  //     // resolve(exifData)
  //     console.log(exifData);

  //   }
  //   reader.readAsDataURL(file)
  // })
  return ExifReader.load(file);

  // return new Promise<Metadata | undefined>((resolve) => {
  //   const res = Exif.getData(file as any, function () {
  //     // eslint-disable-next-line ts/ban-ts-comment
  //     // @ts-expect-error
  //     const res = Exif.getAllTags(this)
  //     resolve(res)
  //   })
  //   !res && resolve(undefined)
  // })
}
