import {
  Binding,
  FieldDefinition,
  FilterCondition,
  FilterGroup,
  FilterValue,
  OperationType,
  UseQueryFiltersResult,
  useQueryFilters,
} from '../../src';

const fields: FieldDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'string',
    suggestions: ['draft', 'active', 'archived'],
  },
  {
    key: 'score',
    label: 'Score',
    type: 'number',
    suggestions: [10, 25, 50],
  },
  {
    key: 'published',
    label: 'Published',
    type: 'boolean',
    suggestions: [true, false],
  },
];

const createStarterGroup = () => ({
  kind: 'group' as const,
  children: [{ kind: 'condition' as const }],
});

interface ConditionRowProps {
  condition: FilterCondition;
  group: FilterGroup;
  isFirstCondition: boolean;
  combinatorOptions: UseQueryFiltersResult['combinatorOptions'];
  fieldOptions: UseQueryFiltersResult['fieldOptions'];
  getAvailableOperations: UseQueryFiltersResult['getAvailableOperations'];
  getSuggestions: UseQueryFiltersResult['getSuggestions'];
  shouldRenderValue: UseQueryFiltersResult['shouldRenderValue'];
  updateConditionField: UseQueryFiltersResult['updateConditionField'];
  updateConditionOperator: UseQueryFiltersResult['updateConditionOperator'];
  updateConditionValue: UseQueryFiltersResult['updateConditionValue'];
  updateGroupCombinator: UseQueryFiltersResult['updateGroupCombinator'];
  removeNode: UseQueryFiltersResult['removeNode'];
}

interface GroupedFiltersProps extends Pick<
  UseQueryFiltersResult,
  | 'addCondition'
  | 'addGroup'
  | 'combinatorOptions'
  | 'fieldOptions'
  | 'getAvailableOperations'
  | 'getSuggestions'
  | 'removeNode'
  | 'shouldRenderValue'
  | 'updateConditionField'
  | 'updateConditionOperator'
  | 'updateConditionValue'
  | 'updateGroupCombinator'
> {
  group: FilterGroup;
  depth?: number;
  isRoot?: boolean;
}

const renderValueInput = (
  condition: FilterCondition,
  suggestions: FilterValue[],
  onChange: (value?: FilterValue) => void
) => {
  if (condition.type === 'boolean') {
    return (
      <label className="checkbox">
        <input
          checked={Boolean(condition.value)}
          type="checkbox"
          onChange={(event) => onChange(event.target.checked)}
        />
        True
      </label>
    );
  }

  return (
    <>
      <input
        className="input"
        list={`suggestions-${condition.id}`}
        type={condition.type === 'number' ? 'number' : 'text'}
        value={
          condition.value === undefined ? '' : String(condition.value)
        }
        onChange={(event) =>
          onChange(
            condition.type === 'number' && event.target.value !== ''
              ? Number(event.target.value)
              : event.target.value || undefined
          )
        }
      />
      {suggestions.length > 0 ? (
        <datalist id={`suggestions-${condition.id}`}>
          {suggestions.map((suggestion) => (
            <option
              key={`${condition.id}-${String(suggestion)}`}
              value={String(suggestion)}
            />
          ))}
        </datalist>
      ) : null}
    </>
  );
};

const ConditionRow = ({
  condition,
  group,
  isFirstCondition,
  combinatorOptions,
  fieldOptions,
  getAvailableOperations,
  getSuggestions,
  shouldRenderValue,
  updateConditionField,
  updateConditionOperator,
  updateConditionValue,
  updateGroupCombinator,
  removeNode,
}: ConditionRowProps) => {
  const operations = getAvailableOperations(condition.id);
  const suggestions = getSuggestions(condition.id);

  return (
    <div className="row">
      {isFirstCondition ? (
        <select
          className="select"
          value={group.combinator}
          onChange={(event) =>
            updateGroupCombinator(
              group.id,
              event.target.value as Binding
            )
          }
        >
          {combinatorOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <span className="combinator-pill">{group.combinator}</span>
      )}

      <select
        className="select"
        value={condition.field ?? ''}
        onChange={(event) =>
          updateConditionField(
            condition.id,
            event.target.value || undefined
          )
        }
      >
        <option value="">Field</option>
        {fieldOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        className="select"
        value={condition.operator ?? ''}
        onChange={(event) =>
          updateConditionOperator(
            condition.id,
            event.target.value
              ? (event.target.value as OperationType)
              : undefined
          )
        }
      >
        <option value="">Operator</option>
        {operations.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {shouldRenderValue(condition.id) ? (
        renderValueInput(condition, suggestions, (nextValue) =>
          updateConditionValue(condition.id, nextValue)
        )
      ) : (
        <div className="value-placeholder">No value</div>
      )}

      <button
        aria-label="Remove condition"
        className="button button-icon button-secondary"
        onClick={() => removeNode(condition.id)}
        title="Remove condition"
        type="button"
      >
        ×
      </button>
    </div>
  );
};

const GroupedFilters = ({
  group,
  depth = 0,
  isRoot = false,
  addCondition,
  addGroup,
  combinatorOptions,
  fieldOptions,
  getAvailableOperations,
  getSuggestions,
  removeNode,
  shouldRenderValue,
  updateConditionField,
  updateConditionOperator,
  updateConditionValue,
  updateGroupCombinator,
}: GroupedFiltersProps) => {
  const firstCondition = group.children.find(
    (child): child is FilterCondition => child.kind === 'condition'
  );

  return (
    <section
      className="group-shell"
      style={{ marginLeft: `${depth * 24}px` }}
    >
      <header className="group-header">
        <div className="group-actions">
          {!firstCondition ? (
            <select
              className="select select-compact"
              value={group.combinator}
              onChange={(event) =>
                updateGroupCombinator(
                  group.id,
                  event.target.value as Binding
                )
              }
            >
              {combinatorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : null}

          <button
            aria-label="Add condition"
            className="button button-icon button-secondary"
            onClick={() => addCondition(group.id)}
            title="Add condition"
            type="button"
          >
            Add Filter +
          </button>
          <button
            aria-label="Add group"
            className="button button-icon button-secondary"
            onClick={() => addGroup(group.id, createStarterGroup())}
            title="Add group"
            type="button"
          >
            Add Filter Group ⊞
          </button>
          {!isRoot ? (
            <button
              aria-label="Remove group"
              className="button button-icon button-danger"
              onClick={() => removeNode(group.id)}
              title="Remove group"
              type="button"
            >
              ×
            </button>
          ) : null}
        </div>
      </header>

      <div className="group-children">
        {group.children.map((child) =>
          child.kind === 'condition' ? (
            <ConditionRow
              key={child.id}
              combinatorOptions={combinatorOptions}
              condition={child}
              fieldOptions={fieldOptions}
              getAvailableOperations={getAvailableOperations}
              getSuggestions={getSuggestions}
              group={group}
              isFirstCondition={child.id === firstCondition?.id}
              removeNode={removeNode}
              shouldRenderValue={shouldRenderValue}
              updateConditionField={updateConditionField}
              updateConditionOperator={updateConditionOperator}
              updateConditionValue={updateConditionValue}
              updateGroupCombinator={updateGroupCombinator}
            />
          ) : (
            <GroupedFilters
              key={child.id}
              addCondition={addCondition}
              addGroup={addGroup}
              combinatorOptions={combinatorOptions}
              fieldOptions={fieldOptions}
              getAvailableOperations={getAvailableOperations}
              getSuggestions={getSuggestions}
              group={child}
              removeNode={removeNode}
              shouldRenderValue={shouldRenderValue}
              updateConditionField={updateConditionField}
              updateConditionOperator={updateConditionOperator}
              updateConditionValue={updateConditionValue}
              updateGroupCombinator={updateGroupCombinator}
              depth={depth + 1}
            />
          )
        )}
      </div>
    </section>
  );
};

export const App = () => {
  const {
    rootGroup,
    fieldOptions,
    combinatorOptions,
    addCondition,
    addGroup,
    removeNode,
    updateConditionField,
    updateConditionOperator,
    updateConditionValue,
    updateGroupCombinator,
    getAvailableOperations,
    getSuggestions,
    shouldRenderValue,
  } = useQueryFilters({
    fields,
    defaultValue: {
      kind: 'group',
      children: [{ kind: 'condition', field: 'status' }],
    },
  });

  return (
    <main className="page">
      <section className="panel">
        <div className="heading">
          <span className="eyebrow">Recursive example</span>
          <h1>Grouped filters with nested conditions</h1>
          <p>
            Groups can nest arbitrarily. Each group owns a shared
            combinator that is selected on the first direct condition
            row, or in the group header until a condition exists.
          </p>
        </div>

        <GroupedFilters
          addCondition={addCondition}
          addGroup={addGroup}
          combinatorOptions={combinatorOptions}
          fieldOptions={fieldOptions}
          getAvailableOperations={getAvailableOperations}
          getSuggestions={getSuggestions}
          group={rootGroup}
          isRoot={true}
          removeNode={removeNode}
          shouldRenderValue={shouldRenderValue}
          updateConditionField={updateConditionField}
          updateConditionOperator={updateConditionOperator}
          updateConditionValue={updateConditionValue}
          updateGroupCombinator={updateGroupCombinator}
        />
      </section>

      <section className="panel panel-code">
        <span className="eyebrow">Current state</span>
        <pre>{JSON.stringify(rootGroup, null, 2)}</pre>
      </section>
    </main>
  );
};
