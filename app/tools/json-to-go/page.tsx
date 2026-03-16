import type { Metadata } from 'next';
import JsonToGo from '../../../components/tools/JsonToGo/JsonToGo';

export const metadata: Metadata = {
  title: 'JSON to Go Converter - Generate Go Structs with JSON Tags',
  description: 'Free JSON to Go struct converter tool. Transform JSON objects into Go structs with proper JSON tags and pointer field detection. Perfect for Go developers.',
  keywords: 'json to go, go struct generator, json converter, golang generator, go development, json to golang, go code generator, struct tags, how to convert json to go struct, golang json struct generator, unmarshal json go, go json tags',
  openGraph: {
    url: 'https://developers.do/tools/json-to-go',
    title: 'JSON to Go - Free Struct Generator',
    description: 'Convert JSON to Go structs instantly with JSON tags and pointer detection.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function JsonToGoPage() {
  return <JsonToGo />;
}
