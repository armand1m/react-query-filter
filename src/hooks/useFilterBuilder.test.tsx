import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Binding } from '../bindings';
import { defineFilterSchema, field } from '../types';
import { useFilterBuilder } from './useFilterBuilder';

const schema = defineFilterSchema({
  status: field.string({
    label: 'Status',
    suggestions: ['draft', 'active'],
  }),
  score: field.number({
    label: 'Score',
    suggestions: [10, 50],
  }),
  published: field.boolean({
    label: 'Published',
  }),
});

describe('useFilterBuilder', () => {
  it('creates starter conditions and groups without raw ids in consumer code', () => {
    const { result } = renderHook(() =>
      useFilterBuilder({
        schema,
      })
    );

    act(() => {
      result.current.root.addCondition();
      result.current.root.addGroup();
    });

    expect(result.current.root.directConditions[0]?.field).toBe(
      'status'
    );
    expect(
      result.current.root.directConditions[0]?.operator
    ).toBeDefined();
    expect(
      result.current.root.directGroups[0]?.firstCondition?.field
    ).toBe('status');
  });

  it('exposes native-friendly select and input props without casts', () => {
    const { result } = renderHook(() =>
      useFilterBuilder({
        schema,
      })
    );

    act(() => {
      result.current.root.addCondition();
    });

    const condition = result.current.root.firstCondition;

    if (!condition) {
      throw new Error('Expected a starter condition');
    }

    act(() => {
      condition.fieldSelectProps().onChange({
        currentTarget: { value: 'score' },
      } as React.ChangeEvent<HTMLSelectElement>);
    });

    const updatedCondition = result.current.root.firstCondition;

    if (
      !updatedCondition ||
      updatedCondition.valueInput.kind !== 'number'
    ) {
      throw new Error('Expected a number input controller');
    }

    const numberInput = updatedCondition.valueInput;

    act(() => {
      numberInput.props.onChange({
        currentTarget: {
          value: '42',
          valueAsNumber: 42,
        },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.root.firstCondition?.field).toBe('score');
    expect(result.current.rootGroup.children[0]).toMatchObject({
      kind: 'condition',
      value: 42,
    });
  });

  it('keeps group combinator helpers on the controller layer', () => {
    const { result } = renderHook(() =>
      useFilterBuilder({
        schema,
      })
    );

    act(() => {
      result.current.root.addGroup();
    });

    const nestedGroup = result.current.root.directGroups[0];

    if (!nestedGroup) {
      throw new Error('Expected nested group');
    }

    act(() => {
      nestedGroup.combinatorSelectProps().onChange({
        currentTarget: { value: Binding.OR },
      } as React.ChangeEvent<HTMLSelectElement>);
    });

    expect(result.current.root.directGroups[0]?.combinator).toBe(
      Binding.OR
    );
  });
});
