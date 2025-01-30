import type { Tags } from 'exifreader';
import { type VNode, ref } from 'vue';
import { getExif } from './exif';
import type { Settings, SettingsField } from '@/types';
import CoRenderVue from '@renderer/views/components/co-render.vue';

export class CoPic {
  id = Math.random();
  name = Math.random().toString();
  imgUrl!: string;
  private file!: File;
  colorPalette: number[][] = [];
  private settings!: Settings;
  private vNode: (() => VNode) | null = null;

  private initPromise: Promise<void[]> | null = null;

  private exif?: Tags;
  isLoaded = ref(false);

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
    this.asyncLoad();
  }

  getSettings() {
    return this.settings;
  }

  getExif() {
    return this.exif;
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

  private renderNode() {
    this.asyncLoad();
    return () => {
      if (this.isLoaded.value)
        return <CoRenderVue imgUrl={this.imgUrl} settings={this.settings} exif={this.exif} />;
      return <Loading imgUrl={this.imgUrl} />;
    };
  }

  private async loadExif() {
    if (!this.exif) {
      this.exif = await getExif(this.file);
      // this.imgInfo = toImgInfo(this.exif)
    }
    console.log(this.exif);

    // return this.exif
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
