import { useEffect } from 'react';

/** TODO: Extract useList from react-use so we can eliminate it from the dependency tree **/
import { useList } from 'react-use';
import { v4 as uuidv4 } from 'uuid';
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

export interface HookProps {
  properties: PropertyDescription[];
  operationLabels?: Record<OperationType, string>;
  typeOperationsMap?: Record<string, OperationType[]>;
  noValueOperations?: OperationType[];
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

export const useQueryFilters = ({
  properties,
  operationLabels = defaultOperationLabels,
  typeOperationsMap = defaultTypeOperationsMap,
  noValueOperations = defaultNoValueOperations,
}: HookProps) => {
  const [filters, filterActions] = useList<Filter>([]);
  const [selectStates, selectStateActions] = useList<FilterSelectState>([]);

  // TODO: make this a component property
  const defaultFilterType = 'string';

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

  const emptyFilter: Partial<Filter> = {
    field: undefined,
    operation: undefined,
    value: undefined,
    binding: filters.length === 0 ? undefined : Binding.AND,
    type: undefined,
  };

  const emptySelectState: FilterSelectState = {
    binding: defaultBindingOptions[0],
    bindingIndex: 0,
    operation: undefined,
    operationIndex: undefined,
    field: undefined,
    fieldIndex: undefined,
  };

  const fields = properties.map(property => ({
    label: property.label,
    value: property.key,
  }));

  const bindings = defaultBindingOptions;

  const getFieldType = (fieldKey?: string) => {
    return properties.find(prop => prop.key === fieldKey)?.type;
  };

  const onAddFilter = () => {
    filterActions.push({
      id: uuidv4(),
      ...emptyFilter,
    });
    selectStateActions.push(emptySelectState);
  };

  const createFilterRowProps = (index: number): FilterRowProps => {
    const filter = filters[index];
    const selectState = selectStates[index];
    const shouldRenderValueInput = filter.operation
      ? noValueOperations.includes(filter.operation) === false
      : true;

    const operations = typeOperationsMap[filter.type ?? defaultFilterType].map(
      operation => {
        return mapOperationToSelectOption(operation, operationLabels);
      }
    );

    const selectedProperty = properties.find(
      prop => prop.key === selectState.field?.value
    );

    const suggestions = selectedProperty?.suggestions ?? [];

    return {
      filter,
      fields,
      operations,
      bindings,
      suggestions,
      selectStates: {
        ...selectState,
        onChangeBinding: binding => {
          selectStateActions.updateAt(index, {
            ...selectState,
            binding: binding ?? undefined,
            bindingIndex: bindings.findIndex(
              val => val.value === binding?.value
            ),
          });
          filterActions.updateAt(index, {
            ...filter,
            binding: binding?.value,
          });
        },
        onChangeField: field => {
          selectStateActions.updateAt(index, {
            ...selectState,
            field: field ?? undefined,
            fieldIndex: fields.findIndex(val => val.value === field?.value),
          });

          filterActions.updateAt(index, {
            ...filter,
            field: field?.value,
            type: getFieldType(field?.value),
            operation: undefined,
            value: undefined,
          });
        },
        onChangeOperation: operation => {
          const shouldClearValue = operation
            ? noValueOperations.includes(operation.value)
            : false;

          selectStateActions.updateAt(index, {
            ...selectState,
            operation: operation ?? undefined,
            operationIndex: operations.findIndex(
              val => val.value === operation?.value
            ),
          });

          filterActions.updateAt(index, {
            ...filter,
            operation: operation?.value,
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
          filter.type === 'boolean' ? event.target.checked : event.target.value;

        filterActions.updateAt(index, {
          ...filter,
          value: transformFilterValue(value, filter.type),
        });
      },
    };
  };

  return {
    filters,
    onAddFilter,
    createFilterRowProps,
  };
};
