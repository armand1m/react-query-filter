import { useEffect, useState } from 'react';
import { createStarryNight, common, all } from '@wooorm/starry-night';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import {
  ConditionController,
  GroupController,
  defineFilterSchema,
  field,
  useFilterBuilder,
} from '../../../src';

const tsxGrammar = all.find((g) => g.scopeName === 'source.tsx')!;
const starryNightPromise = createStarryNight([...common, tsxGrammar]);

const schema = defineFilterSchema({
  status: field.select({
    label: 'Status',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Active', value: 'active' },
      { label: 'Archived', value: 'archived' },
    ],
    suggestions: ['draft', 'active', 'archived'],
  }),
  amount: field.currency({
    label: 'Amount',
    suggestions: [100, 250, 500],
    meta: { currency: 'USD' },
  }),
  publishedAt: field.date({
    label: 'Published Date',
    suggestions: ['2026-04-01', '2026-04-15'],
  }),
  tags: field.multiSelect({
    label: 'Tags',
    options: [
      { label: 'Featured', value: 'featured' },
      { label: 'Internal', value: 'internal' },
      { label: 'Launch', value: 'launch' },
    ],
    suggestions: ['featured', 'launch'],
  }),
  published: field.boolean({
    label: 'Published',
    suggestions: [true, false],
  }),
});

const IMPLEMENTATION_SNIPPET = `import {
  type ConditionController,
  type GroupController,
  defineFilterSchema,
  field,
  useFilterBuilder,
} from 'react-query-filter';

const schema = defineFilterSchema({
  status: field.select({
    label: 'Status',
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Active', value: 'active' },
    ],
  }),
  amount: field.currency({ label: 'Amount' }),
  publishedAt: field.date({ label: 'Published Date' }),
  tags: field.multiSelect({
    label: 'Tags',
    options: [{ label: 'Featured', value: 'featured' }],
  }),
});

function ConditionRow({
  condition,
  group,
}: {
  condition: ConditionController<typeof schema>;
  group: GroupController<typeof schema>;
}) {
  const fieldProps = condition.fieldSelectProps();
  const operatorProps = condition.operatorSelectProps();

  return (
    <div>
      {group.firstCondition?.id === condition.id ? (
        <select {...group.combinatorSelectProps()} />
      ) : (
        <span>{group.combinator}</span>
      )}

      <select {...fieldProps}>
        <option disabled hidden value="">
          Field
        </option>
        {fieldProps.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select {...operatorProps}>
        <option disabled hidden value="">
          Operator
        </option>
        {operatorProps.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {condition.valueInput.kind === 'text' ? (
        <input type="text" {...condition.valueInput.props} />
      ) : null}

      {condition.valueInput.kind === 'number' ? (
        <input type="number" {...condition.valueInput.props} />
      ) : null}

      {condition.valueInput.kind === 'date' ? (
        <input type="date" {...condition.valueInput.props} />
      ) : null}

      {condition.valueInput.kind === 'select' ? (
        <select {...condition.valueInput.props}>
          <option value="">Select value</option>
          {condition.valueInput.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      {condition.valueInput.kind === 'multiselect' ? (
        <select {...condition.valueInput.props}>
          {condition.valueInput.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}

function GroupedFilters({
  group,
}: {
  group: GroupController<typeof schema>;
}) {
  return (
    <section>
      <button onClick={() => group.addCondition()}>
        Add Filter
      </button>
      <button onClick={() => group.addGroup()}>
        Add Filter Group
      </button>

      {group.children.map((child) =>
        child.kind === 'group' ? (
          <GroupedFilters key={child.id} group={child} />
        ) : (
          <ConditionRow
            key={child.id}
            condition={child}
            group={group}
          />
        )
      )}
    </section>
  );
}

export function Filters() {
  const builder = useFilterBuilder({ schema });

  return <GroupedFilters group={builder.root} />;
}`;

const HighlightedCode = ({ code }: { code: string }) => {
  const [highlighted, setHighlighted] =
    useState<React.ReactNode>(null);

  useEffect(() => {
    void starryNightPromise.then((starryNight) => {
      const tree = starryNight.highlight(code, 'source.tsx');
      setHighlighted(toJsxRuntime(tree, { Fragment, jsx, jsxs }) as React.ReactNode);
    });
  }, [code]);

  return <code>{highlighted ?? code}</code>;
};

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

export const FilterDemo = () => {
  const [showImplementation, setShowImplementation] = useState(false);
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
        <div className="implementation-header">
          <div>
            <span className="eyebrow">Example usage</span>
            <h2>Render the same builder facade in your app</h2>
          </div>
          <button
            aria-expanded={showImplementation}
            className="button button-secondary"
            onClick={() =>
              setShowImplementation((current) => !current)
            }
            type="button"
          >
            {showImplementation
              ? 'Hide Code Implementation'
              : 'Show Code Implementation'}
          </button>
        </div>

        {showImplementation ? (
          <pre className="implementation-snippet">
            <HighlightedCode code={IMPLEMENTATION_SNIPPET} />
          </pre>
        ) : null}
      </section>

      <section className="panel panel-code">
        <span className="eyebrow">Current state</span>
        <pre>{JSON.stringify(builder.rootGroup, null, 2)}</pre>
      </section>
    </main>
  );
};
