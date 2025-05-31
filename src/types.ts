export interface GestureEventMap {
  'gesture:double-tap': CustomEvent<UnifiedPointer>;
  'gesture:end': CustomEvent<UnifiedPointer[]>;
  'gesture:long-press': CustomEvent<UnifiedPointer>;
  'gesture:move': CustomEvent<UnifiedPointer[]>;
  'gesture:start': CustomEvent<UnifiedPointer[]>;
  'gesture:swipe': CustomEvent<SwipeEvent>;
  'gesture:tap': CustomEvent<UnifiedPointer>;
}

export type GestureEventType = 'double-tap' | 'end' | 'long-press' | 'move' | 'start' | 'swipe' | 'tap';

export interface GestureRecognizerOptions {
  captureEvents?: boolean;
  doubleTapMaxDelay?: number;
  enablePressure?: boolean;
  enableRelativeCoordinates?: boolean;
  enableSwipe?: boolean;
  enableTap?: boolean;
  longPressDelay?: number;
  suppressTapOnDoubleTap?: boolean;
  suppressTapOnLongPress?: boolean;
  swipeMaxDuration?: number;
  swipeMinVelocity?: number;
  swipeThreshold?: number;
  tapMaxDistance?: number;
  tapMaxDuration?: number;
}

export type PointerType = 'mouse' | 'pen' | 'touch';

export type SwipeDirection = 'down' | 'left' | 'right' | 'up';

export interface SwipeEvent extends UnifiedPointer {
  angle: number;
  direction: SwipeDirection;
  velocity: number;
}

export interface UnifiedPointer {
  distance: number;
  duration: number;
  event: MouseEvent | PointerEvent | Touch;
  identifier: number;
  originalStartX: number;
  originalStartY: number;
  originalTimeStamp: number;
  pressure: number;
  relX: number;
  relY: number;
  scaledX: number;
  scaledY: number;
  startX: number;
  startY: number;
  tiltX?: number;
  tiltY?: number;
  timeStamp: number;
  type: PointerType;
  x: number;
  y: number;
}

declare global {
  interface CSSStyleDeclaration {
    webkitTouchCallout?: string;
  }

  interface HTMLElement {
    addEventListener<K extends keyof GestureEventMap>(
      type: K,
      listener: (this: HTMLElement, ev: GestureEventMap[K]) => any,
      options?: AddEventListenerOptions | boolean,
    ): void;
  }
}
