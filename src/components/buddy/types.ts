export type Feeling = 'idle' | 'happy' | 'talking' | 'excited' | 'proud' | 'shy' | 'sad' | 'sleepy' | 'dizzy';

export type Gesture = 'rest' | 'wave' | 'point' | 'cheer' | 'cover';

export type CharacterProps = {
  feeling: Feeling;
  gesture: Gesture;
  /** Pointing direction in degrees: 0 = right, 90 = down, -90 = up, 180 = left. */
  point?: number;
  /** Where the eyes look, each axis from -1 to 1. */
  look?: { x: number; y: number };
};

export const FEELINGS: Feeling[] = ['idle', 'happy', 'talking', 'excited', 'proud', 'shy', 'sad', 'sleepy', 'dizzy'];
export const GESTURES: Gesture[] = ['rest', 'wave', 'point', 'cheer'];
