import type { Metadata } from 'next';
import HL7Parser from '../../../components/tools/HL7Parser/HL7Parser';

export const metadata: Metadata = {
  title: 'HL7 Parser - Read & Parse HL7 Messages',
  description: 'Free online HL7 v2 parser. Read, inspect, and parse HL7 messages into structured JSON with segment and field breakdown. All processing happens in your browser.',
  keywords: 'hl7 parser, hl7 message parser, hl7 v2 parser, parse hl7, healthcare integration, adt parser, oru parser, hl7 to json, how to read hl7 message, parse hl7 v2 online, hl7 segment viewer, what is an hl7 message',
  openGraph: {
    url: 'https://developers.do/tools/hl7-parser',
    title: 'HL7 Parser - Free Online HL7 Message Parser',
    description: 'Parse HL7 v2 messages into structured JSON with segment and field details.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function HL7ParserPage() {
  return <HL7Parser />;
}
