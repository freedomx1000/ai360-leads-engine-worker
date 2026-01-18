import { useState } from "react";
import { useLeads, useProcessLead } from "@/hooks/use-leads";
import { Link } from "wouter";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { AddLeadDialog } from "@/components/AddLeadDialog";
import { format } from "date-fns";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  RefreshCw,
  ArrowRight,
  BrainCircuit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function LeadsList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { data: leads, isLoading, isError } = useLeads({ search, status: statusFilter });
  const processLead = useProcessLead();
  const { toast } = useToast();

  const handleProcess = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    processLead.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Processing Started",
          description: "The AI engine is now enriching this lead.",
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to start processing job.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Leads Database</h1>
          <p className="text-muted-foreground mt-1">Manage and enrich your potential customers</p>
        </div>
        <AddLeadDialog />
      </div>

      {/* Toolbar */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search leads by name, email or company..." 
            className="pl-9 bg-background"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 w-full md:w-auto">
                <Filter className="w-4 h-4" />
                {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : "All Status"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter(undefined)}>All Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("new")}>New</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("processing")}>Processing</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")}>Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("failed")}>Failed</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Leads Grid/List */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-500">Failed to load leads.</div>
        ) : leads?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No leads found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or create a new lead.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lead Info</th>
                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Job Title</th>
                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Score</th>
                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {leads?.map((lead) => (
                <tr key={lead.id} className="group hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <Link href={`/leads/${lead.id}`} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-blue-500/10 text-primary flex items-center justify-center font-bold shadow-sm border border-primary/10">
                        {lead.name?.charAt(0) || lead.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                          {lead.name || "Unknown"}
                          {lead.company && (
                            <span className="text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {lead.company}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">{lead.email}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="py-4 px-6 hidden md:table-cell text-sm text-muted-foreground">
                    {lead.jobTitle || "-"}
                  </td>
                  <td className="py-4 px-6 hidden sm:table-cell">
                    {lead.score ? (
                      <div className="flex items-center gap-2">
                        <div className="w-full max-w-[60px] h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full", 
                              lead.score > 70 ? "bg-emerald-500" : lead.score > 40 ? "bg-amber-500" : "bg-red-500"
                            )} 
                            style={{ width: `${lead.score}%` }} 
                          />
                        </div>
                        <span className="text-xs font-medium">{lead.score}</span>
                      </div>
                    ) : "-"}
                  </td>
                  <td className="py-4 px-6">
                    <LeadStatusBadge status={lead.status} />
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {lead.status === "new" && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-primary hover:bg-primary/10 hover:text-primary"
                          onClick={(e) => handleProcess(e, lead.id)}
                          disabled={processLead.isPending}
                        >
                          <BrainCircuit className={cn("w-4 h-4", processLead.isPending && "animate-spin")} />
                          <span className="sr-only">Process</span>
                        </Button>
                      )}
                      
                      <Link href={`/leads/${lead.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <ArrowRight className="w-4 h-4" />
                          <span className="sr-only">View</span>
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
