import React, { FC } from 'react';
import { useList } from 'react-use';
import { Box, Button, CloseButton, Text, HStack, Input, Select, SimpleGrid } from "@chakra-ui/react"
import { filterOperations } from './filterOperations';

const properties: PropertyDescription[] = [
  {
    label: "Name",
    key: "name",
    type: "string",
    suggestions: [
      "Artemis",
      "Apollo",
      "Donna",
      "Dhio"
    ]
  },
  {
    label: "Age",
    key: "age",
    type: "number",
    suggestions: [1,2,3]
  },
  {
    label: "Has Owner",
    key: "has_owner",
    type: "boolean"
  }
]

interface Props {
  value?: Filter[];
  onChange?: (filters: Filter[]) => void;
}

export const FilterSelection: FC<Props> = () => {
  const { filters, onChangeFilter, onCreateFilter, onRemoveFilter } = useQueryFilters(properties);

  return (
    <SimpleGrid columns={1} spacingX={3} spacingY={3}>
      {filters.map((filter, index) => {
        return (
          <HStack key={index}>
            <CloseButton onClick={() => onRemoveFilter(index)}/>
            {index === 0 && (
              <Text>Where&nbsp;</Text>
            )} 

            {index !== 0 && (
              <Select
                maxWidth="6rem"
                value={filter.binding}
                onChange={(e) => {
                  onChangeFilter(index, {
                    ...filter,
                    binding: e.target.value as Filter["binding"],
                  });
                }}
              >
                <option value="and">And</option>
                <option value="or">Or</option>
              </Select>
            )}

            <Select
              value={filter.field}
              onChange={(e) => {
                onChangeFilter(index, {
                  ...filter,
                  field: e.target.value,
                  type: properties.find(prop => prop.key === e.target.value)?.type
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
              value={filter.operation}
              onChange={(e) => {
                onChangeFilter(index, {
                  ...filter,
                  operation: e.target.value,
                });
              }}
              placeholder="Operation"
            >
              {filterOperations[filter.type ?? "string"].map((op, iindex) => (
                <option key={iindex} value={op.value}>
                  {op.label}
                </option>
              ))}
            </Select>
            
            {![
              "is-empty",
              "is-not-empty"
            ].includes(filter.operation ?? "") && (
              <Input
                placeholder="Value"
                value={filter.value ?? ''}
                onChange={(e) => {
                  onChangeFilter(index, {
                    ...filter,
                    value: e.target.value,
                  });
                }}
              />
            )}
      
          </HStack>
        )
      })}

      <HStack>
        <Button onClick={onCreateFilter}>Add filter</Button>
        {/* <Button>Add nested filter</Button> */}
      </HStack>
      
      <Box>
        <pre>
          {JSON.stringify(filters, null, 2)}
        </pre>
      </Box>
    </SimpleGrid>
  )
};

interface StringPropertyDescription {
  label: string; 
  key: string;
  type: "string";
  suggestions?: string[];
}

interface NumberPropertyDescription {
  label: string;
  key: string;
  type: "number";
  suggestions?: number[];
}

interface BooleanPropertyDescription {
  label: string;
  key: string;
  type: "boolean";
}

type PropertyDescription = 
  | StringPropertyDescription
  | NumberPropertyDescription
  | BooleanPropertyDescription;

interface Filter {
  field?: string;
  operation?: string;
  value?: string;
  binding?: "and" | "or";
  type?: keyof (typeof filterOperations);
}

export const useQueryFilters = (_properties: PropertyDescription[]) => {
  const [filters, filterActions] = useList<Filter>([]);

  const onCreateFilter = () => {
    const emptyFilter: Filter = {
      field: undefined,
      operation: undefined,
      value: undefined,
      binding: filters.length === 0 ? undefined : "and",
      type: undefined,
    }

    filterActions.push(emptyFilter)
  }

  const onChangeFilter = (index: number, filter: Filter) => {
    filterActions.updateAt(index, filter)
  }

  const onRemoveFilter = (index: number) => {
    filterActions.removeAt(index);
  }

  return {
    filters,
    onCreateFilter,
    onChangeFilter,
    onRemoveFilter
  }
}