import { act, renderHook } from '@testing-library/react-hooks';
import { ChangeEvent } from 'react';
import { Binding } from '../bindings';
import {
  defaultTypeOperationsMap,
  defaultOperationLabels,
  mapOperationToSelectOption,
  OperationType,
} from '../operations';
import { Filter } from '../types';
import { useQueryFilters, HookProps } from './useQueryFilters';

const properties: HookProps['properties'] = [
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

const createTestFilter = () => {
  const { result } = renderHook(() => useQueryFilters({ properties }));

  expect(result.current.filters).toHaveLength(0);

  act(() => {
    result.current.onAddFilter();
  });

  expect(result.current.filters).toHaveLength(1);

  return result;
};

describe('useQueryFilters', () => {
  it('should initialize state with empty filters array', () => {
    const { result } = renderHook(() => useQueryFilters({ properties }));

    expect(result.current.filters).toStrictEqual([]);
  });

  it('should add empty filter when invoking the onAddFilter function', () => {
    createTestFilter();
  });

  it('should initialize using a given initial state', () => {
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
    const { result } = renderHook(() =>
      useQueryFilters({ initialValue, properties })
    );

    expect(result.current.filters).toStrictEqual(initialValue);
  });

  describe('createFilterRowProps', () => {
    it('should return the string operation choices by default if the filter has no field selected', () => {
      const result = createTestFilter();
      const rowProps = result.current.createFilterRowProps(0);
      const expectedOperations = defaultTypeOperationsMap.string.map(
        operation => {
          return mapOperationToSelectOption(operation, defaultOperationLabels);
        }
      );
      expect(rowProps.operations).toStrictEqual(expectedOperations);
    });

    it('should set the field when invoking onChangeField', () => {
      const result = createTestFilter();
      const initialRowProps = result.current.createFilterRowProps(0);
      const fields = initialRowProps.fields;
      const nextField = fields[0];

      act(() => {
        initialRowProps.selectStates.onChangeField(nextField);
      });

      const updatedRowProps = result.current.createFilterRowProps(0);

      expect(updatedRowProps.filter.field).toBe(nextField.value);
    });

    it('should set the operation when invoking onChangeOperation', () => {
      const result = createTestFilter();
      const initialRowProps = result.current.createFilterRowProps(0);
      const operations = initialRowProps.operations;
      const nextOperation = operations[0];

      act(() => {
        initialRowProps.selectStates.onChangeOperation(nextOperation);
      });

      const updatedRowProps = result.current.createFilterRowProps(0);

      expect(updatedRowProps.filter.operation).toBe(nextOperation.value);
    });

    it('should force the first filter to always have the binding set as "undefined"', () => {
      const result = createTestFilter();
      const initialRowProps = result.current.createFilterRowProps(0);
      const orBinding = initialRowProps.bindings[1];

      act(() => {
        initialRowProps.selectStates.onChangeBinding(orBinding);
      });

      const updatedRowProps = result.current.createFilterRowProps(0);

      expect(updatedRowProps.filter.binding).toBe(undefined);
      expect(updatedRowProps.shouldRenderBindingSelect).toBeFalsy();
    });

    it('should set the binding if the filter being is not the first one', () => {
      const result = createTestFilter();

      act(() => {
        result.current.onAddFilter();
      });

      expect(result.current.filters).toHaveLength(2);

      const initialRowProps = result.current.createFilterRowProps(1);
      const orBinding = initialRowProps.bindings[1];

      act(() => {
        initialRowProps.selectStates.onChangeBinding(orBinding);
      });

      const updatedRowProps = result.current.createFilterRowProps(1);

      expect(updatedRowProps.filter.binding).toBe(orBinding.value);
    });

    it('should remove an existing row', () => {
      const result = createTestFilter();
      const rowProps = result.current.createFilterRowProps(0);

      act(() => {
        rowProps.onRemove();
      });

      expect(result.current.filters).toHaveLength(0);
    });

    it('should set the filter value to the event target value when invoking the onChangeValue function in a filter with string type', () => {
      const result = createTestFilter();
      const initialRowProps = result.current.createFilterRowProps(0);

      const changeEvent = {
        target: {
          value: 'example value change',
        },
      } as ChangeEvent<HTMLInputElement>;

      act(() => {
        initialRowProps.onChangeValue(changeEvent);
      });

      const updatedRowProps = result.current.createFilterRowProps(0);

      expect(updatedRowProps.filter.value).toBe(changeEvent.target.value);
    });

    it('should set the filter value to the event target checked property when invoking the onChangeValue function in a filter with boolean type', () => {
      const result = createTestFilter();
      const initialRowProps = result.current.createFilterRowProps(0);
      const fields = initialRowProps.fields;
      const nextField = fields.find(field => field.value === 'has_owner');

      if (!nextField) {
        throw new Error('Failed to find owner field');
      }

      act(() => {
        initialRowProps.selectStates.onChangeField(nextField);
      });

      let updatedRowProps = result.current.createFilterRowProps(0);

      expect(updatedRowProps.filter.type).toBe('boolean');

      const changeEvent = {
        target: {
          checked: true,
        },
      } as ChangeEvent<HTMLInputElement>;

      act(() => {
        updatedRowProps.onChangeValue(changeEvent);
      });

      updatedRowProps = result.current.createFilterRowProps(0);

      expect(updatedRowProps.filter.value).toBe(changeEvent.target.checked);
    });

    it('should clear the filter value when the operation does not require a value to be set', () => {
      const result = createTestFilter();
      const initialRowProps = result.current.createFilterRowProps(0);
      const emptyOperation = mapOperationToSelectOption(
        OperationType.IS_EMPTY,
        defaultOperationLabels
      );

      act(() => {
        initialRowProps.selectStates.onChangeOperation(emptyOperation);
      });

      const updatedRowProps = result.current.createFilterRowProps(0);

      expect(updatedRowProps.filter.value).toBeUndefined();
      expect(updatedRowProps.shouldRenderValueInput).toBeFalsy();
    });
  });
});
