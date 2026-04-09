import knex, { type Knex } from 'knex';
import { Binding } from '../../../src/bindings';
import { OperationType } from '../../../src';
import type { FilterCondition, FilterGroup } from '../../../src';

const db = knex({ client: 'sqlite3', useNullAsDefault: true });

export interface FilterQueryResult {
  sql: string;
  bindings: readonly unknown[];
  displaySql: string;
}

function normalizeBooleanValue(
  value: unknown,
  type?: string
): unknown {
  if (type !== 'boolean') return value;
  if (value === true || value === 1) return 1;
  if (value === false || value === 0) return 0;
  return value;
}

// Type-safe OR/AND dispatch helpers
function addWhere(
  qb: Knex.QueryBuilder,
  isOr: boolean,
  field: string,
  op: string,
  value: unknown
): void {
  if (isOr) qb.orWhere(field, op, value as Knex.Value);
  else qb.where(field, op, value as Knex.Value);
}

function addWhereNot(
  qb: Knex.QueryBuilder,
  isOr: boolean,
  field: string,
  op: string,
  value: unknown
): void {
  if (isOr) qb.orWhereNot(field, op, value as Knex.Value);
  else qb.whereNot(field, op, value as Knex.Value);
}

function addWhereNull(
  qb: Knex.QueryBuilder,
  isOr: boolean,
  field: string
): void {
  if (isOr) qb.orWhereNull(field);
  else qb.whereNull(field);
}

function addWhereNotNull(
  qb: Knex.QueryBuilder,
  isOr: boolean,
  field: string
): void {
  if (isOr) qb.orWhereNotNull(field);
  else qb.whereNotNull(field);
}

function addWhereIn(
  qb: Knex.QueryBuilder,
  isOr: boolean,
  field: string,
  values: unknown[]
): void {
  if (isOr) qb.orWhereIn(field, values as Knex.Value[]);
  else qb.whereIn(field, values as Knex.Value[]);
}

function addWhereNotIn(
  qb: Knex.QueryBuilder,
  isOr: boolean,
  field: string,
  values: unknown[]
): void {
  if (isOr) qb.orWhereNotIn(field, values as Knex.Value[]);
  else qb.whereNotIn(field, values as Knex.Value[]);
}

function applyCondition(
  qb: Knex.QueryBuilder,
  condition: FilterCondition,
  combinator: Binding
): void {
  const { field, operator, value, type } = condition;
  if (!field || !operator) return;

  const isOr = combinator === Binding.OR;

  switch (operator) {
    case OperationType.IS_EMPTY:
      addWhereNull(qb, isOr, field);
      return;

    case OperationType.IS_NOT_EMPTY:
      addWhereNotNull(qb, isOr, field);
      return;

    case OperationType.IS_ANY:
      return;

    case OperationType.IS:
    case OperationType.EQUAL:
      if (value === undefined || value === null) return;
      addWhere(
        qb,
        isOr,
        field,
        '=',
        normalizeBooleanValue(value, type)
      );
      return;

    case OperationType.IS_NOT:
    case OperationType.NOT_EQUAL:
      if (value === undefined || value === null) return;
      addWhere(
        qb,
        isOr,
        field,
        '!=',
        normalizeBooleanValue(value, type)
      );
      return;

    case OperationType.CONTAINS:
      if (typeof value !== 'string' || !value) return;
      addWhere(qb, isOr, field, 'like', `%${value}%`);
      return;

    case OperationType.DOES_NOT_CONTAIN:
      if (typeof value !== 'string' || !value) return;
      addWhereNot(qb, isOr, field, 'like', `%${value}%`);
      return;

    case OperationType.STARTS_WITH:
      if (typeof value !== 'string' || !value) return;
      addWhere(qb, isOr, field, 'like', `${value}%`);
      return;

    case OperationType.ENDS_WITH:
      if (typeof value !== 'string' || !value) return;
      addWhere(qb, isOr, field, 'like', `%${value}`);
      return;

    case OperationType.BIGGER_THAN:
      if (value === undefined || value === null) return;
      addWhere(qb, isOr, field, '>', value);
      return;

    case OperationType.LOWER_THAN:
      if (value === undefined || value === null) return;
      addWhere(qb, isOr, field, '<', value);
      return;

    case OperationType.BIGGER_OR_EQUAL_THAN:
      if (value === undefined || value === null) return;
      addWhere(qb, isOr, field, '>=', value);
      return;

    case OperationType.LOWER_OR_EQUAL_THAN:
      if (value === undefined || value === null) return;
      addWhere(qb, isOr, field, '<=', value);
      return;

    case OperationType.BEFORE:
      if (value === undefined || value === null) return;
      addWhere(qb, isOr, field, '<', value);
      return;

    case OperationType.AFTER:
      if (value === undefined || value === null) return;
      addWhere(qb, isOr, field, '>', value);
      return;

    case OperationType.ON_OR_BEFORE:
      if (value === undefined || value === null) return;
      addWhere(qb, isOr, field, '<=', value);
      return;

    case OperationType.ON_OR_AFTER:
      if (value === undefined || value === null) return;
      addWhere(qb, isOr, field, '>=', value);
      return;

    case OperationType.ANY_OF:
    case OperationType.IN:
      if (!Array.isArray(value) || value.length === 0) return;
      addWhereIn(qb, isOr, field, value);
      return;

    case OperationType.NONE_OF:
    case OperationType.NOT_IN:
      if (!Array.isArray(value) || value.length === 0) return;
      addWhereNotIn(qb, isOr, field, value);
      return;

    case OperationType.ALL_OF:
      if (!Array.isArray(value) || value.length === 0) return;
      for (const v of value as string[]) {
        addWhere(qb, isOr, field, 'like', `%${v}%`);
      }
      return;
  }
}

function applyGroup(qb: Knex.QueryBuilder, group: FilterGroup): void {
  for (const child of group.children) {
    if (child.kind === 'group') {
      const method =
        group.combinator === Binding.OR ? 'orWhere' : 'where';
      qb[method](function (this: Knex.QueryBuilder) {
        applyGroup(this, child);
      });
    } else {
      applyCondition(qb, child, group.combinator);
    }
  }
}

export function buildFilterQuery(
  group: FilterGroup
): FilterQueryResult {
  const qb = db('volcanoes').select('*');
  applyGroup(qb, group);
  const { sql, bindings } = qb.toSQL();
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  const displaySql = qb.toString();
  return { sql, bindings, displaySql };
}
