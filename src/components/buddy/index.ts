import type { ComponentType } from 'react';
import type { BuddyCharacter } from '@/data/buddy';
import type { CharacterProps } from './types';
import Bit from './Bit';
import Nimbus from './Nimbus';
import Pico from './Pico';

/** All buddy characters; `BUDDY.character` in src/data/buddy.ts picks the one on the site. */
export const CHARACTERS: Record<BuddyCharacter, ComponentType<CharacterProps>> = {
  bit: Bit,
  nimbus: Nimbus,
  pico: Pico,
};

/** Each character's accent, used to tint its dust when it is closed. */
export const DUST_TINT: Record<BuddyCharacter, string> = {
  bit: '#6f84ff',
  nimbus: '#a48ff0',
  pico: '#e0875c',
};
