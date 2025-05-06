
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, SortDesc } from "lucide-react";

interface RecordsFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export default function RecordsFilter({ searchTerm, setSearchTerm }: RecordsFilterProps) {
  return (
    <div className="flex items-center mb-4">
      <Search className="h-4 w-4 mr-2 text-muted-foreground" />
      <Input
        placeholder="Search records..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      <Button variant="ghost" size="icon" className="ml-2">
        <Filter className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon">
        <SortDesc className="h-4 w-4" />
      </Button>
    </div>
  );
}
