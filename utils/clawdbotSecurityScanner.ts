export type SecurityFinding = {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  match: string;
  line: number;
  advice: string;
  reference?: string;
};

type SecurityRule = {
  name: string;
  severity: SecurityFinding['severity'];
  advice: string;
  pattern: RegExp;
  reference?: string;
};

const securityRules: SecurityRule[] = [
  // Gateway and Network Exposure
  {
    name: 'Open Gateway Policy',
    severity: 'critical',
    advice: 'Change groupPolicy to "allowlist" to restrict access to authorized users only.',
    pattern: /groupPolicy\s*[=:]\s*["']?open["']?/i,
    reference: 'https://docs.molt.bot/gateway/security',
  },
  {
    name: 'Public Interface Binding',
    severity: 'critical',
    advice: 'Bind to 127.0.0.1 or localhost only. Public binding exposes your control panel to the internet.',
    pattern: /(?:host|bind|listen)\s*[=:]\s*["']?(?:0\.0\.0\.0|::)["']?/i,
    reference: 'https://docs.molt.bot/gateway/security',
  },
  {
    name: 'Disabled Authentication',
    severity: 'critical',
    advice: 'Enable authentication to prevent unauthorized access to your agent.',
    pattern: /(?:auth|authentication|requireAuth)\s*[=:]\s*["']?(?:false|none|disabled|off)["']?/i,
  },

  // Browser and Shell Access
  {
    name: 'Browser Control Enabled',
    severity: 'high',
    advice: 'Browser control allows the agent to execute JavaScript in browser context. Disable unless required, and use sandboxed profiles.',
    pattern: /(?:browserControl|browser_control|allowBrowser)\s*[=:]\s*["']?(?:true|enabled|on|full)["']?/i,
  },
  {
    name: 'Unrestricted Shell Access',
    severity: 'high',
    advice: 'Restrict shell commands to a allowlist. Unrestricted shell access enables arbitrary code execution.',
    pattern: /(?:shellAccess|shell_access|allowShell)\s*[=:]\s*["']?(?:true|full|unrestricted|all)["']?/i,
  },
  {
    name: 'Dangerous Shell Command Allowed',
    severity: 'high',
    advice: 'Remove dangerous commands from the allowlist. These can be exploited via prompt injection.',
    pattern: /(?:allowedCommands|allowed_commands|shellAllowlist).*(?:rm\s+-rf|sudo|chmod\s+777|curl\s+\||\wget\s+\||eval|exec)/i,
  },

  // Logging and Data Exposure
  {
    name: 'Sensitive Data Logging Disabled',
    severity: 'high',
    advice: 'Set redactSensitive to "tools" or "all" to prevent secrets from appearing in logs.',
    pattern: /redactSensitive\s*[=:]\s*["']?(?:off|false|none|disabled)["']?/i,
  },
  {
    name: 'Verbose Logging in Production',
    severity: 'medium',
    advice: 'Reduce log verbosity in production to avoid leaking sensitive operational details.',
    pattern: /(?:logLevel|log_level|verbosity)\s*[=:]\s*["']?(?:debug|trace|verbose|all)["']?/i,
  },
  {
    name: 'Log File World Readable',
    severity: 'medium',
    advice: 'Log files should have restricted permissions (600 or 640). Check file system permissions.',
    pattern: /(?:logFile|log_file|logPath).*(?:\/tmp\/|\/var\/log\/clawdbot)/i,
  },

  // API Keys and Secrets in Config
  {
    name: 'Hardcoded API Key',
    severity: 'high',
    advice: 'Move API keys to environment variables or a secret manager. Never commit keys to config files.',
    pattern: /(?:api[_-]?key|apiKey)\s*[=:]\s*["']?[A-Za-z0-9_\-]{20,}["']?/i,
  },
  {
    name: 'Hardcoded Secret Token',
    severity: 'high',
    advice: 'Move tokens to environment variables. Rotate this token immediately if committed to version control.',
    pattern: /(?:secret|token|password|passwd|credential)\s*[=:]\s*["']?[A-Za-z0-9_\-]{16,}["']?/i,
  },
  {
    name: 'OpenAI/Anthropic Key in Config',
    severity: 'high',
    advice: 'LLM API keys should use environment variables (OPENAI_API_KEY, ANTHROPIC_API_KEY). Remove from config.',
    pattern: /(?:sk-[a-zA-Z0-9]{20,}|sk-ant-[a-zA-Z0-9\-]{20,})/,
  },

  // MCP Server Configuration
  {
    name: 'Untrusted MCP Server',
    severity: 'high',
    advice: 'Only use MCP servers from trusted sources. Third-party servers can exfiltrate data or execute malicious code.',
    pattern: /(?:mcpServers|mcp_servers)[\s\S]*?(?:npx\s+-y|npm\s+exec|bunx)/i,
  },
  {
    name: 'MCP Server with Network Access',
    severity: 'medium',
    advice: 'Review MCP servers that have network capabilities. They can exfiltrate conversation data.',
    pattern: /(?:mcpServers|mcp_servers)[\s\S]*?(?:fetch|http|request|axios|got)/i,
  },

  // File System Permissions
  {
    name: 'Overly Permissive File Access',
    severity: 'high',
    advice: 'Restrict file access to specific directories. Use allowedPaths to limit what the agent can read/write.',
    pattern: /(?:allowedPaths|allowed_paths|fileAccess)\s*[=:]\s*["']?(?:\/|\*|all|any)["']?/i,
  },
  {
    name: 'Home Directory Full Access',
    severity: 'medium',
    advice: 'Limit access to specific subdirectories rather than the entire home folder.',
    pattern: /(?:allowedPaths|allowed_paths).*["']?(?:~\/|\$HOME\/?)["']?/i,
  },
  {
    name: 'Sensitive Directory Access',
    severity: 'high',
    advice: 'Avoid granting access to directories containing credentials (.ssh, .aws, .gnupg).',
    pattern: /(?:allowedPaths|allowed_paths).*(?:\.ssh|\.aws|\.gnupg|\.config)/i,
  },

  // Skill and Plugin Security
  {
    name: 'Auto-Install Skills Enabled',
    severity: 'medium',
    advice: 'Disable automatic skill installation. Manually review and approve skills before use.',
    pattern: /(?:autoInstallSkills|auto_install_skills|skillAutoInstall)\s*[=:]\s*["']?(?:true|on|enabled)["']?/i,
  },
  {
    name: 'Untrusted Skill Source',
    severity: 'high',
    advice: 'Only install skills from verified sources. Check skill code before enabling.',
    pattern: /(?:skillSources|skill_sources)[\s\S]*?(?:github\.com\/(?!clawdbot|moltbot))/i,
  },

  // Persistence and State
  {
    name: 'Unencrypted State Directory',
    severity: 'medium',
    advice: 'Enable state encryption or use OS-level encryption for the state directory.',
    pattern: /(?:stateEncryption|state_encryption|encryptState)\s*[=:]\s*["']?(?:false|off|disabled|none)["']?/i,
  },
  {
    name: 'State in World-Readable Location',
    severity: 'medium',
    advice: 'Move state directory to a user-only accessible location with 700 permissions.',
    pattern: /(?:stateDir|state_dir|statePath).*(?:\/tmp\/|\/var\/)/i,
  },

  // Prompt Injection Mitigations
  {
    name: 'Input Sanitization Disabled',
    severity: 'high',
    advice: 'Enable input sanitization to reduce prompt injection risk.',
    pattern: /(?:sanitizeInput|sanitize_input|inputSanitization)\s*[=:]\s*["']?(?:false|off|disabled|none)["']?/i,
  },
  {
    name: 'Tool Confirmation Disabled',
    severity: 'medium',
    advice: 'Enable tool confirmation for destructive operations to prevent automated damage from injected prompts.',
    pattern: /(?:requireConfirmation|require_confirmation|toolConfirmation)\s*[=:]\s*["']?(?:false|off|disabled|none)["']?/i,
  },

  // Webhook and External Communication
  {
    name: 'Insecure Webhook URL',
    severity: 'high',
    advice: 'Use HTTPS for all webhook endpoints to prevent data interception.',
    pattern: /(?:webhook|callback|notify)(?:Url|_url|URL)\s*[=:]\s*["']?http:\/\//i,
  },
  {
    name: 'Webhook Without Secret',
    severity: 'medium',
    advice: 'Configure a webhook secret to verify incoming requests and prevent forgery.',
    pattern: /(?:webhook|callback)[\s\S]*?(?:secret|token)\s*[=:]\s*["']?["']?/i,
  },
];

export function scanClawdbotConfig(text: string): SecurityFinding[] {
  const lines = text.split(/\r?\n/);
  const findings: SecurityFinding[] = [];

  lines.forEach((line, idx) => {
    securityRules.forEach((rule) => {
      const flags = rule.pattern.flags.includes('g')
        ? rule.pattern.flags
        : `${rule.pattern.flags}g`;
      const regex = new RegExp(rule.pattern.source, flags);
      const matches = line.matchAll(regex);

      for (const match of matches) {
        const value = match[1] || match[0];
        findings.push({
          type: rule.name,
          severity: rule.severity,
          match: value,
          line: idx + 1,
          advice: rule.advice,
          reference: rule.reference,
        });
      }
    });
  });

  // Sort by severity
  const severityOrder: Record<SecurityFinding['severity'], number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  return findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

export type SampleConfig = {
  id: string;
  name: string;
  description: string;
  expectedGrade: string;
  config: string;
};

export const sampleConfigs: SampleConfig[] = [
  {
    id: 'hardened',
    name: 'Hardened Production',
    description: 'Security-first configuration following all best practices',
    expectedGrade: 'A',
    config: `# Hardened Clawdbot/Moltbot Production Configuration
# This configuration follows security best practices

[gateway]
host = "127.0.0.1"
port = 8080
groupPolicy = "allowlist"
authentication = "required"
allowedUsers = ["admin@company.com"]

[agent]
browserControl = false
shellAccess = "restricted"
allowedCommands = ["git status", "git diff", "npm test", "npm run build"]
allowedPaths = ["/home/user/projects"]

[logging]
logLevel = "info"
redactSensitive = "all"
logFile = "/home/user/.moltbot/logs/agent.log"

[credentials]
# All credentials stored in environment variables
# OPENAI_API_KEY, ANTHROPIC_API_KEY set externally

[mcp]
mcpServers = []

[skills]
autoInstallSkills = false
skillSources = []

[state]
stateDir = "/home/user/.moltbot/state"
stateEncryption = true

[security]
sanitizeInput = true
requireConfirmation = true
maxTokensPerRequest = 4096

[webhooks]
notifyUrl = "https://hooks.company.com/moltbot"
webhookSecret = "\${WEBHOOK_SECRET}"
`,
  },
  {
    id: 'developer',
    name: 'Developer Workstation',
    description: 'Balanced config for local development with some conveniences',
    expectedGrade: 'B',
    config: `# Developer Workstation Configuration
# Balanced between security and convenience for local use

[gateway]
host = "127.0.0.1"
port = 8080
groupPolicy = "allowlist"
authentication = "required"

[agent]
browserControl = false
shellAccess = "restricted"
allowedCommands = ["git", "npm", "yarn", "pnpm", "bun", "cargo", "go", "python", "node"]
allowedPaths = ["~/projects", "~/code"]

[logging]
logLevel = "debug"
redactSensitive = "tools"
logFile = "~/.moltbot/logs/dev.log"

[credentials]
# Using environment variables for API keys

[mcp]
mcpServers = [
  { name = "filesystem", command = "moltbot-mcp-fs", trusted = true }
]

[skills]
autoInstallSkills = false
skillSources = ["https://github.com/moltbot/official-skills"]

[state]
stateDir = "~/.moltbot/state"
stateEncryption = false

[security]
sanitizeInput = true
requireConfirmation = false

[webhooks]
# No webhooks configured for local development
`,
  },
  {
    id: 'risky',
    name: 'Risky Defaults',
    description: 'Common misconfigurations seen in quick-start tutorials',
    expectedGrade: 'D',
    config: `# Quick Start Configuration (NOT FOR PRODUCTION)
# Common misconfigurations from copy-pasted tutorials

[gateway]
host = "0.0.0.0"
port = 8080
groupPolicy = "allowlist"
authentication = "required"

[agent]
browserControl = true
shellAccess = "full"
allowedPaths = ["~/"]

[logging]
logLevel = "debug"
redactSensitive = "off"
logFile = "/tmp/clawdbot.log"

[credentials]
openai_api_key = "sk-proj-abc123xyz456789abcdefghijklmnop123456"

[mcp]
mcpServers = [
  { name = "everything", command = "npx -y @somedev/mcp-all-tools" }
]

[skills]
autoInstallSkills = true
skillSources = ["https://github.com/moltbot/official-skills"]

[state]
stateDir = "/tmp/moltbot-state"
stateEncryption = false

[security]
sanitizeInput = true
requireConfirmation = false
`,
  },
  {
    id: 'compromised',
    name: 'Dangerously Insecure',
    description: 'Worst-case scenario with multiple critical vulnerabilities',
    expectedGrade: 'F',
    config: `# DANGER: Extremely Insecure Configuration
# This represents a worst-case deployment scenario

[gateway]
host = "0.0.0.0"
port = 8080
groupPolicy = "open"
authentication = "disabled"

[agent]
browserControl = true
shellAccess = "full"
allowedCommands = ["rm -rf", "sudo", "curl | bash", "wget | sh", "eval"]
allowedPaths = "/"

[logging]
logLevel = "debug"
redactSensitive = "off"
logFile = "/var/log/clawdbot/agent.log"

[credentials]
openai_api_key = "sk-abc123xyz456789abcdefghijklmnopqrstuvwxyz12345678"
anthropic_key = "sk-ant-abcdefghijklmnopqrstuvwxyz123456"
secret_token = "super_secret_password_123"
database_password = "admin123456789"

[mcp]
mcpServers = [
  { name = "untrusted", command = "npx -y @random-person/sketchy-mcp" },
  { name = "network", command = "bunx mcp-http-tools" }
]

[skills]
autoInstallSkills = true
skillSources = ["https://github.com/random-user/clawdbot-skills"]

[state]
stateDir = "/tmp/clawdbot-state"
stateEncryption = false

[security]
sanitizeInput = false
requireConfirmation = false

[webhooks]
notifyUrl = "http://example.com/webhook"
callbackUrl = "http://internal.server/callback"

[filesystem]
allowedPaths = ["~/.ssh", "~/.aws", "~/.gnupg", "~/.config"]
`,
  },
  {
    id: 'json',
    name: 'JSON Format Example',
    description: 'Same risky config in JSON format (moltbot.json)',
    expectedGrade: 'D',
    config: `{
  "gateway": {
    "host": "0.0.0.0",
    "port": 8080,
    "groupPolicy": "allowlist",
    "authentication": "required"
  },
  "agent": {
    "browserControl": true,
    "shellAccess": "full",
    "allowedPaths": ["/"]
  },
  "logging": {
    "logLevel": "debug",
    "redactSensitive": "off"
  },
  "credentials": {
    "api_key": "sk-proj-abcdefghijklmnopqrstuvwxyz123456789012345678"
  },
  "mcp": {
    "mcpServers": [
      {
        "name": "remote-tools",
        "command": "npx -y @community/mcp-toolkit"
      }
    ]
  },
  "skills": {
    "autoInstallSkills": true
  },
  "state": {
    "stateDir": "/tmp/moltbot",
    "stateEncryption": false
  },
  "security": {
    "sanitizeInput": false,
    "requireConfirmation": false
  }
}
`,
  },
  {
    id: 'yaml',
    name: 'YAML Format Example',
    description: 'Moderately secure config in YAML format',
    expectedGrade: 'C',
    config: `# Moltbot Configuration (YAML)
# Moderate security - needs improvement

gateway:
  host: "127.0.0.1"
  port: 8080
  groupPolicy: "allowlist"
  authentication: "required"

agent:
  browserControl: true
  shellAccess: "restricted"
  allowedCommands:
    - git
    - npm
    - docker
  allowedPaths:
    - "~/"

logging:
  logLevel: "debug"
  redactSensitive: "tools"

credentials:
  # Hardcoded key - should use env vars
  anthropic_key: "sk-ant-api03-abcdefghijk123456789"

mcp:
  mcpServers:
    - name: "official-fs"
      command: "moltbot-mcp-filesystem"
      trusted: true

skills:
  autoInstallSkills: false
  skillSources:
    - "https://github.com/moltbot/verified-skills"

state:
  stateDir: "~/.moltbot/state"
  stateEncryption: true

security:
  sanitizeInput: true
  requireConfirmation: false

webhooks:
  notifyUrl: "https://hooks.slack.com/services/XXX/YYY/ZZZ"
`,
  },
];

export function getSampleConfig(id?: string): string {
  if (id) {
    const sample = sampleConfigs.find((s) => s.id === id);
    if (sample) return sample.config;
  }
  // Default to the dangerously insecure one for maximum demonstration
  const defaultSample = sampleConfigs.find((s) => s.id === 'compromised');
  if (defaultSample) return defaultSample.config;
  const firstSample = sampleConfigs[0];
  return firstSample ? firstSample.config : '';
}

export function getSecurityScore(findings: SecurityFinding[]): {
  score: number;
  grade: string;
  summary: string;
} {
  // Start with 100, deduct based on findings
  let score = 100;

  const deductions: Record<SecurityFinding['severity'], number> = {
    critical: 25,
    high: 15,
    medium: 5,
    low: 2,
  };

  findings.forEach((finding) => {
    score -= deductions[finding.severity];
  });

  score = Math.max(0, score);

  let grade: string;
  let summary: string;

  if (score >= 90) {
    grade = 'A';
    summary = 'Excellent! Your configuration follows security best practices.';
  } else if (score >= 80) {
    grade = 'B';
    summary = 'Good security posture with minor issues to address.';
  } else if (score >= 70) {
    grade = 'C';
    summary = 'Moderate risk. Several security improvements recommended.';
  } else if (score >= 50) {
    grade = 'D';
    summary = 'High risk. Critical security issues require immediate attention.';
  } else {
    grade = 'F';
    summary = 'Critical risk! This configuration is dangerously insecure.';
  }

  return { score, grade, summary };
}
