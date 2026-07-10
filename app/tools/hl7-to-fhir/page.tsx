import type { Metadata } from 'next';
import HL7ToFhirConverter from '../../../components/tools/HL7ToFhirConverter/HL7ToFhirConverter';

export const metadata: Metadata = {
  title: 'HL7 to FHIR Converter - Convert HL7 v2 to FHIR R4 Bundles',
  description: 'Free online HL7 to FHIR converter. Transform HL7 v2 messages (ADT, ORU, ORM, VXU, SIU) into FHIR R4 Bundles with Patient, Encounter, Observation, and more. All processing happens in your browser.',
  alternates: {
    canonical: '/tools/hl7-to-fhir',
  },
  openGraph: {
    url: 'https://www.developers.do/tools/hl7-to-fhir',
    title: 'HL7 to FHIR Converter - Free Online HL7 v2 to FHIR R4 Converter',
    description: 'Convert HL7 v2 messages into FHIR R4 Bundles with mapped resources.',
    images: [{ url: '/og/tools/hl7-to-fhir.png', width: 1200, height: 630, alt: 'Developer Tools Dashboard' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/tools/hl7-to-fhir.png'],
  },
};

export default function HL7ToFhirPage() {
  return <HL7ToFhirConverter />;
}
