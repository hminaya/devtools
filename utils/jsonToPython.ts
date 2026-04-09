/**
 * JSON to Python converter
 * Generates both dataclass and Pydantic model output
 * Supports multiple JSON samples to detect optional fields
 */

interface TypeInfo {
  type: string;
  isOptional: boolean;
}

interface ClassDefinition {
  name: string;
  properties: Map<string, TypeInfo>;
}

const generatedClasses = new Map<string, ClassDefinition>();
let classCounter = 0;

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^(.)/, (_, chr) => chr.toUpperCase());
}

function getPythonType(value: any, propertyName: string = '', parentName: string = ''): string {
  if (value === null) {
    return 'Any';
  }

  const type = typeof value;

  if (type === 'string') return 'str';
  if (type === 'number') {
    return Number.isInteger(value) ? 'int' : 'float';
  }
  if (type === 'boolean') return 'bool';

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'list[Any]';
    }

    const types = new Set(value.map(item => getPythonType(item, propertyName, parentName)));

    if (types.size === 1) {
      const itemType = Array.from(types)[0];
      return `list[${itemType}]`;
    }

    return 'list[Any]';
  }

  if (type === 'object') {
    const className = propertyName
      ? toPascalCase(propertyName)
      : `DataClass${classCounter++}`;

    const fullClassName = parentName && propertyName
      ? `${parentName}${className}`
      : className;

    if (!generatedClasses.has(fullClassName)) {
      const classDef: ClassDefinition = {
        name: fullClassName,
        properties: new Map(),
      };

      for (const [key, val] of Object.entries(value)) {
        classDef.properties.set(key, {
          type: getPythonType(val, key, fullClassName),
          isOptional: false,
        });
      }

      generatedClasses.set(fullClassName, classDef);
    }

    return fullClassName;
  }

  return 'Any';
}

function mergeObjectSchemas(obj1: any, obj2: any, propertyName: string = '', parentName: string = ''): void {
  const className = propertyName
    ? toPascalCase(propertyName)
    : 'Root';

  const fullClassName = parentName && propertyName
    ? `${parentName}${className}`
    : className;

  const existingClass = generatedClasses.get(fullClassName);
  if (!existingClass) return;

  const keys1 = new Set(Object.keys(obj1));
  const keys2 = new Set(Object.keys(obj2));

  for (const key of keys1) {
    if (!keys2.has(key)) {
      const propInfo = existingClass.properties.get(key);
      if (propInfo) {
        propInfo.isOptional = true;
      }
    }
  }

  for (const key of keys2) {
    if (!keys1.has(key)) {
      existingClass.properties.set(key, {
        type: getPythonType(obj2[key], key, fullClassName),
        isOptional: true,
      });
    } else {
      if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' &&
          !Array.isArray(obj1[key]) && !Array.isArray(obj2[key]) &&
          obj1[key] !== null && obj2[key] !== null) {
        mergeObjectSchemas(obj1[key], obj2[key], key, fullClassName);
      }
    }
  }
}

function generateDataclass(def: ClassDefinition): string {
  const lines: string[] = [`@dataclass`, `class ${def.name}:`];

  const properties = Array.from(def.properties.entries());
  if (properties.length === 0) {
    lines.push('    pass');
    return lines.join('\n');
  }

  // Non-optional fields first, then optional fields (Python requires defaults after non-defaults)
  const required = properties.filter(([, t]) => !t.isOptional);
  const optional = properties.filter(([, t]) => t.isOptional);
  const sorted = [...required, ...optional];

  for (const [propName, typeInfo] of sorted) {
    const snakeName = toSnakeCase(propName);
    if (typeInfo.isOptional) {
      lines.push(`    ${snakeName}: Optional[${typeInfo.type}] = None`);
    } else {
      lines.push(`    ${snakeName}: ${typeInfo.type}`);
    }
  }

  return lines.join('\n');
}

function generatePydanticModel(def: ClassDefinition): string {
  const lines: string[] = [`class ${def.name}(BaseModel):`];

  const properties = Array.from(def.properties.entries());
  if (properties.length === 0) {
    lines.push('    pass');
    return lines.join('\n');
  }

  const required = properties.filter(([, t]) => !t.isOptional);
  const optional = properties.filter(([, t]) => t.isOptional);
  const sorted = [...required, ...optional];

  const hasAlias = sorted.some(([propName]) => toSnakeCase(propName) !== propName);

  for (const [propName, typeInfo] of sorted) {
    const snakeName = toSnakeCase(propName);
    const needsAlias = snakeName !== propName;

    if (typeInfo.isOptional) {
      if (needsAlias) {
        lines.push(`    ${snakeName}: Optional[${typeInfo.type}] = Field(None, alias="${propName}")`);
      } else {
        lines.push(`    ${snakeName}: Optional[${typeInfo.type}] = None`);
      }
    } else {
      if (needsAlias) {
        lines.push(`    ${snakeName}: ${typeInfo.type} = Field(..., alias="${propName}")`);
      } else {
        lines.push(`    ${snakeName}: ${typeInfo.type}`);
      }
    }
  }

  if (hasAlias) {
    lines.push('');
    lines.push('    model_config = ConfigDict(populate_by_name=True)');
  }

  return lines.join('\n');
}

export type PythonStyle = 'dataclass' | 'pydantic';

export interface ConversionOptions {
  rootClassName?: string;
  style?: PythonStyle;
}

function generateImports(style: PythonStyle, hasOptional: boolean, hasAlias: boolean): string {
  const lines: string[] = [];

  if (style === 'dataclass') {
    lines.push('from dataclasses import dataclass');
    if (hasOptional) {
      lines.push('from typing import Any, Optional');
    } else {
      lines.push('from typing import Any');
    }
  } else {
    if (hasOptional) {
      lines.push('from typing import Any, Optional');
    } else {
      lines.push('from typing import Any');
    }
    const pydanticImports = ['BaseModel'];
    if (hasAlias) {
      pydanticImports.push('ConfigDict', 'Field');
    }
    lines.push(`from pydantic import ${pydanticImports.join(', ')}`);
  }

  return lines.join('\n');
}

function generateInstantiationExample(jsonString: string, rootName: string, style: PythonStyle): string {
  try {
    const obj = JSON.parse(jsonString);

    function formatValue(value: any, indent: number = 4): string {
      const spaces = ' '.repeat(indent);

      if (value === null) return 'None';
      if (typeof value === 'string') return `"${value}"`;
      if (typeof value === 'boolean') return value ? 'True' : 'False';
      if (typeof value === 'number') return String(value);

      if (Array.isArray(value)) {
        if (value.length === 0) return '[]';
        const items = value.map(v => `${spaces}    ${formatValue(v, indent + 4)}`).join(',\n');
        return `[\n${items}\n${spaces}]`;
      }

      if (typeof value === 'object') {
        const entries = Object.entries(value);
        if (entries.length === 0) return `${rootName}()`;
        const props = entries.map(([k, v]) => {
          const snakeKey = toSnakeCase(k);
          return `${spaces}    ${snakeKey}=${formatValue(v, indent + 4)}`;
        }).join(',\n');
        return `${rootName}(\n${props}\n${spaces})`;
      }

      return 'None';
    }

    const entries = Object.entries(obj);
    const props = entries.map(([key, value]) => {
      const snakeKey = toSnakeCase(key);
      return `    ${snakeKey}=${formatValue(value, 4)}`;
    }).join(',\n');

    return `example = ${rootName}(\n${props}\n)`;
  } catch {
    return `# Unable to generate example: Invalid JSON`;
  }
}

/**
 * Convert JSON objects to Python classes
 * @param jsonStrings - Array of JSON strings (multiple samples to detect optional fields)
 * @param options - Conversion options
 * @returns Python class definitions
 */
export function convertJsonToPython(
  jsonStrings: string[],
  options: ConversionOptions = {}
): { success: boolean; output?: string; example?: string; error?: string } {
  try {
    generatedClasses.clear();
    classCounter = 0;

    if (jsonStrings.length === 0) {
      return { success: false, error: 'No JSON provided' };
    }

    const parsedObjects: any[] = [];

    for (const jsonStr of jsonStrings) {
      if (!jsonStr.trim()) continue;
      const parsed = JSON.parse(jsonStr);
      parsedObjects.push(parsed);
    }

    if (parsedObjects.length === 0) {
      return { success: false, error: 'No valid JSON objects' };
    }

    const rootName = options.rootClassName || 'Root';
    const style = options.style || 'dataclass';
    const firstObj = parsedObjects[0];

    const rootClass: ClassDefinition = {
      name: rootName,
      properties: new Map(),
    };

    for (const [key, value] of Object.entries(firstObj)) {
      rootClass.properties.set(key, {
        type: getPythonType(value, key, rootName),
        isOptional: false,
      });
    }

    generatedClasses.set(rootName, rootClass);

    for (let i = 1; i < parsedObjects.length; i++) {
      mergeObjectSchemas(parsedObjects[0], parsedObjects[i], '', '');
    }

    const classCode: string[] = [];

    // Sort: nested classes first, root last
    const sortedClasses = Array.from(generatedClasses.values()).sort((a, b) => {
      if (a.name === rootName) return 1;
      if (b.name === rootName) return -1;
      return a.name.localeCompare(b.name);
    });

    const hasOptional = Array.from(generatedClasses.values()).some(c =>
      Array.from(c.properties.values()).some(p => p.isOptional)
    );

    const hasAlias = style === 'pydantic' && Array.from(generatedClasses.values()).some(c =>
      Array.from(c.properties.entries()).some(([propName]) => toSnakeCase(propName) !== propName)
    );

    classCode.push(generateImports(style, hasOptional, hasAlias));
    classCode.push('');

    for (const classDef of sortedClasses) {
      if (style === 'dataclass') {
        classCode.push(generateDataclass(classDef));
      } else {
        classCode.push(generatePydanticModel(classDef));
      }
    }

    const example = jsonStrings[0] ? generateInstantiationExample(jsonStrings[0], rootName, style) : '';

    return {
      success: true,
      output: classCode.join('\n\n'),
      example,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to convert JSON',
    };
  }
}
