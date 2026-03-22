import type { Bilingual } from "@/wedding/copy";

interface BilingualBlockProps {
  text: Bilingual;
  className?: string;
}

export function BilingualBlock({ text, className }: BilingualBlockProps) {
  return (
    <div
      className={className ? `bilingual-block ${className}` : "bilingual-block"}
    >
      <span className="bilingual-block__en" lang="en">
        {text.en}
      </span>
      <span className="bilingual-block__ar" dir="rtl" lang="ar">
        {text.ar}
      </span>
    </div>
  );
}
