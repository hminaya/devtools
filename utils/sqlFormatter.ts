import { format } from 'sql-formatter';

export type SqlDialect =
  | 'sql'
  | 'mysql'
  | 'mariadb'
  | 'postgresql'
  | 'sqlite'
  | 'transactsql'
  | 'plsql';

export interface SqlFormatOptions {
  dialect: SqlDialect;
  tabWidth: 2 | 4;
  keywordCase: 'upper' | 'lower' | 'preserve';
  linesBetweenQueries: 1 | 2;
}

export function formatSql(
  input: string,
  options: SqlFormatOptions
): string | { error: string } {
  try {
    return format(input, {
      language: options.dialect,
      tabWidth: options.tabWidth,
      keywordCase: options.keywordCase,
      linesBetweenQueries: options.linesBetweenQueries,
    });
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export function minifySql(input: string): string {
  return input
    .replace(/\s+/g, ' ')
    .replace(/\s*([,;()])\s*/g, '$1')
    .trim();
}

export const DIALECT_LABELS: Record<SqlDialect, string> = {
  sql: 'Generic SQL',
  mysql: 'MySQL',
  mariadb: 'MariaDB',
  postgresql: 'PostgreSQL',
  sqlite: 'SQLite',
  transactsql: 'T-SQL (SQL Server)',
  plsql: 'PL/SQL (Oracle)',
};

export const SAMPLE_QUERIES: { label: string; sql: string }[] = [
  {
    label: 'SELECT with JOINs',
    sql: `SELECT u.id, u.name, u.email, o.id AS order_id, o.total, o.created_at FROM users u INNER JOIN orders o ON u.id = o.user_id LEFT JOIN order_items oi ON o.id = oi.order_id WHERE u.active = 1 AND o.created_at >= '2024-01-01' AND o.total > 100.00 GROUP BY u.id, u.name, u.email, o.id, o.total, o.created_at ORDER BY o.created_at DESC LIMIT 50;`,
  },
  {
    label: 'CREATE TABLE',
    sql: `CREATE TABLE IF NOT EXISTS products (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, description TEXT, price DECIMAL(10,2) NOT NULL DEFAULT 0.00, stock_qty INT NOT NULL DEFAULT 0, category_id INT UNSIGNED, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL, INDEX idx_category (category_id), INDEX idx_price (price));`,
  },
  {
    label: 'INSERT with subquery',
    sql: `INSERT INTO audit_log (user_id, action, resource_type, resource_id, old_value, new_value, ip_address, created_at) SELECT u.id, 'UPDATE', 'product', p.id, p.old_price, p.new_price, '192.168.1.1', NOW() FROM products p JOIN users u ON u.role = 'admin' WHERE p.updated_at > NOW() - INTERVAL 1 HOUR;`,
  },
  {
    label: 'Complex WHERE / CASE',
    sql: `SELECT id, name, CASE WHEN status = 0 THEN 'inactive' WHEN status = 1 AND verified = 1 THEN 'active' WHEN status = 1 AND verified = 0 THEN 'pending' ELSE 'unknown' END AS status_label, COALESCE(last_login, created_at) AS last_seen, DATEDIFF(NOW(), COALESCE(last_login, created_at)) AS days_since_seen FROM users WHERE (role IN ('admin', 'moderator') OR (role = 'user' AND subscription_tier > 0)) AND deleted_at IS NULL ORDER BY days_since_seen DESC;`,
  },
];
