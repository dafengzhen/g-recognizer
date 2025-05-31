import type { PointerManager } from './pointer-manager.ts';
import type { GestureRecognizerOptions } from './types.ts';

import { DoubleTapRecognizer } from './double-tap-recognizer.ts';
import { GestureRecognizerBase } from './gesture-recognizer-base.ts';
import { LongPressRecognizer } from './long-press-recognizer.ts';
import { SwipeRecognizer } from './swipe-recognizer.ts';
import { TapRecognizer } from './tap-recognizer.ts';

export class EventProcessor extends GestureRecognizerBase {
  private readonly recognizers: readonly GestureRecognizerBase[];

  constructor(element: HTMLElement, pointerManager: PointerManager, options: GestureRecognizerOptions) {
    super(element, pointerManager, options);
    this.recognizers = this.initializeRecognizers(element, pointerManager, options);
  }

  processEvent(event: MouseEvent | PointerEvent | TouchEvent, eventType: 'cancel' | 'end' | 'move' | 'start'): void {
    // Handle pointer state updates
    if (eventType === 'start') {
      this.pointerManager.addPointer(event);
    } else if (eventType === 'move') {
      this.pointerManager.updatePointer(event);
    }

    const activePointers = this.pointerManager.getActivePointers();

    // Dispatch general gesture event
    this.dispatchEvent(eventType === 'start' || eventType === 'move' ? eventType : 'end', activePointers);

    // Delegate event to recognizers
    for (const recognizer of this.recognizers) {
      recognizer.processEvent(event, eventType);
    }

    // Remove pointer only after recognizers process 'end' or 'cancel'
    if (eventType === 'end' || eventType === 'cancel') {
      this.pointerManager.removePointer(event);
    }
  }

  private initializeRecognizers(
    element: HTMLElement,
    pointerManager: PointerManager,
    options: GestureRecognizerOptions,
  ): GestureRecognizerBase[] {
    const tapRecognizer = new TapRecognizer(element, pointerManager, options);
    const doubleTapRecognizer = new DoubleTapRecognizer(element, pointerManager, options);
    const longPressRecognizer = new LongPressRecognizer(element, pointerManager, options);
    const swipeRecognizer = new SwipeRecognizer(element, pointerManager, options);

    tapRecognizer.setDependencies(doubleTapRecognizer, longPressRecognizer);
    doubleTapRecognizer.setTapRecognizer(tapRecognizer);
    longPressRecognizer.setTapRecognizer(tapRecognizer);

    // Order may matter, keep as is unless optimization logic allows parallelization
    return [longPressRecognizer, doubleTapRecognizer, tapRecognizer, swipeRecognizer];
  }
}
