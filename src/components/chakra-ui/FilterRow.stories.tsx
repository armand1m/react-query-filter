import React from 'react';
import { Meta, Story } from '@storybook/react';
import { FilterRowProps, PropertyDescription } from '../../types';
import { FilterRow } from './FilterRow';

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

const meta: Meta<FilterRowProps> = {
  title: 'Chakra UI/Filter Row',
  component: FilterRow,
  parameters: {
    controls: { expanded: true },
  },
  args: {
    filter: {},
    isFirst: true,
    properties,
  },
};

export default meta;

const Template: Story<FilterRowProps> = args => {
  return <FilterRow {...args} />;
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const FirstRow = Template.bind({});

FirstRow.args = {};

export const OtherRow = Template.bind({});

OtherRow.args = {
  isFirst: false,
};

export const FilterWithoutValue = Template.bind({});

FilterWithoutValue.args = {
  isFirst: false,
  filter: {
    operation: 'is-not-empty',
    field: 'name',
  },
};
