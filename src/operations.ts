export enum OperationType {
  CONTAINS = 'CONTAINS',
  DOES_NOT_CONTAIN = 'DOES_NOT_CONTAIN',
  IS = 'IS',
  IS_NOT = 'IS_NOT',
  IS_EMPTY = 'IS_EMPTY',
  IS_NOT_EMPTY = 'IS_NOT_EMPTY',
  EQUAL = 'EQUAL',
  NOT_EQUAL = 'NOT_EQUAL',
  BIGGER_THAN = 'BIGGER_THAN',
  LOWER_THAN = 'LOWER_THAN',
  BIGGER_OR_EQUAL_THAN = 'BIGGER_OR_EQUAL_THAN',
  LOWER_OR_EQUAL_THAN = 'LOWER_OR_EQUAL_THAN',
}

export const defaultOperationLabels: Record<OperationType, string> = {
  BIGGER_OR_EQUAL_THAN: '>=',
  BIGGER_THAN: '>',
  LOWER_OR_EQUAL_THAN: '<=',
  LOWER_THAN: '<',
  CONTAINS: 'contains',
  DOES_NOT_CONTAIN: 'does not contain',
  EQUAL: '=',
  IS: 'is',
  IS_EMPTY: 'is empty',
  IS_NOT: 'is not',
  IS_NOT_EMPTY: 'is not empty',
  NOT_EQUAL: '!=',
};

export const defaultNoValueOperations = [
  OperationType.IS_EMPTY,
  OperationType.IS_NOT_EMPTY,
];

export const defaultTypeOperationsMap = {
  string: [
    OperationType.CONTAINS,
    OperationType.DOES_NOT_CONTAIN,
    OperationType.IS,
    OperationType.IS_NOT,
    OperationType.IS_EMPTY,
    OperationType.IS_NOT_EMPTY,
  ],
  number: [
    OperationType.EQUAL,
    OperationType.NOT_EQUAL,
    OperationType.BIGGER_OR_EQUAL_THAN,
    OperationType.BIGGER_THAN,
    OperationType.LOWER_OR_EQUAL_THAN,
    OperationType.LOWER_THAN,
    OperationType.IS_EMPTY,
    OperationType.IS_NOT_EMPTY,
  ],
  boolean: [OperationType.IS],
};

export const mapOperationToSelectOption = (
  operation: OperationType,
  operationLabels: Record<OperationType, string>
) => ({
  value: operation,
  label: operationLabels[operation],
});
