/**
 * JSON Schema inference and serialization helpers.
 *
 * Conservative inference: emits type, required, properties, items (arrays),
 * and $defs/definitions for nested objects (draft-dependent naming).
 * Optional-field detection across multiple samples mirrors the
 * JsonToTypeScript multi-sample approach.
 */

export type JsonSchemaDraft = '2020-12' | 'draft-07';

export interface InferSchemaOptions {
  draft: JsonSchemaDraft;
  rootName?: string;
  additionalProperties?: boolean;
  samples?: unknown[];
}

type JsonSchema = Record<string, unknown>;

const JS_TYPE_TO_SCHEMA_TYPE: Record<string, string> = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  object: 'object',
  array: 'array',
};

function jsTypeOf(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function inferPrimitive(value: unknown): JsonSchema {
  if (value === null) return { type: 'null' };
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return { type: JS_TYPE_TO_SCHEMA_TYPE[typeof value] };
  }
  return {};
}

function inferArray(
  arr: unknown[],
  opts: InferSchemaOptions,
  defs: Map<string, JsonSchema>,
  path: string,
): JsonSchema {
  const schema: JsonSchema = { type: 'array' };
  if (arr.length === 0) {
    return schema;
  }

  // Determine homogeneity: all elements same JS type
  const firstType = jsTypeOf(arr[0]);
  const homogeneous = arr.every((el) => jsTypeOf(el) === firstType);

  if (!homogeneous) {
    return schema;
  }

  if (firstType === 'object') {
    const mergedSamples = arr as Record<string, unknown>[];
    schema.items = inferObject(mergedSamples, opts, defs, `${path}[]`);
    return schema;
  }

  if (firstType === 'array') {
    schema.items = inferArray(arr[0] as unknown[], opts, defs, `${path}[]`);
    return schema;
  }

  schema.items = inferPrimitive(arr[0]);
  return schema;
}

function inferObject(
  samples: Record<string, unknown>[],
  opts: InferSchemaOptions,
  defs: Map<string, JsonSchema>,
  path: string,
): JsonSchema {
  const allKeys = new Set<string>();
  samples.forEach((s) => Object.keys(s).forEach((k) => allKeys.add(k)));

  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  for (const key of allKeys) {
    const presentSamples = samples.filter((s) => Object.prototype.hasOwnProperty.call(s, key));
    const isRequired = presentSamples.length === samples.length;

    if (isRequired) required.push(key);

    const values = presentSamples.map((s) => s[key]);
    properties[key] = inferValue(values, opts, defs, `${path}.${key}`);
  }

  const schema: JsonSchema = {
    type: 'object',
    properties,
  };
  if (required.length > 0) schema.required = required;
  if (opts.additionalProperties === false) schema.additionalProperties = false;
  return schema;
}

function inferValue(
  values: unknown[],
  opts: InferSchemaOptions,
  defs: Map<string, JsonSchema>,
  path: string,
): JsonSchema {
  // Drop nulls for type-field inference but keep them for nullable union
  const nonNull = values.filter((v) => v !== null);
  const hasNull = nonNull.length < values.length;

  if (nonNull.length === 0) {
    return { type: 'null' };
  }

  const types = new Set(nonNull.map(jsTypeOf));

  // If mixed non-null primitive types, emit a type union (array of types)
  // Limited to primitive unions; complex mixed shapes fall back to no type.
  const primitiveOnly = [...types].every((t) => t !== 'object' && t !== 'array');
  if (primitiveOnly && types.size > 1) {
    const typeList = [...types].map((t) => JS_TYPE_TO_SCHEMA_TYPE[t]);
    return hasNull ? { type: [...typeList, 'null'] } : { type: typeList };
  }

  // Homogeneous type path
  if (types.size === 1) {
    const onlyType = [...types][0];
    if (onlyType === 'object') {
      const objSchema = inferObject(
        nonNull as Record<string, unknown>[],
        opts,
        defs,
        path,
      );
      return hasNull ? { ...objSchema, type: ['object', 'null'] } : objSchema;
    }
    if (onlyType === 'array') {
      // Merge all array samples into one combined array for inference.
      const merged = (nonNull as unknown[][]).reduce<unknown[]>(
        (acc, arr) => acc.concat(arr),
        [],
      );
      const arrSchema = inferArray(merged, opts, defs, path);
      return hasNull ? { ...arrSchema, type: ['array', 'null'] } : arrSchema;
    }
    const prim = inferPrimitive(nonNull[0]);
    return hasNull ? { type: [prim.type, 'null'] } : prim;
  }

  // Mixed object/array/primitive — give up and emit no type constraint
  return {};
}

const ROOT_NAMES: RegExp = /^[a-zA-Z_$][a-zA-Z0-9_$-]*$/;

function refName(key: string): string {
  const cleaned = key
    .replace(/[^a-zA-Z0-9_$-]/g, '')
    .replace(/^[0-9_-]+/, '')
    .replace(/^[a-z]/, (c) => c.toUpperCase());
  return cleaned || 'Item';
}

export function inferSchema(
  value: unknown,
  opts: InferSchemaOptions,
): { schema: JsonSchema | null; error?: string } {
  try {
    const samplesRaw = opts.samples && opts.samples.length > 0 ? opts.samples : [value];
    const samples = samplesRaw.filter((s) => s !== undefined && s !== null);

    if (samples.length === 0) {
      return { schema: null, error: 'No non-null JSON provided' };
    }

    const rootsAreObjects = samples.every((s) => jsTypeOf(s) === 'object');
    if (!rootsAreObjects) {
      // Infer a simple non-object root
      const inferred = inferValue(samples, opts, new Map(), 'root');
      const root: JsonSchema = opts.draft === '2020-12'
        ? { $schema: 'https://json-schema.org/draft/2020-12/schema', ...inferred }
        : { $schema: 'http://json-schema.org/draft-07/schema#', ...inferred };
      return { schema: root };
    }

    const defs = new Map<string, JsonSchema>();
    const body = inferObject(
      samples as Record<string, unknown>[],
      opts,
      defs,
      opts.rootName && ROOT_NAMES.test(opts.rootName) ? opts.rootName : 'root',
    );

    const $schema = opts.draft === '2020-12'
      ? 'https://json-schema.org/draft/2020-12/schema'
      : 'http://json-schema.org/draft-07/schema#';
    const defsKey = opts.draft === '2020-12' ? '$defs' : 'definitions';

    // Inline defs (we did not actually $ref during inference to keep it simple)
    const root: JsonSchema = { $schema, ...body };
    if (defs.size > 0) {
      const defsObj: Record<string, JsonSchema> = {};
      defs.forEach((v, k) => { defsObj[k] = v; });
      root[defsKey] = defsObj;
    }

    return { schema: root };
  } catch (err) {
    return { schema: null, error: err instanceof Error ? err.message : 'Failed to infer schema' };
  }
}

export function serializeSchema(schema: JsonSchema): string {
  return JSON.stringify(schema, null, 2);
}

export function isValidJson(text: string): { value: unknown; error?: string } {
  try {
    const value = JSON.parse(text);
    return { value };
  } catch (err) {
    return { value: undefined, error: err instanceof Error ? err.message : 'Invalid JSON' };
  }
}