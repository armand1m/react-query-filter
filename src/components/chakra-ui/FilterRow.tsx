import React, { FC } from 'react';
import { CloseButton, Text, HStack, Select, Tooltip } from '@chakra-ui/react';
import { FilterRowProps } from '../../';
import { ValueInput } from '../shared/ValueInput';

export const FilterRow: FC<FilterRowProps> = ({
  filter,
  fields,
  bindings,
  operations,
  suggestions,
  shouldRenderBindingSelect,
  shouldRenderValueInput,
  onRemove,
  onChangeValue,
  selectStates: {
    bindingIndex,
    fieldIndex,
    operationIndex,
    onChangeBinding,
    onChangeField,
    onChangeOperation,
  },
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
          value={bindingIndex}
          onChange={event => {
            const index = Number(event.target.value);
            onChangeBinding(bindings[index]);
          }}
        >
          {bindings.map((binding, index) => (
            <option
              value={index}
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
        value={fieldIndex}
        onChange={event => {
          const index = Number(event.target.value);
          onChangeField(fields[index]);
        }}
        placeholder="Field"
      >
        {fields.map((field, index) => (
          <option
            value={index}
            key={field.value}
            selected={filter.field === field.value}
          >
            {field.label}
          </option>
        ))}
      </Select>

      <Select
        size="sm"
        value={operationIndex}
        onChange={event => {
          const index = Number(event.target.value);
          onChangeOperation(operations[index]);
        }}
        placeholder="Operation"
      >
        {operations.map((operation, index) => (
          <option
            value={index}
            key={operation.value}
            selected={filter.operation === operation.value}
          >
            {operation.label}
          </option>
        ))}
      </Select>

      {shouldRenderValueInput && (
        <ValueInput
          size="sm"
          name={filter.id}
          type={filter.type}
          value={filter.value}
          onChange={onChangeValue}
          suggestions={suggestions}
        />
      )}
    </HStack>
  );
};
