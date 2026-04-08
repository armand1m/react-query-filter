import { Binding } from './bindings';
import {
  defaultNoValueOperations,
  defaultOperationLabels,
  defaultTypeOperationsMap,
  OperationType,
} from './operations';
import {
  type FieldDefinition,
  type FieldType,
  type FilterCondition,
  type FilterConditionDraft,
  type FilterGroup,
  type FilterGroupDraft,
  type FilterNode,
  type FilterNodeDraft,
  type FilterValue,
  type SelectOption,
} from './types';

const createFallbackId = () =>
  `rqf_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

export const createFilterId = () => {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }

  return createFallbackId();
};

export const createFieldOption = (
  field: FieldDefinition
): SelectOption<string> => ({
  label: field.label,
  value: field.key,
});

export const resolveFieldType = (
  fields: FieldDefinition[],
  fieldKey?: string
): FieldType | undefined =>
  fields.find((field) => field.key === fieldKey)?.type;

export const resolveFieldDefinition = (
  fields: FieldDefinition[],
  fieldKey?: string
) => fields.find((field) => field.key === fieldKey);

export const coerceFilterValue = (
  value: FilterValue | undefined,
  type?: FieldType
): FilterValue | undefined => {
  if (value === undefined || type === undefined) {
    return value;
  }

  switch (type) {
    case 'boolean':
      if (typeof value === 'boolean') {
        return value;
      }

      if (typeof value === 'string') {
        const normalizedValue = value.trim().toLowerCase();

        if (normalizedValue === 'true') {
          return true;
        }

        if (normalizedValue === 'false') {
          return false;
        }
      }

      if (typeof value === 'number') {
        return value !== 0;
      }

      return undefined;
    case 'number':
      return typeof value === 'number' ? value : Number(value);
    case 'string':
    default:
      return String(value);
  }
};

export const isFilterGroup = (
  node: FilterNode | FilterNodeDraft
): node is FilterGroup | FilterGroupDraft =>
  node.kind === 'group' || 'children' in node || 'combinator' in node;

export const normalizeCondition = (
  condition: FilterCondition | FilterConditionDraft,
  fields: FieldDefinition[],
  noValueOperations: OperationType[]
): FilterCondition => {
  const type = condition.field
    ? resolveFieldType(fields, condition.field)
    : condition.type;
  const operator = condition.operator;

  return {
    id:
      'id' in condition && condition.id
        ? condition.id
        : createFilterId(),
    kind: 'condition',
    field: condition.field,
    type,
    operator,
    value:
      operator && noValueOperations.includes(operator)
        ? undefined
        : coerceFilterValue(condition.value, type),
  };
};

export const normalizeNode = (
  node: FilterNode | FilterNodeDraft,
  fields: FieldDefinition[],
  defaultCombinator: Binding,
  noValueOperations: OperationType[]
): FilterNode =>
  isFilterGroup(node)
    ? normalizeGroup(
        node,
        fields,
        defaultCombinator,
        noValueOperations
      )
    : normalizeCondition(node, fields, noValueOperations);

export const normalizeGroup = (
  group: FilterGroup | FilterGroupDraft | undefined,
  fields: FieldDefinition[],
  defaultCombinator: Binding,
  noValueOperations: OperationType[] = defaultNoValueOperations
): FilterGroup => ({
  id:
    group && 'id' in group && group.id ? group.id : createFilterId(),
  kind: 'group',
  combinator: group?.combinator ?? defaultCombinator,
  children: (group?.children ?? []).map((child) =>
    normalizeNode(child, fields, defaultCombinator, noValueOperations)
  ),
});

export const findNodeById = (
  group: FilterGroup,
  nodeId: string
): FilterNode | undefined => {
  if (group.id === nodeId) {
    return group;
  }

  for (const child of group.children) {
    if (child.id === nodeId) {
      return child;
    }

    if (child.kind === 'group') {
      const nested = findNodeById(child, nodeId);

      if (nested) {
        return nested;
      }
    }
  }

  return undefined;
};

export const updateNodeById = (
  group: FilterGroup,
  nodeId: string,
  updater: (node: FilterNode) => FilterNode
): FilterGroup => {
  if (group.id === nodeId) {
    const nextNode = updater(group);

    return nextNode.kind === 'group' ? nextNode : group;
  }

  return {
    ...group,
    children: group.children.map((child) => {
      if (child.id === nodeId) {
        return updater(child);
      }

      if (child.kind === 'group') {
        return updateNodeById(child, nodeId, updater);
      }

      return child;
    }),
  };
};

export const appendChildToGroup = (
  group: FilterGroup,
  groupId: string,
  child: FilterNode
): FilterGroup =>
  updateNodeById(group, groupId, (node) =>
    node.kind === 'group'
      ? {
          ...node,
          children: node.children.concat(child),
        }
      : node
  );

export const removeNodeById = (
  group: FilterGroup,
  nodeId: string
): FilterGroup => {
  if (group.id === nodeId) {
    return group;
  }

  return {
    ...group,
    children: group.children
      .filter((child) => child.id !== nodeId)
      .map((child) =>
        child.kind === 'group' ? removeNodeById(child, nodeId) : child
      ),
  };
};

export const resolveOperationLabels = (
  overrides?: Partial<Record<OperationType, string>>
) => ({
  ...defaultOperationLabels,
  ...overrides,
});

export const resolveTypeOperationsMap = (
  overrides?: Partial<Record<FieldType, OperationType[]>>
) => ({
  ...defaultTypeOperationsMap,
  ...overrides,
});
