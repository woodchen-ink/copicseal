<script lang="tsx">
import {
  onMounted,
  onBeforeUnmount,
  ref,
  computed,
  defineComponent,
  type CSSProperties,
  PropType
} from 'vue';
import { Settings } from '../../types';
import { mapStyle } from '@renderer/utils/common';
import { Tags } from 'exifreader';
import TplDefault from '../tpls/tpl-default.vue';
import { renderUtils } from '@renderer/utils/render';

console.log(TplDefault);

const res = () => import('../tpls/tpl-default.vue');
console.log(res);

export default defineComponent({
  props: {
    imgUrl: {
      type: String,
      required: true
    },
    settings: {
      type: Object as PropType<Settings>,
      required: true
    },
    exif: {
      type: Object as PropType<Tags>,
      required: true
    }
  },
  setup(props) {
    const isHorizontal = ref(true);
    const sizeRatio = ref(0);
    const bgStyle = computed<CSSProperties>(() => {
      const { mode, style, padding } = props.settings.background;

      return {
        position: 'relative',
        zIndex: 0,
        padding: mode === 'none' ? 0 : (padding ?? []).map((i: number) => `${i}rem`).join(' '),
        overflow: 'hidden',
        ...mapStyle(style)
      };
    });

    const bgImgStyle = computed<CSSProperties>(() => {
      const { mode, style, padding, image, color } = props.settings.background;

      if (mode === 'none') {
        return {};
      }

      return {
        zIndex: -1,
        position: 'absolute',
        inset: '-' + padding?.[0] + 'rem',
        background: mode === 'image' ? `url(${props.imgUrl})` : color?.rgba,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter:
          mode === 'image' ? image?.filters?.map((it) => `${it.type}(${it.value})`).join(' ') : '',
        pointerEvents: 'none',
        ...mapStyle(style)
      };
    });

    const isLoading = ref(true);
    const el = ref<HTMLDivElement>();
    const bgEl = ref<HTMLDivElement>();
    // const [ow, oh] = [1280, 720]

    onMounted(async () => {
      setTimeout(() => {
        handleCalcSize();
      }, 200);
    });

    const offWinResize = window.api.onWinResized(() => {
      setTimeout(() => {
        handleCalcSize();
      }, 20);
    });
    onBeforeUnmount(() => {
      offWinResize();
    });

    // function formatExpression(expression: string | undefined, data: Tags) {
    //   if (!expression) return '';
    //   return expression.replace(/\${(\w+)}/g, (_, key) => data[key]?.description || '');
    // }

    const accessedKeys = new Set<string>();
    const handler = {
      get(target: Record<string, string>, key: string) {
        accessedKeys.add(key);
        console.log('2Accessed keys:', Array.from(accessedKeys));

        return target[key];
      }
    };
    const info = new Proxy(
      Object.keys(props.exif).reduce(
        (acc, key) => {
          acc[key] = props.exif[key].description || '';
          return acc;
        },
        {} as Record<string, string>
      ),
      handler
    );

    function render() {
      // const { fields } = props.settings;

      // return fields.map((field) => renderNode(field, true));

      return <TplDefault utils={renderUtils} info={info} imgUrl={props.imgUrl} />;
    }

    // function renderNode(field: SettingsField, isRoot = false) {
    //   if (field.type === 'container') {
    //     return (
    //       <div class={{ root: isRoot }} style={field.style}>
    //         {field.children?.map((f) => renderNode(f))}
    //       </div>
    //     );
    //   }
    //   if (field.type === 'main-image') {
    //     // return (
    //     //   <div
    //     //     class="main-image"
    //     //     style={{ ...field.style, backgroundImage: `url(${props.imgUrl})`, backgroundSize: 'cover' }}
    //     //   ></div>
    //     // )
    //     return (
    //       <img class="main-image" style={{ ...field.style, display: 'block' }} src={props.imgUrl} />
    //     );
    //   }
    //   if (field.type === 'text') {
    //     return <div style={field.style}>{formatExpression(field.expression, props.exif)}</div>;
    //   }
    //   return field.type;
    // }

    function handleCalcSize() {
      const wrapperEl = el.value?.parentElement?.parentElement;
      console.log(el.value, bgEl.value, wrapperEl);
      if (el.value && bgEl.value && wrapperEl) {
        const { width, height } = wrapperEl.getBoundingClientRect();
        calcSize(el.value, bgEl.value, [width, height]);
        // calcSize(el.value, bgEl.value, [1280, 720])
        // console.log(wrapperEl, [width, height])
      }
    }

    async function calcSize(
      _wrapper: HTMLDivElement,
      containerEl: HTMLDivElement,
      [ow, oh]: number[]
    ) {
      containerEl.style.width = '';
      containerEl.style.height = '';
      containerEl.style.minWidth = '';
      containerEl.style.minHeight = '';
      const initialWidth = 400;
      document.querySelector('html')!.style.fontSize = `${initialWidth}px`;

      const mainImage = containerEl.querySelector<HTMLDivElement>('.main-image')!;

      const [iw, ih] = await getImgSize();
      console.log(iw, ih);
      //   const { width: iw, height: ih } = mainImage.getBoundingClientRect()
      //   if (iw < ih) {
      //     mainImage.style.width = `${iw / ih}em`
      //     mainImage.style.height = '1em'
      //   } else {
      console.log(mainImage);

      mainImage.style.width = '1rem';
      mainImage.style.height = `${ih / iw}rem`;
      //   }
      console.log(containerEl);

      const { width: w1, height: h1 } = containerEl.getBoundingClientRect();

      const imgRatio = w1 / h1;

      //   const [ow, oh] = [1280, 720]
      // const [ow, oh] = [108, 192];
      console.log({ w1, h1, ow, oh });

      console.log(imgRatio, ow / oh);
      isHorizontal.value = imgRatio <= ow / oh;
      const fontSize = isHorizontal.value ? (initialWidth * oh) / h1 : (initialWidth * ow) / w1;

      document.querySelector('html')!.style.fontSize = `${fontSize}px`;

      sizeRatio.value = isHorizontal.value ? oh / fontSize : ow / fontSize;
      console.log('sizeRatio', sizeRatio.value, isHorizontal.value);

      containerEl.style.width = `${ow}px`;
      containerEl.style.height = `${oh}px`;
      containerEl.style.minWidth = `${ow}px`;
      containerEl.style.minHeight = `${oh}px`;
      isLoading.value = false;
    }

    function getImgSize() {
      const { 'Image Width': ImageWidth, 'Image Height': ImageHeight, Orientation } = props.exif;
      const [iw, ih, or] = [ImageWidth?.value, ImageHeight?.value, Orientation?.value];
      if (iw && ih) return or && +or > 4 ? [ih, iw] : [iw, ih];

      const img = new Image();
      img.src = props.imgUrl;

      return new Promise<[number, number]>((resolve) => {
        img.onload = () => {
          resolve([img.width, img.height]);
        };
        img.onerror = () => {
          resolve([0, 0]);
        };
      });
    }
    return () => (
      <div ref={el} class="co-render" style={{ opacity: isLoading.value ? 0 : 1 }}>
        <div ref={bgEl} class="background" style={bgStyle.value}>
          <div class="background-image" style={bgImgStyle.value}></div>
          {render()}
        </div>
      </div>
    );
  }
});
</script>
