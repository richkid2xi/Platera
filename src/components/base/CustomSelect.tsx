import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: (SelectOption | string)[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  className = '',
  buttonClassName = '',
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize options to object format
  const normalizedOptions = options.map(opt =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white dark:bg-foreground-900 border border-background-200 dark:border-foreground-800 rounded-lg text-sm text-foreground-900 dark:text-foreground-100 focus:outline-none focus:border-primary-500 font-body transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-background-300 dark:hover:border-foreground-700 cursor-pointer'} ${buttonClassName || 'px-3 py-2.5'}`}
      >
        <span className={selectedOption ? 'text-foreground-900 dark:text-foreground-100 truncate' : 'text-foreground-400 truncate'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <i className={`ri-arrow-down-s-line text-foreground-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-foreground-900 border border-background-200 dark:border-foreground-800 rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto animate-fade-in custom-scrollbar">
          {normalizedOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-foreground-400 font-body">No options</div>
          ) : (
            normalizedOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm font-body transition-colors cursor-pointer ${opt.value === value
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-foreground-700 dark:text-foreground-300 hover:bg-background-50 dark:hover:bg-foreground-800'
                  }`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
