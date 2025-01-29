export const renderUtils = {
  getModelName
};

function getModelName(model: string) {
  const modelMap: { [key: string]: string } = {
    'ILCE-7M4': 'α7M4'
  };

  return modelMap[model] || model;
}
