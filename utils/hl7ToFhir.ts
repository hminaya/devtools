import { parseHl7Message } from './hl7';
import type { ParsedHl7Message, Hl7Segment, Hl7Field } from './hl7';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FhirResource {
  resourceType: string;
  id: string;
  [key: string]: unknown;
}

export interface FhirBundleEntry {
  fullUrl: string;
  resource: FhirResource;
}

export interface FhirBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'transaction';
  timestamp?: string;
  entry: FhirBundleEntry[];
}

export interface FhirResourceSummary {
  resourceType: string;
  id: string;
  description: string;
}

export interface Hl7ToFhirResult {
  success: boolean;
  bundle?: FhirBundle;
  resourceSummary?: FhirResourceSummary[];
  warnings?: string[];
  error?: string;
}

// ---------------------------------------------------------------------------
// Data access helpers
// ---------------------------------------------------------------------------

function getSegments(parsed: ParsedHl7Message, name: string): Hl7Segment[] {
  return parsed.segments.filter((s) => s.name === name);
}

function getField(segment: Hl7Segment | undefined, position: number): Hl7Field | undefined {
  return segment?.fields.find((f) => f.position === position);
}

function getFieldValue(segment: Hl7Segment | undefined, position: number): string {
  return getField(segment, position)?.value ?? '';
}

function getComponent(segment: Hl7Segment | undefined, fieldPos: number, compPos: number): string {
  const field = getField(segment, fieldPos);
  if (!field) return '';
  const rep = field.repetitions[0];
  if (!rep) return '';
  const comp = rep.components.find((c) => c.position === compPos);
  return comp?.value ?? '';
}

// ---------------------------------------------------------------------------
// Value mappers
// ---------------------------------------------------------------------------

function hl7DateToIso(hl7Date: string): string | undefined {
  if (!hl7Date) return undefined;
  const d = hl7Date.replace(/[^0-9]/g, '');
  if (d.length < 4) return undefined;

  const year = d.slice(0, 4);
  const month = d.slice(4, 6) || '01';
  const day = d.slice(6, 8) || '01';
  const hour = d.slice(8, 10);
  const minute = d.slice(10, 12);
  const second = d.slice(12, 14);

  if (hour) {
    return `${year}-${month}-${day}T${hour}:${minute || '00'}:${second || '00'}`;
  }
  return `${year}-${month}-${day}`;
}

function mapGender(hl7Gender: string): string {
  const map: Record<string, string> = {
    M: 'male',
    F: 'female',
    O: 'other',
    U: 'unknown',
    A: 'other',
    N: 'other',
  };
  return map[hl7Gender?.toUpperCase()] ?? 'unknown';
}

function mapEncounterClass(patientClass: string): { system: string; code: string; display: string } {
  const map: Record<string, { code: string; display: string }> = {
    I: { code: 'IMP', display: 'inpatient encounter' },
    O: { code: 'AMB', display: 'ambulatory' },
    E: { code: 'EMER', display: 'emergency' },
    P: { code: 'PRENC', display: 'pre-admission' },
    R: { code: 'IMP', display: 'recurring patient' },
    B: { code: 'AMB', display: 'obstetrics' },
  };
  const entry = map[patientClass?.toUpperCase()] ?? { code: 'AMB', display: 'ambulatory' };
  return { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', ...entry };
}

function mapObservationStatus(hl7Status: string): string {
  const map: Record<string, string> = {
    F: 'final',
    P: 'preliminary',
    C: 'corrected',
    R: 'registered',
    I: 'registered',
    D: 'cancelled',
    W: 'entered-in-error',
    X: 'cancelled',
  };
  return map[hl7Status?.toUpperCase()] ?? 'unknown';
}

function mapOrderStatus(orcStatus: string): string {
  const map: Record<string, string> = {
    NW: 'active',
    SC: 'active',
    IP: 'active',
    CM: 'completed',
    CA: 'revoked',
    DC: 'revoked',
    HD: 'on-hold',
    ER: 'entered-in-error',
    OD: 'active',
    RE: 'active',
  };
  return map[orcStatus?.toUpperCase()] ?? 'active';
}

function mapAppointmentStatus(triggerEvent: string): string {
  const map: Record<string, string> = {
    S12: 'booked',
    S13: 'booked',
    S14: 'booked',
    S15: 'cancelled',
    S16: 'cancelled',
    S17: 'noshow',
    S26: 'entered-in-error',
  };
  return map[triggerEvent?.toUpperCase()] ?? 'proposed';
}

function mapDiagnosticReportStatus(obrStatus: string): string {
  const map: Record<string, string> = {
    F: 'final',
    P: 'preliminary',
    C: 'corrected',
    R: 'registered',
    I: 'registered',
    O: 'registered',
    A: 'partial',
    X: 'cancelled',
  };
  return map[obrStatus?.toUpperCase()] ?? 'unknown';
}

// ---------------------------------------------------------------------------
// FHIR structure builders
// ---------------------------------------------------------------------------

function buildHumanName(segment: Hl7Segment | undefined, fieldPos: number) {
  const family = getComponent(segment, fieldPos, 1);
  const given = getComponent(segment, fieldPos, 2);
  const middle = getComponent(segment, fieldPos, 3);
  const suffix = getComponent(segment, fieldPos, 4);
  const prefix = getComponent(segment, fieldPos, 5);

  if (!family && !given) return undefined;

  const name: Record<string, unknown> = {};
  if (family) name.family = family;
  const givenNames = [given, middle].filter(Boolean);
  if (givenNames.length > 0) name.given = givenNames;
  if (prefix) name.prefix = [prefix];
  if (suffix) name.suffix = [suffix];

  return name;
}

function buildAddress(segment: Hl7Segment | undefined, fieldPos: number) {
  const street = getComponent(segment, fieldPos, 1);
  const other = getComponent(segment, fieldPos, 2);
  const city = getComponent(segment, fieldPos, 3);
  const state = getComponent(segment, fieldPos, 4);
  const zip = getComponent(segment, fieldPos, 5);
  const country = getComponent(segment, fieldPos, 6);

  if (!street && !city && !state && !zip) return undefined;

  const address: Record<string, unknown> = {};
  const lines = [street, other].filter(Boolean);
  if (lines.length > 0) address.line = lines;
  if (city) address.city = city;
  if (state) address.state = state;
  if (zip) address.postalCode = zip;
  if (country) address.country = country;

  return address;
}

function buildTelecom(segment: Hl7Segment | undefined, fieldPos: number, use: string) {
  const value = getComponent(segment, fieldPos, 1) || getFieldValue(segment, fieldPos);
  if (!value) return undefined;

  return {
    system: 'phone',
    value,
    use,
  };
}

function buildIdentifier(id: string, system?: string, type?: string) {
  if (!id) return undefined;

  const identifier: Record<string, unknown> = { value: id };
  if (system) identifier.system = system;
  if (type) {
    identifier.type = {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: type }],
    };
  }

  return identifier;
}

function buildCodeableConcept(code: string, display?: string, system?: string) {
  if (!code) return undefined;

  const coding: Record<string, unknown> = { code };
  if (display) coding.display = display;
  if (system) coding.system = system;

  return { coding: [coding], text: display || code };
}

function uuid(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Resource mappers
// ---------------------------------------------------------------------------

function mapPatient(parsed: ParsedHl7Message): FhirResource {
  const pid = getSegments(parsed, 'PID')[0];
  const patientId = uuid();

  const resource: FhirResource = {
    resourceType: 'Patient',
    id: patientId,
  };

  // Identifier (PID-3)
  const mrn = getComponent(pid, 3, 1);
  const assigningAuth = getComponent(pid, 3, 4);
  if (mrn) {
    resource.identifier = [buildIdentifier(mrn, assigningAuth || undefined, 'MR')];
  }

  // Name (PID-5)
  const name = buildHumanName(pid, 5);
  if (name) resource.name = [name];

  // Date of birth (PID-7)
  const dob = hl7DateToIso(getFieldValue(pid, 7));
  if (dob) resource.birthDate = dob.split('T')[0];

  // Gender (PID-8)
  const gender = getFieldValue(pid, 8);
  if (gender) resource.gender = mapGender(gender);

  // Address (PID-11)
  const address = buildAddress(pid, 11);
  if (address) resource.address = [address];

  // Telecom (PID-13, PID-14)
  const telecoms = [
    buildTelecom(pid, 13, 'home'),
    buildTelecom(pid, 14, 'work'),
  ].filter(Boolean);
  if (telecoms.length > 0) resource.telecom = telecoms;

  // SSN (PID-19)
  const ssn = getFieldValue(pid, 19);
  if (ssn) {
    const identifiers = (resource.identifier as Record<string, unknown>[]) || [];
    identifiers.push(buildIdentifier(ssn, 'http://hl7.org/fhir/sid/us-ssn', 'SS')!);
    resource.identifier = identifiers;
  }

  // Marital status (PID-16)
  const marital = getFieldValue(pid, 16);
  if (marital) {
    resource.maritalStatus = buildCodeableConcept(
      marital,
      undefined,
      'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus'
    );
  }

  return resource;
}

function mapEncounter(parsed: ParsedHl7Message, patientRef: string): FhirResource | undefined {
  const pv1 = getSegments(parsed, 'PV1')[0];
  if (!pv1) return undefined;

  const encounterId = uuid();
  const resource: FhirResource = {
    resourceType: 'Encounter',
    id: encounterId,
    status: 'in-progress',
    class: mapEncounterClass(getFieldValue(pv1, 2)),
    subject: { reference: patientRef },
  };

  // Visit number (PV1-19)
  const visitNum = getComponent(pv1, 19, 1) || getFieldValue(pv1, 19);
  if (visitNum) {
    resource.identifier = [buildIdentifier(visitNum, undefined, 'VN')];
  }

  // Location (PV1-3)
  const pointOfCare = getComponent(pv1, 3, 1);
  const room = getComponent(pv1, 3, 2);
  const bed = getComponent(pv1, 3, 3);
  const facility = getComponent(pv1, 3, 4);
  if (pointOfCare) {
    const locationDisplay = [pointOfCare, room, bed, facility].filter(Boolean).join(' / ');
    resource.location = [{ location: { display: locationDisplay } }];
  }

  // Attending doctor (PV1-7)
  const attendingId = getComponent(pv1, 7, 1);
  const attendingFamily = getComponent(pv1, 7, 2);
  const attendingGiven = getComponent(pv1, 7, 3);
  if (attendingId || attendingFamily) {
    const display = [attendingGiven, attendingFamily].filter(Boolean).join(' ');
    resource.participant = [{
      type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType', code: 'ATND', display: 'attender' }] }],
      individual: { display: display || attendingId },
    }];
  }

  // Admit date (PV1-44)
  const admitDate = hl7DateToIso(getFieldValue(pv1, 44));
  if (admitDate) {
    resource.period = { start: admitDate };
  }

  // Event type from EVN
  const evn = getSegments(parsed, 'EVN')[0];
  if (evn) {
    const eventDate = hl7DateToIso(getFieldValue(evn, 2));
    if (eventDate && !admitDate) {
      resource.period = { start: eventDate };
    }
  }

  // Service type (PV1-10)
  const service = getFieldValue(pv1, 10);
  if (service) {
    resource.serviceType = buildCodeableConcept(service);
  }

  return resource;
}

function mapDiagnosticReport(
  parsed: ParsedHl7Message,
  patientRef: string,
  observationRefs: string[]
): FhirResource | undefined {
  const obr = getSegments(parsed, 'OBR')[0];
  if (!obr) return undefined;

  const reportId = uuid();
  const resource: FhirResource = {
    resourceType: 'DiagnosticReport',
    id: reportId,
    status: mapDiagnosticReportStatus(getFieldValue(obr, 25)),
    subject: { reference: patientRef },
  };

  // Code (OBR-4)
  const code = getComponent(obr, 4, 1);
  const codeText = getComponent(obr, 4, 2);
  const codeSystem = getComponent(obr, 4, 3);
  if (code) {
    resource.code = buildCodeableConcept(code, codeText, codeSystem || undefined);
  }

  // Identifiers
  const placerOrder = getComponent(obr, 2, 1) || getFieldValue(obr, 2);
  const fillerOrder = getComponent(obr, 3, 1) || getFieldValue(obr, 3);
  const identifiers: Record<string, unknown>[] = [];
  if (placerOrder) identifiers.push(buildIdentifier(placerOrder, undefined, 'PLAC')!);
  if (fillerOrder) identifiers.push(buildIdentifier(fillerOrder, undefined, 'FILL')!);
  if (identifiers.length > 0) resource.identifier = identifiers;

  // Effective date (OBR-7)
  const effectiveDate = hl7DateToIso(getFieldValue(obr, 7));
  if (effectiveDate) resource.effectiveDateTime = effectiveDate;

  // Issued date (OBR-22)
  const issuedDate = hl7DateToIso(getFieldValue(obr, 22));
  if (issuedDate) resource.issued = issuedDate;

  // Observation references
  if (observationRefs.length > 0) {
    resource.result = observationRefs.map((ref) => ({ reference: ref }));
  }

  // Ordering provider (OBR-16)
  const providerId = getComponent(obr, 16, 1);
  const providerFamily = getComponent(obr, 16, 2);
  const providerGiven = getComponent(obr, 16, 3);
  if (providerId || providerFamily) {
    const display = [providerGiven, providerFamily].filter(Boolean).join(' ');
    resource.resultsInterpreter = [{ display: display || providerId }];
  }

  return resource;
}

function mapObservations(parsed: ParsedHl7Message, patientRef: string): FhirResource[] {
  const obxSegments = getSegments(parsed, 'OBX');
  return obxSegments.map((obx) => {
    const obsId = uuid();
    const resource: FhirResource = {
      resourceType: 'Observation',
      id: obsId,
      status: mapObservationStatus(getFieldValue(obx, 11)),
      subject: { reference: patientRef },
    };

    // Code (OBX-3)
    const code = getComponent(obx, 3, 1);
    const codeText = getComponent(obx, 3, 2);
    const codeSystem = getComponent(obx, 3, 3);
    if (code) {
      resource.code = buildCodeableConcept(code, codeText, codeSystem || undefined);
    }

    // Value (OBX-5) — check type (OBX-2)
    const valueType = getFieldValue(obx, 2);
    const rawValue = getComponent(obx, 5, 1) || getFieldValue(obx, 5);

    if (rawValue) {
      if (valueType === 'NM') {
        const numVal = parseFloat(rawValue);
        if (!isNaN(numVal)) {
          const unitCode = getComponent(obx, 6, 1);
          const unitText = getComponent(obx, 6, 2) || unitCode;
          const unitSystem = getComponent(obx, 6, 3);
          resource.valueQuantity = {
            value: numVal,
            unit: unitText || unitCode || undefined,
            code: unitCode || undefined,
            system: unitSystem || (unitCode ? 'http://unitsofmeasure.org' : undefined),
          };
        }
      } else if (valueType === 'CE' || valueType === 'CWE') {
        const valCode = getComponent(obx, 5, 1);
        const valText = getComponent(obx, 5, 2);
        const valSystem = getComponent(obx, 5, 3);
        resource.valueCodeableConcept = buildCodeableConcept(valCode, valText, valSystem || undefined);
      } else if (valueType === 'ST' || valueType === 'TX' || valueType === 'FT') {
        resource.valueString = rawValue;
      } else {
        resource.valueString = rawValue;
      }
    }

    // Reference range (OBX-7)
    const refRange = getFieldValue(obx, 7);
    if (refRange) {
      resource.referenceRange = [{ text: refRange }];
    }

    // Abnormal flag (OBX-8)
    const abnFlag = getFieldValue(obx, 8);
    if (abnFlag) {
      const interpretationMap: Record<string, { code: string; display: string }> = {
        N: { code: 'N', display: 'Normal' },
        H: { code: 'H', display: 'High' },
        L: { code: 'L', display: 'Low' },
        HH: { code: 'HH', display: 'Critical high' },
        LL: { code: 'LL', display: 'Critical low' },
        A: { code: 'A', display: 'Abnormal' },
        AA: { code: 'AA', display: 'Critical abnormal' },
      };
      const interp = interpretationMap[abnFlag.toUpperCase()] ?? { code: abnFlag, display: abnFlag };
      resource.interpretation = [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
          code: interp.code,
          display: interp.display,
        }],
      }];
    }

    // Observation date (OBX-14)
    const obsDate = hl7DateToIso(getFieldValue(obx, 14));
    if (obsDate) resource.effectiveDateTime = obsDate;

    return resource;
  });
}

function mapServiceRequest(parsed: ParsedHl7Message, patientRef: string): FhirResource | undefined {
  const orc = getSegments(parsed, 'ORC')[0];
  const obr = getSegments(parsed, 'OBR')[0];
  if (!orc && !obr) return undefined;

  const srId = uuid();
  const orderControl = getFieldValue(orc, 1);
  const orderStatus = getFieldValue(orc, 5);

  const resource: FhirResource = {
    resourceType: 'ServiceRequest',
    id: srId,
    status: mapOrderStatus(orderStatus || orderControl),
    intent: 'order',
    subject: { reference: patientRef },
  };

  // Code from OBR-4
  if (obr) {
    const code = getComponent(obr, 4, 1);
    const codeText = getComponent(obr, 4, 2);
    const codeSystem = getComponent(obr, 4, 3);
    if (code) {
      resource.code = buildCodeableConcept(code, codeText, codeSystem || undefined);
    }
  }

  // Identifiers from ORC
  const identifiers: Record<string, unknown>[] = [];
  const placerOrder = getComponent(orc, 2, 1) || getFieldValue(orc, 2);
  const fillerOrder = getComponent(orc, 3, 1) || getFieldValue(orc, 3);
  if (placerOrder) identifiers.push(buildIdentifier(placerOrder, undefined, 'PLAC')!);
  if (fillerOrder) identifiers.push(buildIdentifier(fillerOrder, undefined, 'FILL')!);
  if (identifiers.length > 0) resource.identifier = identifiers;

  // Authored on (ORC-9)
  const authoredOn = hl7DateToIso(getFieldValue(orc, 9));
  if (authoredOn) resource.authoredOn = authoredOn;

  // Ordering provider (ORC-12)
  const providerId = getComponent(orc, 12, 1);
  const providerFamily = getComponent(orc, 12, 2);
  const providerGiven = getComponent(orc, 12, 3);
  if (providerId || providerFamily) {
    const display = [providerGiven, providerFamily].filter(Boolean).join(' ');
    resource.requester = { display: display || providerId };
  }

  // Occurrence (OBR-7 requested time)
  if (obr) {
    const occurrence = hl7DateToIso(getFieldValue(obr, 7));
    if (occurrence) resource.occurrenceDateTime = occurrence;
  }

  return resource;
}

function mapImmunization(parsed: ParsedHl7Message, patientRef: string): FhirResource | undefined {
  const rxa = getSegments(parsed, 'RXA')[0];
  if (!rxa) return undefined;

  const immId = uuid();
  const resource: FhirResource = {
    resourceType: 'Immunization',
    id: immId,
    status: 'completed',
    patient: { reference: patientRef },
  };

  // Vaccine code (RXA-5)
  const vaccineCode = getComponent(rxa, 5, 1);
  const vaccineText = getComponent(rxa, 5, 2);
  const vaccineSystem = getComponent(rxa, 5, 3);
  if (vaccineCode) {
    resource.vaccineCode = buildCodeableConcept(
      vaccineCode,
      vaccineText,
      vaccineSystem === 'CVX' ? 'http://hl7.org/fhir/sid/cvx' : vaccineSystem || undefined
    );
  }

  // Occurrence (RXA-3)
  const adminDate = hl7DateToIso(getFieldValue(rxa, 3));
  if (adminDate) resource.occurrenceDateTime = adminDate;

  // Dose quantity (RXA-6, RXA-7)
  const doseAmount = getFieldValue(rxa, 6);
  const doseUnit = getComponent(rxa, 7, 1) || getFieldValue(rxa, 7);
  if (doseAmount) {
    const numVal = parseFloat(doseAmount);
    if (!isNaN(numVal)) {
      resource.doseQuantity = {
        value: numVal,
        unit: doseUnit || undefined,
        system: 'http://unitsofmeasure.org',
      };
    }
  }

  // Lot number (RXA-15)
  const lotNumber = getFieldValue(rxa, 15);
  if (lotNumber) resource.lotNumber = lotNumber;

  // Expiration date (RXA-16)
  const expDate = hl7DateToIso(getFieldValue(rxa, 16));
  if (expDate) resource.expirationDate = expDate.split('T')[0];

  // Manufacturer (RXA-17)
  const mfrCode = getComponent(rxa, 17, 1);
  const mfrText = getComponent(rxa, 17, 2);
  if (mfrCode || mfrText) {
    resource.manufacturer = { display: mfrText || mfrCode };
  }

  // Performer (RXA-10)
  const perfId = getComponent(rxa, 10, 1);
  const perfFamily = getComponent(rxa, 10, 2);
  const perfGiven = getComponent(rxa, 10, 3);
  if (perfId || perfFamily) {
    const display = [perfGiven, perfFamily].filter(Boolean).join(' ');
    resource.performer = [{ actor: { display: display || perfId } }];
  }

  // Completion status (RXA-20)
  const completionStatus = getFieldValue(rxa, 20);
  if (completionStatus) {
    const statusMap: Record<string, string> = {
      CP: 'completed',
      RE: 'not-done',
      NA: 'not-done',
      PA: 'completed',
    };
    resource.status = statusMap[completionStatus.toUpperCase()] ?? 'completed';
  }

  return resource;
}

function mapAppointment(parsed: ParsedHl7Message, patientRef: string, triggerEvent: string): FhirResource | undefined {
  const sch = getSegments(parsed, 'SCH')[0];
  if (!sch) return undefined;

  const apptId = uuid();
  const resource: FhirResource = {
    resourceType: 'Appointment',
    id: apptId,
    status: mapAppointmentStatus(triggerEvent),
  };

  // Participant — patient is always a participant
  const participants: Record<string, unknown>[] = [{
    actor: { reference: patientRef },
    status: 'accepted',
  }];

  // Identifiers (SCH-1 placer, SCH-2 filler)
  const identifiers: Record<string, unknown>[] = [];
  const placerAppt = getComponent(sch, 1, 1) || getFieldValue(sch, 1);
  const fillerAppt = getComponent(sch, 2, 1) || getFieldValue(sch, 2);
  if (placerAppt) identifiers.push(buildIdentifier(placerAppt, undefined, 'PLAC')!);
  if (fillerAppt) identifiers.push(buildIdentifier(fillerAppt, undefined, 'FILL')!);
  if (identifiers.length > 0) resource.identifier = identifiers;

  // Appointment type (SCH-7)
  const apptReasonCode = getComponent(sch, 7, 1);
  const apptReasonText = getComponent(sch, 7, 2);
  if (apptReasonCode || apptReasonText) {
    resource.appointmentType = buildCodeableConcept(
      apptReasonCode || apptReasonText,
      apptReasonText,
      undefined
    );
  }

  // Timing (SCH-11) — contains start^end in components 4 and 5
  const startTime = getComponent(sch, 11, 4);
  const endTime = getComponent(sch, 11, 5);
  if (startTime) {
    const isoStart = hl7DateToIso(startTime);
    if (isoStart) resource.start = isoStart;
  }
  if (endTime) {
    const isoEnd = hl7DateToIso(endTime);
    if (isoEnd) resource.end = isoEnd;
  }

  // Duration (SCH-9)
  const duration = getFieldValue(sch, 9);
  if (duration) {
    const numVal = parseInt(duration, 10);
    if (!isNaN(numVal)) {
      resource.minutesDuration = numVal;
    }
  }

  // Service type from AIS-3
  const ais = getSegments(parsed, 'AIS')[0];
  if (ais) {
    const serviceCode = getComponent(ais, 3, 1);
    const serviceText = getComponent(ais, 3, 2);
    const serviceSystem = getComponent(ais, 3, 3);
    if (serviceCode) {
      resource.serviceType = [buildCodeableConcept(serviceCode, serviceText, serviceSystem || undefined)];
    }
  }

  // Provider from AIP-3
  const aip = getSegments(parsed, 'AIP')[0];
  if (aip) {
    const provId = getComponent(aip, 3, 1);
    const provFamily = getComponent(aip, 3, 2);
    const provGiven = getComponent(aip, 3, 3);
    if (provId || provFamily) {
      const display = [provGiven, provFamily].filter(Boolean).join(' ');
      participants.push({
        actor: { display: display || provId },
        status: 'accepted',
      });
    }
  }

  // Location from AIL-3
  const ail = getSegments(parsed, 'AIL')[0];
  if (ail) {
    const locPOC = getComponent(ail, 3, 1);
    const locRoom = getComponent(ail, 3, 2);
    const locBed = getComponent(ail, 3, 3);
    const locFacility = getComponent(ail, 3, 4);
    if (locPOC) {
      const locDisplay = [locPOC, locRoom, locBed, locFacility].filter(Boolean).join(' / ');
      participants.push({
        actor: { display: locDisplay },
        status: 'accepted',
      });
    }
  }

  resource.participant = participants;

  // Description from SCH-7 text or SCH-6
  const reasonText = getComponent(sch, 6, 2) || getComponent(sch, 6, 1);
  if (reasonText) {
    resource.reasonCode = [buildCodeableConcept(
      getComponent(sch, 6, 1) || reasonText,
      reasonText,
      undefined
    )];
  }

  return resource;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function convertHl7ToFhir(input: string): Hl7ToFhirResult {
  const parseResult = parseHl7Message(input);

  if (!parseResult.success || !parseResult.data) {
    return {
      success: false,
      error: parseResult.error || 'Failed to parse HL7 message',
    };
  }

  const parsed = parseResult.data;
  const warnings: string[] = [...(parseResult.warnings || [])];
  const entries: FhirBundleEntry[] = [];
  const summaries: FhirResourceSummary[] = [];

  const messageType = parsed.messageType || '';
  const triggerEvent = parsed.triggerEvent || '';
  const messageKey = `${messageType}^${triggerEvent}`.toUpperCase();

  // Always map Patient from PID
  const hasPid = getSegments(parsed, 'PID').length > 0;
  if (!hasPid) {
    return {
      success: false,
      error: 'No PID segment found. A Patient Identification segment is required for FHIR conversion.',
    };
  }

  const patient = mapPatient(parsed);
  const patientFullUrl = `urn:uuid:${patient.id}`;
  entries.push({ fullUrl: patientFullUrl, resource: patient });

  const patientName = (patient.name as Array<{ family?: string; given?: string[] }>)?.[0];
  const patientDisplay = patientName
    ? [patientName.given?.[0], patientName.family].filter(Boolean).join(' ')
    : 'Patient';
  summaries.push({ resourceType: 'Patient', id: patient.id, description: patientDisplay });

  // Route to appropriate mappers
  switch (messageKey) {
    case 'ADT^A01':
    case 'ADT^A02':
    case 'ADT^A03':
    case 'ADT^A04':
    case 'ADT^A08': {
      const encounter = mapEncounter(parsed, patientFullUrl);
      if (encounter) {
        entries.push({ fullUrl: `urn:uuid:${encounter.id}`, resource: encounter });
        summaries.push({ resourceType: 'Encounter', id: encounter.id, description: `${messageKey} encounter` });
      }
      break;
    }

    case 'ORU^R01': {
      const observations = mapObservations(parsed, patientFullUrl);
      const obsRefs = observations.map((obs) => `urn:uuid:${obs.id}`);

      const report = mapDiagnosticReport(parsed, patientFullUrl, obsRefs);
      if (report) {
        entries.push({ fullUrl: `urn:uuid:${report.id}`, resource: report });
        const reportCode = (report.code as { text?: string })?.text;
        summaries.push({
          resourceType: 'DiagnosticReport',
          id: report.id,
          description: reportCode || 'Diagnostic Report',
        });
      }

      observations.forEach((obs) => {
        entries.push({ fullUrl: `urn:uuid:${obs.id}`, resource: obs });
        const obsCode = (obs.code as { text?: string })?.text;
        summaries.push({ resourceType: 'Observation', id: obs.id, description: obsCode || 'Observation' });
      });
      break;
    }

    case 'ORM^O01': {
      const serviceRequest = mapServiceRequest(parsed, patientFullUrl);
      if (serviceRequest) {
        entries.push({ fullUrl: `urn:uuid:${serviceRequest.id}`, resource: serviceRequest });
        const srCode = (serviceRequest.code as { text?: string })?.text;
        summaries.push({
          resourceType: 'ServiceRequest',
          id: serviceRequest.id,
          description: srCode || 'Service Request',
        });
      }
      break;
    }

    case 'VXU^V04': {
      const immunization = mapImmunization(parsed, patientFullUrl);
      if (immunization) {
        entries.push({ fullUrl: `urn:uuid:${immunization.id}`, resource: immunization });
        const vaccCode = (immunization.vaccineCode as { text?: string })?.text;
        summaries.push({
          resourceType: 'Immunization',
          id: immunization.id,
          description: vaccCode || 'Immunization',
        });
      }
      break;
    }

    case 'SIU^S12':
    case 'SIU^S13':
    case 'SIU^S14':
    case 'SIU^S15':
    case 'SIU^S16':
    case 'SIU^S17':
    case 'SIU^S26': {
      const appointment = mapAppointment(parsed, patientFullUrl, triggerEvent);
      if (appointment) {
        entries.push({ fullUrl: `urn:uuid:${appointment.id}`, resource: appointment });
        const apptType = (appointment.appointmentType as { text?: string })?.text;
        summaries.push({
          resourceType: 'Appointment',
          id: appointment.id,
          description: apptType || 'Appointment',
        });
      }
      break;
    }

    default: {
      warnings.push(
        `Message type "${messageKey}" is not specifically mapped. Only the Patient resource was extracted from PID.`
      );
      break;
    }
  }

  const bundle: FhirBundle = {
    resourceType: 'Bundle',
    id: uuid(),
    type: 'transaction',
    timestamp: hl7DateToIso(parsed.timestamp || ''),
    entry: entries.map((e) => ({
      ...e,
      request: { method: 'PUT', url: `${e.resource.resourceType}/${e.resource.id}` },
    })) as FhirBundleEntry[],
  };

  // Clean undefined timestamp
  if (!bundle.timestamp) delete bundle.timestamp;

  return {
    success: true,
    bundle,
    resourceSummary: summaries,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
