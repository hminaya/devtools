import type { Metadata } from 'next';
import HL7ToFhirConverter from '../../../components/tools/HL7ToFhirConverter/HL7ToFhirConverter';

export const metadata: Metadata = {
  title: 'HL7 to FHIR Converter - Convert HL7 v2 to FHIR R4 Bundles',
  description: 'Free online HL7 to FHIR converter. Transform HL7 v2 messages (ADT, ORU, ORM, VXU, SIU) into FHIR R4 Bundles with Patient, Encounter, Observation, and more. All processing happens in your browser.',
  keywords: 'hl7 to fhir, hl7 fhir converter, hl7 v2 to fhir r4, fhir bundle, adt to fhir, oru to fhir, healthcare interoperability, fhir converter',
  openGraph: {
    url: 'https://developers.do/tools/hl7-to-fhir',
    title: 'HL7 to FHIR Converter - Free Online HL7 v2 to FHIR R4 Converter',
    description: 'Convert HL7 v2 messages into FHIR R4 Bundles with mapped resources.',
    images: [{ url: 'https://developers.do/favicon.png' }],
  },
};

export default function HL7ToFhirPage() {
  return <HL7ToFhirConverter />;
}
