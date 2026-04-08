import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Binding } from '../bindings';
import { OperationType } from '../operations';
import {
  FieldDefinition,
  FilterCondition,
  FilterGroup,
} from '../types';
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

const getFirstCondition = (group: FilterGroup) => {
  const condition = group.children.find(
    (child): child is FilterCondition => child.kind === 'condition'
  );

  if (!condition) {
    throw new Error('Expected group to contain a condition');
  }

  return condition;
};

const getFirstGroup = (group: FilterGroup) => {
  const nestedGroup = group.children.find(
    (child): child is FilterGroup => child.kind === 'group'
  );

  if (!nestedGroup) {
    throw new Error('Expected group to contain a nested group');
  }

  return nestedGroup;
};

describe('useQueryFilters', () => {
  it('creates nested groups and conditions recursively', () => {
    const { result } = renderHook(() => useQueryFilters({ fields }));

    act(() => {
      result.current.addCondition(result.current.rootGroup.id);
      result.current.addGroup(result.current.rootGroup.id);
    });

    const nestedGroup = getFirstGroup(result.current.rootGroup);

    act(() => {
      result.current.addCondition(nestedGroup.id, { field: 'age' });
    });

    const updatedNestedGroup = getFirstGroup(
      result.current.rootGroup
    );

    expect(result.current.rootGroup.children).toHaveLength(2);
    expect(updatedNestedGroup.combinator).toBe(Binding.AND);
    expect(getFirstCondition(updatedNestedGroup).field).toBe('age');
  });

  it('clears operator and value when the field changes', () => {
    const { result } = renderHook(() =>
      useQueryFilters({
        fields,
        defaultValue: {
          kind: 'group',
          children: [{ kind: 'condition' }],
        },
      })
    );

    const conditionId = getFirstCondition(
      result.current.rootGroup
    ).id;

    act(() => {
      result.current.updateConditionField(conditionId, 'name');
      result.current.updateConditionOperator(
        conditionId,
        OperationType.CONTAINS
      );
      result.current.updateConditionValue(conditionId, 'Ada');
      result.current.updateConditionField(conditionId, 'age');
    });

    const condition = getFirstCondition(result.current.rootGroup);

    expect(condition.field).toBe('age');
    expect(condition.type).toBe('number');
    expect(condition.operator).toBeUndefined();
    expect(condition.value).toBeUndefined();
  });

  it('coerces values based on field type and hides no-value operations', () => {
    const { result } = renderHook(() =>
      useQueryFilters({
        fields,
        defaultValue: {
          kind: 'group',
          children: [{ kind: 'condition', field: 'age' }],
        },
      })
    );

    const conditionId = getFirstCondition(
      result.current.rootGroup
    ).id;

    act(() => {
      result.current.updateConditionOperator(
        conditionId,
        OperationType.BIGGER_THAN
      );
      result.current.updateConditionValue(conditionId, '42');
    });

    expect(getFirstCondition(result.current.rootGroup).value).toBe(
      42
    );

    act(() => {
      result.current.updateConditionOperator(
        conditionId,
        OperationType.IS_EMPTY
      );
    });

    expect(
      getFirstCondition(result.current.rootGroup).value
    ).toBeUndefined();
    expect(result.current.shouldRenderValue(conditionId)).toBe(false);
  });

  it('returns suggestions and available operations for nested conditions', () => {
    const { result } = renderHook(() =>
      useQueryFilters({
        fields,
        defaultValue: {
          kind: 'group',
          children: [
            {
              kind: 'group',
              children: [{ kind: 'condition', field: 'isAdmin' }],
            },
          ],
        },
      })
    );

    const nestedGroup = getFirstGroup(result.current.rootGroup);
    const conditionId = getFirstCondition(nestedGroup).id;

    expect(result.current.getSuggestions(conditionId)).toStrictEqual([
      true,
      false,
    ]);
    expect(
      result.current.getAvailableOperations(conditionId)
    ).toStrictEqual([
      {
        label: 'is',
        value: OperationType.IS,
      },
    ]);
  });

  it('parses string boolean payloads explicitly in default values', () => {
    const { result } = renderHook(() =>
      useQueryFilters({
        fields,
        defaultValue: {
          kind: 'group',
          children: [
            {
              kind: 'condition',
              field: 'isAdmin',
              operator: OperationType.IS,
              value: 'false',
            },
          ],
        },
      })
    );

    expect(getFirstCondition(result.current.rootGroup).value).toBe(
      false
    );
  });

  it('parses string boolean payloads explicitly on updates', () => {
    const { result } = renderHook(() =>
      useQueryFilters({
        fields,
        defaultValue: {
          kind: 'group',
          children: [{ kind: 'condition', field: 'isAdmin' }],
        },
      })
    );

    const conditionId = getFirstCondition(
      result.current.rootGroup
    ).id;

    act(() => {
      result.current.updateConditionOperator(
        conditionId,
        OperationType.IS
      );
      result.current.updateConditionValue(conditionId, 'false');
    });

    expect(getFirstCondition(result.current.rootGroup).value).toBe(
      false
    );
  });

  it('updates the combinator on a nested group', () => {
    const { result } = renderHook(() => useQueryFilters({ fields }));

    act(() => {
      result.current.addGroup(result.current.rootGroup.id);
    });

    const nestedGroupId = getFirstGroup(result.current.rootGroup).id;

    act(() => {
      result.current.updateGroupCombinator(nestedGroupId, Binding.OR);
    });

    expect(getFirstGroup(result.current.rootGroup).combinator).toBe(
      Binding.OR
    );
  });

  it('supports controlled usage through rootGroup and onChange', () => {
    const onChange = vi.fn();
    const controlledValue: FilterGroup = {
      id: 'root',
      kind: 'group',
      combinator: Binding.AND,
      children: [
        {
          id: 'condition-1',
          kind: 'condition',
          field: 'name',
          operator: OperationType.IS,
          value: 'Ada',
        },
      ],
    };
    const { result } = renderHook(() =>
      useQueryFilters({
        fields,
        value: controlledValue,
        onChange,
      })
    );

    act(() => {
      result.current.updateConditionValue('condition-1', 'Linus');
    });

    expect(onChange).toHaveBeenCalledWith({
      id: 'root',
      kind: 'group',
      combinator: Binding.AND,
      children: [
        {
          id: 'condition-1',
          kind: 'condition',
          field: 'name',
          operator: OperationType.IS,
          value: 'Linus',
          type: 'string',
        },
      ],
    });
  });
});
