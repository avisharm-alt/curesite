import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SortDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

const SortDropdown: React.FC<SortDropdownProps> = ({ value, onChange, options }) => {
  return (
    <>
      <div className="sort-dropdown-wrapper">
        <select
          className="sort-dropdown"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="sort-dropdown-icon" />
      </div>

      <style>{`
        .sort-dropdown-wrapper {
          position: relative;
          display: inline-block;
        }

        .sort-dropdown {
          appearance: none;
          padding: var(--vs-space-2) var(--vs-space-8) var(--vs-space-2) var(--vs-space-3);
          font-family: var(--vs-font);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--vs-text-secondary);
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-md);
          cursor: pointer;
          transition: all var(--vs-transition-fast);
        }

        .sort-dropdown:hover {
          border-color: var(--vs-border-hover);
          color: var(--vs-text-primary);
        }

        .sort-dropdown:focus {
          outline: none;
          border-color: var(--vs-text-tertiary);
        }

        .sort-dropdown-icon {
          position: absolute;
          right: var(--vs-space-2);
          top: 50%;
          transform: translateY(-50%);
          color: var(--vs-text-tertiary);
          pointer-events: none;
        }
      `}</style>
    </>
  );
};

export default SortDropdown;
