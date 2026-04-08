# react-query-filter

Headless query-builder hooks for React 18 and 19.

This refresh turns the package into a typed core library. Instead of returning DOM event handlers and prebuilt UI row props, `useQueryFilters` now exposes state, typed actions, and derived selectors so applications can build their own query-builder interface.

## Highlights

- React 18/19 support
- Headless API with typed field definitions
- Controlled and uncontrolled usage
- No bundled UI kit dependencies
- Modern build/test toolchain based on `tsup`, Vite, and Vitest

## Install

```bash
npm install react-query-filter
```

## Quick start

```tsx
import {
  OperationType,
  useQueryFilters,
  type FieldDefinition,
} from 'react-query-filter';

const fields: FieldDefinition[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'string',
    suggestions: ['draft', 'active'],
  },
  {
    key: 'score',
    label: 'Score',
    type: 'number',
    suggestions: [10, 50],
  },
];

function Example() {
  const {
    filters,
    fieldOptions,
    addFilter,
    updateField,
    updateOperator,
    updateValue,
    getAvailableOperations,
  } = useQueryFilters({ fields });

  return (
    <>
      <button onClick={() => addFilter()}>Add filter</button>
      {filters.map((filter) => (
        <div key={filter.id}>
          <select
            onChange={(event) =>
              updateField(filter.id, event.target.value)
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
            onChange={(event) =>
              updateOperator(
                filter.id,
                event.target.value as OperationType
              )
            }
          >
            <option value="">Operator</option>
            {getAvailableOperations(filter.id).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <input
            onChange={(event) =>
              updateValue(filter.id, event.target.value)
            }
          />
        </div>
      ))}
    </>
  );
}
```

## API snapshot

`useQueryFilters(options)` returns:

- `filters`
- `fieldOptions`
- `combinatorOptions`
- `addFilter`, `removeFilter`, `replaceFilters`, `reset`
- `updateField`, `updateOperator`, `updateValue`, `updateCombinator`
- `getFilter`, `getFieldDefinition`, `getAvailableOperations`, `getSuggestions`, `shouldRenderValue`

See [`example/src/App.tsx`](./example/src/App.tsx) for a complete UI example.

## Development

```bash
npm install
npm run validate
npm run example
```

## Migration notes

- `properties` became `fields`
- `initialValue` became `defaultValue`
- `operation` became `operator`
- `binding` became `combinator`
- `createFilterRowProps` was removed in favor of typed update methods and selectors
