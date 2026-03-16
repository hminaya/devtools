import type { Metadata } from 'next';
import JsonToCSharp from '../../../components/tools/JsonToCSharp/JsonToCSharp';

export const metadata: Metadata = {
  title: 'JSON to C# - Convert JSON to C# Classes',
  description: 'Free JSON to C# converter with syntax highlighting. Generate C# classes from JSON objects with optional JsonProperty attributes and PascalCase naming. Supports nullable property detection.',
  keywords: 'json to csharp, json to c#, csharp class generator, json converter, generate c# classes, json to class, csharp code generator, how to convert json to csharp, generate c# class from json, json to dotnet, json deserialize csharp',
  openGraph: {
    url: 'https://developers.do/tools/json-to-csharp',
    title: 'JSON to C# - Free Class Generator with Syntax Highlighting',
    description: 'Convert JSON to C# classes with JsonProperty attributes and PascalCase options. Free JSON to C# converter with nullable support.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function JsonToCSharpPage() {
  return <JsonToCSharp />;
}
