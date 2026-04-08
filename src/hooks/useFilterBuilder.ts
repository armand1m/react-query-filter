import { useMemo } from 'react';
import { defaultTypeOperationsMap } from '../operations';
import { useQueryFilters } from './useQueryFilters';
import {
  ConditionController,
  FieldDefinition,
  FilterCondition,
  FilterConditionDraft,
  FilterGroup,
  FilterGroupDraft,
  FilterSchema,
  GroupController,
  SchemaField,
  SchemaKey,
  SchemaValue,
  UseFilterBuilderOptions,
  UseFilterBuilderResult,
  ValueInputController,
} from '../types';

const getSchemaKeys = <TSchema extends FilterSchema>(
  schema: TSchema
) => Object.keys(schema) as SchemaKey<TSchema>[];

const schemaFieldToDefinition = <
  TSchema extends FilterSchema,
  TKey extends SchemaKey<TSchema>,
>(
  key: TKey,
  schemaField: TSchema[TKey]
): FieldDefinition => {
  switch (schemaField.type) {
    case 'boolean':
      return {
        key,
        label: schemaField.label,
        type: 'boolean',
        suggestions: schemaField.suggestions,
      };
    case 'number':
      return {
        key,
        label: schemaField.label,
        type: 'number',
        suggestions: schemaField.suggestions,
      };
    case 'string':
    default:
      return {
        key,
        label: schemaField.label,
        type: 'string',
        suggestions: schemaField.suggestions,
      };
  }
};

const getDefaultOperators = (schemaField?: SchemaField) =>
  schemaField
    ? (schemaField.operators ??
      defaultTypeOperationsMap[schemaField.type])
    : defaultTypeOperationsMap.string;

const createStarterConditionDraft = <TSchema extends FilterSchema>(
  schema: TSchema
): FilterConditionDraft => {
  const firstKey = getSchemaKeys(schema)[0];

  if (!firstKey) {
    return {
      kind: 'condition',
    };
  }

  const schemaField = schema[firstKey];

  return {
    kind: 'condition',
    field: firstKey,
    operator: getDefaultOperators(schemaField)[0],
  };
};

const createStarterGroupDraft = <TSchema extends FilterSchema>(
  schema: TSchema
): FilterGroupDraft => ({
  kind: 'group',
  children: [createStarterConditionDraft(schema)],
});

export const useFilterBuilder = <TSchema extends FilterSchema>({
  defaultCombinator,
  defaultValue,
  noValueOperations,
  onChange,
  schema,
  value,
}: UseFilterBuilderOptions<TSchema>): UseFilterBuilderResult<TSchema> => {
  const fields = useMemo(
    () =>
      getSchemaKeys(schema).map((key) =>
        schemaFieldToDefinition(key, schema[key])
      ),
    [schema]
  );
  const raw = useQueryFilters({
    fields,
    value,
    defaultValue,
    onChange,
    defaultCombinator,
    noValueOperations,
  });
  const fieldOptions = useMemo(
    () =>
      getSchemaKeys(schema).map((key) => ({
        label: schema[key].label,
        value: key,
      })),
    [schema]
  );

  const getSchemaField = (fieldKey?: string) =>
    fieldKey ? schema[fieldKey as SchemaKey<TSchema>] : undefined;

  const buildConditionController = (
    condition: FilterCondition
  ): ConditionController<TSchema> => {
    const schemaField = getSchemaField(condition.field);
    const operatorOptions = schemaField?.operators
      ? schemaField.operators.map((operation) => ({
          label: raw.operationLabels[operation],
          value: operation,
        }))
      : raw.getAvailableOperations(condition.id);
    const suggestions = (schemaField?.suggestions ??
      []) as SchemaValue<TSchema>[];

    const valueInput = (() => {
      if (!raw.shouldRenderValue(condition.id)) {
        return {
          kind: 'none',
        } satisfies ValueInputController;
      }

      switch (schemaField?.type) {
        case 'boolean':
          return {
            kind: 'boolean',
            props: {
              checked: condition.value === true,
              onChange: (event) => {
                raw.updateConditionValue(
                  condition.id,
                  event.currentTarget.checked
                );
              },
            },
            suggestions: suggestions as boolean[],
          } satisfies ValueInputController;
        case 'number':
          return {
            kind: 'number',
            props: {
              value:
                typeof condition.value === 'number'
                  ? condition.value
                  : '',
              onChange: (event) => {
                const nextValue = event.currentTarget.value;

                raw.updateConditionValue(
                  condition.id,
                  nextValue === ''
                    ? undefined
                    : event.currentTarget.valueAsNumber
                );
              },
            },
            suggestions: suggestions as number[],
          } satisfies ValueInputController;
        case 'string':
        default:
          return {
            kind: 'text',
            props: {
              list:
                suggestions.length > 0
                  ? `suggestions-${condition.id}`
                  : undefined,
              onChange: (event) => {
                raw.updateConditionValue(
                  condition.id,
                  event.currentTarget.value || undefined
                );
              },
              value:
                typeof condition.value === 'string'
                  ? condition.value
                  : '',
            },
            suggestions: suggestions as string[],
          } satisfies ValueInputController;
      }
    })();

    return {
      id: condition.id,
      kind: 'condition',
      field: condition.field as SchemaKey<TSchema> | undefined,
      operator: condition.operator,
      remove: () => raw.removeNode(condition.id),
      availableOperators: operatorOptions,
      suggestions,
      setField: (field) =>
        raw.updateConditionField(condition.id, field),
      setOperator: (operator) =>
        raw.updateConditionOperator(condition.id, operator),
      setValue: (value) =>
        raw.updateConditionValue(condition.id, value),
      fieldSelectProps: () => ({
        onChange: (event) => {
          const nextField = fieldOptions.find(
            (option) => option.value === event.currentTarget.value
          )?.value;

          raw.updateConditionField(condition.id, nextField);
        },
        options: fieldOptions,
        value:
          (condition.field as SchemaKey<TSchema> | undefined) ?? '',
      }),
      operatorSelectProps: () => ({
        onChange: (event) => {
          const nextOperator = operatorOptions.find(
            (option) =>
              String(option.value) === event.currentTarget.value
          )?.value;

          raw.updateConditionOperator(condition.id, nextOperator);
        },
        options: operatorOptions,
        value: condition.operator ?? '',
      }),
      valueInput,
    };
  };

  const buildGroupController = (
    group: FilterGroup,
    isRoot = false
  ): GroupController<TSchema> => {
    const children = group.children.map((child) =>
      child.kind === 'group'
        ? buildGroupController(child)
        : buildConditionController(child)
    );
    const directConditions = children.filter(
      (child): child is ConditionController<TSchema> =>
        child.kind === 'condition'
    );
    const directGroups = children.filter(
      (child): child is GroupController<TSchema> =>
        child.kind === 'group'
    );

    return {
      id: group.id,
      kind: 'group',
      combinator: group.combinator,
      children,
      directConditions,
      directGroups,
      firstCondition: directConditions[0],
      isRoot,
      remove: () => {
        if (!isRoot) {
          raw.removeNode(group.id);
        }
      },
      addCondition: (draft) =>
        raw.addCondition(
          group.id,
          draft ?? createStarterConditionDraft(schema)
        ),
      addGroup: (draft) =>
        raw.addGroup(
          group.id,
          draft ?? createStarterGroupDraft(schema)
        ),
      setCombinator: (combinator) =>
        raw.updateGroupCombinator(group.id, combinator),
      combinatorSelectProps: () => ({
        onChange: (event) => {
          const nextCombinator = raw.combinatorOptions.find(
            (option) =>
              String(option.value) === event.currentTarget.value
          )?.value;

          if (nextCombinator) {
            raw.updateGroupCombinator(group.id, nextCombinator);
          }
        },
        options: raw.combinatorOptions,
        value: group.combinator,
      }),
    };
  };

  const root = buildGroupController(raw.rootGroup, true);

  return {
    root,
    rootGroup: raw.rootGroup,
    schema,
    reset: raw.reset,
    replaceTree: raw.replaceTree,
  };
};
