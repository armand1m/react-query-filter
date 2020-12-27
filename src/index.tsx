import React, { FC, useEffect } from 'react';
import { useList } from 'react-use';
import {
  Button,
  CloseButton,
  Text,
  HStack,
  Input,
  Select,
  SimpleGrid,
  SlideFade,
  Code,
} from '@chakra-ui/react';
import { filterOperations } from './filterOperations';

const properties: PropertyDescription[] = [
  {
    label: 'Name',
    key: 'name',
    type: 'string',
    suggestions: ['Artemis', 'Apollo', 'Donna', 'Dhio'],
  },
  {
    label: 'Age',
    key: 'age',
    type: 'number',
    suggestions: [1, 2, 3],
  },
  {
    label: 'Has Owner',
    key: 'has_owner',
    type: 'boolean',
  },
];

interface Props {
  value?: Filter[];
  onChange?: (filters: Filter[]) => void;
}

export const FilterSelection: FC<Props> = () => {
  const {
    filters,
    onChangeFilter,
    onCreateFilter,
    onRemoveFilter,
    getFieldType,
    getFilterOperationsForType,
    shouldRenderInputForOperation,
  } = useQueryFilters(properties);

  return (
    <SimpleGrid columns={1} spacingX={3} spacingY={3}>
      {filters.map((filter, index) => {
        return (
          <SlideFade in={true} offsetY="20px" key={index}>
            <HStack>
              <CloseButton onClick={() => onRemoveFilter(index)} />

              {index === 0 ? (
                <Text fontSize="sm">Where&nbsp;</Text>
              ) : (
                <Select
                  size="sm"
                  maxWidth="6rem"
                  value={filter.binding}
                  onChange={e => {
                    onChangeFilter(index, {
                      ...filter,
                      binding: e.target.value as Filter['binding'],
                    });
                  }}
                >
                  <option value="and">And</option>
                  <option value="or">Or</option>
                </Select>
              )}

              <Select
                size="sm"
                value={filter.field}
                onChange={e => {
                  const fieldKey = e.target.value;

                  onChangeFilter(index, {
                    ...filter,
                    field: fieldKey,
                    type: getFieldType(fieldKey),
                  });
                }}
                placeholder="Field"
              >
                {properties.map(prop => (
                  <option value={prop.key} key={`${prop.key}-${index}`}>
                    {prop.label}
                  </option>
                ))}
              </Select>

              <Select
                size="sm"
                value={filter.operation}
                onChange={e => {
                  const operationKey = e.target.value;
                  const shouldClearValue =
                    shouldRenderInputForOperation(operationKey) === false;

                  onChangeFilter(index, {
                    ...filter,
                    operation: operationKey,
                    value: shouldClearValue ? undefined : filter.value,
                  });
                }}
                placeholder="Operation"
              >
                {getFilterOperationsForType(filter.type).map((op, index) => (
                  <option key={index} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </Select>

              {shouldRenderInputForOperation(filter.operation) && (
                <Input
                  size="sm"
                  placeholder="Value"
                  value={filter.value ?? ''}
                  onChange={e => {
                    onChangeFilter(index, {
                      ...filter,
                      value: e.target.value,
                    });
                  }}
                />
              )}
            </HStack>
          </SlideFade>
        );
      })}

      <HStack>
        <Button size="sm" onClick={onCreateFilter}>
          Add filter
        </Button>
        {/* <Button>Add nested filter</Button> */}
      </HStack>

      <Code>
        <pre>{JSON.stringify(filters, null, 2)}</pre>
      </Code>
    </SimpleGrid>
  );
};

interface StringPropertyDescription {
  label: string;
  key: string;
  type: 'string';
  suggestions?: string[];
}

interface NumberPropertyDescription {
  label: string;
  key: string;
  type: 'number';
  suggestions?: number[];
}

interface BooleanPropertyDescription {
  label: string;
  key: string;
  type: 'boolean';
}

type PropertyDescription =
  | StringPropertyDescription
  | NumberPropertyDescription
  | BooleanPropertyDescription;

interface Filter {
  field?: string;
  operation?: string;
  value?: string;
  binding?: 'and' | 'or';
  type?: keyof typeof filterOperations;
}

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

  const getFilterOperationsForType = (fieldType?: Filter['type']) => {
    return filterOperations[fieldType ?? 'string'];
  };

  const shouldRenderInputForOperation = (operation?: Filter['operation']) => {
    const noInputOperations = ['is-empty', 'is-not-empty'];
    return !noInputOperations.includes(operation ?? '');
  };

  const onCreateFilter = () => {
    const emptyFilter: Filter = {
      field: undefined,
      operation: undefined,
      value: undefined,
      binding: filters.length === 0 ? undefined : 'and',
      type: undefined,
    };

    filterActions.push(emptyFilter);
  };

  const onChangeFilter = (index: number, filter: Filter) => {
    filterActions.updateAt(index, filter);
  };

  const onRemoveFilter = (index: number) => {
    filterActions.removeAt(index);
  };

  return {
    filters,
    onCreateFilter,
    onChangeFilter,
    onRemoveFilter,
    getFieldType,
    getFilterOperationsForType,
    shouldRenderInputForOperation,
  };
};
