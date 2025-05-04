// const TplDefault = Vue.defineAsyncComponent(() => {
//   return fetch('https://copicseal.github.io/templates/templates/default/index.js')
//     .then(res => res.text())
//     .then((code) => {
//       const obj = { exports: {}, Vue };
//       new Function('exports', 'Vue', code)(obj.exports, obj.Vue);
//       console.log(obj);
//       return obj.exports.CoTest;
//     });
// });

// fetch('https://copicseal.github.io/templates/templates/default/index.css')
//   .then(res => res.text())
//   .then((res) => {
//     const style = document.createElement('style');
//     style.id = 'co-style';
//     style.textContent = res;
//     document.head.appendChild(style);
//   });

// console.log(TplDefault);
