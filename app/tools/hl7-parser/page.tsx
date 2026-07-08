import type { Metadata } from 'next';
import HL7Parser from '../../../components/tools/HL7Parser/HL7Parser';

export const metadata: Metadata = {
  title: 'HL7 Parser - Parse HL7 v2 Messages, Segments & Fields',
  description: 'Paste an HL7 v2 message and inspect MSH, PID, PV1, OBX, and other segments with labeled fields, warnings, and structured JSON output. Runs in your browser.',
  keywords: 'hl7 parser, hl7 message parser, hl7 v2 parser, parse hl7, healthcare integration, adt parser, oru parser, hl7 to json, how to read hl7 message, parse hl7 v2 online, hl7 segment viewer, what is an hl7 message',
  alternates: {
    canonical: '/tools/hl7-parser',
  },
  openGraph: {
    url: 'https://developers.do/tools/hl7-parser',
    title: 'HL7 Parser - Free Online HL7 v2 Segment Viewer',
    description: 'Parse HL7 v2 messages into labeled segments, fields, components, warnings, and structured JSON output.',
    images: [{ url: '/og/tools/hl7-parser.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/hl7-parser.png'],
  },
};

export default function HL7ParserPage() {
  return <HL7Parser />;
}
