import { useMemo } from 'react';
import {
  Binding,
  FieldDefinition,
  FilterValue,
  OperationType,
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

const renderValueInput = (
  type: FieldDefinition['type'] | undefined,
  value: FilterValue | undefined,
  suggestions: FilterValue[],
  onChange: (value?: FilterValue) => void
) => {
  if (type === 'boolean') {
    return (
      <label className="checkbox">
        <input
          checked={Boolean(value)}
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
        list={`suggestions-${type ?? 'string'}`}
        type={type === 'number' ? 'number' : 'text'}
        value={value === undefined ? '' : String(value)}
        onChange={(event) =>
          onChange(
            type === 'number' && event.target.value !== ''
              ? Number(event.target.value)
              : event.target.value || undefined
          )
        }
      />
      {suggestions.length > 0 ? (
        <datalist id={`suggestions-${type ?? 'string'}`}>
          {suggestions.map((suggestion) => (
            <option
              key={String(suggestion)}
              value={String(suggestion)}
            />
          ))}
        </datalist>
      ) : null}
    </>
  );
};

export const App = () => {
  const {
    filters,
    fieldOptions,
    combinatorOptions,
    addFilter,
    removeFilter,
    updateField,
    updateOperator,
    updateValue,
    updateCombinator,
    getAvailableOperations,
    getSuggestions,
    shouldRenderValue,
  } = useQueryFilters({
    fields,
    defaultValue: [
      {
        field: 'status',
      },
    ],
  });

  const formattedFilters = useMemo(
    () => JSON.stringify(filters, null, 2),
    [filters]
  );

  return (
    <main className="page">
      <section className="panel">
        <div className="heading">
          <span className="eyebrow">Headless example</span>
          <h1>Build your own query builder UI</h1>
          <p>
            The library now exposes typed state and actions instead of
            DOM event handlers or packaged component kits.
          </p>
        </div>

        <div className="toolbar">
          <button className="button" onClick={() => addFilter()}>
            Add filter
          </button>
        </div>

        <div className="filters">
          {filters.map((filter, index) => {
            const operations = getAvailableOperations(filter.id);
            const suggestions = getSuggestions(filter.id);

            return (
              <div className="row" key={filter.id}>
                {index > 0 ? (
                  <select
                    className="select"
                    value={filter.combinator}
                    onChange={(event) =>
                      updateCombinator(
                        filter.id,
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
                  <span className="where">Where</span>
                )}

                <select
                  className="select"
                  value={filter.field ?? ''}
                  onChange={(event) =>
                    updateField(
                      filter.id,
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
                  value={filter.operator ?? ''}
                  onChange={(event) =>
                    updateOperator(
                      filter.id,
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

                {shouldRenderValue(filter.id)
                  ? renderValueInput(
                      filter.type,
                      filter.value,
                      suggestions,
                      (nextValue) => updateValue(filter.id, nextValue)
                    )
                  : null}

                <button
                  aria-label="Remove filter"
                  className="button button-secondary"
                  onClick={() => removeFilter(filter.id)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel panel-code">
        <span className="eyebrow">Current state</span>
        <pre>{formattedFilters}</pre>
      </section>
    </main>
  );
};
