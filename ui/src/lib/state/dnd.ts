import { getContext } from 'svelte';

export const useDnD = () => {
  return getContext('dnd') as { current: string | null };
};
