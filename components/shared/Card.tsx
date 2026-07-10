import Link from 'next/link';

interface CardProps {
  icon: string;
  title: string;
  description: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

function CardContent({ icon, title, description, compact = false }: Omit<CardProps, 'href' | 'external' | 'onClick'>) {
  if (compact) {
    return (
      <>
        <div className="text-lg leading-none" aria-hidden="true">{icon}</div>
        <h3 className="mt-2 text-sm font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{description}</p>
      </>
    );
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-xl transition-colors group-hover:bg-blue-50" aria-hidden="true">{icon}</span>
        <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" aria-hidden="true">→</span>
      </div>
      <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900">{title}</h3>
      <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-500">{description}</p>
    </>
  );
}

function Card({ icon, title, description, href, external = false, onClick, compact = false }: CardProps) {
  const className = compact
    ? 'block h-full w-full cursor-pointer rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100'
    : 'group block h-full w-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60 focus:outline-none focus:ring-4 focus:ring-blue-100';

  if (href) {
    if (external) {
      return (
        <a className={className} href={href} target="_blank" rel="noopener noreferrer">
          <CardContent icon={icon} title={title} description={description} compact={compact} />
        </a>
      );
    }

    return (
      <Link className={className} href={href} prefetch={false}>
        <CardContent icon={icon} title={title} description={description} compact={compact} />
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      <CardContent icon={icon} title={title} description={description} compact={compact} />
    </button>
  );
}

export default Card;
