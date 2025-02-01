const logos = import.meta.glob<string>('../assets/logos/*.svg', {
  eager: true,
  import: 'default'
});

const modelLogoMap = Object.keys(logos).reduce(
  (map, path) => {
    const key = path.split('/').pop()?.split('.')[0];
    if (key) map[key.toUpperCase()] = logos[path];

    return map;
  },
  {} as Record<string, string>
);

export const renderUtils = {
  getModelName,
  getModelLogo
};

function getModelName(model: string) {
  const modelMap: { [key: string]: string } = {
    'ILCE-7M4': 'α7M4'
  };

  return modelMap[model] || model;
}

function getModelLogo(model: string) {
  return modelLogoMap[model.toUpperCase()];
}
