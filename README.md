# react-query-filter

<div style="max-width: 700px">
  <img src="./.github/chakra-ui-demo.gif?raw=true">
</div>

> **Heads up:** This is still a work in progress. A lot of breaking change might happen and a lot of features are still missing. PR's are very welcome but please open an issue first describing what you think could be better.

Set of utilities to implement a Query Builder for filters.

This library ships a `useQueryFilters` hook that you can use to implement an UI on top of it.

The `useQueryFilters` will track state changes and enable you to build your own UI implementation on top of it.

 - [Features](#features)
 - [Signature](#signature)
 - [Usage](#usage)
 - [License](#license)

## Features

 - [x] Fully headless: Bring your own UI
 - [x] Conditional operations based on field type
    - [x] Strings
    - [x] Numbers
    - [x] Boolean
    - [ ] Dates
    - [ ] Single Select
    - [ ] Multiple Select
 - [x] Conditional value based on operation type
    - Condition value is always `undefined` if operation type is `IS_EMPTY` or `IS_NOT_EMPTY`
 - [x] `AND` & `OR` logic gates supported, implemented as the `Binding` enum
 - [x] Custom Operation Labels enabled
 - [ ] Support for controlled state
 - [ ] Support for nested conditions

## Types

```tsx
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
  
export enum Binding {
  AND = 'AND',
  OR = 'OR',
}

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

export interface Filter {
  field?: string;
  operation?: OperationType;
  value?: string;
  binding?: Binding;
  type?: PropertyDescription['type'];
}

export interface SelectOption<T> {
  label: string;
  value: T;
}

export interface FilterRowProps {
  filter: Filter;
  fields: SelectOption<string>[];
  bindings: SelectOption<Binding>[];
  operations: SelectOption<OperationType>[];
  shouldRenderBindingSelect: boolean;
  shouldRenderValueInput: boolean;
  getFieldSelectOption: (field: string) => SelectOption<string> | undefined;
  onRemove: () => void;
  onChangeBinding: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeField: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeOperation: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeValue: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface HookProps {
  properties: PropertyDescription[];
  operationLabels?: Record<OperationType, string>;
  typeOperationsMap?: Record<string, OperationType[]>;
  noValueOperations?: OperationType[];
}

const useQueryFilters: (props: HookProps) => {
  filters: Filter[];
  onAddFilter: () => void;
  createFilterRowProps: (index: number) => FilterRowProps;
}
```

## Usage

Code speaks for itself, so here is an example implementing a `FilterSelection` and `FilterRow` components using `useQueryFilters` and `chakra-ui`.

First, make sure you have the following dependencies in place:

```sh
# install chakra and dependencies
yarn add @chakra-ui/react @emotion/react @emotion/styled framer-motion

# install react-query-filter
yarn add react-query-filter
```

```tsx
/** FilterSelection.tsx */
import React, { FC } from 'react';
import {
  Button,
  HStack,
  SimpleGrid,
  SlideFade,
  Code,
} from '@chakra-ui/react';
import { useQueryFilters, Filter, PropertyDescription } from 'react-query-filter';
import { FilterRow } from './FilterRow';

interface Props {
  value?: Filter[];
  onChange?: (filters: Filter[]) => void;
  properties: PropertyDescription[];
}

export const FilterSelection: FC<Props> = ({ properties }) => {
  const { filters, onAddFilter, createFilterRowProps } = useQueryFilters({
    properties
  });

  return (
    <SimpleGrid columns={1} spacingY={4}>
      <SimpleGrid columns={1} spacingY={3}>
        {filters.map((_filter, index) => (
          <SlideFade in={true} key={index}>
            <FilterRow {...createFilterRowProps(index)} />
          </SlideFade>
        ))}
      </SimpleGrid>

      <HStack>
        <Button size="sm" onClick={onAddFilter}>
          Add filter
        </Button>
      </HStack>

      <Code padding={4}>
        <pre>{JSON.stringify(filters, null, 2)}</pre>
      </Code>
    </SimpleGrid>
  );
};
```

```tsx
/** FilterRow.tsx */
import React from 'react';
import {
  CloseButton,
  Text,
  HStack,
  Input,
  Select,
  Tooltip,
} from '@chakra-ui/react';
import { FilterRowProps } from 'react-query-filter';

export const FilterRow: React.FC<FilterRowProps> = ({
  filter,
  fields,
  bindings,
  operations,
  shouldRenderBindingSelect,
  shouldRenderValueInput,
  onRemove,
  onChangeBinding,
  onChangeField,
  onChangeOperation,
  onChangeValue,
}) => (
  <HStack>
    <Tooltip shouldWrapChildren label="Remove Filter" placement="left">
      <CloseButton onClick={onRemove} />
    </Tooltip>

    {shouldRenderBindingSelect ? (
      <Select
        size="sm"
        maxWidth="6rem"
        value={filter.binding}
        onChange={onChangeBinding}
      >
        {bindings.map(binding => (
          <option
            value={binding.value}
            key={binding.value}
            selected={filter.binding === binding.value}
          >
            {binding.label}
          </option>
        ))}
      </Select>
    ) : (
      <Text fontSize="sm">Where&nbsp;</Text>
    )}

    <Select
      size="sm"
      value={filter.field}
      onChange={onChangeField}
      placeholder="Field"
    >
      {fields.map(field => (
        <option
          value={field.value}
          key={field.value}
          selected={filter.field === field.value}
        >
          {field.label}
        </option>
      ))}
    </Select>

    <Select
      size="sm"
      value={filter.operation}
      onChange={onChangeOperation}
      placeholder="Operation"
    >
      {operations.map(operation => (
        <option
          value={operation.value}
          key={operation.value}
          selected={filter.operation === operation.value}
        >
          {operation.label}
        </option>
      ))}
    </Select>

    {shouldRenderValueInput && (
      <Input
        size="sm"
        placeholder="Value"
        value={filter.value ?? ''}
        onChange={onChangeValue}
      />
    )}
  </HStack>
);
```

This component can then be used like this:

```tsx
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

<FilterSelection properties={properties} />
```

## License

MIT © [Armando Magalhaes](https://github.com/armand1m)
