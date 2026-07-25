"use client";

import { useState } from "react";

export default function Description({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 280;
  const displayText =
    expanded || !isLong ? text : `${text.slice(0, 280).trimEnd()}…`;

  return (
    <div className="py-6 border-b border-pebble">
      <p className="text-sm sm:text-base text-charcoal leading-relaxed whitespace-pre-line">
        {displayText}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="cursor-pointer mt-3 text-sm font-medium text-forest hover:text-forest-light transition-colors duration-200 underline underline-offset-2"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
