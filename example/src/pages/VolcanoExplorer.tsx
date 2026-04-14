import { useMemo } from 'react';
import {
  defineFilterSchema,
  field,
  useFilterBuilder,
} from '../../../src';
import { GroupedFilters } from '../components/FilterComponents';
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
