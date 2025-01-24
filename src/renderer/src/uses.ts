import { type InjectionKey, Ref, computed, inject, provide, ref, shallowRef } from 'vue';
import { cloneDeep } from 'lodash';
import type { CoPic } from './utils/co-pic';
import { Settings } from './types';

const CoPicInjectionKey: InjectionKey<ReturnType<typeof getCoPicList>> =
  Symbol('CoPicInjectionKey');

export function provideCoPic() {
  const coPicList = getCoPicList();
  coPicList.setSettings(getDefaultSettings());
  provide(CoPicInjectionKey, coPicList);

  return coPicList;
}
export function injectCoPic() {
  return inject(CoPicInjectionKey, getCoPicList());
}

function getCoPicList() {
  const settings: Ref<Settings> = ref<Settings>(getDefaultSettings());
  const list = shallowRef<CoPic[]>([]);
  const currentIndex = ref(0);

  const currentCoPic = computed(() => list.value[currentIndex.value]);
  function setCurrentIndex(index: number) {
    currentIndex.value = index;
  }

  function setSettings(_settings: Settings) {
    settings.value = _settings;
    list.value.forEach((item) => item.setSettings(cloneDeep(_settings)));
  }

  function push(pic: CoPic) {
    pic.setSettings(cloneDeep(settings.value));
    list.value = list.value.concat(pic);
    currentIndex.value = list.value.length - 1;
  }

  return {
    list,
    currentIndex,
    currentCoPic,
    setCurrentIndex,
    settings,
    setSettings,
    push
  };
}

function getDefaultSettings(): Settings {
  return {
    background: {
      mode: 'image',
      color: { rgba: '#ffffff' },
      image: {
        filters: [
          {
            type: 'blur',
            value: '0.04rem'
          },
          {
            type: 'brightness',
            value: '120%'
          }
        ]
      },
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      },
      padding: [0.1, 0.1]
    },
    fields: [
      {
        type: 'container',
        style: {
          padding: '0.01rem 0.01rem 0',
          backgroundColor: '#fffc',
          backdropFilter: 'blur(0.2rem)',
          boxShadow: `0 0 0.2rem rgba(0, 0, 0, .8)`
        },
        children: [
          {
            type: 'main-image',
            style: {
              margin: '0 auto'
              // width: '1rem'
            }
          },
          {
            type: 'container',
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              height: '0.1rem',
              paddingLeft: '0.02rem',
              paddingRight: '0.02rem',
              fontSize: '0.05rem'
            },
            children: [
              {
                type: 'container',
                style: {
                  display: 'flex',
                  alignItems: 'baseline'
                },
                children: [
                  {
                    type: 'text',
                    expression: '${Make}',
                    style: {
                      display: 'flex',
                      alignItems: 'flex-end'
                    }
                  },
                  {
                    type: 'text',
                    expression: '${Model}',
                    style: {
                      display: 'flex',
                      alignItems: 'flex-end',
                      marginLeft: '0.02rem',
                      fontSize: '0.04rem'
                    }
                  }
                ]
              },
              {
                type: 'container',
                children: [
                  {
                    type: 'text',
                    expression: '${FocalLength} ${FNumber} ${ExposureTime}s ISO${ISOSpeedRatings}',
                    style: {
                      display: 'flex',
                      alignItems: 'flex-end',
                      marginLeft: '0.03rem',
                      fontSize: '0.03rem'
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  };
}
