# g-recognizer

[![GitHub License](https://img.shields.io/github/license/dafengzhen/g-recognizer?color=blue)](https://github.com/dafengzhen/g-recognizer)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dafengzhen/g-recognizer/pulls)

**g-recognizer** 是一个简单的 JavaScript 手势识别库，它提供了对点击、双击、长按和滑动手势的支持

[English](./README.md)

## 安装

```bash
npm install g-recognizer
```

## 快速示例

### 浏览器兼容性

g-recognizer 提供了对旧浏览器的兼容版本（legacy build）

如果你的项目需要支持旧版浏览器，请使用以下方式引入：

```javascript
import {GestureRecognizer} from 'g-recognizer/legacy';
```

### 基本用法

```javascript
import {GestureRecognizer} from 'g-recognizer';

const element = document.getElementById('my-element');
const recognizer = new GestureRecognizer(element, {
  enableTap: true,
  enableSwipe: true,
});

// 监听手势事件
element.addEventListener('gesture:tap', (e) => {
  console.log('检测到点击', e.detail);
});

element.addEventListener('gesture:double-tap', (e) => {
  console.log('检测到双击', e.detail);
});

element.addEventListener('gesture:long-press', (e) => {
  console.log('检测到长按', e.detail);
});

element.addEventListener('gesture:swipe', (e) => {
  console.log('检测到滑动', e.detail.direction);
});
```

## 配置选项

GestureRecognizer 构造函数接受一个配置对象，支持以下属性：

| 选项                        | 类型      | 默认值   | 说明                |
|---------------------------|---------|-------|-------------------|
| enableTap                 | boolean | true  | 启用点击手势识别          |
| enableSwipe               | boolean | true  | 启用手势滑动识别          |
| tapMaxDistance            | number  | 8     | 点击允许的最大移动距离（像素）   |
| tapMaxDuration            | number  | 200   | 点击允许的最长持续时间（毫秒）   |
| doubleTapMaxDelay         | number  | 250   | 双击允许的最长间隔时间（毫秒）   |
| longPressDelay            | number  | 600   | 触发长按的持续时间（毫秒）     |
| swipeThreshold            | number  | 20    | 触发滑动的最小距离（像素）     |
| swipeMinVelocity          | number  | 0.2   | 滑动识别的最小速度（像素/毫秒）  |
| swipeMaxDuration          | number  | 500   | 滑动允许的最长持续时间（毫秒）   |
| suppressTapOnDoubleTap    | boolean | false | 双击时是否抑制点击事件       |
| suppressTapOnLongPress    | boolean | true  | 长按时是否抑制点击事件       |
| captureEvents             | boolean | false | 是否在捕获阶段处理手势事件     |
| enableRelativeCoordinates | boolean | true  | 在手势详情中提供相对坐标（0-1） |
| enablePressure            | boolean | false | 在手势详情中包含压力信息      |

## API 参考

### 方法

| 方法                         | 说明     | 
|----------------------------|--------|
| enable()                   | 启用手势识别 | 
| disable()                  | 禁用手势识别 | 
| updateOptions(newOptions)	 | 更新识别配置 | 

### 事件

所有手势事件都在目标元素上触发，前缀为 gesture:，事件详情包含在 detail 属性中：

| 方法                  | 说明        | 
|---------------------|-----------|
| gesture:tap	        | 检测到点击时触发  | 
| gesture:double-tap  | 检测到双击时触发	 | 
| gesture:long-press	 | 检测到长按时触发	 | 
| gesture:swipe	      | 检测到滑动时触发	 | 

## 贡献

欢迎贡献代码！如果您发现任何问题或有改进建议，请随时提交 issue 或 pull request

## License

[MIT](https://opensource.org/licenses/MIT)

