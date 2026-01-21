export interface ExtractedEntity {
  type: string;
  value: string;
  start: number;
  end: number;
}

export interface ExtractionResult {
  entities: ExtractedEntity[];
  summary: Record<string, number>;
}

interface PatternDefinition {
  name: string;
  pattern: RegExp;
  description: string;
}

const PATTERNS: PatternDefinition[] = [
  {
    name: 'Email',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    description: 'Email addresses',
  },
  {
    name: 'URL',
    pattern: /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)/g,
    description: 'HTTP/HTTPS URLs',
  },
  {
    name: 'IPv4',
    pattern: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    description: 'IPv4 addresses',
  },
  {
    name: 'IPv6',
    pattern: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,7}:|\b(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}\b/g,
    description: 'IPv6 addresses',
  },
  {
    name: 'Phone',
    pattern: /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g,
    description: 'Phone numbers (US format)',
  },
  {
    name: 'Date',
    pattern: /\b(?:\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4}|\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/g,
    description: 'Dates (various formats)',
  },
  {
    name: 'Time',
    pattern: /\b(?:[01]?\d|2[0-3]):[0-5]\d(?::[0-5]\d)?(?:\s?[AP]M)?\b/gi,
    description: 'Time values',
  },
  {
    name: 'UUID',
    pattern: /\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g,
    description: 'UUIDs',
  },
  {
    name: 'Hex Color',
    pattern: /#(?:[0-9a-fA-F]{3}){1,2}\b/g,
    description: 'Hex color codes',
  },
  {
    name: 'Credit Card',
    pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
    description: 'Credit card numbers (masked in output)',
  },
  {
    name: 'MAC Address',
    pattern: /\b(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}\b/g,
    description: 'MAC addresses',
  },
  {
    name: 'File Path',
    pattern: /(?:\/[\w.-]+)+\/?|(?:[A-Za-z]:\\[\w\\.-]+)/g,
    description: 'File paths (Unix/Windows)',
  },
  {
    name: 'Hashtag',
    pattern: /#[a-zA-Z][a-zA-Z0-9_]*/g,
    description: 'Hashtags',
  },
  {
    name: 'Mention',
    pattern: /@[a-zA-Z][a-zA-Z0-9_]*/g,
    description: '@mentions',
  },
  {
    name: 'Semver',
    pattern: /\bv?\d+\.\d+\.\d+(?:-[a-zA-Z0-9.]+)?(?:\+[a-zA-Z0-9.]+)?\b/g,
    description: 'Semantic versions',
  },
  {
    name: 'JWT',
    pattern: /\beyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]+\b/g,
    description: 'JWT tokens',
  },
  {
    name: 'Base64',
    pattern: /\b(?:[A-Za-z0-9+/]{4}){10,}(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?\b/g,
    description: 'Base64 encoded strings (40+ chars)',
  },
];

export function getAvailablePatterns(): { name: string; description: string }[] {
  return PATTERNS.map(({ name, description }) => ({ name, description }));
}

function maskSensitive(type: string, value: string): string {
  if (type === 'Credit Card') {
    return value.slice(0, 4) + ' **** **** ' + value.slice(-4);
  }
  return value;
}

export function extractEntities(
  text: string,
  enabledTypes: string[]
): ExtractionResult {
  const entities: ExtractedEntity[] = [];
  const seen = new Set<string>();

  for (const { name, pattern } of PATTERNS) {
    if (!enabledTypes.includes(name)) continue;

    // Reset regex state
    pattern.lastIndex = 0;
    let match;

    while ((match = pattern.exec(text)) !== null) {
      const key = `${name}:${match[0]}:${match.index}`;
      if (seen.has(key)) continue;
      seen.add(key);

      entities.push({
        type: name,
        value: maskSensitive(name, match[0]),
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  // Sort by position in text
  entities.sort((a, b) => a.start - b.start);

  // Generate summary
  const summary: Record<string, number> = {};
  for (const entity of entities) {
    summary[entity.type] = (summary[entity.type] || 0) + 1;
  }

  return { entities, summary };
}

export function exportAsJson(entities: ExtractedEntity[]): string {
  return JSON.stringify(entities, null, 2);
}

export function exportAsCsv(entities: ExtractedEntity[]): string {
  const header = 'Type,Value,Start,End';
  const rows = entities.map(
    (e) => `"${e.type}","${e.value.replace(/"/g, '""')}",${e.start},${e.end}`
  );
  return [header, ...rows].join('\n');
}

export function getUniqueValues(entities: ExtractedEntity[]): Record<string, string[]> {
  const grouped: Record<string, Set<string>> = {};
  for (const entity of entities) {
    if (!grouped[entity.type]) {
      grouped[entity.type] = new Set();
    }
    const set = grouped[entity.type];
    if (set) {
      set.add(entity.value);
    }
  }
  const result: Record<string, string[]> = {};
  for (const [type, values] of Object.entries(grouped)) {
    result[type] = Array.from(values);
  }
  return result;
}

const SAMPLE_TEXTS = [
  `Here's a sample log file with various data types:

User john.doe@example.com logged in from 192.168.1.100 at 2024-03-15 14:30:00
Request ID: 550e8400-e29b-41d4-a716-446655440000
API endpoint: https://api.example.com/v1/users?id=123

Error in /var/log/application/error.log:
Connection timeout from 10.0.0.50 (MAC: 00:1A:2B:3C:4D:5E)

Contact support: +1 (555) 123-4567 or support@company.org
Version: v2.1.0-beta.3

Color theme: #3B82F6, #10B981, #EF4444
Hashtags: #javascript #typescript #webdev
Mentions: @alice @bob @charlie

JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

Meeting scheduled for 09:30 AM on 12/25/2024
File uploaded: C:\\Users\\Admin\\Documents\\report.pdf`,

  `Server deployment notes - Production Environment

Deployed by: devops@techcorp.io on 2024-08-22 at 18:45:30
Server IPs: 172.16.0.10, 172.16.0.11, 172.16.0.12
Load balancer: https://lb.techcorp.io/health

Network interfaces:
- eth0: 00:50:56:A1:B2:C3 (primary)
- eth1: 00:50:56:D4:E5:F6 (backup)

Release: v3.14.159-rc.1
Config path: /etc/myapp/config.yaml
Backup location: /mnt/backups/2024-08-22/

Contact: @sysadmin @devops_lead
Emergency: +1-800-555-0199
Docs: https://docs.techcorp.io/deployment#production

Session token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZGVwbG95Ym90IiwiZXhwIjoxNzI0MzYwMDAwfQ.mock_signature_here

#deployment #production #release`,

  `Bug Report #4521 - User Authentication Issue

Reported by: sarah.miller@bugtracker.net
Date: 01/15/2025 at 10:22 AM

Description:
Users from subnet 10.20.30.0/24 experiencing login failures.
Affected endpoint: https://auth.myservice.com/api/v2/login

Reproduction steps:
1. Connect from IP range 10.20.30.1 - 10.20.30.254
2. Attempt login at 08:00 AM EST
3. Observe 503 error

Related commits:
- a1b2c3d4-e5f6-7890-abcd-ef1234567890
- 98765432-10fe-dcba-0987-654321fedcba

Slack: @frontend_team @backend_team
Labels: #bug #authentication #urgent #p0

Device MAC: AC:DE:48:00:11:22
App version: v1.2.3
OS: Windows path C:\\Program Files\\MyApp\\logs\\auth.log`,

  `E-commerce Order Summary

Order ID: 7f3d2e1c-9a8b-4c5d-6e7f-8a9b0c1d2e3f
Customer: orders@shopper.example
Phone: (555) 867-5309

Billing Details:
Card: 4532015112830366 (Visa)
Transaction time: 2024-12-01 23:59:59

Shipping to:
Address file: /home/warehouse/orders/pending.csv

Product links:
- https://shop.example/products/item-001?color=blue&size=lg
- https://shop.example/products/item-002?ref=cart

Promo codes used: #SAVE20 #FREESHIP
Customer service: help@shopper.example or +1.555.234.5678

Internal tracking:
Gateway response: eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJvcmRlciI6IjEyMzQ1Iiwic3RhdHVzIjoicGFpZCJ9.mock_payment_signature

Palette used: #FF5733, #33FF57, #3357FF, #F0F
Fulfillment version: v4.0.0-stable
Timestamp: 11:30 PM on 12/01/2024`,

  `Network Security Audit Report

Auditor: security.audit@cyberdefense.org
Date: 2025-01-10 09:00:00

Scanned Assets:
External: 203.0.113.50, 203.0.113.51
Internal: 192.168.100.1 - 192.168.100.254
IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334

Discovered Services:
- https://vpn.company.net:8443/login
- https://mail.company.net/owa

Endpoints checked:
/var/log/secure
/etc/ssh/sshd_config
C:\\Windows\\System32\\config\\SAM

Device inventory:
Router: 00:11:22:33:44:55
Switch: 66:77:88:99:AA:BB
Firewall: CC:DD:EE:FF:00:11

Finding IDs:
- 12345678-1234-5678-1234-567812345678
- abcdef01-2345-6789-abcd-ef0123456789

Report by @security_team @compliance
Tags: #audit #security #compliance #quarterly
Version: v2.5.0-audit

Contact: +1 (555) 999-0000 or incident@cyberdefense.org`,

  `Social Media Analytics Dashboard

Report generated: 03/20/2024 at 16:45:00
Analyst: analytics@socialmetrics.io

Top performing posts:
1. https://twitter.com/brand/status/1234567890
   Mentions: @influencer1 @brand_ambassador
   Tags: #viral #trending #marketing

2. https://instagram.com/p/AbCdEfGhIjK/
   Colors used: #E1306C, #F77737, #FCAF45

Audience IPs (anonymized sample):
- 98.76.54.32
- 123.45.67.89
- 111.222.33.44

Campaign tracking:
ID: c0ffee00-dead-beef-cafe-123456789abc
API: https://api.analytics.io/v3/metrics?campaign=spring2024

Export: /reports/2024/Q1/social_metrics.json
Backup: C:\\Analytics\\Exports\\march_2024.csv

Team contacts:
- social.manager@company.co (+1-555-321-0987)
- content.lead@company.co
Slack: @social_team @marketing

Auth token: eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOiJhbmFseXRpY3MiLCJzY29wZSI6InJlYWQifQ.mock_es256_sig
Platform version: v5.2.1`,
];

export function getRandomSampleText(): string {
  const index = Math.floor(Math.random() * SAMPLE_TEXTS.length);
  return SAMPLE_TEXTS[index] ?? SAMPLE_TEXTS[0] ?? '';
}

// Keep for backwards compatibility
export const SAMPLE_TEXT = SAMPLE_TEXTS[0] ?? '';
