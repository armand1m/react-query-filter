import type { ChangeEventHandler } from 'react';
import type { Binding } from './bindings';
import type { OperationType } from './operations';

export interface SelectOption<T> {
  label: string;
  value: T;
}

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

export interface SchemaFieldBase<TType extends FieldType> {
  label: string;
  type: TType;
  suggestions?: SuggestionMap[TType][];
  operators?: OperationType[];
}

export type SchemaStringField = SchemaFieldBase<'string'>;
export type SchemaNumberField = SchemaFieldBase<'number'>;
export type SchemaBooleanField = SchemaFieldBase<'boolean'>;

export type SchemaField =
  | SchemaStringField
  | SchemaNumberField
  | SchemaBooleanField;

export type FilterSchema = Record<string, SchemaField>;

export type SchemaKey<TSchema extends FilterSchema> = Extract<
  keyof TSchema,
  string
>;

export type SchemaValueForField<TField extends SchemaField> =
  TField extends SchemaStringField
    ? string
    : TField extends SchemaNumberField
      ? number
      : boolean;

export type SchemaValue<TSchema extends FilterSchema> =
  SchemaValueForField<TSchema[SchemaKey<TSchema>]>;

export interface DefineFilterSchema {
  <TSchema extends FilterSchema>(schema: TSchema): TSchema;
}

export interface FieldFactory {
  string: (
    field: Omit<SchemaStringField, 'type'>
  ) => SchemaStringField;
  number: (
    field: Omit<SchemaNumberField, 'type'>
  ) => SchemaNumberField;
  boolean: (
    field: Omit<SchemaBooleanField, 'type'>
  ) => SchemaBooleanField;
}

export const field: FieldFactory = {
  string: (value): SchemaStringField => ({
    ...value,
    type: 'string',
  }),
  number: (value): SchemaNumberField => ({
    ...value,
    type: 'number',
  }),
  boolean: (value): SchemaBooleanField => ({
    ...value,
    type: 'boolean',
  }),
};

export const defineFilterSchema = <TSchema extends FilterSchema>(
  schema: TSchema
) => schema;

export interface NativeSelectProps<TValue extends string> {
  onChange: ChangeEventHandler<HTMLSelectElement>;
  options: SelectOption<TValue>[];
  value: TValue | '';
}

export interface TextValueInputController {
  kind: 'text';
  props: {
    list?: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    value: string;
  };
  suggestions: string[];
}

export interface NumberValueInputController {
  kind: 'number';
  props: {
    onChange: ChangeEventHandler<HTMLInputElement>;
    value: number | '';
  };
  suggestions: number[];
}

export interface BooleanValueInputController {
  kind: 'boolean';
  props: {
    checked: boolean;
    onChange: ChangeEventHandler<HTMLInputElement>;
  };
  suggestions: boolean[];
}

export interface NoValueInputController {
  kind: 'none';
}

export type ValueInputController =
  | TextValueInputController
  | NumberValueInputController
  | BooleanValueInputController
  | NoValueInputController;

export interface ConditionController<
  TSchema extends FilterSchema = FilterSchema,
> {
  id: string;
  kind: 'condition';
  field?: SchemaKey<TSchema>;
  operator?: OperationType;
  remove: () => void;
  availableOperators: SelectOption<OperationType>[];
  suggestions: SchemaValue<TSchema>[];
  setField: (field?: SchemaKey<TSchema>) => void;
  setOperator: (operator?: OperationType) => void;
  setValue: (value?: SchemaValue<TSchema>) => void;
  fieldSelectProps: () => NativeSelectProps<SchemaKey<TSchema>>;
  operatorSelectProps: () => NativeSelectProps<OperationType>;
  valueInput: ValueInputController;
}

export interface GroupController<
  TSchema extends FilterSchema = FilterSchema,
> {
  id: string;
  kind: 'group';
  combinator: Binding;
  children: BuilderNodeController<TSchema>[];
  directConditions: ConditionController<TSchema>[];
  directGroups: GroupController<TSchema>[];
  firstCondition?: ConditionController<TSchema>;
  isRoot: boolean;
  remove: () => void;
  addCondition: (draft?: FilterConditionDraft) => void;
  addGroup: (draft?: FilterGroupDraft) => void;
  setCombinator: (combinator: Binding) => void;
  combinatorSelectProps: () => NativeSelectProps<Binding>;
}

export type BuilderNodeController<TSchema extends FilterSchema> =
  | ConditionController<TSchema>
  | GroupController<TSchema>;

export interface UseFilterBuilderOptions<
  TSchema extends FilterSchema = FilterSchema,
> {
  defaultCombinator?: Binding;
  defaultValue?: FilterGroup | FilterGroupDraft;
  noValueOperations?: OperationType[];
  onChange?: (rootGroup: FilterGroup) => void;
  schema: TSchema;
  value?: FilterGroup;
}

export interface UseFilterBuilderResult<
  TSchema extends FilterSchema = FilterSchema,
> {
  root: GroupController<TSchema>;
  rootGroup: FilterGroup;
  schema: TSchema;
  reset: () => void;
  replaceTree: (rootGroup: FilterGroup | FilterGroupDraft) => void;
}
