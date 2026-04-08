import type { SelectOption } from './types';

export enum Binding {
  AND = 'AND',
  OR = 'OR',
}

export const defaultBindingOptions: SelectOption<Binding>[] = [
  {
    value: Binding.AND,
    label: 'And',
  },
  {
    value: Binding.OR,
    label: 'Or',
  },
];
