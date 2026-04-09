import type { ChangeEventHandler, SelectHTMLAttributes } from 'react';
import type { Binding } from './bindings';
import type { OperationType } from './operations';

export interface SelectOption<T> {
  label: string;
  value: T;
}

export type FilterScalar = string | number | boolean;
export type FilterValue = FilterScalar | readonly FilterScalar[];
export type FieldType = string;

export type ValueInputKind =
  | 'text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'select'
  | 'multiselect'
  | 'none';

export interface FieldTypeDefinition<
  TType extends string = string,
  TValue extends FilterValue = FilterValue,
> {
  type: TType;
  valueKind: ValueInputKind;
  defaultOperators: OperationType[];
  coerce?: (value: unknown) => FilterValue | undefined;
  isEmpty?: (value: FilterValue | undefined) => boolean;
  readonly __valueType?: TValue;
}

export interface SchemaFieldBase<
  TValue extends FilterValue = FilterValue,
  TType extends string = string,
> {
  readonly __valueType?: TValue;
  label: string;
  type: TType;
  valueKind: ValueInputKind;
  suggestions?: FilterScalar[];
  operators?: OperationType[];
  options?: SelectOption<string>[];
  meta?: Record<string, unknown>;
  coerce?: (value: unknown) => FilterValue | undefined;
  isEmpty?: (value: FilterValue | undefined) => boolean;
}

export interface FieldDefinitionBase<
  TValue extends FilterValue = FilterValue,
  TType extends string = string,
> extends SchemaFieldBase<TValue, TType> {
  key: string;
}

export type FieldDefinition = FieldDefinitionBase;
export type SchemaField = SchemaFieldBase;
export type FilterSchema = Record<string, SchemaField>;

export type SchemaKey<TSchema extends FilterSchema> = Extract<
  keyof TSchema,
  string
>;

export type SchemaValueForField<TField extends SchemaField> =
  TField extends SchemaFieldBase<infer TValue, string>
    ? TValue
    : never;

export type SchemaValue<TSchema extends FilterSchema> =
  SchemaValueForField<TSchema[SchemaKey<TSchema>]>;

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
  getSuggestions: (conditionId: string) => FilterScalar[];
  shouldRenderValue: (conditionId: string) => boolean;
}

export interface DefineFilterSchema {
  <TSchema extends FilterSchema>(schema: TSchema): TSchema;
}

type SelectLikeChangeHandler = ChangeEventHandler<
  HTMLInputElement | HTMLSelectElement
>;

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

export interface DateValueInputController {
  kind: 'date';
  props: {
    list?: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    value: string;
  };
  suggestions: string[];
}

export interface DateTimeValueInputController {
  kind: 'datetime-local';
  props: {
    list?: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    value: string;
  };
  suggestions: string[];
}

export interface TimeValueInputController {
  kind: 'time';
  props: {
    list?: string;
    onChange: ChangeEventHandler<HTMLInputElement>;
    value: string;
  };
  suggestions: string[];
}

export interface SelectValueInputController {
  kind: 'select';
  props: {
    onChange: SelectLikeChangeHandler;
    value: string;
  };
  options: SelectOption<string>[];
  suggestions: string[];
}

export interface MultiSelectValueInputController {
  kind: 'multiselect';
  props: Pick<
    SelectHTMLAttributes<HTMLSelectElement>,
    'multiple' | 'value'
  > & {
    onChange: ChangeEventHandler<HTMLSelectElement>;
  };
  options: SelectOption<string>[];
  suggestions: string[];
}

export interface NoValueInputController {
  kind: 'none';
}

export type ValueInputController =
  | TextValueInputController
  | NumberValueInputController
  | BooleanValueInputController
  | DateValueInputController
  | DateTimeValueInputController
  | TimeValueInputController
  | SelectValueInputController
  | MultiSelectValueInputController
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
  suggestions: FilterScalar[];
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

const createStringListInputProps = (
  value: string | undefined,
  onChange: ChangeEventHandler<HTMLInputElement>,
  suggestions: string[],
  conditionId: string
) => ({
  list:
    suggestions.length > 0 ? `suggestions-${conditionId}` : undefined,
  onChange,
  value: value ?? '',
});

const defaultIsEmpty = (value: FilterValue | undefined) =>
  value === undefined ||
  (Array.isArray(value) ? value.length === 0 : value === '');

const coerceTextValue = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return String(value);
};

const coerceNumberValue = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'number') {
    return Number.isNaN(value) ? undefined : value;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? undefined : parsed;
};

const coerceBooleanValue = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();

    if (normalizedValue === 'true') {
      return true;
    }

    if (normalizedValue === 'false') {
      return false;
    }
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return undefined;
};

const coerceStringArrayValue = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry))
      .filter((entry) => entry.length > 0);
  }

  return [String(value)];
};

export const defineFieldType = <
  TType extends string,
  TValue extends FilterValue,
>(
  definition: FieldTypeDefinition<TType, TValue>
) => definition;

export type StringSchemaField = SchemaFieldBase<string, 'string'>;
export type NumberSchemaField = SchemaFieldBase<number, 'number'>;
export type BooleanSchemaField = SchemaFieldBase<boolean, 'boolean'>;
export type DateSchemaField = SchemaFieldBase<string, 'date'>;
export type DateTimeSchemaField = SchemaFieldBase<string, 'datetime'>;
export type TimeSchemaField = SchemaFieldBase<string, 'time'>;
export type SelectSchemaField = SchemaFieldBase<string, 'select'>;
export type MultiSelectSchemaField = SchemaFieldBase<
  readonly string[],
  'multiselect'
>;
export type CurrencySchemaField = SchemaFieldBase<number, 'currency'>;
export type PercentSchemaField = SchemaFieldBase<number, 'percent'>;
export type DurationSchemaField = SchemaFieldBase<number, 'duration'>;
export type EmailSchemaField = SchemaFieldBase<string, 'email'>;
export type IdSchemaField = SchemaFieldBase<string, 'id'>;

export const builtinFieldTypes = {
  string: defineFieldType({
    type: 'string',
    valueKind: 'text',
    defaultOperators: [],
    coerce: coerceTextValue,
    isEmpty: defaultIsEmpty,
  }),
  number: defineFieldType({
    type: 'number',
    valueKind: 'number',
    defaultOperators: [],
    coerce: coerceNumberValue,
    isEmpty: defaultIsEmpty,
  }),
  boolean: defineFieldType({
    type: 'boolean',
    valueKind: 'boolean',
    defaultOperators: [],
    coerce: coerceBooleanValue,
    isEmpty: defaultIsEmpty,
  }),
  date: defineFieldType({
    type: 'date',
    valueKind: 'date',
    defaultOperators: [],
    coerce: coerceTextValue,
    isEmpty: defaultIsEmpty,
  }),
  dateTime: defineFieldType({
    type: 'datetime',
    valueKind: 'datetime-local',
    defaultOperators: [],
    coerce: coerceTextValue,
    isEmpty: defaultIsEmpty,
  }),
  time: defineFieldType({
    type: 'time',
    valueKind: 'time',
    defaultOperators: [],
    coerce: coerceTextValue,
    isEmpty: defaultIsEmpty,
  }),
  select: defineFieldType({
    type: 'select',
    valueKind: 'select',
    defaultOperators: [],
    coerce: coerceTextValue,
    isEmpty: defaultIsEmpty,
  }),
  multiSelect: defineFieldType({
    type: 'multiselect',
    valueKind: 'multiselect',
    defaultOperators: [],
    coerce: coerceStringArrayValue,
    isEmpty: (value) =>
      value === undefined ||
      (Array.isArray(value) && value.length === 0),
  }),
  currency: defineFieldType({
    type: 'currency',
    valueKind: 'number',
    defaultOperators: [],
    coerce: coerceNumberValue,
    isEmpty: defaultIsEmpty,
  }),
  percent: defineFieldType({
    type: 'percent',
    valueKind: 'number',
    defaultOperators: [],
    coerce: coerceNumberValue,
    isEmpty: defaultIsEmpty,
  }),
  duration: defineFieldType({
    type: 'duration',
    valueKind: 'number',
    defaultOperators: [],
    coerce: coerceNumberValue,
    isEmpty: defaultIsEmpty,
  }),
  email: defineFieldType({
    type: 'email',
    valueKind: 'text',
    defaultOperators: [],
    coerce: coerceTextValue,
    isEmpty: defaultIsEmpty,
  }),
  id: defineFieldType({
    type: 'id',
    valueKind: 'text',
    defaultOperators: [],
    coerce: coerceTextValue,
    isEmpty: defaultIsEmpty,
  }),
} as const;

type InferFieldValue<TDefinition> =
  TDefinition extends FieldTypeDefinition<string, infer TValue>
    ? TValue
    : never;

type CustomFieldConfig<
  TDefinition extends FieldTypeDefinition<string, any>,
> = Omit<
  SchemaFieldBase<InferFieldValue<TDefinition>, TDefinition['type']>,
  'type' | 'valueKind' | 'coerce' | 'isEmpty'
>;

export interface FieldFactory {
  string: (
    field: Omit<
      StringSchemaField,
      'type' | 'valueKind' | 'coerce' | 'isEmpty'
    >
  ) => StringSchemaField;
  number: (
    field: Omit<
      NumberSchemaField,
      'type' | 'valueKind' | 'coerce' | 'isEmpty'
    >
  ) => NumberSchemaField;
  boolean: (
    field: Omit<
      BooleanSchemaField,
      'type' | 'valueKind' | 'coerce' | 'isEmpty'
    >
  ) => BooleanSchemaField;
  date: (
    field: Omit<
      DateSchemaField,
      'type' | 'valueKind' | 'coerce' | 'isEmpty'
    >
  ) => DateSchemaField;
  dateTime: (
    field: Omit<
      DateTimeSchemaField,
      'type' | 'valueKind' | 'coerce' | 'isEmpty'
    >
  ) => DateTimeSchemaField;
  time: (
    field: Omit<
      TimeSchemaField,
      'type' | 'valueKind' | 'coerce' | 'isEmpty'
    >
  ) => TimeSchemaField;
  select: (
    field: Omit<
      SelectSchemaField,
      'type' | 'valueKind' | 'coerce' | 'isEmpty'
    >
  ) => SelectSchemaField;
  multiSelect: (
    field: Omit<
      MultiSelectSchemaField,
      'type' | 'valueKind' | 'coerce' | 'isEmpty'
    >
  ) => MultiSelectSchemaField;
  currency: (
    field: Omit<
      CurrencySchemaField,
      'type' | 'valueKind' | 'coerce' | 'isEmpty'
    >
  ) => CurrencySchemaField;
  percent: (
    field: Omit<
      PercentSchemaField,
      'type' | 'valueKind' | 'coerce' | 'isEmpty'
    >
  ) => PercentSchemaField;
  duration: (
    field: Omit<
      DurationSchemaField,
      'type' | 'valueKind' | 'coerce' | 'isEmpty'
    >
  ) => DurationSchemaField;
  email: (
    field: Omit<
      EmailSchemaField,
      'type' | 'valueKind' | 'coerce' | 'isEmpty'
    >
  ) => EmailSchemaField;
  id: (
    field: Omit<
      IdSchemaField,
      'type' | 'valueKind' | 'coerce' | 'isEmpty'
    >
  ) => IdSchemaField;
  custom: <TDefinition extends FieldTypeDefinition<string, any>>(
    definition: TDefinition,
    field: CustomFieldConfig<TDefinition>
  ) => SchemaFieldBase<
    InferFieldValue<TDefinition>,
    TDefinition['type']
  >;
}

const createField = <
  TDefinition extends FieldTypeDefinition<string, any>,
>(
  definition: TDefinition,
  field: CustomFieldConfig<TDefinition>
) =>
  ({
    ...field,
    type: definition.type,
    valueKind: definition.valueKind,
    coerce: definition.coerce,
    isEmpty: definition.isEmpty,
  }) as SchemaFieldBase<
    InferFieldValue<TDefinition>,
    TDefinition['type']
  >;

export const createFieldFactory = (): FieldFactory => ({
  string: (value) =>
    createField<typeof builtinFieldTypes.string>(
      builtinFieldTypes.string,
      value
    ) as StringSchemaField,
  number: (value) =>
    createField<typeof builtinFieldTypes.number>(
      builtinFieldTypes.number,
      value
    ) as NumberSchemaField,
  boolean: (value) =>
    createField<typeof builtinFieldTypes.boolean>(
      builtinFieldTypes.boolean,
      value
    ) as BooleanSchemaField,
  date: (value) =>
    createField<typeof builtinFieldTypes.date>(
      builtinFieldTypes.date,
      value
    ) as DateSchemaField,
  dateTime: (value) =>
    createField<typeof builtinFieldTypes.dateTime>(
      builtinFieldTypes.dateTime,
      value
    ) as DateTimeSchemaField,
  time: (value) =>
    createField<typeof builtinFieldTypes.time>(
      builtinFieldTypes.time,
      value
    ) as TimeSchemaField,
  select: (value) =>
    createField<typeof builtinFieldTypes.select>(
      builtinFieldTypes.select,
      value
    ) as SelectSchemaField,
  multiSelect: (value) =>
    createField<typeof builtinFieldTypes.multiSelect>(
      builtinFieldTypes.multiSelect,
      value
    ) as MultiSelectSchemaField,
  currency: (value) =>
    createField<typeof builtinFieldTypes.currency>(
      builtinFieldTypes.currency,
      value
    ) as CurrencySchemaField,
  percent: (value) =>
    createField<typeof builtinFieldTypes.percent>(
      builtinFieldTypes.percent,
      value
    ) as PercentSchemaField,
  duration: (value) =>
    createField<typeof builtinFieldTypes.duration>(
      builtinFieldTypes.duration,
      value
    ) as DurationSchemaField,
  email: (value) =>
    createField<typeof builtinFieldTypes.email>(
      builtinFieldTypes.email,
      value
    ) as EmailSchemaField,
  id: (value) =>
    createField<typeof builtinFieldTypes.id>(
      builtinFieldTypes.id,
      value
    ) as IdSchemaField,
  custom: (definition, value) => createField(definition, value),
});

export const field: FieldFactory = createFieldFactory();

export const defineFilterSchema = <TSchema extends FilterSchema>(
  schema: TSchema
) => schema;

export const createTextLikeController = (
  kind: 'text' | 'date' | 'datetime-local' | 'time',
  value: string | undefined,
  onChange: ChangeEventHandler<HTMLInputElement>,
  suggestions: string[],
  conditionId: string
):
  | TextValueInputController
  | DateValueInputController
  | DateTimeValueInputController
  | TimeValueInputController => ({
  kind,
  props: createStringListInputProps(
    value,
    onChange,
    suggestions,
    conditionId
  ),
  suggestions,
});
