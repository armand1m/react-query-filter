import React from 'react';
import { Meta, Story } from '@storybook/react';
import { PropertyDescription } from '../../';
import { FilterSelection } from './FilterSelection';
import { Filter } from '../../types';
import { OperationType } from '../../operations';
import { Binding } from '../../bindings';

const meta: Meta = {
  title: 'Chakra UI/Filter Selection',
  component: FilterSelection,
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

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

const initialValue: Filter[] = [
  {
    id: '35f924a2-9e1d-423c-8565-41619a5b8e8e',
    field: 'name',
    operation: OperationType.IS,
    value: 'Artemis',
    type: 'string',
  },
  {
    id: '91f7e872-f0e9-4fdf-8db1-6b51c0670817',
    binding: Binding.AND,
  },
];

const Template: Story = args => (
  <FilterSelection value={initialValue} properties={properties} {...args} />
);

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
