import { Binding } from './bindings';
import { OperationType } from './operations';
import { SelectOption } from './select-option';

export type FieldType = 'string' | 'number' | 'boolean';

export type FilterValue = string | number | boolean;

type SuggestionMap = {
  string: string;
  number: number;
  boolean: boolean;
};

export interface FieldDefinitionBase<TType extends FieldType> {
  key: string;
  label: string;
  type: TType;
  suggestions?: SuggestionMap[TType][];
}

export type StringFieldDefinition = FieldDefinitionBase<'string'>;
export type NumberFieldDefinition = FieldDefinitionBase<'number'>;
export type BooleanFieldDefinition = FieldDefinitionBase<'boolean'>;

export type FieldDefinition =
  | StringFieldDefinition
  | NumberFieldDefinition
  | BooleanFieldDefinition;

export type PropertyDescription = FieldDefinition;

export interface Filter {
  id: string;
  field?: string;
  operator?: OperationType;
  value?: FilterValue;
  combinator?: Binding;
  type?: FieldType;
}

export interface FilterDraft {
  field?: string;
  operator?: OperationType;
  value?: FilterValue;
  combinator?: Binding;
  type?: FieldType;
}

export interface UseQueryFiltersOptions {
  fields: FieldDefinition[];
  value?: Filter[];
  defaultValue?: Array<Filter | FilterDraft>;
  onChange?: (filters: Filter[]) => void;
  defaultCombinator?: Binding;
  operationLabels?: Partial<Record<OperationType, string>>;
  typeOperationsMap?: Partial<Record<FieldType, OperationType[]>>;
  noValueOperations?: OperationType[];
}

export interface UseQueryFiltersResult {
  filters: Filter[];
  fieldOptions: SelectOption<string>[];
  combinatorOptions: SelectOption<Binding>[];
  operationLabels: Record<OperationType, string>;
  addFilter: (draft?: FilterDraft) => void;
  removeFilter: (filterId: string) => void;
  updateField: (filterId: string, field?: string) => void;
  updateOperator: (
    filterId: string,
    operator?: OperationType
  ) => void;
  updateValue: (filterId: string, value?: FilterValue) => void;
  updateCombinator: (filterId: string, combinator: Binding) => void;
  replaceFilters: (filters: Filter[]) => void;
  reset: () => void;
  getFilter: (filterId: string) => Filter | undefined;
  getFieldDefinition: (
    fieldKey?: string
  ) => FieldDefinition | undefined;
  getAvailableOperations: (
    filterId: string
  ) => SelectOption<OperationType>[];
  getSuggestions: (filterId: string) => FilterValue[];
  shouldRenderValue: (filterId: string) => boolean;
}
