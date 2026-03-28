import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Search stories...' 
}) => {
  return (
    <>
      <div className="search-input-wrapper">
        <Search size={18} className="search-input-icon" />
        <input
          type="text"
          className="search-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>

      <style>{`
        .search-input-wrapper {
          position: relative;
          width: 100%;
          max-width: 320px;
        }

        .search-input-icon {
          position: absolute;
          left: var(--vs-space-4);
          top: 50%;
          transform: translateY(-50%);
          color: var(--vs-text-tertiary);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: var(--vs-space-3) var(--vs-space-4) var(--vs-space-3) var(--vs-space-10);
          font-family: var(--vs-font);
          font-size: 0.9375rem;
          color: var(--vs-text-primary);
          background: var(--vs-white);
          border: 1px solid var(--vs-border);
          border-radius: var(--vs-radius-md);
          transition: all var(--vs-transition-fast);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--vs-text-tertiary);
        }

        .search-input::placeholder {
          color: var(--vs-text-tertiary);
        }
      `}</style>
    </>
  );
};

export default SearchInput;
