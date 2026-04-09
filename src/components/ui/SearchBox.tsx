// src/components/ui/SearchBox.tsx
import { FiSearch } from "react-icons/fi";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBox({
  value,
  onChange,
  placeholder,
  className,
}: SearchBoxProps) {
  return (
    <div className={`relative ${className}`}>
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search..."}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EB7D23]"
      />
    </div>
  );
}
