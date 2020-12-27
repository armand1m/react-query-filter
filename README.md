# react-query-filters

> **Heads up:** This is still a work in progress. A lot of breaking change might happen and a lot of features are still missing. PR's are very welcome but please open an issue first describing what you think could be better.

Set of utilities to implement a Query Builder for filters.

This library ships a `useQueryFilters` hook that you can use to implement an UI on top of it.

The `useQueryFilters` will track state changes and enable you do build your query filter builder using the styles you want.

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
    - Value is always undefined if operation type is `is-empty` or `is-not-empty`
 - [x] `AND` & `OR` logic gates supported
 - [ ] Support for controlled state
 - [ ] Support for nested conditions

## Signature

```tsx
type PropertyDescription =
  | StringPropertyDescription
  | NumberPropertyDescription
  | BooleanPropertyDescription;

interface Filter {
  field?: string;
  operation?: string;
  value?: string;
  binding?: 'and' | 'or';
  type?: SupportedFieldType;
}

interface FilterRowProps {
  properties: PropertyDescription[];
  filter: Filter;
  isFirst: boolean;
  onRemove: () => void;
  onChangeBinding: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeField: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeOperation: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onChangeValue: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const useQueryFilters: (properties: PropertyDescription[]) => {
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

# install react-query-filters
yarn add react-query-filters
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
import { useQueryFilters, Filter, PropertyDescription } from 'react-query-filters';
import { FilterRow } from './FilterRow';

interface Props {
  value?: Filter[];
  onChange?: (filters: Filter[]) => void;
  properties: PropertyDescription[];
}

export const FilterSelection: FC<Props> = ({ properties }) => {
  const { filters, onAddFilter, createFilterRowProps } = useQueryFilters(
    properties
  );

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
import React, { FC } from 'react';
import {
  CloseButton,
  Text,
  HStack,
  Input,
  Select,
  Tooltip,
} from '@chakra-ui/react';
import { FilterRowProps, useRowUtilities } from 'react-query-filters';

export const FilterRow: FC<FilterRowProps> = ({
  properties,
  filter,
  isFirst,
  onRemove,
  onChangeBinding,
  onChangeField,
  onChangeOperation,
  onChangeValue,
}) => {
  const {
    getFilterOperationsForType,
    shouldRenderValueInputForOperation,
  } = useRowUtilities();

  return (
    <HStack>
      <Tooltip shouldWrapChildren label="Remove Filter" placement="left">
        <CloseButton onClick={onRemove} />
      </Tooltip>

      {isFirst ? (
        <Text fontSize="sm">Where&nbsp;</Text>
      ) : (
        <Select
          size="sm"
          maxWidth="6rem"
          value={filter.binding}
          onChange={onChangeBinding}
        >
          <option value="and">And</option>
          <option value="or">Or</option>
        </Select>
      )}

      <Select
        size="sm"
        value={filter.field}
        onChange={onChangeField}
        placeholder="Field"
      >
        {properties.map((prop, index) => (
          <option value={prop.key} key={index}>
            {prop.label}
          </option>
        ))}
      </Select>

      <Select
        size="sm"
        value={filter.operation}
        onChange={onChangeOperation}
        placeholder="Operation"
      >
        {getFilterOperationsForType(filter.type).map((operation, index) => (
          <option value={operation.value} key={index}>
            {operation.label}
          </option>
        ))}
      </Select>

      {shouldRenderValueInputForOperation(filter.operation) && (
        <Input
          size="sm"
          placeholder="Value"
          value={filter.value ?? ''}
          onChange={onChangeValue}
        />
      )}
    </HStack>
  );
};
```

This component can the be used like this:

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

<div style="max-width: 700px">
  <img src="./.github/chakra-ui-demo.gif?raw=true">
</div>

## License

MIT © [Armando Magalhaes](https://github.com/armand1m)