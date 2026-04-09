import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Binding } from '../bindings';
import { OperationType } from '../operations';
import {
  defineFieldType,
  FieldDefinition,
  FilterCondition,
  FilterGroup,
  field,
} from '../types';
import { useQueryFilters } from './useQueryFilters';

const coordinateType = defineFieldType({
  type: 'coordinate',
  valueKind: 'text',
  defaultOperators: [OperationType.IS],
  coerce: (value) =>
    typeof value === 'string' && value.length > 0 ? value : undefined,
});

const fields: FieldDefinition[] = [
  {
    key: 'name',
    ...field.string({
      label: 'Name',
      suggestions: ['Ada', 'Linus'],
    }),
  },
  {
    key: 'age',
    ...field.number({
      label: 'Age',
      suggestions: [18, 42],
    }),
  },
  {
    key: 'isAdmin',
    ...field.boolean({
      label: 'Is Admin',
      suggestions: [true, false],
    }),
  },
  {
    key: 'publishedAt',
    ...field.date({
      label: 'Published At',
      suggestions: ['2026-04-01'],
    }),
  },
  {
    key: 'status',
    ...field.select({
      label: 'Status',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Active', value: 'active' },
      ],
      suggestions: ['draft', 'active'],
    }),
  },
  {
    key: 'tags',
    ...field.multiSelect({
      label: 'Tags',
      options: [
        { label: 'Featured', value: 'featured' },
        { label: 'Launch', value: 'launch' },
      ],
      suggestions: ['featured', 'launch'],
    }),
  },
  {
    key: 'location',
    ...field.custom(coordinateType, {
      label: 'Location',
      suggestions: ['35.6762,139.6503'],
    }),
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

  it('keeps semantic date values as strings', () => {
    const { result } = renderHook(() =>
      useQueryFilters({
        fields,
        defaultValue: {
          kind: 'group',
          children: [{ kind: 'condition', field: 'publishedAt' }],
        },
      })
    );

    const conditionId = getFirstCondition(
      result.current.rootGroup
    ).id;

    act(() => {
      result.current.updateConditionOperator(
        conditionId,
        OperationType.BEFORE
      );
      result.current.updateConditionValue(conditionId, '2026-04-15');
    });

    expect(getFirstCondition(result.current.rootGroup)).toMatchObject(
      {
        field: 'publishedAt',
        type: 'date',
        value: '2026-04-15',
      }
    );
  });

  it('coerces multiselect values to string arrays', () => {
    const { result } = renderHook(() =>
      useQueryFilters({
        fields,
        defaultValue: {
          kind: 'group',
          children: [{ kind: 'condition', field: 'tags' }],
        },
      })
    );

    const conditionId = getFirstCondition(
      result.current.rootGroup
    ).id;

    act(() => {
      result.current.updateConditionOperator(
        conditionId,
        OperationType.ANY_OF
      );
      result.current.updateConditionValue(conditionId, [
        'featured',
        'launch',
      ]);
    });

    expect(
      getFirstCondition(result.current.rootGroup).value
    ).toStrictEqual(['featured', 'launch']);
  });

  it('uses custom field coercion for semantic custom types', () => {
    const { result } = renderHook(() =>
      useQueryFilters({
        fields,
        defaultValue: {
          kind: 'group',
          children: [{ kind: 'condition', field: 'location' }],
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
      result.current.updateConditionValue(
        conditionId,
        '35.6762,139.6503'
      );
    });

    expect(getFirstCondition(result.current.rootGroup)).toMatchObject(
      {
        field: 'location',
        type: 'coordinate',
        value: '35.6762,139.6503',
      }
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
