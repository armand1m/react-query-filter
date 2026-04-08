# react-query-filter

Headless recursive query-builder hooks for React 18 and 19.

The library keeps a tree-based grouped-filter engine internally, but the primary API is now a schema-driven builder facade. Consumers define fields once, then render typed group and condition controllers without juggling raw node ids, enum casts, or manual `Boolean` / `Number` / `String` coercion.

## Install

```bash
npm install react-query-filter
```

## Quick start

```tsx
import {
  defineFilterSchema,
  field,
  useFilterBuilder,
} from 'react-query-filter';

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
  }),
});

function Filters() {
  const builder = useFilterBuilder({ schema });

  return (
    <div>
      <button onClick={() => builder.root.addCondition()}>
        Add Filter
      </button>
      <button onClick={() => builder.root.addGroup()}>
        Add Filter Group
      </button>

      <GroupedFilters group={builder.root} />
    </div>
  );
}
```

## Recursive UI example

```tsx
import {
  type ConditionController,
  type GroupController,
} from 'react-query-filter';

function ConditionRow({
  condition,
  group,
}: {
  condition: ConditionController<typeof schema>;
  group: GroupController<typeof schema>;
}) {
  const combinatorProps = group.combinatorSelectProps();
  const fieldProps = condition.fieldSelectProps();
  const operatorProps = condition.operatorSelectProps();

  return (
    <div>
      {group.firstCondition?.id === condition.id ? (
        <select {...combinatorProps}>
          {combinatorProps.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}

      <select {...fieldProps}>
        <option value="">Field</option>
        {fieldProps.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select {...operatorProps}>
        <option value="">Operator</option>
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

      {condition.valueInput.kind === 'boolean' ? (
        <input type="checkbox" {...condition.valueInput.props} />
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
      <button onClick={() => group.addCondition()}>Add Filter</button>
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
```

## Beginner-facing API

Primary exports:

- `defineFilterSchema`
- `field.string()`, `field.number()`, `field.boolean()`
- `useFilterBuilder`
- `GroupController` and `ConditionController` helper types

`useFilterBuilder()` returns:

- `root`: recursive group controller
- `rootGroup`: raw tree value for persistence or debugging
- `reset()`
- `replaceTree()`

Each `GroupController` exposes:

- `children`, `directConditions`, `directGroups`, `firstCondition`
- `addCondition()`, `addGroup()`, `remove()`
- `setCombinator()` and `combinatorSelectProps()`

Each `ConditionController` exposes:

- `field`, `operator`, `suggestions`, `availableOperators`
- `setField()`, `setOperator()`, `setValue()`, `remove()`
- `fieldSelectProps()`, `operatorSelectProps()`, `valueInput`

## Advanced API

For advanced tree manipulation, the lower-level `useQueryFilters` hook and raw group/condition types remain available. That path is useful if you want direct access to the normalized tree engine, but it is no longer the recommended onboarding path.

## Development

```bash
npm install
npm --prefix example install
npm run validate
npm run example
```

The example app is also deployable to GitHub Pages from this repository. The Pages workflow builds `example/` with the repository base path so the hosted demo works at `https://armand1m.github.io/react-query-filter/`.

## Release automation

Releases are automated with Release Please on `main`. Maintainers do not hand-edit `CHANGELOG.md` or bump `package.json` versions for normal releases.

- Merge Conventional Commit PRs into `main`.
- Release Please opens or updates a release PR with the changelog and next version.
- Release PRs should pass normal CI before merge. To make that reliable, configure a `RELEASE_PLEASE_TOKEN` repository secret so Release Please PRs can trigger the standard pull request workflows.
- Merging the release PR validates the merged commit, publishes to npm, and only then creates the GitHub Release so npm and changelog state stay aligned.

Pull requests also get a release preview comment that shows the likely bump from the PR commits and the projected next release if merged now. Keep the PR title in Conventional Commit format so the preview and release history stay readable.
