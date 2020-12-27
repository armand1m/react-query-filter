export interface FilterOperation {
  value: string;
  label: string;
}

export const stringFilterOperations: FilterOperation[] = [
  {
    value: 'contains',
    label: 'contains...',
  },
  {
    value: 'does-not-contain',
    label: 'does not contain...',
  },
  {
    value: 'is',
    label: 'is...',
  },
  {
    value: 'is-not',
    label: 'is not...',
  },
  {
    value: 'is-empty',
    label: 'is empty...',
  },
  {
    value: 'is-not-empty',
    label: 'is not empty...',
  },
];

export const numberOperations: FilterOperation[] = [
  {
    value: '=',
    label: '=',
  },
  {
    value: '!=',
    label: '!=',
  },
  {
    value: '>',
    label: '>',
  },
  {
    value: '<',
    label: '<',
  },
  {
    value: '>=',
    label: '>=',
  },
  {
    value: '<=',
    label: '<=',
  },
  {
    value: 'is-empty',
    label: 'is empty...',
  },
  {
    value: 'is-not-empty',
    label: 'is not empty...',
  },
];

const booleanOperations: FilterOperation[] = [
  {
    value: 'is',
    label: 'is...',
  },
];

export const filterOperations = {
  string: stringFilterOperations,
  number: numberOperations,
  boolean: booleanOperations,
};

export type SupportedFieldType = keyof typeof filterOperations;

export const getFilterOperationsForType = (
  fieldType: SupportedFieldType = 'string'
) => {
  return filterOperations[fieldType];
};

export const shouldRenderValueInputForOperation = (
  operationKey: string = ''
) => {
  const noInputOperations = ['is-empty', 'is-not-empty'];
  return !noInputOperations.includes(operationKey);
};
