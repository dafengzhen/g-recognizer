# g-recognizer

[![GitHub License](https://img.shields.io/github/license/dafengzhen/gesture-recognizer?color=blue)](https://github.com/dafengzhen/evflow)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/dafengzhen/gesture-recognizer/pulls)

**g-recognizer** is a lightweight JavaScript gesture recognition library that supports tap, double-tap, long-press,
and swipe gestures.

[简体中文](./README.zh.md)

## Installation

```bash
npm install g-recognizer
```

## Quick Example

### Browser Compatibility

g-recognizer provides a legacy build for compatibility with older browsers.

If your project needs to support legacy browsers, import it as follows:

```javascript
import {GestureRecognizer} from 'g-recognizer/legacy';
```

### Basic Usage

```javascript
import {GestureRecognizer} from 'g-recognizer';

const element = document.getElementById('my-element');
const recognizer = new GestureRecognizer(element, {
  enableTap: true,
  enableSwipe: true,
});

// Listen to gesture events
element.addEventListener('gesture:tap', (e) => {
  console.log('Tap detected', e.detail);
});

element.addEventListener('gesture:double-tap', (e) => {
  console.log('Double tap detected', e.detail);
});

element.addEventListener('gesture:long-press', (e) => {
  console.log('Long press detected', e.detail);
});

element.addEventListener('gesture:swipe', (e) => {
  console.log('Swipe detected', e.detail.direction);
});
```

## Configuration Options

The `GestureRecognizer` constructor accepts a configuration object with the following options:

| Option                    | Type    | Default | Description                                          |
|---------------------------|---------|---------|------------------------------------------------------|
| enableTap                 | boolean | true    | Enable tap gesture recognition                       |
| enableSwipe               | boolean | true    | Enable swipe gesture recognition                     |
| tapMaxDistance            | number  | 8       | Maximum movement distance allowed for a tap (px)     |
| tapMaxDuration            | number  | 200     | Maximum duration allowed for a tap (ms)              |
| doubleTapMaxDelay         | number  | 250     | Maximum delay between two taps for double-tap (ms)   |
| longPressDelay            | number  | 600     | Duration to trigger long-press (ms)                  |
| swipeThreshold            | number  | 20      | Minimum distance to trigger a swipe (px)             |
| swipeMinVelocity          | number  | 0.2     | Minimum velocity for swipe recognition (px/ms)       |
| swipeMaxDuration          | number  | 500     | Maximum duration allowed for a swipe (ms)            |
| suppressTapOnDoubleTap    | boolean | false   | Suppress tap event when a double-tap is detected     |
| suppressTapOnLongPress    | boolean | true    | Suppress tap event when a long-press is detected     |
| captureEvents             | boolean | false   | Handle gesture events during the capture phase       |
| enableRelativeCoordinates | boolean | true    | Provide relative coordinates (0–1) in gesture detail |
| enablePressure            | boolean | false   | Include pressure information in gesture detail       |

## API Reference

### Methods

| Method                    | Description                 |
|---------------------------|-----------------------------|
| enable()                  | Enable gesture recognition  |
| disable()                 | Disable gesture recognition |
| updateOptions(newOptions) | Update recognition settings |

### Events

All gesture events are dispatched on the target element, prefixed with `gesture:`, and include details in the `detail`
property:

| Event               | Description                             |
|---------------------|-----------------------------------------|
| gesture\:tap        | Triggered when a tap is detected        |
| gesture\:double-tap | Triggered when a double-tap is detected |
| gesture\:long-press | Triggered when a long-press is detected |
| gesture\:swipe      | Triggered when a swipe is detected      |

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, feel free to submit an issue or
a pull request.

## License

[MIT](https://opensource.org/licenses/MIT)

