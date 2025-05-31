import type { GestureRecognizerOptions } from './types.ts';

import { EventProcessor } from './event-processor.ts';
import { PointerManager } from './pointer-manager.ts';

type EventType = keyof HTMLElementEventMap;

export class GestureRecognizer {
  private element: HTMLElement;

  private readonly eventHandlers: Record<string, (e: Event) => void>;

  private eventProcessor: EventProcessor;

  private readonly eventTypeMap: { [key: string]: EventType[] };

  private isEnabled = false;

  private isListening = false;

  private options: GestureRecognizerOptions;

  private readonly pointerManager: PointerManager;

  constructor(element: HTMLElement, options: GestureRecognizerOptions = {}) {
    this.element = element;
    this.options = options;

    this.pointerManager = new PointerManager(element);
    this.eventProcessor = new EventProcessor(element, this.pointerManager, options);

    this.eventHandlers = {
      cancel: this.handleEvent.bind(this, 'cancel'),
      end: this.handleEvent.bind(this, 'end'),
      move: this.handleEvent.bind(this, 'move'),
      start: this.handleEvent.bind(this, 'start'),
    };

    this.eventTypeMap = this.getSupportedEvents();

    this.applyGesturePreventionStyles();
    this.enable();
  }

  disable() {
    if (!this.isEnabled) {
      return;
    }
    this.isEnabled = false;
    this.stopListening();
  }

  enable() {
    if (this.isEnabled) {
      return;
    }
    this.isEnabled = true;
    this.startListening();
  }

  updateOptions(newOptions: Partial<GestureRecognizerOptions>) {
    this.options = { ...this.options, ...newOptions };
  }

  private applyGesturePreventionStyles() {
    const style = this.element.style;
    style.touchAction = 'none';
    style.userSelect = 'none';

    if (CSS.supports('-webkit-touch-callout', 'none')) {
      style.webkitTouchCallout = 'none';
    }
  }

  private getSupportedEvents(): { [key: string]: EventType[] } {
    if (window.PointerEvent) {
      return {
        cancel: ['pointercancel'],
        end: ['pointerup'],
        move: ['pointermove'],
        start: ['pointerdown'],
      };
    } else if ('ontouchstart' in window) {
      return {
        cancel: ['touchcancel'],
        end: ['touchend'],
        move: ['touchmove'],
        start: ['touchstart'],
      };
    } else {
      return {
        cancel: ['mouseleave'],
        end: ['mouseup'],
        move: ['mousemove'],
        start: ['mousedown'],
      };
    }
  }

  private handleEvent(type: 'cancel' | 'end' | 'move' | 'start', event: Event) {
    if (!this.isEnabled) {
      return;
    }
    event.preventDefault();
    this.eventProcessor.processEvent(event as MouseEvent | PointerEvent | TouchEvent, type);
  }

  private startListening() {
    if (this.isListening) {
      return;
    }
    const eventOptions: AddEventListenerOptions = {
      capture: this.options.captureEvents || false,
      passive: false,
    };

    for (const [type, events] of Object.entries(this.eventTypeMap)) {
      for (const evt of events) {
        this.element.addEventListener(evt, this.eventHandlers[type], eventOptions);
      }
    }

    this.isListening = true;
  }

  private stopListening() {
    if (!this.isListening) {
      return;
    }

    for (const [type, events] of Object.entries(this.eventTypeMap)) {
      for (const evt of events) {
        this.element.removeEventListener(evt, this.eventHandlers[type]);
      }
    }

    this.isListening = false;
  }
}
