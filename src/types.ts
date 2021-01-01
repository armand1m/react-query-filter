import { Binding } from './bindings';
import { OperationType } from './operations';
import { SelectOption } from './select-option';

interface StringPropertyDescription {
  label: string;
  key: string;
  type: 'string';
  suggestions?: string[];
}

interface NumberPropertyDescription {
  label: string;
  key: string;
  type: 'number';
  suggestions?: number[];
}

interface BooleanPropertyDescription {
  label: string;
  key: string;
  type: 'boolean';
}

export type PropertyDescription =
  | StringPropertyDescription
  | NumberPropertyDescription
  | BooleanPropertyDescription;

export interface Filter {
  field?: string;
  operation?: OperationType;
  value?: string;
  binding?: Binding;
  type?: PropertyDescription['type'];
}

export interface FilterRowProps {
  filter: Filter;
  fields: SelectOption<string>[];
  bindings: SelectOption<Binding>[];
  operations: SelectOption<OperationType>[];
  shouldRenderBindingSelect: boolean;
  shouldRenderValueInput: boolean;
  getFieldSelectOption: (field: string) => SelectOption<string> | undefined;
  onRemove: () => void;
  onChangeBinding: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeField: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeOperation: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeValue: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
