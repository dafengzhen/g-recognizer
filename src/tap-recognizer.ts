import type { DoubleTapRecognizer } from './double-tap-recognizer.ts';
import type { LongPressRecognizer } from './long-press-recognizer.ts';
import type { UnifiedPointer } from './types.ts';

import { GestureRecognizerBase } from './gesture-recognizer-base.ts';

export class TapRecognizer extends GestureRecognizerBase {
  private currentPointer: null | UnifiedPointer = null;

  private doubleTapRecognizer?: DoubleTapRecognizer;

  private isPotentialTap = false;

  private longPressRecognizer?: LongPressRecognizer;

  private tapTimeout: null | number = null;

  cancelTap() {
    this.isPotentialTap = false;
    this.currentPointer = null;
  }

  processEvent(event: MouseEvent | PointerEvent | TouchEvent, eventType: 'cancel' | 'end' | 'move' | 'start') {
    if (!this.options.enableTap) {
      return;
    }

    const handlers: Record<typeof eventType, (event: any) => void> = {
      cancel: () => this.handleCancel(),
      end: (e) => this.handleEnd(e),
      move: (e) => this.handleMove(e),
      start: (e) => this.handleStart(e),
    };

    handlers[eventType]?.(event);
  }

  setDependencies(doubleTapRecognizer: DoubleTapRecognizer, longPressRecognizer: LongPressRecognizer) {
    this.doubleTapRecognizer = doubleTapRecognizer;
    this.longPressRecognizer = longPressRecognizer;
  }

  private handleCancel() {
    this.cancelTap();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private handleEnd(_event: MouseEvent | PointerEvent | TouchEvent) {
    if (!this.isPotentialTap || !this.currentPointer) {
      return;
    }

    const pointer = this.pointerManager.getPointerById(this.currentPointer.identifier);
    if (pointer && pointer.duration <= this.options.tapMaxDuration) {
      this.triggerTap(pointer);
    } else {
      this.cancelTap();
    }
  }

  private handleMove(event: MouseEvent | PointerEvent | TouchEvent) {
    if (!this.isPotentialTap || !this.currentPointer) {
      return;
    }

    const updatedPointer = this.pointerManager.updatePointer(event);
    if (!updatedPointer || updatedPointer.identifier !== this.currentPointer.identifier) {
      return;
    }

    if (updatedPointer.distance > this.options.tapMaxDistance) {
      this.cancelTap();
    }
  }

  private handleStart(event: MouseEvent | PointerEvent | TouchEvent) {
    const pointer = this.pointerManager.addPointer(event);
    if (!pointer) {
      return;
    }

    this.currentPointer = pointer;
    this.isPotentialTap = true;
  }

  private reset() {
    this.isPotentialTap = false;
    this.currentPointer = null;

    if (this.tapTimeout !== null) {
      clearTimeout(this.tapTimeout);
      this.tapTimeout = null;
    }
  }

  private triggerTap(pointer: UnifiedPointer) {
    const { doubleTapMaxDelay, suppressTapOnDoubleTap, suppressTapOnLongPress } = this.options;

    const shouldDelayTap = suppressTapOnDoubleTap || (suppressTapOnDoubleTap && suppressTapOnLongPress);

    if (shouldDelayTap) {
      if (this.tapTimeout !== null) {
        clearTimeout(this.tapTimeout);
        this.tapTimeout = null;
      }

      this.tapTimeout = window.setTimeout(() => {
        const suppressTap =
          (suppressTapOnLongPress && this.longPressRecognizer?.isActive()) ||
          (suppressTapOnDoubleTap && this.doubleTapRecognizer?.didDoubleTapOccur());

        if (!suppressTap) {
          this.dispatchEvent('tap', pointer);
        }

        this.reset();
      }, doubleTapMaxDelay);
    } else {
      this.dispatchEvent('tap', pointer);
      this.reset();
    }
  }
}
