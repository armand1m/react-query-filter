import {
  ConditionController,
  GroupController,
  defineFilterSchema,
  field,
  useFilterBuilder,
} from '../../src';

const schema = defineFilterSchema({
  status: field.string({
    label: 'Status',
    suggestions: ['draft', 'active', 'archived'],
  }),
  score: field.number({
    label: 'Score',
    suggestions: [10, 25, 50],
  }),
  published: field.boolean({
    label: 'Published',
    suggestions: [true, false],
  }),
});

const renderValueInput = (
  condition: ConditionController<typeof schema>
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
    case 'text':
      return (
        <>
          <input
            className="input"
            type="text"
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

const ConditionRow = ({
  condition,
  group,
}: {
  condition: ConditionController<typeof schema>;
  group: GroupController<typeof schema>;
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
        <option value="">Field</option>
        {fieldProps.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select className="select" {...operatorProps}>
        <option value="">Operator</option>
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

const GroupedFilters = ({
  group,
  depth = 0,
}: {
  group: GroupController<typeof schema>;
  depth?: number;
}) => (
  <section
    className="group-shell"
    style={{ marginLeft: `${depth * 24}px` }}
  >
    <header className="group-header">
      <div className="group-actions">
        {!group.firstCondition ? (
          <select
            className="select select-compact"
            {...group.combinatorSelectProps()}
          >
            {group.combinatorSelectProps().options.map((option) => (
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

export const App = () => {
  const builder = useFilterBuilder({
    schema,
    defaultValue: {
      kind: 'group',
      children: [
        {
          kind: 'condition',
        },
      ],
    },
  });

  return (
    <main className="page">
      <section className="panel">
        <div className="heading">
          <span className="eyebrow">Builder facade</span>
          <h1>Recursive grouped filters without tree plumbing</h1>
          <p>
            The example now consumes typed group and condition
            controllers, not raw node ids, casts, or manual value
            coercion.
          </p>
        </div>

        <GroupedFilters group={builder.root} />
      </section>

      <section className="panel panel-code">
        <span className="eyebrow">Current state</span>
        <pre>{JSON.stringify(builder.rootGroup, null, 2)}</pre>
      </section>
    </main>
  );
};
