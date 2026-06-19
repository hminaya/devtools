import Link from 'next/link';

interface CardProps {
  icon: string;
  title: string;
  description: string;
  href?: string;
  external?: boolean;
  onClick?: () => void;
}

function CardContent({ icon, title, description }: Omit<CardProps, 'href' | 'external' | 'onClick'>) {
  return (
    <>
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm line-clamp-2">{description}</p>
    </>
  );
}

function Card({ icon, title, description, href, external = false, onClick }: CardProps) {
  const className = 'block bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer';

  if (href) {
    if (external) {
      return (
        <a className={className} href={href} target="_blank" rel="noopener noreferrer">
          <CardContent icon={icon} title={title} description={description} />
        </a>
      );
    }

    return (
      <Link className={className} href={href}>
        <CardContent icon={icon} title={title} description={description} />
      </Link>
    );
  }

  return (
    <button type="button" className={`${className} text-left`} onClick={onClick}>
      <CardContent icon={icon} title={title} description={description} />
    </button>
  );
}

export default Card;
