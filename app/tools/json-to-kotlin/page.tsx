import type { Metadata } from 'next';
import JsonToKotlin from '../../../components/tools/JsonToKotlin/JsonToKotlin';

export const metadata: Metadata = {
  title: 'JSON to Kotlin Converter - Generate Kotlin Data Classes',
  description: 'Free JSON to Kotlin converter tool. Transform JSON objects into Kotlin data classes with nullable field detection. Perfect for Android and backend developers.',
  keywords: 'json to kotlin, kotlin data class generator, json converter, kotlin generator, android development, json to kotlin online, kotlin code generator, how to convert json to kotlin, kotlin data class from json, android json to model, json deserialize kotlin',
  openGraph: {
    url: 'https://developers.do/tools/json-to-kotlin',
    title: 'JSON to Kotlin - Free Data Class Generator',
    description: 'Convert JSON to Kotlin data classes instantly with nullable field detection.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function JsonToKotlinPage() {
  return <JsonToKotlin />;
}
