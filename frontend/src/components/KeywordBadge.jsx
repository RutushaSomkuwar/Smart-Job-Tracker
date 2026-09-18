import React from 'react';
import { Check, X } from 'lucide-react';

const KeywordBadge = ({ keyword, type = 'matched', size = 'sm' }) => {
  const isMatched = type === 'matched';
  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md border transition-all ${
        isMatched
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
      } ${sizeClasses}`}
    >
      {isMatched ? (
        <Check className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <X className="w-3.5 h-3.5 text-amber-600" />
      )}
      <span>{keyword}</span>
    </span>
  );
};

export default KeywordBadge;
