import { SelectOption } from './select-option';

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
