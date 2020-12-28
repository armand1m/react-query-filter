import React, { FC } from 'react';
import {
  CloseButton,
  Text,
  HStack,
  Input,
  Select,
  Tooltip,
} from '@chakra-ui/react';
import { useRowUtilities } from '../../filterOperations';
import { FilterRowProps } from '../../types';

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
