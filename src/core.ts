import { Binding } from './bindings';
import { SelectOption } from './select-option';
import {
  defaultNoValueOperations,
  defaultOperationLabels,
  defaultTypeOperationsMap,
  OperationType,
} from './operations';
import {
  FieldDefinition,
  FieldType,
  Filter,
  FilterDraft,
  FilterValue,
} from './types';

const createFallbackId = () =>
  `rqf_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

export const createFilterId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return createFallbackId();
};

export const createFieldOption = (
  field: FieldDefinition
): SelectOption<string> => ({
  label: field.label,
  value: field.key,
});

export const resolveFieldType = (
  fields: FieldDefinition[],
  fieldKey?: string
): FieldType | undefined =>
  fields.find((field) => field.key === fieldKey)?.type;

export const resolveFieldDefinition = (
  fields: FieldDefinition[],
  fieldKey?: string
) => fields.find((field) => field.key === fieldKey);

export const coerceFilterValue = (
  value: FilterValue | undefined,
  type?: FieldType
): FilterValue | undefined => {
  if (value === undefined || type === undefined) {
    return value;
  }

  switch (type) {
    case 'boolean':
      return Boolean(value);
    case 'number':
      return typeof value === 'number' ? value : Number(value);
    case 'string':
    default:
      return String(value);
  }
};

export const normalizeFilter = (
  filter: Filter | FilterDraft,
  index: number,
  fields: FieldDefinition[],
  defaultCombinator: Binding,
  noValueOperations: OperationType[]
): Filter => {
  const type = filter.field
    ? resolveFieldType(fields, filter.field)
    : filter.type;
  const operator = filter.operator;

  return {
    id: 'id' in filter && filter.id ? filter.id : createFilterId(),
    field: filter.field,
    type,
    operator,
    value:
      operator && noValueOperations.includes(operator)
        ? undefined
        : coerceFilterValue(filter.value, type),
    combinator:
      index === 0
        ? undefined
        : (filter.combinator ?? defaultCombinator),
  };
};

export const normalizeFilters = (
  filters: Array<Filter | FilterDraft>,
  fields: FieldDefinition[],
  defaultCombinator: Binding,
  noValueOperations: OperationType[] = defaultNoValueOperations
) =>
  filters.map((filter, index) =>
    normalizeFilter(
      filter,
      index,
      fields,
      defaultCombinator,
      noValueOperations
    )
  );

export const resolveOperationLabels = (
  overrides?: Partial<Record<OperationType, string>>
) => ({
  ...defaultOperationLabels,
  ...overrides,
});

export const resolveTypeOperationsMap = (
  overrides?: Partial<Record<FieldType, OperationType[]>>
) => ({
  ...defaultTypeOperationsMap,
  ...overrides,
});
