/**
 * Common port number reference.
 *
 * Sourced from IANA's well-known ports registry (0–1023) plus commonly used
 * registered ports (1024–49151) for developer-relevant services. Not exhaustive —
 * focuses on the ports a developer is most likely to encounter.
 */

export interface PortEntry {
  port: number;
  protocol: 'tcp' | 'udp' | 'tcp/udp' | 'sctp';
  service: string;
  description?: string;
  encrypted?: boolean;     // whether the service supports encryption (TLS-native)
  deprecated?: boolean;
  category: string;
}

export const PORT_CATEGORIES = [
  'Web',
  'Database',
  'Email',
  'File Transfer',
  'Remote Access',
  'Messaging',
  'Networking',
  'DevOps',
  'Security',
  'Other',
] as const;

export const PORT_ENTRIES: PortEntry[] = [
  // ─── Web ───
  { port: 80,    protocol: 'tcp',     service: 'HTTP',      description: 'Hypertext Transfer Protocol', category: 'Web' },
  { port: 443,   protocol: 'tcp',     service: 'HTTPS',     description: 'HTTP over TLS/SSL',          category: 'Web', encrypted: true },
  { port: 8080,  protocol: 'tcp',     service: 'HTTP-Alt',  description: 'Alternate HTTP (commonly dev servers, proxies)', category: 'Web' },
  { port: 8443,  protocol: 'tcp',     service: 'HTTPS-Alt', description: 'Alternate HTTPS', encrypted: true, category: 'Web' },
  { port: 8000,  protocol: 'tcp',     service: 'HTTP-Alt',  description: 'Common dev server default (Django, etc.)', category: 'Web' },
  { port: 3000,  protocol: 'tcp',     service: 'Dev-Server', description: 'Common Next.js / Node.js / React dev port', category: 'Web' },
  { port: 4200,  protocol: 'tcp',     service: 'Angular-Dev', description: 'Angular CLI default dev port', category: 'Web' },
  { port: 5000,  protocol: 'tcp',     service: 'Flask/Py',  description: 'Flask, .NET, default macOS AirPlay', category: 'Web' },
  { port: 9000,  protocol: 'tcp',     service: 'PHP-FPM',    description: 'PHP-FPM, SonarQube, alternate HTTP', category: 'Web' },
  { port: 4000,  protocol: 'tcp',     service: 'Dev-Server', description: 'Jekyll, Phoenix, Elixir',  category: 'Web' },

  // ─── Database ───
  { port: 3306,  protocol: 'tcp',     service: 'MySQL',      description: 'MySQL / MariaDB',         category: 'Database' },
  { port: 5432,  protocol: 'tcp',     service: 'PostgreSQL', description: 'PostgreSQL default',       category: 'Database' },
  { port: 1433,  protocol: 'tcp',     service: 'SQL Server',  description: 'Microsoft SQL Server',    category: 'Database' },
  { port: 1521,  protocol: 'tcp',     service: 'Oracle',      description: 'Oracle Database listener', category: 'Database' },
  { port: 27017, protocol: 'tcp',     service: 'MongoDB',      description: 'MongoDB default',        category: 'Database' },
  { port: 6379,  protocol: 'tcp',     service: 'Redis',       description: 'Redis default',           category: 'Database' },
  { port: 11211, protocol: 'tcp',     service: 'Memcached',   description: 'Memcached default',       category: 'Database' },
  { port: 9200,  protocol: 'tcp',     service: 'Elasticsearch', description: 'Elasticsearch HTTP',     category: 'Database' },
  { port: 9300,  protocol: 'tcp',     service: 'Elasticsearch', description: 'Elasticsearch transport', category: 'Database' },
  { port: 8529,  protocol: 'tcp',     service: 'ArangoDB',    description: 'ArangoDB default',         category: 'Database' },
  { port: 7474,  protocol: 'tcp',     service: 'Neo4j',       description: 'Neo4j HTTP',              category: 'Database' },
  { port: 7687,  protocol: 'tcp',     service: 'Neo4j',       description: 'Neo4j Bolt',              category: 'Database' },
  { port: 5984,  protocol: 'tcp',     service: 'CouchDB',      description: 'Apache CouchDB',          category: 'Database' },
  { port: 8086,  protocol: 'tcp',     service: 'InfluxDB',     description: 'InfluxDB HTTP API',     category: 'Database' },

  // ─── Email ───
  { port: 25,    protocol: 'tcp',     service: 'SMTP',       description: 'Simple Mail Transfer Protocol (server-to-server)', category: 'Email' },
  { port: 465,   protocol: 'tcp',     service: 'SMTPS',      description: 'SMTP over TLS (implicit)', category: 'Email', encrypted: true },
  { port: 587,   protocol: 'tcp',     service: 'SMTP',        description: 'SMTP submission (STARTTLS)', category: 'Email', encrypted: true },
  { port: 110,   protocol: 'tcp',     service: 'POP3',        description: 'Post Office Protocol v3', category: 'Email' },
  { port: 995,   protocol: 'tcp',     service: 'POP3S',      description: 'POP3 over TLS',           category: 'Email', encrypted: true },
  { port: 143,   protocol: 'tcp',     service: 'IMAP',        description: 'Internet Message Access Protocol', category: 'Email' },
  { port: 993,   protocol: 'tcp',     service: 'IMAPS',      description: 'IMAP over TLS',           category: 'Email', encrypted: true },

  // ─── File Transfer ───
  { port: 20,    protocol: 'tcp',     service: 'FTP-Data',   description: 'FTP data transfer',       category: 'File Transfer' },
  { port: 21,    protocol: 'tcp',     service: 'FTP',         description: 'FTP control',             category: 'File Transfer' },
  { port: 22,    protocol: 'tcp',     service: 'SFTP/SSH',    description: 'SSH (incl. SFTP subsystem)', category: 'Remote Access', encrypted: true },
  { port: 69,    protocol: 'udp',     service: 'TFTP',        description: 'Trivial FTP',            category: 'File Transfer' },
  { port: 115,   protocol: 'tcp',     service: 'SFTP',       description: 'Simple FTP (legacy, not SSH SFTP)', category: 'File Transfer' },
  { port: 989,   protocol: 'tcp',     service: 'FTPS-Data',  description: 'FTP over TLS data',       category: 'File Transfer', encrypted: true },
  { port: 990,   protocol: 'tcp',     service: 'FTPS',        description: 'FTP over TLS control',    category: 'File Transfer', encrypted: true },

  // ─── Remote Access ───
  { port: 23,    protocol: 'tcp',     service: 'Telnet',     description: 'Unencrypted remote terminal (DEPRECATED)', category: 'Remote Access', deprecated: true },
  { port: 5900,  protocol: 'tcp',     service: 'VNC',         description: 'VNC remote desktop (display :0)', category: 'Remote Access' },
  { port: 3389,  protocol: 'tcp',     service: 'RDP',         description: 'Microsoft Remote Desktop Protocol', category: 'Remote Access', encrypted: true },
  { port: 5985,  protocol: 'tcp',     service: 'WinRM',       description: 'Windows Remote Management HTTP', category: 'Remote Access' },
  { port: 5986,  protocol: 'tcp',     service: 'WinRM',       description: 'Windows Remote Management HTTPS', category: 'Remote Access', encrypted: true },

  // ─── Messaging ───
  { port: 1883,  protocol: 'tcp',     service: 'MQTT',        description: 'MQTT (unencrypted)',     category: 'Messaging' },
  { port: 8883,  protocol: 'tcp',     service: 'MQTTS',       description: 'MQTT over TLS',          category: 'Messaging', encrypted: true },
  { port: 5672,  protocol: 'tcp',     service: 'AMQP',        description: 'RabbitMQ / AMQP 0-9-1',  category: 'Messaging' },
  { port: 5671,  protocol: 'tcp',     service: 'AMQPS',      description: 'AMQP over TLS',          category: 'Messaging', encrypted: true },
  { port: 61616, protocol: 'tcp',     service: 'ActiveMQ',    description: 'Apache ActiveMQ OpenWire', category: 'Messaging' },
  { port: 9092,  protocol: 'tcp',     service: 'Kafka',       description: 'Apache Kafka',           category: 'Messaging' },
  { port: 4222,  protocol: 'tcp',     service: 'NATS',        description: 'NATS default',           category: 'Messaging' },
  { port: 8333,  protocol: 'tcp',     service: 'ZMQ',         description: 'ZeroMQ alternate',       category: 'Messaging' },

  // ─── Networking ───
  { port: 53,    protocol: 'tcp/udp', service: 'DNS',          description: 'Domain Name System',     category: 'Networking' },
  { port: 67,    protocol: 'udp',     service: 'DHCP-Server', description: 'DHCP server-to-client',  category: 'Networking' },
  { port: 68,    protocol: 'udp',     service: 'DHCP-Client', description: 'DHCP client-to-server',  category: 'Networking' },
  { port: 123,   protocol: 'udp',     service: 'NTP',          description: 'Network Time Protocol',  category: 'Networking' },
  { port: 161,   protocol: 'udp',     service: 'SNMP',         description: 'Simple Network Management Protocol', category: 'Networking' },
  { port: 162,   protocol: 'udp',     service: 'SNMP-Trap',   description: 'SNMP traps',             category: 'Networking' },
  { port: 389,   protocol: 'tcp',     service: 'LDAP',         description: 'Lightweight Directory Access Protocol', category: 'Networking' },
  { port: 636,   protocol: 'tcp',     service: 'LDAPS',        description: 'LDAP over TLS',          category: 'Networking', encrypted: true },
  { port: 1812,  protocol: 'udp',     service: 'RADIUS',      description: 'RADIUS authentication',   category: 'Networking' },
  { port: 1813,  protocol: 'udp',     service: 'RADIUS-Acct', description: 'RADIUS accounting',      category: 'Networking' },
  { port: 500,   protocol: 'udp',     service: 'IPsec/IKE',  description: 'Internet Key Exchange',  category: 'Networking' },

  // ─── DevOps ───
  { port: 2375,  protocol: 'tcp',     service: 'Docker',       description: 'Docker daemon (unencrypted — avoid in prod)', category: 'DevOps', deprecated: true },
  { port: 2376,  protocol: 'tcp',     service: 'Docker-TLS',  description: 'Docker daemon over TLS',  category: 'DevOps', encrypted: true },
  { port: 5000,  protocol: 'tcp',     service: 'Registry',    description: 'Docker Registry (v2)',    category: 'DevOps' },
  { port: 4243,  protocol: 'tcp',     service: 'Docker-Old',  description: 'Docker daemon legacy (deprecated)', category: 'DevOps', deprecated: true },
  { port: 10250, protocol: 'tcp',     service: 'kubelet',     description: 'Kubernetes kubelet API',   category: 'DevOps', encrypted: true },
  { port: 10255, protocol: 'tcp',     service: 'kubelet-RO',  description: 'Kubernetes kubelet read-only', category: 'DevOps', deprecated: true },
  { port: 6443,  protocol: 'tcp',     service: 'kube-API',    description: 'Kubernetes API server',  category: 'DevOps', encrypted: true },
  { port: 30000, protocol: 'tcp',     service: 'NodePort',    description: 'Kubernetes NodePort range start (30000–32767)', category: 'DevOps' },
  { port: 8200,  protocol: 'tcp',     service: 'Vault',        description: 'HashiCorp Vault',         category: 'DevOps' },
  { port: 4646,  protocol: 'tcp',     service: 'Nomad',        description: 'HashiCorp Nomad',         category: 'DevOps' },
  { port: 8500,  protocol: 'tcp',     service: 'Consul',       description: 'HashiCorp Consul UI/API', category: 'DevOps' },

  // ─── Security ───
  { port: 587,   protocol: 'tcp',     service: 'Submission',  description: 'SMTP Submission (also encrypted via STARTTLS)', category: 'Security', encrypted: true },
  { port: 1194,  protocol: 'udp',     service: 'OpenVPN',     description: 'OpenVPN default',          category: 'Security', encrypted: true },
  { port: 51820, protocol: 'udp',     service: 'WireGuard',    description: 'WireGuard default',       category: 'Security', encrypted: true },
  { port: 4500,  protocol: 'udp',     service: 'IPsec-NAT',   description: 'IPsec NAT-T',            category: 'Security' },
  { port: 54321, protocol: 'tcp',     service: 'OSSEC',        description: 'OSSEC agent',            category: 'Security' },

  // ─── Other ───
  { port: 0,     protocol: 'tcp/udp', service: 'Reserved',    description: 'Reserved — not assignable to apps', category: 'Other' },
  { port: 113,   protocol: 'tcp',     service: 'ident',        description: 'Identification service (legacy)', category: 'Other' },
  { port: 5353,  protocol: 'udp',     service: 'mDNS',        description: 'Multicast DNS (Bonjour)', category: 'Other' },
  { port: 1900,  protocol: 'udp',     service: 'UPnP/SSDP',    description: 'Simple Service Discovery Protocol', category: 'Other' },
  { port: 9418,  protocol: 'tcp',     service: 'Git',          description: 'Git protocol (unencrypted)', category: 'Other' },
  { port: 5269,  protocol: 'tcp',     service: 'XMPP',         description: 'Jabber/XMPP server-to-server', category: 'Other' },
  { port: 5222,  protocol: 'tcp',     service: 'XMPP',         description: 'Jabber/XMPP client-to-server', category: 'Other' },
  { port: 8200,  protocol: 'tcp',     service: 'PowerShell-Web', description: 'PSWS HTTP listener (default config)', category: 'Other' },
  { port: 5173,  protocol: 'tcp',     service: 'Vite-Dev',     description: 'Vite default dev server', category: 'Other' },
  { port: 4173,  protocol: 'tcp',     service: 'Vite-Preview', description: 'Vite preview',           category: 'Other' },
  { port: 3001,  protocol: 'tcp',     service: 'Dev-Server',  description: 'Common second-instance dev port', category: 'Other' },
  { port: 3002,  protocol: 'tcp',     service: 'Dev-Server',  description: 'Common third-instance dev port', category: 'Other' },
];