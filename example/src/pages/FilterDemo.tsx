import { useEffect, useState } from 'react';
import { createStarryNight, common, all } from '@wooorm/starry-night';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import {
  defineFilterSchema,
  field,
  useFilterBuilder,
} from '../../../src';
import { GroupedFilters } from '../components/FilterComponents';

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
      setHighlighted(
        toJsxRuntime(tree, { Fragment, jsx, jsxs }) as React.ReactNode
      );
    });
  }, [code]);

  return <code>{highlighted ?? code}</code>;
};

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
