import React from 'react';
import { Meta, Story } from '@storybook/react';
import { FilterSelection } from '.';

const meta: Meta = {
  title: 'Filter Selection',
  component: FilterSelection,
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story = _args => <FilterSelection />;

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
