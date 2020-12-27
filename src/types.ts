import { SupportedFieldType } from './filterOperations';

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
  operation?: string;
  value?: string;
  binding?: 'and' | 'or';
  type?: SupportedFieldType;
}

export interface FilterRowProps {
  properties: PropertyDescription[];
  filter: Filter;
  isFirst: boolean;
  onRemove: () => void;
  onChangeBinding: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeField: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeOperation: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeValue: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
