# react-query-filter

Headless recursive query-builder hooks for React 18 and 19.

This library exposes a typed grouped-filter tree plus mutation helpers so applications can build nested query-builder interfaces without coupling to a specific UI kit.

## Highlights

- React 18/19 support
- Recursive groups and conditions
- Shared group combinators for easier mental parsing
- Controlled and uncontrolled usage
- Modern build/test toolchain based on `tsup`, Vite, and Vitest

## Install

```bash
npm install react-query-filter
```

## Quick start

```tsx
import {
  Binding,
  OperationType,
  useQueryFilters,
  type FieldDefinition,
} from 'react-query-filter';

const fields: FieldDefinition[] = [
  { key: 'status', label: 'Status', type: 'string' },
  { key: 'score', label: 'Score', type: 'number' },
];

function Example() {
  const {
    rootGroup,
    addCondition,
    addGroup,
    updateConditionField,
    updateConditionOperator,
    updateConditionValue,
    updateGroupCombinator,
    getAvailableOperations,
  } = useQueryFilters({ fields });

  const firstCondition = rootGroup.children.find(
    (child) => child.kind === 'condition'
  );

  return (
    <>
      <button onClick={() => addCondition(rootGroup.id)}>
        Add condition
      </button>
      <button onClick={() => addGroup(rootGroup.id)}>
        Add group
      </button>

      {firstCondition?.kind === 'condition' ? (
        <div>
          <select
            value={rootGroup.combinator}
            onChange={(event) =>
              updateGroupCombinator(
                rootGroup.id,
                event.target.value as Binding
              )
            }
          >
            <option value="AND">And</option>
            <option value="OR">Or</option>
          </select>

          <select
            onChange={(event) =>
              updateConditionField(
                firstCondition.id,
                event.target.value
              )
            }
          />

          <select
            onChange={(event) =>
              updateConditionOperator(
                firstCondition.id,
                event.target.value as OperationType
              )
            }
          >
            {getAvailableOperations(firstCondition.id).map(
              (option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              )
            )}
          </select>

          <input
            onChange={(event) =>
              updateConditionValue(
                firstCondition.id,
                event.target.value
              )
            }
          />
        </div>
      ) : null}
    </>
  );
}
```

## API snapshot

`useQueryFilters(options)` returns:

- `rootGroup`
- `fieldOptions`
- `combinatorOptions`
- `addCondition`, `addGroup`, `removeNode`, `replaceTree`, `reset`
- `updateConditionField`, `updateConditionOperator`, `updateConditionValue`
- `updateGroupCombinator`
- `getNode`, `getGroup`, `getCondition`
- `getFieldDefinition`, `getAvailableOperations`, `getSuggestions`, `shouldRenderValue`

## Group behavior

- Every group owns one logical combinator: `AND` or `OR`.
- Direct child conditions in the same group reflect that shared combinator.
- In the example UI, the combinator is selected on the first direct condition row in a group.
- If a group has no direct condition row yet, the combinator falls back to the group header.

See [`example/src/App.tsx`](./example/src/App.tsx) for a complete recursive UI example.

## Development

```bash
npm install
npm --prefix example install
npm run validate
npm run example
```

## Migration notes

- Flat `filters` were replaced by recursive `rootGroup`
- `addFilter` became `addCondition(groupId)`
- `removeFilter` became `removeNode(nodeId)`
- `updateField`, `updateOperator`, and `updateValue` became condition-specific update methods
- Group combinators now live on `FilterGroup`, not on individual condition rows
