import type { PointerManager } from './pointer-manager.ts';
import type { GestureEventType, GestureRecognizerOptions, SwipeDirection } from './types.ts';

const DEFAULT_OPTIONS: Required<GestureRecognizerOptions> = {
  captureEvents: false,
  doubleTapMaxDelay: 250,
  enablePressure: false,
  enableRelativeCoordinates: true,
  enableSwipe: true,
  enableTap: true,
  longPressDelay: 600,
  suppressTapOnDoubleTap: false,
  suppressTapOnLongPress: true,
  swipeMaxDuration: 500,
  swipeMinVelocity: 0.2,
  swipeThreshold: 20,
  tapMaxDistance: 8,
  tapMaxDuration: 200,
};

const RAD_TO_DEG = 180 / Math.PI;

export abstract class GestureRecognizerBase {
  protected readonly element: HTMLElement;
  protected readonly options: Required<GestureRecognizerOptions>;
  protected readonly pointerManager: PointerManager;

  constructor(element: HTMLElement, pointerManager: PointerManager, options: GestureRecognizerOptions) {
    this.element = element;
    this.pointerManager = pointerManager;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  abstract processEvent(
    event: MouseEvent | PointerEvent | TouchEvent,
    eventType: 'cancel' | 'end' | 'move' | 'start',
  ): void;

  protected calculateAngle(dx: number, dy: number): number {
    return Math.atan2(dy, dx) * RAD_TO_DEG;
  }

  protected calculateVelocity(startTime: number, endTime: number, distance: number): number {
    const duration = endTime - startTime;
    return duration > 0 ? distance / duration : 0;
  }

  protected dispatchEvent<T>(type: GestureEventType, detail: T) {
    const customEvent = new CustomEvent(`gesture:${type}`, {
      bubbles: true,
      cancelable: true,
      detail,
    });
    this.element.dispatchEvent(customEvent);
  }

  protected getSwipeDirection(angle: number): SwipeDirection {
    if (angle >= -45 && angle < 45) {
      return 'right';
    }
    if (angle >= 45 && angle < 135) {
      return 'down';
    }
    if (angle < -45 && angle >= -135) {
      return 'up';
    }
    return 'left';
  }
}
