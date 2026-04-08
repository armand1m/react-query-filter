import { useCallback, useMemo, useRef, useState } from 'react';
import { Binding, defaultBindingOptions } from '../bindings';
import {
  createFieldOption,
  createFilterId,
  normalizeFilter,
  normalizeFilters,
  resolveFieldDefinition,
  resolveOperationLabels,
  resolveTypeOperationsMap,
} from '../core';
import {
  defaultNoValueOperations,
  mapOperationToSelectOption,
  OperationType,
} from '../operations';
import { SelectOption } from '../select-option';
import {
  FieldDefinition,
  Filter,
  FilterDraft,
  FilterValue,
  UseQueryFiltersOptions,
  UseQueryFiltersResult,
} from '../types';

const removeValueForOperator = (
  filter: Filter,
  operator: OperationType | undefined,
  noValueOperations: OperationType[]
) => ({
  ...filter,
  operator,
  value:
    operator && noValueOperations.includes(operator)
      ? undefined
      : filter.value,
});

const normalizeDraft = (
  draft: FilterDraft | undefined,
  index: number,
  fields: FieldDefinition[],
  defaultCombinator: Binding,
  noValueOperations: OperationType[]
) =>
  normalizeFilter(
    {
      id: createFilterId(),
      ...draft,
    },
    index,
    fields,
    defaultCombinator,
    noValueOperations
  );

export const useQueryFilters = ({
  fields,
  value,
  defaultValue = [],
  onChange,
  defaultCombinator = Binding.AND,
  operationLabels: operationLabelOverrides,
  typeOperationsMap: typeOperationsOverrides,
  noValueOperations = defaultNoValueOperations,
}: UseQueryFiltersOptions): UseQueryFiltersResult => {
  const isControlled = value !== undefined;
  const fieldOptions = useMemo(
    () => fields.map(createFieldOption),
    [fields]
  );
  const combinatorOptions = useMemo(() => defaultBindingOptions, []);
  const operationLabels = useMemo(
    () => resolveOperationLabels(operationLabelOverrides),
    [operationLabelOverrides]
  );
  const typeOperationsMap = useMemo(
    () => resolveTypeOperationsMap(typeOperationsOverrides),
    [typeOperationsOverrides]
  );
  const defaultFilters = useMemo(
    () =>
      normalizeFilters(
        defaultValue,
        fields,
        defaultCombinator,
        noValueOperations
      ),
    [defaultValue, fields, defaultCombinator, noValueOperations]
  );
  const [internalFilters, setInternalFilters] =
    useState(defaultFilters);
  const controlledFilters = useMemo(
    () =>
      isControlled
        ? normalizeFilters(
            value,
            fields,
            defaultCombinator,
            noValueOperations
          )
        : undefined,
    [
      defaultCombinator,
      fields,
      isControlled,
      noValueOperations,
      value,
    ]
  );
  const filters = controlledFilters ?? internalFilters;
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const commit = useCallback(
    (nextFilters: Filter[]) => {
      filtersRef.current = nextFilters;

      if (!isControlled) {
        setInternalFilters(nextFilters);
      }

      onChange?.(nextFilters);
    },
    [isControlled, onChange]
  );

  const updateFilters = useCallback(
    (updater: (current: Filter[]) => Filter[]) => {
      commit(updater(filtersRef.current));
    },
    [commit]
  );

  const getFieldDefinition = useCallback(
    (fieldKey?: string) => resolveFieldDefinition(fields, fieldKey),
    [fields]
  );

  const getFilter = useCallback(
    (filterId: string) =>
      filters.find((filter) => filter.id === filterId),
    [filters]
  );

  const getAvailableOperations = useCallback(
    (filterId: string): SelectOption<OperationType>[] => {
      const filter = getFilter(filterId);
      const filterType = filter?.type ?? 'string';
      const operations =
        typeOperationsMap[filterType] ?? typeOperationsMap.string;

      return operations.map((operation) =>
        mapOperationToSelectOption(operation, operationLabels)
      );
    },
    [getFilter, operationLabels, typeOperationsMap]
  );

  const getSuggestions = useCallback(
    (filterId: string): FilterValue[] => {
      const filter = getFilter(filterId);

      return getFieldDefinition(filter?.field)?.suggestions ?? [];
    },
    [getFieldDefinition, getFilter]
  );

  const shouldRenderValue = useCallback(
    (filterId: string) => {
      const filter = getFilter(filterId);

      return filter?.operator
        ? !noValueOperations.includes(filter.operator)
        : true;
    },
    [getFilter, noValueOperations]
  );

  const addFilter = useCallback(
    (draft?: FilterDraft) => {
      updateFilters((current) =>
        current.concat(
          normalizeDraft(
            draft,
            current.length,
            fields,
            defaultCombinator,
            noValueOperations
          )
        )
      );
    },
    [defaultCombinator, fields, noValueOperations, updateFilters]
  );

  const removeFilter = useCallback(
    (filterId: string) => {
      updateFilters((current) =>
        normalizeFilters(
          current.filter((filter) => filter.id !== filterId),
          fields,
          defaultCombinator,
          noValueOperations
        )
      );
    },
    [defaultCombinator, fields, noValueOperations, updateFilters]
  );

  const updateField = useCallback(
    (filterId: string, field?: string) => {
      updateFilters((current) =>
        current.map((filter, index) =>
          filter.id === filterId
            ? normalizeFilter(
                {
                  ...filter,
                  field,
                  type: undefined,
                  operator: undefined,
                  value: undefined,
                },
                index,
                fields,
                defaultCombinator,
                noValueOperations
              )
            : filter
        )
      );
    },
    [defaultCombinator, fields, noValueOperations, updateFilters]
  );

  const updateOperator = useCallback(
    (filterId: string, operator?: OperationType) => {
      updateFilters((current) =>
        current.map((filter, index) =>
          filter.id === filterId
            ? normalizeFilter(
                removeValueForOperator(
                  filter,
                  operator,
                  noValueOperations
                ),
                index,
                fields,
                defaultCombinator,
                noValueOperations
              )
            : filter
        )
      );
    },
    [defaultCombinator, fields, noValueOperations, updateFilters]
  );

  const updateValue = useCallback(
    (filterId: string, value?: FilterValue) => {
      updateFilters((current) =>
        current.map((filter, index) =>
          filter.id === filterId
            ? normalizeFilter(
                {
                  ...filter,
                  value,
                },
                index,
                fields,
                defaultCombinator,
                noValueOperations
              )
            : filter
        )
      );
    },
    [defaultCombinator, fields, noValueOperations, updateFilters]
  );

  const updateCombinator = useCallback(
    (filterId: string, combinator: Binding) => {
      updateFilters((current) =>
        current.map((filter, index) =>
          filter.id === filterId
            ? normalizeFilter(
                {
                  ...filter,
                  combinator,
                },
                index,
                fields,
                defaultCombinator,
                noValueOperations
              )
            : filter
        )
      );
    },
    [defaultCombinator, fields, noValueOperations, updateFilters]
  );

  const replaceFilters = useCallback(
    (nextFilters: Filter[]) => {
      commit(
        normalizeFilters(
          nextFilters,
          fields,
          defaultCombinator,
          noValueOperations
        )
      );
    },
    [commit, defaultCombinator, fields, noValueOperations]
  );

  const reset = useCallback(() => {
    commit(defaultFilters);
  }, [commit, defaultFilters]);

  return {
    filters,
    fieldOptions,
    combinatorOptions,
    operationLabels,
    addFilter,
    removeFilter,
    updateField,
    updateOperator,
    updateValue,
    updateCombinator,
    replaceFilters,
    reset,
    getFilter,
    getFieldDefinition,
    getAvailableOperations,
    getSuggestions,
    shouldRenderValue,
  };
};
