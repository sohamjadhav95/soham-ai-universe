// Last known pointer position, kept across pages so anything that follows the
// cursor (hover previews, the next-project ball) starts in the right place even
// if it opens before the mouse moves, e.g. when content scrolls under it.
export const pointer = { x: -500, y: -500 };

if (typeof window !== 'undefined')
  window.addEventListener(
    'pointermove',
    e => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    },
    { passive: true },
  );
