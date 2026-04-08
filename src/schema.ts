import {
  FieldFactory,
  FilterSchema,
  SchemaBooleanField,
  SchemaNumberField,
  SchemaStringField,
} from './types';

export const field: FieldFactory = {
  string: (value): SchemaStringField => ({
    ...value,
    type: 'string',
  }),
  number: (value): SchemaNumberField => ({
    ...value,
    type: 'number',
  }),
  boolean: (value): SchemaBooleanField => ({
    ...value,
    type: 'boolean',
  }),
};

export const defineFilterSchema = <TSchema extends FilterSchema>(
  schema: TSchema
) => schema;
