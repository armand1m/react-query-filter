import React, { FC } from 'react';
import { Button, HStack, SimpleGrid, SlideFade, Code } from '@chakra-ui/react';
import { useQueryFilters, Filter, PropertyDescription } from '../../';
import { FilterRow } from './FilterRow';

interface Props {
  value?: Filter[];
  onChange?: (filters: Filter[]) => void;
  properties: PropertyDescription[];
}

export const FilterSelection: FC<Props> = ({ properties }) => {
  const { filters, onAddFilter, createFilterRowProps } = useQueryFilters({
    properties,
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
