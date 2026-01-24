export type SecretFinding = {
  type: string;
  severity: 'high' | 'medium' | 'low';
  match: string;
  line: number;
  advice: string;
};

type Detector = {
  name: string;
  severity: SecretFinding['severity'];
  advice: string;
  pattern: RegExp;
};

const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomString(length: number, source: string = charset): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += source.charAt(Math.floor(Math.random() * source.length));
  }
  return result;
}

function makeAwsAccessKey(): string {
  return `AKIA${randomString(16, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')}`;
}

function makeAwsSecret(): string {
  return randomString(40, charset + '+/');
}

function makeGithubToken(): string {
  return `ghp_${randomString(36, charset)}`;
}

function makeSlackToken(): string {
  return `xoxb-${randomString(12)}-${randomString(24)}`;
}

function makeOpenAiKey(): string {
  return `sk-${randomString(48, charset)}`;
}

function makeStripeKey(): string {
  return `sk_live_${randomString(28, charset)}`;
}

function makeGoogleApiKey(): string {
  return `AIza${randomString(35, charset + '-_')}`;
}

function makeJwt(): string {
  const part = (len: number) => randomString(len, `${charset}-_.`);
  return `${part(24)}.${part(36)}.${part(43)}`;
}

const detectors: Detector[] = [
  {
    name: 'AWS Access Key',
    severity: 'high',
    advice: 'Rotate the key in IAM and remove it from source control.',
    pattern: /AKIA[0-9A-Z]{16}/,
  },
  {
    name: 'AWS Secret Key',
    severity: 'high',
    advice: 'Rotate the key in IAM and remove it from source control.',
    pattern: /(?:aws_secret_access_key|aws-secret|aws_secret)["']?\s*[:=]\s*["']?([A-Za-z0-9\/+=]{40})/i,
  },
  {
    name: 'Google API Key',
    severity: 'high',
    advice: 'Regenerate the key in Google Cloud Console and store it securely.',
    pattern: /AIza[0-9A-Za-z\-_]{35}/,
  },
  {
    name: 'GitHub Token',
    severity: 'high',
    advice: 'Revoke the token in GitHub and issue a new one with least privilege.',
    pattern: /ghp_[A-Za-z0-9]{36}/,
  },
  {
    name: 'Slack Token',
    severity: 'high',
    advice: 'Revoke the token in Slack and rotate bots/apps tokens.',
    pattern: /(xox[baprs]-[A-Za-z0-9\-]{10,48})/,
  },
  {
    name: 'Stripe Secret Key',
    severity: 'high',
    advice: 'Roll the key in Stripe dashboard and remove from code.',
    pattern: /sk_live_[0-9a-zA-Z]{24,}/,
  },
  {
    name: 'OpenAI API Key',
    severity: 'high',
    advice: 'Recreate the key in OpenAI and keep it outside the codebase.',
    pattern: /sk-[a-zA-Z0-9]{48}/,
  },
  {
    name: 'Private Key',
    severity: 'high',
    advice: 'Remove private keys from repos; use a secret manager or vault.',
    pattern: /-----BEGIN (?:RSA |DSA |EC )?PRIVATE KEY-----/,
  },
  {
    name: 'JWT',
    severity: 'medium',
    advice: 'Avoid embedding JWTs in code; use environment variables.',
    pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9._-]+\.[A-Za-z0-9._-]+/,
  },
  {
    name: 'Generic High Entropy',
    severity: 'medium',
    advice: 'Review this string; it may be a key or token.',
    pattern: /(?:secret|token|password|passwd|api[_-]?key)["']?\s*[:=]\s*["']?([A-Za-z0-9\/+=]{16,})/i,
  },
];

export function scanSecrets(text: string): SecretFinding[] {
  const lines = text.split(/\r?\n/);
  const findings: SecretFinding[] = [];

  lines.forEach((line, idx) => {
    detectors.forEach((detector) => {
      const flags = detector.pattern.flags.includes('g')
        ? detector.pattern.flags
        : `${detector.pattern.flags}g`;
      const regex = new RegExp(detector.pattern.source, flags);
      const matches = line.matchAll(regex);

      for (const match of matches) {
        const value = match[1] || match[0];
        findings.push({
          type: detector.name,
          severity: detector.severity,
          match: value,
          line: idx + 1,
          advice: detector.advice,
        });
      }
    });
  });

  return findings;
}

export function getSampleSecrets(): string {
  const lines = [
    '# Example configuration with generated sample secrets (client-side only)',
    `AWS_ACCESS_KEY_ID=${makeAwsAccessKey()}`,
    `AWS_SECRET_ACCESS_KEY=${makeAwsSecret()}`,
    `GITHUB_TOKEN=${makeGithubToken()}`,
    `SLACK_BOT_TOKEN=${makeSlackToken()}`,
    `OPENAI_API_KEY=${makeOpenAiKey()}`,
    `stripe_secret=${makeStripeKey()}`,
    `google_api_key=${makeGoogleApiKey()}`,
    'password="hunter2"',
    `token=${makeJwt()}`,
    `${'-----BEGIN '}PRIVATE KEY-----`,
    'SAMPLE_PRIVATE_KEY_BLOCK',
    '-----END PRIVATE KEY-----',
  ];

  return lines.join('\n');
}
