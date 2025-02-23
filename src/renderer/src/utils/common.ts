import type { Style } from '@renderer/types';
import type { Tags } from 'exifreader';
import type { CSSProperties } from 'vue';
import { parse } from 'csv-parse/browser/esm';

export function transToPx(val: string | number, relativeSize: number) {
  if (typeof val === 'string' && /^\d+(?:\.\d+)?$/.test(val))
    val = Number(val);

  if (typeof val === 'number') {
    if (val < 1 && val > 0)
      return Math.round(val * relativeSize);

    return val;
  }
  if (/\d+(?:\.\d+)?%$/.test(val))
    return Math.round((Number(val.replace('%', '')) / 100) * relativeSize);

  return Math.round(Number(val.replace(/\d+/g, '')));
}

export function toImgInfo(exif: Tags) {
  const {
    PixelXDimension,
    PixelYDimension,
    Orientation,
    FocalLength,
    ExposureTime,
    ISOSpeedRatings,
    FNumber,
    Make,
    Model,
    WhiteBalance,
    'Image Width': ImageWidth,
    'Image Height': ImageHeight,
    'Device Manufacturer': DeviceManufacturer,
    LensModel,
  } = exif;

  const getVal = (val: any) => {
    if (Array.isArray(val))
      return val.reduce((p, c) => p / c);
    return `${val ?? 0}`;
  };

  const res = {
    width: Number(PixelXDimension?.value || ImageWidth?.value || 0),
    height: Number(PixelYDimension?.value || ImageHeight?.value || 0),
    orientation: Number(Orientation?.value ?? 0),
    focalLength: Number(getVal(FocalLength?.value) ?? 0),
    exposureTime: ExposureTime?.description ?? '',
    iSOSpeedRatings: Number(ISOSpeedRatings?.value ?? 0),
    fNumber: Number(getVal(FNumber?.value) ?? 0),
    make: String(Make?.value ?? DeviceManufacturer?.value ?? ''),
    model: String(Model?.value ?? (LensModel?.value as string)?.split(' ').shift() ?? ''),
    whiteBalance: Number(WhiteBalance?.value ?? 0),
  };

  res.make = res.make
    .replace('CORPORATION', '')
    .replace('Camera AG', '')
    .replace('Digital Solutions', '')
    .trim();

  res.model = getMPModelName(res.model);

  res.model = res.model
    .replace('OM', 'OMOM')
    .replace(res.make, '')
    .replace('ILCE-', 'α')
    .replace(/z\s?/gi, 'ℤ')
    .replace('Digital Camera', '')
    .trim();

  return res;
}

export function checkMaxBlur(blur: number, canvasWidth: number, canvasHeight: number) {
  const maxBlur = Math.round(24000000 * (1 / (canvasWidth * canvasHeight)) * 1000);
  return Math.min(maxBlur, blur);
}

export function scaleSize<T extends object>(obj: T, scale: number): T {
  const res = {} as T;
  for (const key in obj) {
    let val = obj[key];
    if (typeof val === 'number') {
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-expect-error
      val *= scale;
    }

    res[key] = val;
  }

  return res;
}

export function getMakeLogoPath(make?: string) {
  const logoMap: Record<string, string> = {
    SONY: 'sony',
    Canon: 'canon',
    FUJIFILM: 'fujifilm',
    NIKON: 'nikon',
    Panasonic: 'lumix',
    Leica: 'leica',
    OM: 'olympus',
  };
  if (!make || !logoMap[make])
    return;

  const url = `/logo/${logoMap[make]}.svg`;
  return url;
}

export function loadMPModels() {
  const MPModels = localStorage.getItem('MPModels');
  if (MPModels)
    return JSON.parse(MPModels) as string[][];

  const url
    = 'https://raw.githubusercontent.com/KHwang9883/MobileModels-csv/refs/heads/main/models.csv';
  fetch(url)
    .then(res => res.text())
    .then((res) => {
      parse(res, {}, (err, data) => {
        if (!err && data)
          localStorage.setItem('MPModels', JSON.stringify(data));
      });
    });
  return [];
}

export function getMPModelName(model: string) {
  const mpModels = loadMPModels();
  return mpModels.find(([m]) => m === model)?.[6] ?? model;
}
loadMPModels();

export function fetchImage(url: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = function () {
      resolve(img);
    };
    img.onerror = function () {
      resolve(null);
    };
    img.src = url;
  });
}

export function getStyleFromMap(map: StylePropertyMapReadOnly) {
  return {
    color: map.get('color')?.toString(),
    fontSize: Number(
      map
        .get('font-size')
        ?.toString()
        .replace(/[^\d.]+/g, '') || 0,
    ),
  };
}

// 4k 3840×2160
// 2k 2560×1440
// 1080P 1920×1080
// 720P 1280×720
/**
 * 复合 style 转为 原生 style
 * @param style 复合 style
 * @returns 原生 style
 */
export function mapStyle(style?: Style) {
  if (!style) {
    return style;
  }
  const _style: CSSProperties = {};
  const { light, dark, horizontal, vertical, ...others } = style;
  Object.assign(_style, others);
  [light, dark, horizontal, vertical].forEach((_s) => {
    if (_s) {
      Object.assign(_style, _s);
    }
  });

  return _style;
}
