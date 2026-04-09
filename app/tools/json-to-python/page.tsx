import type { Metadata } from 'next';
import JsonToPython from '../../../components/tools/JsonToPython/JsonToPython';

export const metadata: Metadata = {
  title: 'JSON to Python Converter - Generate Dataclasses & Pydantic Models',
  description: 'Free JSON to Python converter. Transform JSON objects into Python dataclasses or Pydantic BaseModel classes with optional field detection. Perfect for API development and data validation.',
  keywords: 'json to python, python dataclass generator, json to pydantic, json converter python, python class generator, json to python online, pydantic model generator, json to dataclass, python json to model, api response to python, json deserialize python, convert json to python class',
  openGraph: {
    url: 'https://developers.do/tools/json-to-python',
    title: 'JSON to Python - Free Dataclass & Pydantic Generator',
    description: 'Convert JSON to Python dataclasses or Pydantic models instantly with optional field detection.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function JsonToPythonPage() {
  return <JsonToPython />;
}
