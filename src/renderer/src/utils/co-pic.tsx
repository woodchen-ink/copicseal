import type { Tags } from 'exifreader';
import type { Properties } from 'csstype';
import { type CSSProperties, type VNode, ref } from 'vue';
import ColorThief from 'colorthief';
import { ExifDict, getExif } from './exif';
import {
  checkMaxBlur,
  fetchImage,
  getMakeLogoPath,
  getStyleFromMap,
  scaleSize,
  toImgInfo,
  transToPx
} from './common';
import type { Settings, SettingsField } from '@/types';
import CoRenderVue from '@renderer/views/components/co-render.vue';

const temp: SettingsField = {
  type: 'container',
  markTo: 'mark',
  style: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: '10%',
    paddingRight: '10%',
    fontSize: '10%',
    overflow: 'hidden'
  },
  children: [
    {
      type: 'container',
      style: {
        display: 'flex',
        alignItems: 'flex-end'
      },
      children: [
        {
          type: 'image',
          style: {
            height: '1em'
          }
        },
        {
          type: 'text',
          expression: 'α7M4',
          style: {
            marginLeft: '5%',
            lineHeight: '1em',
            fontSize: '8%'
          }
        }
      ]
    },
    {
      type: 'text',
      expression: '70mm f/4 1/1000s ISO100',
      style: {
        fontSize: '5%'
      }
    }
  ]
};

console.log(temp);

// export interface Settings {
//   displays: {
//     enable: boolean
//     showModel: boolean
//     showMake: boolean
//     showParams: boolean
//     paramFormat: {
//       type: string
//       enable: boolean
//       format: string
//     }[]
//   }
//   bg: {
//     mode: string
//     color: string
//     image: {
//       blur: string
//       brightness: string
//     }
//     paddingX: string
//     paddingY: number
//   }
//   mark: {
//     height: number
//     bgColor: string
//     fontSize: number
//   }
//   fields?: SettingsField[]
// }

export class CoPic {
  id = Math.random();
  name = Math.random().toString();
  imgUrl!: string;
  bgImgUrl!: string;
  private file!: File;
  colorPalette: number[][] = [];
  private settings!: Settings;
  private parameterFields: SettingsField[] = [];
  private vNode: (() => VNode) | null = null;
  private domRect: {
    coPic: DOMRect;
    bg: DOMRect;
    imgWrap: DOMRect;
    img: DOMRect;
    mark: DOMRect;
    // makeModel: DOMRect
    // make: DOMRect
    // model: DOMRect
    // params: DOMRect
  } | null = null;

  private initPromise: Promise<void[]> | null = null;

  private exif?: Tags;
  isLoaded = ref(false);
  private imgInfo = {
    exposureTime: '0',
    iSOSpeedRatings: 0,
    fNumber: 0,
    make: '',
    model: '',
    focalLength: 0,
    whiteBalance: 0,
    width: 0,
    height: 0,
    orientation: 0
  };

  constructor(file: File) {
    this.file = file;
    this.imgUrl = URL.createObjectURL(file);
    this.name = file.name;
    this.init();
  }

  setSettings(settings: Partial<Settings>) {
    const fillId = (fields: SettingsField[]): SettingsField[] => {
      return fields.map((field) => {
        return {
          ...field,
          id: field.id || `_f_${Math.random().toString(32).slice(2)}`,
          children: field.children ? fillId(field.children) : undefined
        };
      });
    };

    this.settings = {
      ...this.settings,
      ...settings
    };
    this.settings.fields = fillId(this.settings.fields ?? []);
    this.isLoaded.value = false;
    this.vNode = null;
    this.domRect = null;
    this.asyncLoad();
  }

  getSettings() {
    return this.settings;
  }

  update() {
    if (!this.vNode) this.vNode = this.renderNode();
    return this.vNode;
  }

  private async init() {
    this.initPromise = Promise.all([this.loadExif(), this.getColorPalette()]);
    return this.initPromise;
  }

  private async asyncLoad() {
    await this.initPromise;
    // await Promise.all([this.genBgImg()])
    console.warn('isLoaded');

    this.isLoaded.value = true;
  }

  private updated(displayScale: number) {
    return async (dom: any) => {
      if (!dom || this.domRect) return;
      await new Promise((r) => setTimeout(r, 200));
      this.domRect = this.getLayoutSize(dom as HTMLDivElement, displayScale);
      this.getFieldsSize(dom as HTMLDivElement, displayScale);
    };
  }

  private getFieldsSize(rootEl: HTMLDivElement, displayScale: number) {
    function getSize(id?: string) {
      const el = id ? rootEl.querySelector(`[data-field="${id}"]`)! : rootEl;
      const rect: DOMRect = el.getBoundingClientRect().toJSON();
      if (id) {
        const r = rootEl.getBoundingClientRect();
        rect.x -= r.x;
        rect.y -= r.y;
      } else {
        rect.x = 0;
        rect.y = 0;
      }
      // console.log('getSize', 1 / displayScale, getStyleFromMap(el.computedStyleMap()), el)

      return {
        rect: scaleSize(rect, 1 / displayScale),
        style: scaleSize(getStyleFromMap(el.computedStyleMap()), 1 / displayScale)
      };
    }
    const fillSize = (fields: SettingsField[]) => {
      fields.forEach((field) => {
        this.parameterFields.push();
        field.__CO__ = getSize(field.id);
        if (field.children) fillSize(field.children);
      });
    };
    if (this.settings.fields) fillSize(this.settings.fields);

    console.log(this.settings.fields);
  }

  private getLayoutSize(rootEl: HTMLDivElement, displayScale: number) {
    function getSize(selectors?: string) {
      const el = selectors ? rootEl.querySelector(selectors)! : rootEl;
      const rect = el.getBoundingClientRect().toJSON();
      if (selectors) {
        const r = rootEl.getBoundingClientRect();
        rect.x -= r.x;
        rect.y -= r.y;
      } else {
        rect.x = 0;
        rect.y = 0;
      }
      return scaleSize(rect, 1 / displayScale);
    }

    return {
      coPic: getSize(),
      bg: getSize('.bg'),
      imgWrap: getSize('.img-wrap'),
      img: getSize('.img-wrap .img'),
      mark: getSize('.img-wrap .mark')
      // makeModel: getSize('.img-wrap .mark .make-model'),
      // make: getSize('.img-wrap .mark .make-model .make'),
      // model: getSize('.img-wrap .mark .make-model .model'),
      // params: getSize('.img-wrap .mark .params'),
    };
  }

  private renderNode() {
    this.asyncLoad();
    return () => {
      if (this.isLoaded.value)
        return <CoRenderVue imgUrl={this.imgUrl} settings={this.settings} exif={this.exif} />;
      return <Loading imgUrl={this.imgUrl} />;
    };
  }

  async renderToCanvas(canvasEl: HTMLCanvasElement) {
    if (!this.domRect) return;
    const { coPic } = this.domRect;

    canvasEl.width = coPic.width;
    canvasEl.height = coPic.height;

    const ctx = canvasEl.getContext('2d')!;

    const renderImg = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
      if (!this.domRect) return;
      const { img: imgRect } = this.domRect;
      ctx.drawImage(img, imgRect.x, imgRect.y, imgRect.width, imgRect.height);
    };

    const renderMark = async (ctx: CanvasRenderingContext2D) => {
      if (!this.domRect) return;
      const { mark } = this.domRect;
      ctx.fillStyle = 'white';
      ctx.fillRect(mark.x, mark.y, mark.width, mark.height);

      // const {
      //   markFontSize,
      // } = this.calcSize()

      // const makeLogoPath = getMakeLogoPath(this.imgInfo.make)
      // if (makeLogoPath) {
      //   const img = new Image()
      //   await new Promise((resolve) => {
      //     img.onload = () => {
      //       ctx.drawImage(img, make.x, make.y, make.width, make.height)
      //       resolve(undefined)
      //     }
      //     img.src = makeLogoPath
      //   })
      // }
      // else {
      //   ctx.font = `${markFontSize}px "PingFang SC"`
      //   ctx.textBaseline = 'middle'
      //   ctx.fillStyle = '#000'
      //   ctx.fillText(this.imgInfo.make, make.x, make.y + make.height / 2)
      // }

      // fetch(getMakeLogoPath()).then(res => res.text())
      //   .then((rawSVG) => {
      //     rawSVG = rawSVG.replace('currentColor', 'red')
      //     const svg = new Blob([rawSVG], { type: 'image/svg+xml;charset=utf-8' })
      //     const url = URL.createObjectURL(svg)
      //     const img = new Image()

      //     img.onload = function () {
      //       ctx.drawImage(img, make.x, make.y, make.width, make.height)
      //       URL.revokeObjectURL(url)
      //     }

      //     img.src = url
      //   })

      // ctx.font = `${markFontSize * 0.6}px "PingFang SC"`
      // ctx.textBaseline = 'middle'
      // ctx.fillStyle = '#000'
      // ctx.fillText((this.imgInfo.model), model.x, model.y + model.height / 2)

      // ctx.font = `${markFontSize * 0.5}px "PingFang SC"`
      // ctx.fillText(this.getParamInfo(), params.x, params.y + params.height / 2)
    };

    const renderImgWrap = (ctx: CanvasRenderingContext2D) => {
      if (!this.domRect) return;
      const { imgWrap } = this.domRect;
      // 设置阴影效果
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // 阴影颜色
      ctx.shadowBlur = 400; // 阴影模糊程度
      ctx.shadowOffsetX = 0; // 阴影 X 偏移量
      ctx.shadowOffsetY = 0; // 阴影 Y 偏移量

      ctx.fillStyle = 'white';
      ctx.fillRect(imgWrap.x, imgWrap.y, imgWrap.width, imgWrap.height);

      // 清除阴影效果
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };

    const renderBg = async (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
      if (!this.domRect || this.settings.bg.mode === 'none') return;
      const { bg } = this.domRect;
      const { canvasWidth, canvasHeight } = this.calcSize();
      const imgW = img.width;
      const imgH = img.height;

      if (this.settings.bg.mode === 'color') {
        ctx.fillStyle = this.settings.bg.color || 'rgba(255, 255, 255, 0)';
        ctx.fillRect(0, 0, bg.width, bg.height);
        return;
      }

      if (this.bgImgUrl) {
        const bgImg = await fetchImage(this.bgImgUrl);
        if (!bgImg) return;

        // const blur = checkMaxBlur(Math.round(imgW * 0.036), canvasWidth, canvasHeight)
        // console.log('blur, ', blur)

        // ctx.clearRect(0, 0, bg.width, bg.height)
        // ctx.drawImage(img, 0, -(bg.width / imgW * imgH - bg.height) / 2, bg.width, bg.width / imgW * imgH)
        ctx.filter = `brightness(140%)`; // blur(${blur}px)` // 设置模糊程度
        ctx.drawImage(
          bgImg,
          bg.x,
          -((bg.width / imgW) * imgH - bg.height) / 2,
          bg.width,
          (bg.width / imgW) * imgH
        );
        ctx.filter = 'none';
        // ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
        // ctx.fillRect(0, 0, bg.width, bg.height)
      } else {
        const blur = checkMaxBlur(Math.round(imgW * 0.036), canvasWidth, canvasHeight);
        // console.log('blur, ', blur)
        // ctx.drawImage(img, 0, -(bg.width / imgW * imgH - bg.height) / 2, bg.width, bg.width / imgW * imgH)
        ctx.filter = `brightness(140%) blur(${blur}px)`; // 设置模糊程度
        ctx.drawImage(
          img,
          bg.x,
          -((bg.width / imgW) * imgH - bg.height) / 2,
          bg.width,
          (bg.width / imgW) * imgH
        );
        ctx.filter = 'none';
      }
    };

    const renderFields = async (fields: SettingsField[]) => {
      fields.forEach((field) => {
        // console.log(field.value)

        const { rect, style } = field.__CO__ ?? {};
        // console.log(style)

        if (field.type === 'text') {
          ctx.font = `${style?.fontSize ?? 0}px "PingFang SC"`;
          ctx.textBaseline = 'middle';
          ctx.fillStyle = style?.color || '#000';
          ctx.fillText(field.value ?? '', rect!.x, rect!.y + rect!.height / 2);
          // console.log('text', field.value)
        }
        if (field.children) renderFields(field.children);
      });
    };

    const img = await fetchImage(this.imgUrl);
    if (!img) return ctx;
    await renderBg(ctx, img);
    renderImgWrap(ctx);
    await renderMark(ctx);
    renderImg(ctx, img);
    await renderFields(this.settings.fields ?? []);

    return ctx;
  }

  async exportToImage(canvasEl?: HTMLCanvasElement) {
    canvasEl = canvasEl || document.createElement('canvas');
    if (await this.renderToCanvas(canvasEl)) {
      canvasEl.toBlob((blob) => {
        blob && window.open(URL.createObjectURL(blob), '_blank');
      });
    }
  }

  private async loadExif() {
    if (!this.exif) {
      this.exif = await getExif(this.file);
      // this.imgInfo = toImgInfo(this.exif)
    }
    console.log(this.exif);

    // return this.exif
  }

  private async genBgImg() {
    if (this.settings.bg.mode !== 'image') return;

    // const { canvasWidth } = this.calcSize()
    // const [url] = await filterImage(this.file, Math.round(canvasWidth * 0.02))
    // if (!url)
    //   console.warn('ffmpeg: filter image fail.')

    // this.bgImgUrl = URL.createObjectURL(this.file)
  }

  protected calcSize() {
    const imgInfo = toImgInfo(this.exif!);
    let { width: imgWidth = 0, height: imgHeight = 0, orientation = 1 } = imgInfo;
    if ([5, 6, 7, 8].includes(Number(orientation))) {
      const temp = imgHeight;
      imgHeight = imgWidth;
      imgWidth = temp;
    }

    const { bg, mark } = this.settings;
    const blur = transToPx(this.settings.bg.image.blur, imgWidth);
    const bgPaddingY = transToPx(this.settings.bg.paddingY, imgWidth);
    const bgPaddingX = transToPx(this.settings.bg.paddingX, imgWidth);
    const markHeight = transToPx(this.settings.mark.height, imgWidth);
    const markFontSize = transToPx(this.settings.mark.fontSize, imgWidth);

    let canvasWidth = 0;
    let canvasHeight = 0;
    if (bg.mode === 'none') {
      canvasWidth = imgWidth;
      canvasHeight = imgHeight + markHeight;
    } else {
      // 计算画布大小
      if (imgWidth / imgHeight < 16 / 9) {
        canvasHeight = imgHeight + bgPaddingY * 2 + markHeight;
        canvasWidth = Math.round(canvasHeight * (16 / 9));
      } else {
        canvasWidth = imgWidth + bgPaddingX * 2;
        canvasHeight = Math.round(canvasWidth * (9 / 16));
      }
    }

    return {
      canvasWidth,
      canvasHeight,
      imgWidth,
      imgHeight,
      markHeight,
      markFontSize,
      previewWidth: window.innerWidth - 280,
      previewHeight: window.innerHeight - 280,
      blurSize: Math.round(blur)
    };
  }

  private getParamInfo() {
    const { focalLength, fNumber, exposureTime, iSOSpeedRatings } = this.imgInfo;

    return [
      focalLength && `${focalLength}mm`,
      fNumber && `f/${fNumber}`,
      exposureTime && `${exposureTime}s`,
      iSOSpeedRatings && `ISO${iSOSpeedRatings}`
    ]
      .filter(Boolean)
      .join(' ');
  }

  protected async getColorPalette() {
    // if (this.colorPalette.length) return
    // const img = await fetchImage(this.imgUrl)
    // if (img) {
    //   const colorThief = new ColorThief()
    //   const res = await colorThief.getPalette(img, 3)
    //   this.colorPalette = res || [[255, 255, 255]]
    //   this.settings.bg.color =
    //     `#${this.colorPalette[0].map((it) => it.toString(16).padStart(2, '0')).join('')}`.toUpperCase()
    // }
    console.warn('getColorPalette');
  }
}

function Loading(props: { imgUrl: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#eee',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '-20px',
          backgroundImage: `url(${props.imgUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          opacity: 0.4,
          filter: `brightness(0.4) blur(${20}px)`
        }}
      ></div>
      <span
        style={{
          position: 'relative'
        }}
      >
        加载中（页面可能会卡顿）...
      </span>
    </div>
  );
}

function fieldToVNode(this: CoPic, fields: SettingsField[]) {
  return fields.map((field) => {
    field = transFieldStyle.call(this, field);

    return (
      <div
        data-field={field.id}
        style={{
          ...field.style
        }}
      >
        {field.children ? fieldToVNode.call(this, field.children) : field.value}
      </div>
    );
  });
}

function getMarkToMark(this: CoPic) {
  const { fields = [] } = this.getSettings();
  console.log('getMarkToMark', fields);

  return fields
    .filter(({ markTo }) => markTo === 'mark')
    .map((field) => {
      field = transFieldStyle.call(this, field);

      return (
        <div
          data-field={field.id}
          style={{
            position: 'absolute',
            inset: 0,
            ...field.style
          }}
        >
          {field.children ? fieldToVNode.call(this, field.children) : field.value}
        </div>
      );
    });
}

function transFieldStyle(this: CoPic, field: SettingsField): SettingsField {
  const style: Properties = {
    ...field.style
  };
  const { imgWidth, previewWidth, canvasWidth, canvasHeight, previewHeight } = this.calcSize();
  const displayScale = Math.min(previewHeight / canvasHeight, previewWidth / canvasWidth);

  if (field.style) {
    for (const k in field.style) {
      const key = k as keyof Properties;
      const val = field.style[key];
      if (typeof val === 'string' && /\d%$/g.test(val))
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-expect-error
        style[key] = `${transToPx(val, imgWidth) * displayScale}px`;
    }
  }

  return {
    ...field,
    style
  };
}
