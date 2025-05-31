import type { TapRecognizer } from './tap-recognizer.ts';
import type { UnifiedPointer } from './types.ts';

import { GestureRecognizerBase } from './gesture-recognizer-base.ts';

export class DoubleTapRecognizer extends GestureRecognizerBase {
  private currentTap: null | { pointer: UnifiedPointer; time: number } = null;

  private doubleTapOccurred = false;

  private doubleTapTimeout: null | number = null;

  private lastTap: null | { pointer: UnifiedPointer; time: number } = null;

  private tapRecognizer?: TapRecognizer;

  didDoubleTapOccur(): boolean {
    return this.doubleTapOccurred;
  }

  processEvent(event: MouseEvent | PointerEvent | TouchEvent, eventType: 'cancel' | 'end' | 'move' | 'start') {
    if (eventType !== 'end') {
      return;
    }

    const pointerId = this.pointerManager.getPointerId(event);
    const pointer = pointerId !== null ? this.pointerManager.getPointerById(pointerId) : null;

    if (!pointer || pointer.duration > this.options.tapMaxDuration || pointer.distance > this.options.tapMaxDistance) {
      return;
    }

    const now = performance.now();
    const { doubleTapMaxDelay } = this.options;

    this.currentTap = { pointer, time: now };

    const isDoubleTap =
      this.lastTap &&
      now - this.lastTap.time < doubleTapMaxDelay &&
      this.isSimilarPosition(this.lastTap.pointer, pointer);

    if (isDoubleTap) {
      this.doubleTapOccurred = true;
      this.triggerDoubleTap(pointer);
    } else {
      this.doubleTapOccurred = false;
      this.lastTap = this.currentTap;

      if (this.doubleTapTimeout) {
        clearTimeout(this.doubleTapTimeout);
      }

      this.doubleTapTimeout = window.setTimeout(() => {
        this.lastTap = null;
        this.doubleTapTimeout = null;
      }, doubleTapMaxDelay);
    }
  }

  setTapRecognizer(tapRecognizer: TapRecognizer) {
    this.tapRecognizer = tapRecognizer;
  }

  private isSimilarPosition(p1: UnifiedPointer, p2: UnifiedPointer): boolean {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const maxDistanceSquared = (this.options.tapMaxDistance * 1.5) ** 2;
    return dx * dx + dy * dy < maxDistanceSquared;
  }

  private triggerDoubleTap(pointer: UnifiedPointer) {
    if (this.doubleTapTimeout) {
      clearTimeout(this.doubleTapTimeout);
      this.doubleTapTimeout = null;
    }

    this.tapRecognizer?.cancelTap();
    this.dispatchEvent('double-tap', pointer);

    this.currentTap = null;
    this.lastTap = null;
  }
}
