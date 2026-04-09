import { useCallback, useMemo, useRef, useState } from 'react';
import { Binding, defaultBindingOptions } from '../bindings';
import {
  appendChildToGroup,
  createFieldOption,
  findNodeById,
  normalizeCondition,
  normalizeGroup,
  removeNodeById,
  resolveFieldDefinition,
  resolveOperationLabels,
  resolveTypeOperationsMap,
  updateNodeById,
} from '../core';
import {
  defaultNoValueOperations,
  mapOperationToSelectOption,
  OperationType,
} from '../operations';
import {
  type FilterCondition,
  type FilterConditionDraft,
  type FilterGroup,
  type FilterGroupDraft,
  type FilterNode,
  type FilterScalar,
  type FilterValue,
  type SelectOption,
  type UseQueryFiltersOptions,
  type UseQueryFiltersResult,
} from '../types';

const removeValueForOperator = (
  condition: FilterCondition,
  operator: OperationType | undefined,
  noValueOperations: OperationType[]
) => ({
  ...condition,
  operator,
  value:
    operator && noValueOperations.includes(operator)
      ? undefined
      : condition.value,
});

export const useQueryFilters = ({
  fields,
  value,
  defaultValue,
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
  const defaultRootGroup = useMemo(
    () =>
      normalizeGroup(
        defaultValue,
        fields,
        defaultCombinator,
        noValueOperations
      ),
    [defaultValue, fields, defaultCombinator, noValueOperations]
  );
  const [internalRootGroup, setInternalRootGroup] =
    useState(defaultRootGroup);
  const controlledRootGroup = useMemo(
    () =>
      isControlled
        ? normalizeGroup(
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
  const rootGroup = controlledRootGroup ?? internalRootGroup;
  const rootGroupRef = useRef(rootGroup);
  rootGroupRef.current = rootGroup;

  const commit = useCallback(
    (nextRootGroup: FilterGroup) => {
      rootGroupRef.current = nextRootGroup;

      if (!isControlled) {
        setInternalRootGroup(nextRootGroup);
      }

      onChange?.(nextRootGroup);
    },
    [isControlled, onChange]
  );

  const updateTree = useCallback(
    (updater: (current: FilterGroup) => FilterGroup) => {
      commit(updater(rootGroupRef.current));
    },
    [commit]
  );

  const getFieldDefinition = useCallback(
    (fieldKey?: string) => resolveFieldDefinition(fields, fieldKey),
    [fields]
  );

  const getNode = useCallback(
    (nodeId: string): FilterNode | undefined =>
      findNodeById(rootGroup, nodeId),
    [rootGroup]
  );

  const getGroup = useCallback(
    (groupId: string): FilterGroup | undefined => {
      const node = getNode(groupId);

      return node?.kind === 'group' ? node : undefined;
    },
    [getNode]
  );

  const getCondition = useCallback(
    (conditionId: string): FilterCondition | undefined => {
      const node = getNode(conditionId);

      return node?.kind === 'condition' ? node : undefined;
    },
    [getNode]
  );

  const getAvailableOperations = useCallback(
    (conditionId: string): SelectOption<OperationType>[] => {
      const condition = getCondition(conditionId);
      const fieldType = condition?.type ?? 'string';
      const operations =
        typeOperationsMap[fieldType as string] ??
        typeOperationsMap.string ??
        [];

      return operations.map((operation: OperationType) =>
        mapOperationToSelectOption(operation, operationLabels)
      );
    },
    [getCondition, operationLabels, typeOperationsMap]
  );

  const getSuggestions = useCallback(
    (conditionId: string): FilterScalar[] => {
      const condition = getCondition(conditionId);

      return getFieldDefinition(condition?.field)?.suggestions ?? [];
    },
    [getCondition, getFieldDefinition]
  );

  const shouldRenderValue = useCallback(
    (conditionId: string) => {
      const condition = getCondition(conditionId);

      return condition?.operator
        ? !noValueOperations.includes(condition.operator)
        : true;
    },
    [getCondition, noValueOperations]
  );

  const addCondition = useCallback(
    (groupId: string, draft?: FilterConditionDraft) => {
      updateTree((current) =>
        appendChildToGroup(
          current,
          groupId,
          normalizeCondition(
            {
              kind: 'condition',
              ...draft,
            },
            fields,
            noValueOperations
          )
        )
      );
    },
    [fields, noValueOperations, updateTree]
  );

  const addGroup = useCallback(
    (groupId: string, draft?: FilterGroupDraft) => {
      updateTree((current) =>
        appendChildToGroup(
          current,
          groupId,
          normalizeGroup(
            {
              kind: 'group',
              ...draft,
            },
            fields,
            defaultCombinator,
            noValueOperations
          )
        )
      );
    },
    [defaultCombinator, fields, noValueOperations, updateTree]
  );

  const removeNode = useCallback(
    (nodeId: string) => {
      updateTree((current) => removeNodeById(current, nodeId));
    },
    [updateTree]
  );

  const updateConditionField = useCallback(
    (conditionId: string, field?: string) => {
      updateTree((current) =>
        updateNodeById(current, conditionId, (node) =>
          node.kind === 'condition'
            ? normalizeCondition(
                {
                  ...node,
                  field,
                  type: undefined,
                  operator: undefined,
                  value: undefined,
                },
                fields,
                noValueOperations
              )
            : node
        )
      );
    },
    [fields, noValueOperations, updateTree]
  );

  const updateConditionOperator = useCallback(
    (conditionId: string, operator?: OperationType) => {
      updateTree((current) =>
        updateNodeById(current, conditionId, (node) =>
          node.kind === 'condition'
            ? normalizeCondition(
                removeValueForOperator(
                  node,
                  operator,
                  noValueOperations
                ),
                fields,
                noValueOperations
              )
            : node
        )
      );
    },
    [fields, noValueOperations, updateTree]
  );

  const updateConditionValue = useCallback(
    (conditionId: string, value?: FilterValue) => {
      updateTree((current) =>
        updateNodeById(current, conditionId, (node) =>
          node.kind === 'condition'
            ? normalizeCondition(
                {
                  ...node,
                  value,
                },
                fields,
                noValueOperations
              )
            : node
        )
      );
    },
    [fields, noValueOperations, updateTree]
  );

  const updateGroupCombinator = useCallback(
    (groupId: string, combinator: Binding) => {
      updateTree((current) =>
        updateNodeById(current, groupId, (node) =>
          node.kind === 'group'
            ? {
                ...node,
                combinator,
              }
            : node
        )
      );
    },
    [updateTree]
  );

  const replaceTree = useCallback(
    (nextRootGroup: FilterGroup | FilterGroupDraft) => {
      commit(
        normalizeGroup(
          nextRootGroup,
          fields,
          defaultCombinator,
          noValueOperations
        )
      );
    },
    [commit, defaultCombinator, fields, noValueOperations]
  );

  const reset = useCallback(() => {
    commit(defaultRootGroup);
  }, [commit, defaultRootGroup]);

  return {
    rootGroup,
    fieldOptions,
    combinatorOptions,
    operationLabels,
    addCondition,
    addGroup,
    removeNode,
    updateConditionField,
    updateConditionOperator,
    updateConditionValue,
    updateGroupCombinator,
    replaceTree,
    reset,
    getNode,
    getGroup,
    getCondition,
    getFieldDefinition,
    getAvailableOperations,
    getSuggestions,
    shouldRenderValue,
  };
};
