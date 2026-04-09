import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Binding } from '../bindings';
import { defineFieldType, defineFilterSchema, field } from '../types';
import { useFilterBuilder } from './useFilterBuilder';

const coordinateType = defineFieldType({
  type: 'coordinate',
  valueKind: 'text',
  defaultOperators: [],
  coerce: (value) =>
    typeof value === 'string' && value.length > 0 ? value : undefined,
});

const schema = defineFilterSchema({
  status: field.select({
    label: 'Status',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Active', value: 'active' },
    ],
    suggestions: ['draft', 'active'],
  }),
  score: field.number({
    label: 'Score',
    suggestions: [10, 50],
  }),
  publishedAt: field.date({
    label: 'Published At',
    suggestions: ['2026-04-01'],
  }),
  tags: field.multiSelect({
    label: 'Tags',
    options: [
      { label: 'Featured', value: 'featured' },
      { label: 'Internal', value: 'internal' },
    ],
    suggestions: ['featured'],
  }),
  published: field.boolean({
    label: 'Published',
  }),
  location: field.custom(coordinateType, {
    label: 'Location',
    suggestions: ['35.6762,139.6503'],
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

  it('builds semantic value input controllers for select, date, and multiselect fields', () => {
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
      condition.setField('publishedAt');
    });

    expect(result.current.root.firstCondition?.valueInput.kind).toBe(
      'date'
    );

    act(() => {
      result.current.root.firstCondition?.setField('tags');
    });

    const multiSelectInput =
      result.current.root.firstCondition?.valueInput;

    if (
      !multiSelectInput ||
      multiSelectInput.kind !== 'multiselect'
    ) {
      throw new Error('Expected a multiselect input controller');
    }

    act(() => {
      multiSelectInput.props.onChange({
        currentTarget: {
          selectedOptions: [
            { value: 'featured' },
            { value: 'internal' },
          ],
        },
      } as unknown as React.ChangeEvent<HTMLSelectElement>);
    });

    expect(result.current.rootGroup.children[0]).toMatchObject({
      kind: 'condition',
      value: ['featured', 'internal'],
    });

    act(() => {
      result.current.root.firstCondition?.setField('status');
    });

    expect(result.current.root.firstCondition?.valueInput.kind).toBe(
      'select'
    );
  });

  it('supports custom field types through field.custom', () => {
    const { result } = renderHook(() =>
      useFilterBuilder({
        schema,
      })
    );

    act(() => {
      result.current.root.addCondition();
    });

    act(() => {
      result.current.root.directConditions[0]?.setField('location');
      result.current.root.directConditions[0]?.setValue(
        '35.6762,139.6503'
      );
    });

    const condition = result.current.root.directConditions[0];

    expect(condition?.valueInput.kind).toBe('text');
    expect(result.current.rootGroup.children[0]).toMatchObject({
      kind: 'condition',
      field: 'location',
      value: '35.6762,139.6503',
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
