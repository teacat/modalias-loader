# Module Alias Loader

這個 Loader 是為 Webpack 4 所設計的，這能夠在開發 Vue.js 時更方便地使用 Module CSS 動態樣式。

## 使用方法

在 `vue.config.js` 覆蓋 Vue.js 原生的 Pug 處理讀取器。

```js
module.exports = {
    chainWebpack: config => {
        /** 取得 Vue.js 基礎的 Pug Loader */
        const pugRule = config.module.rule('pug')
        
        /** 清除原始的 Pug Loader 行為 */
        pugRule.uses.clear()
        
        /** 使用 Pug Loader 之後並使用 Modalias Loader */
        pugRule 
            .use('modalias-loader')
              .loader('./modalias-loader/loader.js')
              .end()
            .use('pug-plain-loader')
              .loader('pug-plain-loader')
              .end()
    }
}
```

## 範例

### 單個樣式

#### 原生方式

```
<div :id="$style.my-id" :class="$style['my-class']">
```

#### Module Alias Loader

```
<div id="_my-id" class="_my-class">
```

&nbsp;

### 多個樣式

#### 原生方式

```
<div :class="[$style['my-class'], $style['my-class2'], $style['my-class3']]">
```

#### Module Alias Loader

```
<div class="_my-class _my-class2 _my-class3">
```
