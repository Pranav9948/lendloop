interface PageHeadingProps {
  title: string;
  description: string;
}

export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h2>

      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}
