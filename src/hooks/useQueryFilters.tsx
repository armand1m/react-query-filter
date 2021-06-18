import { useCallback, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useList } from './useList';
import { Binding, defaultBindingOptions } from '../bindings';
import {
  OperationType,
  defaultOperationLabels,
  defaultTypeOperationsMap,
  defaultNoValueOperations,
  mapOperationToSelectOption,
} from '../operations';
import {
  Filter,
  FilterRowProps,
  FilterSelectState,
  PropertyDescription,
} from '../types';
import { SelectOption } from '../select-option';

export interface HookProps {
  initialValue?: Filter[];
  properties: PropertyDescription[];
  bindings?: SelectOption<Binding>[];
  operationLabels?: Record<OperationType, string>;
  typeOperationsMap?: Record<string, OperationType[]>;
  noValueOperations?: OperationType[];
  defaultFilterType?: PropertyDescription['type'];
  defaultBinding?: Binding;
}

const transformFilterValue = (
  value: any,
  type?: PropertyDescription['type']
) => {
  switch (type) {
    case 'boolean':
      return Boolean(value);
    case 'number':
      return Number(value);
    default:
      return String(value);
  }
};
const mapPropertyToSelectOption = (
  property: PropertyDescription
): SelectOption<string> => ({
  label: property.label,
  value: property.key,
});

export const useQueryFilters = ({
  properties,
  initialValue = [],
  defaultFilterType = 'string',
  defaultBinding = Binding.AND,
  bindings = defaultBindingOptions,
  operationLabels = defaultOperationLabels,
  typeOperationsMap = defaultTypeOperationsMap,
  noValueOperations = defaultNoValueOperations,
}: HookProps) => {
  const fieldSelectOptions = properties.map(mapPropertyToSelectOption);

  const getOperationsForFilterType = useCallback(
    (filterType?: keyof typeof typeOperationsMap) => {
      const operationsMap =
        filterType && filterType in typeOperationsMap
          ? typeOperationsMap[filterType]
          : typeOperationsMap[defaultFilterType];

      const operations = operationsMap.map(operation => {
        return mapOperationToSelectOption(operation, operationLabels);
      });

      return operations;
    },
    [defaultFilterType, typeOperationsMap, operationLabels]
  );

  const mapFilterToSelectState = useCallback(
    (filter: Filter): FilterSelectState => {
      const fieldIndex = fieldSelectOptions.findIndex(
        op => op.value === filter.field
      );
      const field = fieldSelectOptions[fieldIndex];

      const operations = getOperationsForFilterType(filter.type);
      const operationIndex = operations.findIndex(
        op => op.value === filter.operation
      );
      const operation = operations[operationIndex];

      const bindingIndex = bindings.findIndex(
        op => op.value === filter.binding
      );
      const binding = bindings[bindingIndex];

      return {
        field,
        binding,
        operation,
        fieldIndex,
        bindingIndex,
        operationIndex,
      };
    },
    [fieldSelectOptions, getOperationsForFilterType, bindings]
  );

  const [filters, filterActions] = useList<Filter>(initialValue);
  const [selectStates, selectStateActions] = useList<FilterSelectState>(
    initialValue.map(mapFilterToSelectState)
  );

  useEffect(() => {
    if (!filters.length) return;

    const firstFilter = filters[0];

    /** Forces the first filter to never have a binding */
    if (firstFilter.binding !== undefined) {
      filterActions.updateAt(0, {
        ...firstFilter,
        binding: undefined,
      });
    }

    const firstSelectState = selectStates[0];

    if (firstSelectState.binding !== undefined) {
      selectStateActions.updateAt(0, {
        ...firstSelectState,
        binding: undefined,
        bindingIndex: undefined,
      });
    }
  }, [filters, filterActions, selectStates, selectStateActions]);

  const emptyFilter: Partial<Filter> = useMemo(
    () => ({
      field: undefined,
      operation: undefined,
      value: undefined,
      binding: filters.length === 0 ? undefined : defaultBinding,
      type: undefined,
    }),
    [filters, defaultBinding]
  );

  const emptySelectState: FilterSelectState = useMemo(
    () => ({
      binding: bindings.find(op => op.value === defaultBinding),
      bindingIndex: bindings.findIndex(op => op.value === defaultBinding),
      operation: undefined,
      operationIndex: undefined,
      field: undefined,
      fieldIndex: undefined,
    }),
    [bindings, defaultBinding]
  );

  const getFieldType = useCallback(
    (fieldKey: string) => {
      return properties.find(prop => prop.key === fieldKey)?.type;
    },
    [properties]
  );

  const onAddFilter = useCallback(() => {
    filterActions.push({
      id: uuidv4(),
      ...emptyFilter,
    });
    selectStateActions.push(emptySelectState);
  }, [filterActions, selectStateActions, emptySelectState, emptyFilter]);

  const createFilterRowProps = useCallback(
    (index: number): FilterRowProps => {
      const filter = filters[index];
      const selectState = selectStates[index];
      const shouldRenderValueInput = filter.operation
        ? noValueOperations.includes(filter.operation) === false
        : true;

      const operations = getOperationsForFilterType(filter.type);

      const selectedProperty = properties.find(
        prop => prop.key === selectState.field?.value
      );

      const suggestions = selectedProperty?.suggestions ?? [];

      return {
        filter,
        fields: fieldSelectOptions,
        operations,
        bindings,
        suggestions,
        selectStates: {
          ...selectState,
          onChangeBinding: binding => {
            selectStateActions.updateAt(index, {
              ...selectState,
              binding,
              bindingIndex: bindings.findIndex(
                val => val.value === binding.value
              ),
            });
            filterActions.updateAt(index, {
              ...filter,
              binding: binding.value,
            });
          },
          onChangeField: field => {
            selectStateActions.updateAt(index, {
              ...selectState,
              field,
              fieldIndex: fieldSelectOptions.findIndex(
                val => val.value === field.value
              ),
            });

            filterActions.updateAt(index, {
              ...filter,
              field: field.value,
              type: getFieldType(field.value),
              operation: undefined,
              value: undefined,
            });
          },
          onChangeOperation: operation => {
            const shouldClearValue = noValueOperations.includes(
              operation.value
            );

            selectStateActions.updateAt(index, {
              ...selectState,
              operation,
              operationIndex: operations.findIndex(
                val => val.value === operation.value
              ),
            });

            filterActions.updateAt(index, {
              ...filter,
              operation: operation.value,
              value: shouldClearValue ? undefined : filter.value,
            });
          },
        },
        shouldRenderBindingSelect: index !== 0,
        shouldRenderValueInput,
        onRemove: () => {
          filterActions.removeAt(index);
          selectStateActions.removeAt(index);
        },
        onChangeValue: event => {
          const value =
            filter.type === 'boolean'
              ? event.target.checked
              : event.target.value;

          filterActions.updateAt(index, {
            ...filter,
            value: transformFilterValue(value, filter.type),
          });
        },
      };
    },
    [
      filters,
      filterActions,
      selectStates,
      selectStateActions,
      noValueOperations,
      getFieldType,
      getOperationsForFilterType,
      properties,
      bindings,
      fieldSelectOptions,
    ]
  );

  return {
    filters,
    onAddFilter,
    createFilterRowProps,
  };
};
