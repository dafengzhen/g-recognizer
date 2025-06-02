import { GestureRecognizer } from '../src/gesture-recognizer';

document.addEventListener('DOMContentLoaded', () => {
  const elements = {
    avgSwipeDistance: document.getElementById('avgSwipeDistance')!,
    avgSwipeSpeed: document.getElementById('avgSwipeSpeed')!,
    btnResetSwipe: document.getElementById('btnResetSwipe')!,
    btnResetTap: document.getElementById('btnResetTap')!,
    lastTapPos: document.getElementById('lastTapPos')!,
    swipeArea: document.getElementById('swipeArea')!,
    swipeDirection: document.getElementById('swipeDirection')!,
    swipeLogs: document.getElementById('swipeLogs')!,
    tapArea: document.getElementById('tapArea')!,
    tapCount: document.getElementById('tapCount')!,
    tapLogs: document.getElementById('tapLogs')!,
    totalDoubleTaps: document.getElementById('totalDoubleTaps')!,
    totalLongPresses: document.getElementById('totalLongPresses')!,
    totalSwipes: document.getElementById('totalSwipes')!,
    totalTaps: document.getElementById('totalTaps')!,
  };

  const stats = {
    doubleTapCounter: 0,
    longPressCounter: 0,
    swipeCounter: 0,
    tapCounter: 0,
    totalSwipeDistance: 0,
    totalSwipeSpeed: 0,
  };

  const setText = (el: HTMLElement, value: number | string) => {
    if (el.textContent !== value.toString()) {
      el.textContent = value.toString();
    }
  };

  const addLogEntry = (container: HTMLElement, content: string, className: string, limit = 50) => {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${className}`;
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${content}`;
    container.insertBefore(logEntry, container.firstChild);

    while (container.children.length > limit) {
      container.removeChild(container.lastChild!);
    }
  };

  const updateTapStats = () => {
    setText(elements.tapCount, stats.tapCounter);
    setText(elements.totalTaps, stats.tapCounter);
    setText(elements.totalDoubleTaps, stats.doubleTapCounter);
    setText(elements.totalLongPresses, stats.longPressCounter);
  };

  const updateSwipeStats = (direction: string) => {
    setText(elements.totalSwipes, stats.swipeCounter);
    setText(elements.swipeDirection, direction);

    const avgDistance = stats.swipeCounter ? Math.round(stats.totalSwipeDistance / stats.swipeCounter) : 0;
    const avgSpeed = stats.swipeCounter ? (stats.totalSwipeSpeed / stats.swipeCounter).toFixed(2) : '0.00';

    setText(elements.avgSwipeDistance, `${avgDistance}px`);
    setText(elements.avgSwipeSpeed, `${avgSpeed}px/ms`);
  };

  const addTapLog = (type: string, x: number, y: number) => {
    const position = `(${Math.round(x)}, ${Math.round(y)})`;
    const labelMap: Record<string, string> = {
      'double-tap': 'Double tap',
      'long-press': 'Long press',
      tap: 'Tap',
    };
    addLogEntry(elements.tapLogs, `${labelMap[type]} at ${position}`, `log-${type}`);
    setText(elements.lastTapPos, position);
  };

  const addSwipeLog = (direction: string, distance: number, velocity: number) => {
    const directionLabel: Record<string, string> = {
      down: 'Down',
      left: 'Left',
      right: 'Right',
      up: 'Up',
    };
    const content = `${directionLabel[direction] || direction} swipe (Distance: ${Math.round(distance)}px, Speed: ${velocity.toFixed(2)}px/ms)`;
    addLogEntry(elements.swipeLogs, content, 'log-swipe');
  };

  const showGestureFeedback = (area: HTMLElement, type: string, x: number, y: number) => {
    const feedback = document.createElement('div');
    feedback.className = `gesture-feedback ${type}`;
    Object.assign(feedback.style, { left: `${x}px`, top: `${y}px` });
    area.appendChild(feedback);
    setTimeout(() => feedback.remove(), 600);
  };

  const showSwipeFeedback = (
    area: HTMLElement,
    direction: string,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
  ) => {
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    const path = document.createElement('div');
    path.className = `swipe-path swipe-path-${direction}`;
    Object.assign(path.style, {
      left: `${startX}px`,
      top: `${startY}px`,
      transform: `rotate(${angle}deg)`,
      width: `${distance}px`,
    });

    const dir = document.createElement('div');
    dir.className = `swipe-direction swipe-${direction}`;
    Object.assign(dir.style, {
      left: `${endX}px`,
      top: `${endY}px`,
    });
    dir.textContent = { down: '↓', left: '←', right: '→', up: '↑' }[direction] || '';

    area.append(path, dir);
    setTimeout(() => {
      path.remove();
      dir.remove();
    }, 1000);
  };

  new GestureRecognizer(elements.tapArea, { enableTap: true });
  new GestureRecognizer(elements.swipeArea, { enableSwipe: true });

  elements.tapArea.addEventListener('gesture:tap', (e) => handleTap('tap', e as CustomEvent));
  elements.tapArea.addEventListener('gesture:double-tap', (e) => handleTap('double-tap', e as CustomEvent));
  elements.tapArea.addEventListener('gesture:long-press', (e) => handleTap('long-press', e as CustomEvent));

  const handleTap = (type: string, e: CustomEvent) => {
    const { x, y } = e.detail;
    if (type === 'tap') {
      stats.tapCounter++;
    } else if (type === 'double-tap') {
      stats.doubleTapCounter++;
    } else if (type === 'long-press') {
      stats.longPressCounter++;
    }

    updateTapStats();
    addTapLog(type, x, y);
    showGestureFeedback(elements.tapArea, type, x, y);
  };

  elements.swipeArea.addEventListener('gesture:swipe', (e) => {
    const { direction, distance, startX, startY, velocity, x, y } = e.detail;
    stats.swipeCounter++;
    stats.totalSwipeDistance += distance;
    stats.totalSwipeSpeed += velocity;

    updateSwipeStats(direction);
    addSwipeLog(direction, distance, velocity);
    showSwipeFeedback(elements.swipeArea, direction, startX, startY, x, y);
  });

  elements.btnResetTap.addEventListener('click', () => {
    Object.assign(stats, {
      doubleTapCounter: 0,
      longPressCounter: 0,
      tapCounter: 0,
    });
    updateTapStats();
    elements.tapLogs.innerHTML = '<div class="log-entry">Tap area reset</div>';
    setText(elements.lastTapPos, '(0, 0)');
  });

  elements.btnResetSwipe.addEventListener('click', () => {
    Object.assign(stats, {
      swipeCounter: 0,
      totalSwipeDistance: 0,
      totalSwipeSpeed: 0,
    });
    updateSwipeStats('-');
    elements.swipeLogs.innerHTML = '<div class="log-entry log-swipe">[Reset] Swipe data cleared</div>';
  });

  elements.tapLogs.innerHTML = '<div class="log-entry log-swipe">Tap area ready. Start experimenting!</div>';
  elements.swipeLogs.innerHTML = '<div class="log-entry log-swipe">Swipe area ready. Start swiping!</div>';
});
