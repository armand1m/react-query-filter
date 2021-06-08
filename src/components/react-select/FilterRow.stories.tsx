import React from 'react';
import { Meta, Story } from '@storybook/react';
import { FilterRowProps } from '../../';
import { FilterRow } from './FilterRow';

const meta: Meta<FilterRowProps> = {
  title: 'React Select/Filter Row',
  component: FilterRow,
  parameters: {
    controls: { expanded: true },
  },
  args: {
    filter: {
      id: 'test-id',
    },
    fields: [],
    operations: [],
    bindings: [],
    selectStates: {
      onChangeBinding: () => {},
      onChangeField: () => {},
      onChangeOperation: () => {},
    },
    shouldRenderBindingSelect: false,
    shouldRenderValueInput: true,
  },
};

export default meta;

const Template: Story<FilterRowProps> = args => {
  return <FilterRow {...args} />;
};

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};
