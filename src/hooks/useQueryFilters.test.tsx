import { act, renderHook } from '@testing-library/react-hooks';
import {
  defaultTypeOperationsMap,
  defaultOperationLabels,
  mapOperationToSelectOption,
} from '../operations';
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

    it.skip('should return the proper operation options based on the type of the field selected in the filter', () => {});

    it('should remove an existing row', () => {
      const result = createTestFilter();
      const rowProps = result.current.createFilterRowProps(0);

      act(() => {
        rowProps.onRemove();
      });

      expect(result.current.filters).toHaveLength(0);
    });

    it.skip('should set the filter value when invoking the onChangeValue function', () => {});
  });
});
