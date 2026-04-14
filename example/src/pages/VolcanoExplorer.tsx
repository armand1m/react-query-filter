import { useMemo } from 'react';
import {
  ConditionController,
  GroupController,
  defineFilterSchema,
  field,
  useFilterBuilder,
} from '../../../src';
import { buildFilterQuery } from '../db/filterToSql';
import { queryVolcanoes } from '../db/volcanoes';

const volcanoSchema = defineFilterSchema({
  name: field.string({
    label: 'Name',
    suggestions: ['Etna', 'Fuji', 'Vesuvius', 'Krakatau'],
  }),
  country: field.string({
    label: 'Country',
    suggestions: ['Italy', 'Japan', 'USA', 'Indonesia', 'Iceland'],
  }),
  continent: field.select({
    label: 'Continent',
    options: [
      { label: 'Africa', value: 'Africa' },
      { label: 'Antarctica', value: 'Antarctica' },
      { label: 'Asia', value: 'Asia' },
      { label: 'Europe', value: 'Europe' },
      { label: 'North America', value: 'North America' },
      { label: 'Oceania', value: 'Oceania' },
      { label: 'South America', value: 'South America' },
    ],
    suggestions: ['Europe', 'Asia', 'North America'],
  }),
  height_m: field.number({
    label: 'Height (m)',
    suggestions: [1000, 2000, 3000, 4000, 5000],
  }),
  last_eruption: field.date({
    label: 'Last Eruption',
    suggestions: ['2020-01-01', '2010-01-01', '2000-01-01'],
  }),
  type: field.select({
    label: 'Type',
    options: [
      { label: 'Stratovolcano', value: 'Stratovolcano' },
      { label: 'Shield', value: 'Shield' },
      { label: 'Caldera', value: 'Caldera' },
    ],
    suggestions: ['Stratovolcano', 'Shield'],
  }),
  is_active: field.boolean({
    label: 'Active',
    suggestions: [true, false],
  }),
});

const renderValueInput = (
  condition: ConditionController<typeof volcanoSchema>
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
              {condition.valueInput.suggestions.map((s) => (
                <option key={`${condition.id}-${s}`} value={s} />
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
              {condition.valueInput.suggestions.map((s) => (
                <option key={`${condition.id}-${s}`} value={s} />
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
              {condition.valueInput.suggestions.map((s) => (
                <option key={`${condition.id}-${s}`} value={s} />
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
  condition: ConditionController<typeof volcanoSchema>;
  group: GroupController<typeof volcanoSchema>;
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
  group: GroupController<typeof volcanoSchema>;
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

export const VolcanoExplorer = () => {
  const builder = useFilterBuilder({
    schema: volcanoSchema,
    defaultValue: { kind: 'group', children: [] },
  });

  const { query, results } = useMemo(() => {
    const query = buildFilterQuery(builder.rootGroup);
    const results = queryVolcanoes(query);
    return { query, results };
  }, [builder.rootGroup]);

  return (
    <main className="page">
      <section className="panel">
        <div className="heading">
          <span className="eyebrow">Live SQL demo</span>
          <h1>Volcano Explorer</h1>
          <p>
            Build filters with the library and watch them execute as
            SQL against 25 real volcanoes in an in-browser database.
          </p>
        </div>

        <GroupedFilters group={builder.root} />
      </section>

      <section className="panel panel-code">
        <span className="eyebrow">Generated SQL</span>
        <pre className="implementation-snippet">
          {query.displaySql}
        </pre>
      </section>

      <section className="panel">
        <div className="results-header">
          <span className="eyebrow">Results</span>
          <h2>
            {results.length}{' '}
            {results.length === 1 ? 'volcano' : 'volcanoes'} found
          </h2>
        </div>

        <div className="table-wrapper">
          <table className="volcano-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Country</th>
                <th>Continent</th>
                <th>Height (m)</th>
                <th>Last Eruption</th>
                <th>Type</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="no-results">
                    No volcanoes match the current filters.
                  </td>
                </tr>
              ) : (
                results.map((v) => (
                  <tr key={v.name}>
                    <td>{v.name}</td>
                    <td>{v.country}</td>
                    <td>{v.continent}</td>
                    <td>{v.height_m.toLocaleString()}</td>
                    <td>{v.last_eruption}</td>
                    <td>{v.type}</td>
                    <td>
                      <span
                        className={`active-badge ${v.is_active ? 'active-badge-yes' : 'active-badge-no'}`}
                      >
                        {v.is_active ? 'Active' : 'Dormant'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};
