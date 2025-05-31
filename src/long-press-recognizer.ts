import type { TapRecognizer } from './tap-recognizer.ts';
import type { UnifiedPointer } from './types.ts';

import { GestureRecognizerBase } from './gesture-recognizer-base.ts';

export class LongPressRecognizer extends GestureRecognizerBase {
  private currentPointer: null | UnifiedPointer = null;

  private isActiveFlag = false;

  private longPressTimeoutId: null | number = null;

  private tapRecognizer?: TapRecognizer;

  isActive(): boolean {
    return this.isActiveFlag;
  }

  processEvent(event: MouseEvent | PointerEvent | TouchEvent, eventType: 'cancel' | 'end' | 'move' | 'start') {
    switch (eventType) {
      case 'cancel':
      case 'end':
        this.handleEnd();
        break;
      case 'move':
        this.handleMove(event);
        break;
      case 'start':
        this.handleStart(event);
        break;
    }
  }

  setTapRecognizer(tapRecognizer: TapRecognizer) {
    this.tapRecognizer = tapRecognizer;
  }

  private cancelLongPress() {
    if (this.longPressTimeoutId !== null) {
      clearTimeout(this.longPressTimeoutId);
      this.longPressTimeoutId = null;
    }

    this.isActiveFlag = false;
    this.currentPointer = null;
  }

  private handleEnd() {
    this.cancelLongPress();
  }

  private handleMove(event: MouseEvent | PointerEvent | TouchEvent) {
    if (!this.currentPointer) {
      return;
    }

    const updatedPointer = this.pointerManager.updatePointer(event);
    if (!updatedPointer || updatedPointer.identifier !== this.currentPointer.identifier) {
      return;
    }

    if (updatedPointer.distance > this.options.tapMaxDistance) {
      this.cancelLongPress();
    }
  }

  private handleStart(event: MouseEvent | PointerEvent | TouchEvent) {
    const pointer = this.pointerManager.addPointer(event);
    if (!pointer) {
      return;
    }

    this.currentPointer = pointer;
    this.isActiveFlag = true;

    const delay = this.options.longPressDelay;

    this.longPressTimeoutId = window.setTimeout(() => {
      if (this.options.suppressTapOnLongPress) {
        this.tapRecognizer?.cancelTap();
      }
      this.dispatchEvent('long-press', pointer);
    }, delay);
  }
}
