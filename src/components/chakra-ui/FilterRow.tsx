import React, { FC } from 'react';
import {
  CloseButton,
  Text,
  HStack,
  Input,
  Select,
  Tooltip,
} from '@chakra-ui/react';
import { FilterRowProps } from '../../';

export const FilterRow: FC<FilterRowProps> = ({
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
}) => {
  return (
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
};
