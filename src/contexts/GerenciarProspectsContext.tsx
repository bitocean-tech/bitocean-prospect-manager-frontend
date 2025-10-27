"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { ListPlacesQuery, PlaceItem } from "@/types/gerenciar-prospects";

interface GerenciarProspectsContextType {
  // Filtros
  filters: ListPlacesQuery;
  setFilters: (filters: ListPlacesQuery) => void;
  clearFilters: () => void;
  
  // Seleções múltiplas
  selectedItems: PlaceItem[];
  toggleSelection: (item: PlaceItem) => void;
  selectAll: (items: PlaceItem[]) => void;
  clearSelection: () => void;
  isSelected: (item: PlaceItem) => boolean;
}

const GerenciarProspectsContext = createContext<GerenciarProspectsContextType | undefined>(undefined);

const defaultFilters: ListPlacesQuery = {
  page: 1,
  pageSize: 20,
};

interface GerenciarProspectsProviderProps {
  children: ReactNode;
}

export function GerenciarProspectsProvider({ children }: GerenciarProspectsProviderProps) {
  const [filters, setFilters] = useState<ListPlacesQuery>(defaultFilters);
  const [selectedItems, setSelectedItems] = useState<PlaceItem[]>([]);

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  const toggleSelection = (item: PlaceItem) => {
    setSelectedItems(prev => {
      const isCurrentlySelected = prev.some(selected => selected.id === item.id);
      if (isCurrentlySelected) {
        return prev.filter(selected => selected.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const selectAll = (items: PlaceItem[]) => {
    // Adiciona apenas os itens da página atual que não estão selecionados
    setSelectedItems(prev => {
      const currentIds = new Set(prev.map(item => item.id));
      const newItems = items.filter(item => !currentIds.has(item.id));
      return [...prev, ...newItems];
    });
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const isSelected = (item: PlaceItem) => {
    return selectedItems.some(selected => selected.id === item.id);
  };

  const value: GerenciarProspectsContextType = {
    filters,
    setFilters,
    clearFilters,
    selectedItems,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
  };

  return (
    <GerenciarProspectsContext.Provider value={value}>
      {children}
    </GerenciarProspectsContext.Provider>
  );
}

export function useGerenciarProspects() {
  const context = useContext(GerenciarProspectsContext);
  if (context === undefined) {
    throw new Error("useGerenciarProspects must be used within a GerenciarProspectsProvider");
  }
  return context;
}