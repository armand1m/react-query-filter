import {
  type ConditionController,
  type FilterSchema,
  type GroupController,
} from '../../../src';

// --- Value input renderer ---

const renderValueInput = <TSchema extends FilterSchema>(
  condition: ConditionController<TSchema>
) => {
  switch (condition.valueInput.kind) {
    case 'boolean':
      return (
        <label className="checkbox">
          <input type="checkbox" {...condition.valueInput.props} />
          True
        </label>
      );
    case 'number':
      return (
        <>
          <input
            className="input"
            type="number"
            {...condition.valueInput.props}
          />
          {condition.valueInput.suggestions.length > 0 ? (
            <datalist id={`suggestions-${condition.id}`}>
              {condition.valueInput.suggestions.map((suggestion) => (
                <option
                  key={`${condition.id}-${suggestion}`}
                  value={suggestion}
                />
              ))}
            </datalist>
          ) : null}
        </>
      );
    case 'date':
      return (
        <>
          <input
            className="input"
            type="date"
            {...condition.valueInput.props}
          />
          {condition.valueInput.suggestions.length > 0 ? (
            <datalist id={`suggestions-${condition.id}`}>
              {condition.valueInput.suggestions.map((suggestion) => (
                <option
                  key={`${condition.id}-${suggestion}`}
                  value={suggestion}
                />
              ))}
            </datalist>
          ) : null}
        </>
      );
    case 'select':
      return (
        <select className="select" {...condition.valueInput.props}>
          <option value="">Select value</option>
          {condition.valueInput.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    case 'multiselect':
      return (
        <select
          className="select"
          size={Math.max(3, condition.valueInput.options.length)}
          {...condition.valueInput.props}
        >
          {condition.valueInput.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    case 'text':
    case 'datetime-local':
    case 'time':
      return (
        <>
          <input
            className="input"
            type={condition.valueInput.kind}
            {...condition.valueInput.props}
          />
          {condition.valueInput.suggestions.length > 0 ? (
            <datalist id={`suggestions-${condition.id}`}>
              {condition.valueInput.suggestions.map((suggestion) => (
                <option
                  key={`${condition.id}-${suggestion}`}
                  value={suggestion}
                />
              ))}
            </datalist>
          ) : null}
        </>
      );
    case 'none':
    default:
      return <div className="value-placeholder">No value</div>;
  }
};

// --- Condition row ---

export const ConditionRow = <TSchema extends FilterSchema>({
  condition,
  group,
}: {
  condition: ConditionController<TSchema>;
  group: GroupController<TSchema>;
}) => {
  const combinatorProps = group.combinatorSelectProps();
  const fieldProps = condition.fieldSelectProps();
  const operatorProps = condition.operatorSelectProps();

  return (
    <div className="row">
      {group.firstCondition?.id === condition.id ? (
        <select className="select" {...combinatorProps}>
          {combinatorProps.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <span className="combinator-pill">{group.combinator}</span>
      )}

      <select className="select" {...fieldProps}>
        <option disabled={true} hidden={true} value="">
          Field
        </option>
        {fieldProps.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select className="select" {...operatorProps}>
        <option disabled={true} hidden={true} value="">
          Operator
        </option>
        {operatorProps.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {renderValueInput(condition)}

      <button
        aria-label="Remove condition"
        className="button button-icon button-secondary"
        onClick={condition.remove}
        title="Remove condition"
        type="button"
      >
        ×
      </button>
    </div>
  );
};

// --- Grouped filters ---

export const GroupedFilters = <TSchema extends FilterSchema>({
  group,
  depth = 0,
}: {
  group: GroupController<TSchema>;
  depth?: number;
}) => {
  const combinatorProps = group.combinatorSelectProps();

  return (
    <section
      className="group-shell"
      style={{ marginLeft: `${depth * 24}px` }}
    >
      <header className="group-header">
        <div className="group-actions">
          {!group.firstCondition ? (
            <select
              className="select select-compact"
              {...combinatorProps}
            >
              {combinatorProps.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : null}

          <button
            aria-label="Add condition"
            className="button button-icon button-secondary"
            onClick={() => group.addCondition()}
            title="Add condition"
            type="button"
          >
            Add Filter +
          </button>
          <button
            aria-label="Add group"
            className="button button-icon button-secondary"
            onClick={() => group.addGroup()}
            title="Add group"
            type="button"
          >
            Add Filter Group ⊞
          </button>
          {!group.isRoot ? (
            <button
              aria-label="Remove group"
              className="button button-icon button-danger"
              onClick={group.remove}
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
              condition={child}
              group={group}
            />
          ) : (
            <GroupedFilters
              key={child.id}
              depth={depth + 1}
              group={child}
            />
          )
        )}
      </div>
    </section>
  );
};
