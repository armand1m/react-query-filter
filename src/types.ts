import { Binding } from './bindings';
import { OperationType } from './operations';
import { SelectOption } from './select-option';

interface StringPropertyDescription {
  label: string;
  key: string;
  type: 'string';
  suggestions?: string[];
}

interface NumberPropertyDescription {
  label: string;
  key: string;
  type: 'number';
  suggestions?: number[];
}

interface BooleanPropertyDescription {
  label: string;
  key: string;
  type: 'boolean';
  suggestions?: [true, false];
}

export type PropertyDescription =
  | StringPropertyDescription
  | NumberPropertyDescription
  | BooleanPropertyDescription;

export interface Filter {
  id: string;
  field?: string;
  operation?: OperationType;
  value?: string | number | boolean;
  binding?: Binding;
  type?: PropertyDescription['type'];
}

export interface FilterSelectState {
  field?: SelectOption<string>;
  operation?: SelectOption<OperationType>;
  binding?: SelectOption<Binding>;
  fieldIndex?: number;
  operationIndex?: number;
  bindingIndex?: number;
}

export interface FilterRowProps {
  /** The current row filter state */
  filter: Filter;
  /** Current Select States */
  selectStates: FilterSelectState & {
    /** onChange handler for the `field` property of the current row filter. */
    onChangeField: (selectedField: SelectOption<string>) => void;
    /** onChange handler for the `binding` property of the current row filter. */
    onChangeBinding: (selectedBinding: SelectOption<Binding>) => void;
    /** onChange handler for the `operation` property of the current row filter. */
    onChangeOperation: (selectedOperation: SelectOption<OperationType>) => void;
  };
  /** List of Select Options for available fields. */
  fields: SelectOption<string>[];
  /** List of Select Options for available bindings. */
  bindings: SelectOption<Binding>[];
  /** List of Select Options for available operations. Will change based on the selected field type. */
  operations: SelectOption<OperationType>[];
  /** List of suggestions for this row. Will change based on the selected field type. */
  suggestions: any[];
  /** Flag that indicates whether the UI should render the binding select input. */
  shouldRenderBindingSelect: boolean;
  /** Flag that indicates whether the UI should render the value input. */
  shouldRenderValueInput: boolean;
  /** Handler that removes the current row filter from the overall state. */
  onRemove: () => void;
  /** onChange handler for the `value` property of the current row filter. */
  onChangeValue: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
