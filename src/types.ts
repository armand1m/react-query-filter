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

export interface FilterCondition {
  id: string;
  kind: 'condition';
  field?: string;
  operator?: OperationType;
  value?: FilterValue;
  type?: FieldType;
}

export interface FilterConditionDraft {
  kind?: 'condition';
  field?: string;
  operator?: OperationType;
  value?: FilterValue;
  type?: FieldType;
}

export interface FilterGroup {
  id: string;
  kind: 'group';
  combinator: Binding;
  children: FilterNode[];
}

export interface FilterGroupDraft {
  kind?: 'group';
  combinator?: Binding;
  children?: FilterNodeDraft[];
}

export type FilterNode = FilterCondition | FilterGroup;
export type FilterNodeDraft = FilterConditionDraft | FilterGroupDraft;

export interface UseQueryFiltersOptions {
  fields: FieldDefinition[];
  value?: FilterGroup;
  defaultValue?: FilterGroup | FilterGroupDraft;
  onChange?: (rootGroup: FilterGroup) => void;
  defaultCombinator?: Binding;
  operationLabels?: Partial<Record<OperationType, string>>;
  typeOperationsMap?: Partial<Record<FieldType, OperationType[]>>;
  noValueOperations?: OperationType[];
}

export interface UseQueryFiltersResult {
  rootGroup: FilterGroup;
  fieldOptions: SelectOption<string>[];
  combinatorOptions: SelectOption<Binding>[];
  operationLabels: Record<OperationType, string>;
  addCondition: (
    groupId: string,
    draft?: FilterConditionDraft
  ) => void;
  addGroup: (groupId: string, draft?: FilterGroupDraft) => void;
  removeNode: (nodeId: string) => void;
  updateConditionField: (conditionId: string, field?: string) => void;
  updateConditionOperator: (
    conditionId: string,
    operator?: OperationType
  ) => void;
  updateConditionValue: (
    conditionId: string,
    value?: FilterValue
  ) => void;
  updateGroupCombinator: (
    groupId: string,
    combinator: Binding
  ) => void;
  replaceTree: (rootGroup: FilterGroup | FilterGroupDraft) => void;
  reset: () => void;
  getNode: (nodeId: string) => FilterNode | undefined;
  getGroup: (groupId: string) => FilterGroup | undefined;
  getCondition: (conditionId: string) => FilterCondition | undefined;
  getFieldDefinition: (
    fieldKey?: string
  ) => FieldDefinition | undefined;
  getAvailableOperations: (
    conditionId: string
  ) => SelectOption<OperationType>[];
  getSuggestions: (conditionId: string) => FilterValue[];
  shouldRenderValue: (conditionId: string) => boolean;
}
