import React, { FC } from 'react';
import Select from 'react-select';
import { CloseButton, Text, HStack, Tooltip } from '@chakra-ui/react';
import { FilterRowProps } from '../../';
import { ValueInput } from '../shared/ValueInput';

const selectStyles = {
  control: (styles: any) => ({
    ...styles,
    width: '180px',
  }),
};

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
    binding,
    field,
    operation,
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
          styles={selectStyles}
          value={binding}
          onChange={selectedBinding => {
            if (!selectedBinding) {
              return;
            }

            onChangeBinding(selectedBinding);
          }}
          options={bindings}
        />
      ) : (
        <Text fontSize="sm">Where&nbsp;</Text>
      )}

      <Select
        styles={selectStyles}
        value={field}
        onChange={selectedField => {
          if (!selectedField) {
            return;
          }

          onChangeField(selectedField);
        }}
        placeholder="Field"
        options={fields}
      />

      <Select
        styles={selectStyles}
        value={operation}
        onChange={selectedOperation => {
          if (!selectedOperation) {
            return;
          }

          onChangeOperation(selectedOperation);
        }}
        placeholder="Operation"
        options={operations}
      />

      {shouldRenderValueInput && (
        <ValueInput
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
