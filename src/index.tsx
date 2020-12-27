import React, { FC } from 'react';
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
import {
  getFilterOperationsForType,
  shouldRenderValueInputForOperation,
} from './filterOperations';
import { Filter, FilterRowProps, PropertyDescription } from './types';
import { useQueryFilters } from './useQueryFilters';

interface Props {
  value?: Filter[];
  onChange?: (filters: Filter[]) => void;
  properties: PropertyDescription[];
}

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
  return (
    <HStack>
      <CloseButton onClick={onRemove} />

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
          <option value={prop.key} key={`${prop.key}-${index}`}>
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

export const FilterSelection: FC<Props> = ({ properties }) => {
  const { filters, onAddFilter, createFilterRowProps } = useQueryFilters(
    properties
  );

  return (
    <SimpleGrid columns={1} spacingY={3}>
      {filters.map((_filter, index) => (
        <SlideFade in={true} key={index}>
          <FilterRow {...createFilterRowProps(index)} />
        </SlideFade>
      ))}

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
