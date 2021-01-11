import { SelectOption } from './select-option';

export enum Binding {
  AND = 'AND',
  OR = 'OR',
}

export const AndOption: SelectOption<Binding> = {
  value: Binding.AND,
  label: 'And',
};

export const OrOption: SelectOption<Binding> = {
  value: Binding.OR,
  label: 'Or',
};

export const defaultBindingOptions: SelectOption<Binding>[] = [
  AndOption,
  OrOption,
];
