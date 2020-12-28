import React from 'react';
import { Meta, Story } from '@storybook/react';
import { PropertyDescription } from '../../types';
import { FilterSelection } from './FilterSelection';

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

const Template: Story = args => (
  <FilterSelection properties={properties} {...args} />
);

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
