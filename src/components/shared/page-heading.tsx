interface PageHeadingProps {
  title: string;
  description: string;
}

export function PageHeading({ title, description }: PageHeadingProps) {
  return (
    <div className="mb-7 min-w-0">
      <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
        {title}
      </h2>

      <p className="mt-2 text-sm text-muted">{description}</p>
    </div>
  );
}
