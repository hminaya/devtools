interface CardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

function Card({ icon, title, description, onClick }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <div className="text-2xl mb-2">{icon}</div>
      <h3 className="text-base font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm line-clamp-2">{description}</p>
    </div>
  );
}

export default Card;
