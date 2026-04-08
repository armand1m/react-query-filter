import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Binding } from '../bindings';
import { OperationType } from '../operations';
import { FieldDefinition, Filter } from '../types';
import { useQueryFilters } from './useQueryFilters';

const fields: FieldDefinition[] = [
  {
    key: 'name',
    label: 'Name',
    type: 'string',
    suggestions: ['Ada', 'Linus'],
  },
  {
    key: 'age',
    label: 'Age',
    type: 'number',
    suggestions: [18, 42],
  },
  {
    key: 'isAdmin',
    label: 'Is Admin',
    type: 'boolean',
    suggestions: [true, false],
  },
];

const getFirstFilter = (filters: Filter[]) => {
  const [filter] = filters;

  if (!filter) {
    throw new Error('Expected at least one filter');
  }

  return filter;
};

describe('useQueryFilters', () => {
  it('creates filters with an invariant first combinator', () => {
    const { result } = renderHook(() => useQueryFilters({ fields }));

    act(() => {
      result.current.addFilter();
      result.current.addFilter();
    });

    expect(result.current.filters).toHaveLength(2);
    expect(result.current.filters[0]?.combinator).toBeUndefined();
    expect(result.current.filters[1]?.combinator).toBe(Binding.AND);
  });

  it('clears operator and value when the field changes', () => {
    const { result } = renderHook(() => useQueryFilters({ fields }));

    act(() => {
      result.current.addFilter();
    });

    const filterId = getFirstFilter(result.current.filters).id;

    act(() => {
      result.current.updateField(filterId, 'name');
      result.current.updateOperator(filterId, OperationType.CONTAINS);
      result.current.updateValue(filterId, 'Ada');
      result.current.updateField(filterId, 'age');
    });

    const filter = getFirstFilter(result.current.filters);

    expect(filter.field).toBe('age');
    expect(filter.type).toBe('number');
    expect(filter.operator).toBeUndefined();
    expect(filter.value).toBeUndefined();
  });

  it('coerces values based on field type and hides no-value operations', () => {
    const { result } = renderHook(() => useQueryFilters({ fields }));

    act(() => {
      result.current.addFilter({ field: 'age' });
    });

    const filterId = getFirstFilter(result.current.filters).id;

    act(() => {
      result.current.updateOperator(
        filterId,
        OperationType.BIGGER_THAN
      );
      result.current.updateValue(filterId, '42');
    });

    expect(getFirstFilter(result.current.filters).value).toBe(42);

    act(() => {
      result.current.updateOperator(filterId, OperationType.IS_EMPTY);
    });

    expect(
      getFirstFilter(result.current.filters).value
    ).toBeUndefined();
    expect(result.current.shouldRenderValue(filterId)).toBe(false);
  });

  it('returns suggestions and available operations from the active field', () => {
    const { result } = renderHook(() =>
      useQueryFilters({
        fields,
        defaultValue: [{ field: 'isAdmin' }],
      })
    );

    const filterId = getFirstFilter(result.current.filters).id;

    expect(result.current.getSuggestions(filterId)).toStrictEqual([
      true,
      false,
    ]);
    expect(
      result.current.getAvailableOperations(filterId)
    ).toStrictEqual([
      {
        label: 'is',
        value: OperationType.IS,
      },
    ]);
  });

  it('supports controlled usage through value and onChange', () => {
    const onChange = vi.fn();
    const controlledValue = [
      {
        id: 'static-id',
        field: 'name',
        operator: OperationType.IS,
        value: 'Ada',
      },
    ];
    const { result } = renderHook(() =>
      useQueryFilters({
        fields,
        value: controlledValue,
        onChange,
      })
    );

    act(() => {
      result.current.updateValue('static-id', 'Linus');
    });

    expect(onChange).toHaveBeenCalledWith([
      {
        id: 'static-id',
        field: 'name',
        operator: OperationType.IS,
        value: 'Linus',
        type: 'string',
        combinator: undefined,
      },
    ]);
  });
});
