import * as React from 'react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from './command';
import { Badge } from './badge';

interface TypeaheadSelectProps {
  options: string[];
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  placeholder?: string;
  disabledOptions?: string[];
  multiSelect?: boolean;
  maxSelect?: number;
}

export const TypeaheadSelect: React.FC<TypeaheadSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder = 'Select...',
  disabledOptions = [],
  multiSelect = false,
  maxSelect = 99,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  const filtered = options.filter(
    (opt) =>
      opt.toLowerCase().includes(search.toLowerCase()) &&
      (!multiSelect || !selected.includes(opt))
  );

  React.useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleSelect = (opt: string) => {
    if (multiSelect) {
      if (selected.includes(opt)) return;
      if (selected.length >= maxSelect) return;
      onValueChange([...selected, opt]);
    } else {
      onValueChange(opt);
      setOpen(false);
    }
    setSearch('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleRemove = (opt: string) => {
    if (!multiSelect) return;
    onValueChange(selected.filter((s) => s !== opt));
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="flex flex-wrap gap-2 border rounded-md px-3 py-2 bg-background cursor-pointer min-h-[2.5rem]"
        tabIndex={0}
        onClick={() => {
          setOpen(true);
          setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
          }, 0);
        }}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {multiSelect ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : selected.length > 0 ? (
          <span>{selected[0]}</span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-popover border rounded-md shadow-lg">
          <Command>
            <CommandInput
              ref={inputRef}
              placeholder={placeholder}
              value={search}
              onValueChange={setSearch}
              autoFocus
            />
            <CommandList>
              {filtered.length === 0 && <CommandEmpty>No options found.</CommandEmpty>}
              {filtered.map((opt) => (
                <CommandItem
                  key={opt}
                  onSelect={() => handleSelect(opt)}
                  disabled={disabledOptions.includes(opt)}
                  className={disabledOptions.includes(opt) ? 'opacity-50 pointer-events-none' : ''}
                >
                  {opt}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </div>
      )}
      {multiSelect && selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selected.map((opt) => (
            <Badge
              key={opt}
              variant="secondary"
              className="flex items-center gap-1 cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                handleRemove(opt);
              }}
            >
              {opt} <span className="ml-1">×</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}; 