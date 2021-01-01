import { useEffect } from 'react';
import { useList } from 'react-use';
import { Binding, defaultBindingOptions } from '../bindings';
import {
  OperationType,
  defaultOperationLabels,
  defaultTypeOperationsMap,
  defaultNoValueOperations,
} from '../operations';
import { Filter, FilterRowProps, PropertyDescription } from '../types';

interface HookProps {
  properties: PropertyDescription[];
  operationLabels?: Record<OperationType, string>;
  typeOperationsMap?: Record<string, OperationType[]>;
  noValueOperations?: OperationType[];
}

export const useQueryFilters = ({
  properties,
  operationLabels = defaultOperationLabels,
  typeOperationsMap = defaultTypeOperationsMap,
  noValueOperations = defaultNoValueOperations,
}: HookProps) => {
  const [filters, filterActions] = useList<Filter>([]);
  const emptyFilter: Filter = {
    field: undefined,
    operation: undefined,
    value: undefined,
    binding: filters.length === 0 ? undefined : Binding.AND,
    type: undefined,
  };

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
  }, [filters, filterActions]);

  const getFieldType = (fieldKey: string) => {
    return properties.find(prop => prop.key === fieldKey)?.type;
  };

  const onAddFilter = () => {
    filterActions.push(emptyFilter);
  };

  const createFilterRowProps = (index: number): FilterRowProps => {
    const filter = filters[index];

    const shouldRenderValueInput = filter.operation
      ? noValueOperations.includes(filter.operation) === false
      : true;

    const operations = typeOperationsMap[filter.type ?? 'string'].map(
      operation => ({
        value: operation,
        label: operationLabels[operation],
      })
    );

    return {
      filter,
      shouldRenderBindingSelect: index !== 0,
      shouldRenderValueInput,
      fields: properties.map(property => ({
        label: property.label,
        value: property.key,
      })),
      operations,
      bindings: defaultBindingOptions,
      getFieldSelectOption: field => {
        const fieldFromProperties = properties.find(prop => prop.key === field);

        return fieldFromProperties
          ? {
              value: fieldFromProperties.key,
              label: fieldFromProperties.label,
            }
          : undefined;
      },
      onRemove: () => filterActions.removeAt(index),
      onChangeBinding: event => {
        filterActions.updateAt(index, {
          ...filter,
          binding: event.target.value as Filter['binding'],
        });
      },
      onChangeField: event => {
        const fieldKey = event.target.value;

        filterActions.updateAt(index, {
          ...filter,
          field: fieldKey,
          type: getFieldType(fieldKey),
          operation: undefined,
          value: undefined,
        });
      },
      onChangeOperation: event => {
        const operationKey = event.target.value as OperationType;
        const shouldClearValue = noValueOperations.includes(operationKey);

        filterActions.updateAt(index, {
          ...filter,
          operation: operationKey,
          value: shouldClearValue ? undefined : filter.value,
        });
      },
      onChangeValue: event => {
        filterActions.updateAt(index, {
          ...filter,
          value: event.target.value,
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
