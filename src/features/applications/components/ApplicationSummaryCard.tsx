interface ApplicationSummaryCardProps {
  title: string;
  value: number;
  description: string;
  icon: string;
}

export default function ApplicationSummaryCard({
  title,
  value,
  description,
  icon,
}: ApplicationSummaryCardProps) {
  return (
    <article className="application-summary-card">
      <div className="application-summary-card__header">
        <span className="application-summary-card__icon">
          {icon}
        </span>

        <span className="application-summary-card__title">
          {title}
        </span>
      </div>

      <strong className="application-summary-card__value">
        {value}
      </strong>

      <p className="application-summary-card__description">
        {description}
      </p>
    </article>
  );
}