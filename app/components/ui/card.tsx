type CardProps = {
  title: string;
  description: string;
  meta?: string;
};

export function Card({ title, description, meta }: CardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
      <h2 className="font-medium text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
      {meta ? <p className="mt-3 text-xs font-medium uppercase tracking-[0.2em] text-teal-600">{meta}</p> : null}
    </div>
  );
}
