import React from 'react';
import { Input, InputProps, Checkbox } from '@chakra-ui/react';
import { FilterRowProps, PropertyDescription } from '../../';

/**
 * TODO: add support for date types.
 */
export const ValueInput: React.FC<{
  name: string;
  size?: InputProps['size'];
  type?: PropertyDescription['type'];
  value: any;
  onChange: FilterRowProps['onChangeValue'];
  suggestions?: any[];
}> = ({ name, size, type, value, onChange, suggestions }) => {
  const datalist = suggestions && (
    <datalist id={name}>
      {suggestions.map(suggestion => (
        <option value={suggestion} />
      ))}
    </datalist>
  );

  let input = (
    <Input
      list={name}
      size={size}
      placeholder="Value"
      type={type}
      value={value}
      onChange={onChange}
    />
  );

  if (type === 'boolean') {
    input = <Checkbox checked={Boolean(value)} onChange={onChange} />;
  }

  return (
    <>
      {datalist}
      {input}
    </>
  );
};
