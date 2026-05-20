'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const HomeSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/busca?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="relative w-full mb-6 mt-2">
      <input
        type="text"
        placeholder="Buscar pods, juices, coils..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-[#0c0c0f] border border-zinc-800 rounded-xl px-4 py-3 pl-11 text-sm text-zinc-300 focus:outline-none focus:border-[#00ff66]/40 focus:ring-1 focus:ring-[#00ff66]/20 transition-all duration-300 font-cyber-inter"
      />
      <Search className="absolute left-4 top-3.5 w-4 h-4 text-zinc-500" />
    </form>
  );
};
