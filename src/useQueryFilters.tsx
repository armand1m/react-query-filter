import { useEffect } from 'react';
import { useList } from 'react-use';
import { shouldRenderValueInputForOperation } from './filterOperations';
import { Filter, FilterRowProps, PropertyDescription } from './types';

export const useQueryFilters = (properties: PropertyDescription[]) => {
  const [filters, filterActions] = useList<Filter>([]);

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
    const emptyFilter: Filter = {
      field: undefined,
      operation: undefined,
      value: undefined,
      binding: filters.length === 0 ? undefined : 'and',
      type: undefined,
    };

    filterActions.push(emptyFilter);
  };

  const createFilterRowProps = (index: number) => {
    const filter = filters[index];

    return {
      properties,
      filter,
      isFirst: index === 0,
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
        });
      },
      onChangeOperation: event => {
        const operationKey = event.target.value;
        const shouldClearValue =
          shouldRenderValueInputForOperation(operationKey) === false;

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
    } as FilterRowProps;
  };

  return {
    filters,
    onAddFilter,
    createFilterRowProps,
  };
};
