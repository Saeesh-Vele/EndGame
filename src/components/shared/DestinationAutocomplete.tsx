"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export interface DestinationOption {
  id: string;
  name: string;
  slug: string;
  villaCount: number;
}

/**
 * Typeahead over the destinations table, shared by the homepage search panel
 * and the /villas filter bar.
 *
 * The committed value is a destination *slug* — that's what goes in the URL
 * and what the villas page reads back. The text in the box is presentational:
 * it always resolves to a real destination on blur, or reverts. That keeps the
 * component from ever handing its parent a half-typed string.
 */
export default function DestinationAutocomplete({
  options,
  value,
  onChange,
  placeholder = "Search destinations",
  inputId,
  inputClassName = "",
  ariaLabel = "Destination",
}: {
  options: DestinationOption[];
  /** Slug of the selected destination, or "" for none. */
  value: string;
  onChange: (slug: string) => void;
  placeholder?: string;
  inputId?: string;
  inputClassName?: string;
  ariaLabel?: string;
}) {
  const generatedId = useId();
  const fieldId = inputId ?? generatedId;
  const listboxId = `${fieldId}-listbox`;

  const selected = useMemo(
    () => options.find((option) => option.slug === value) ?? null,
    [options, value]
  );

  // `draft` is what the user has typed since they last committed; null means
  // "showing the selection". Deriving the input's value from it rather than
  // copying the selection into state with an effect means picking an option,
  // clearing, reverting a bad entry, and an external change (URL params,
  // sidebar checkboxes) all fall out of one rule: clear the draft.
  const [draft, setDraft] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const query = draft ?? selected?.name ?? "";

  const trimmed = query.trim().toLowerCase();
  const showAll = trimmed === "" || query === selected?.name;

  const filtered = useMemo(
    () =>
      showAll
        ? options
        : options.filter((option) =>
            option.name.toLowerCase().includes(trimmed)
          ),
    [options, showAll, trimmed]
  );

  // Clamped on read rather than corrected in an effect — the list shrinks
  // under the cursor as the query narrows.
  const activeIndex = Math.min(highlight, Math.max(filtered.length - 1, 0));

  /** Turns whatever is typed into a slug, or leaves the selection untouched. */
  const commitFromQuery = () => {
    setOpen(false);
    setDraft(null);

    if (trimmed === "") {
      if (value !== "") onChange("");
      return;
    }

    const exact = options.find(
      (option) => option.name.toLowerCase() === trimmed
    );
    const resolved = exact ?? (filtered.length === 1 ? filtered[0] : null);

    // No confident match: keep the current selection. Clearing the draft puts
    // its name back in the box.
    if (resolved && resolved.slug !== value) onChange(resolved.slug);
  };

  // Re-registered on every render while open, deliberately: the handler has to
  // see the current query text to resolve it when the click lands.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        commitFromQuery();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  });

  const pick = (option: DestinationOption) => {
    setOpen(false);
    setDraft(null);
    onChange(option.slug);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setHighlight(0);
        return;
      }
      if (filtered.length === 0) return;
      setHighlight((current) => {
        const next = event.key === "ArrowDown" ? current + 1 : current - 1;
        return (next + filtered.length) % filtered.length;
      });
      return;
    }

    if (event.key === "Enter") {
      if (open && filtered[activeIndex]) {
        // Don't let the surrounding form submit on the keypress that was
        // meant to choose an option.
        event.preventDefault();
        pick(filtered[activeIndex]);
      }
      return;
    }

    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        setDraft(null);
      }
      return;
    }

    if (event.key === "Tab" && open) {
      commitFromQuery();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <input
        id={fieldId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          open && filtered[activeIndex]
            ? `${listboxId}-${filtered[activeIndex].id}`
            : undefined
        }
        aria-label={ariaLabel}
        autoComplete="off"
        value={query}
        placeholder={placeholder}
        onChange={(event) => {
          setDraft(event.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className={inputClassName}
      />

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Destinations"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-64 overflow-y-auto rounded-xl border border-pebble bg-white py-1 shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3.5 py-2.5 text-sm text-slate">
              No destinations match “{query.trim()}”.
            </li>
          ) : (
            filtered.map((option, index) => (
              <li key={option.id}>
                <button
                  type="button"
                  id={`${listboxId}-${option.id}`}
                  role="option"
                  aria-selected={option.slug === value}
                  // mousedown rather than click: the input's blur would
                  // otherwise close the list before the click lands.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    pick(option);
                  }}
                  onMouseEnter={() => setHighlight(index)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors duration-150 ${
                    index === activeIndex ? "bg-sandstone" : "bg-transparent"
                  }`}
                >
                  <span className="truncate text-sm text-charcoal">
                    {option.name}
                  </span>
                  <span className="shrink-0 text-xs text-slate">
                    {option.villaCount}{" "}
                    {option.villaCount === 1 ? "villa" : "villas"}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
