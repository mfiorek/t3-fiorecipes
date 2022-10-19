import { atom } from 'jotai';
import { inferQueryOutput } from '../utils/trpc';

export const selectedRecipeAtom = atom<inferQueryOutput<'recipe.get-all'>[number] | null>(null);
