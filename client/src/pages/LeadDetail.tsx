import { useRoute } from "wouter";
import { useLead, useProcessLead } from "@/hooks/use-leads";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { ScoreGauge } from "@/components/ScoreGauge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Mail, 
  Briefcase, 
  Calendar, 
  BrainCircuit, 
  ArrowLeft,
  Share2,
  Download
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function LeadDetail() {
  const [, params] = useRoute("/leads/:id");
  const id = parseInt(params?.id || "0");
  const { data: lead, isLoading } = useLead(id);
  const processLead = useProcessLead();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold">Lead Not Found</h2>
        <Link href="/leads">
          <Button>Back to Leads</Button>
        </Link>
      </div>
    );
  }

  const handleProcess = () => {
    processLead.mutate(id, {
      onSuccess: () => {
        toast({
          title: "Processing Started",
          description: "The AI engine is now enriching this lead.",
        });
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header with Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/leads">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-bold text-foreground">{lead.name || "Unknown Lead"}</h1>
              <LeadStatusBadge status={lead.status} />
            </div>
            <div className="flex items-center gap-4 text-muted-foreground mt-1 text-sm">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {lead.email}
              </span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>Added {format(new Date(lead.createdAt || new Date()), 'PPP')}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {lead.status === "new" && (
            <Button 
              onClick={handleProcess} 
              disabled={processLead.isPending}
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <BrainCircuit className={cn("w-4 h-4 mr-2", processLead.isPending && "animate-spin")} />
              {processLead.isPending ? "Processing..." : "Enrich Data"}
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Sidebar */}
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6 flex flex-col items-center justify-center border-b border-border/50">
               <div className="w-24 h-24 rounded-full bg-background border-4 border-white shadow-xl flex items-center justify-center mb-4">
                 <span className="text-3xl font-bold text-primary">{lead.name?.charAt(0) || lead.email.charAt(0)}</span>
               </div>
               <h3 className="font-bold text-lg">{lead.name}</h3>
               <p className="text-muted-foreground text-sm">{lead.jobTitle || "No Job Title"}</p>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                <div className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">Company</p>
                    <p className="text-sm font-medium">{lead.company || "-"}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">Role</p>
                    <p className="text-sm font-medium">{lead.jobTitle || "-"}</p>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase">Added On</p>
                    <p className="text-sm font-medium">{lead.createdAt ? format(new Date(lead.createdAt), 'PPP') : '-'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Score Card */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">AI Quality Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-6">
              <ScoreGauge score={lead.score || 0} />
              <p className="text-center text-sm text-muted-foreground mt-2 px-4">
                Based on company size, role relevance, and email deliverability.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="enriched" className="w-full">
            <TabsList className="w-full justify-start border-b border-border/50 rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger 
                value="enriched" 
                className="px-6 py-3 rounded-t-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-card data-[state=active]:shadow-none rounded-none"
              >
                Enriched Data
              </TabsTrigger>
              <TabsTrigger 
                value="raw"
                className="px-6 py-3 rounded-t-lg border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-card data-[state=active]:shadow-none rounded-none"
              >
                Raw Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="enriched" className="mt-6 space-y-6 animate-in fade-in duration-300">
              {Object.keys(lead.enrichedData || {}).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(lead.enrichedData as Record<string, any>).map(([key, value]) => (
                    <Card key={key} className="border-border/50 shadow-sm hover:shadow-md transition-all">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">{key.replace(/_/g, ' ')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm font-medium break-words">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-2 border-border/60 bg-muted/20">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                      <BrainCircuit className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-lg font-semibold">No enriched data yet</h3>
                    <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                      Click the "Enrich Data" button to run AI processing on this lead.
                    </p>
                    {lead.status === "new" && (
                      <Button onClick={handleProcess} disabled={processLead.isPending}>
                        {processLead.isPending ? "Processing..." : "Start Enrichment"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="raw" className="mt-6 animate-in fade-in duration-300">
              <Card className="bg-slate-950 border-slate-800 text-slate-300 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-slate-800 bg-slate-900/50 flex flex-row items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-slate-400 hover:text-white">
                    <Download className="w-3 h-3 mr-1" /> JSON
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <pre className="p-6 overflow-x-auto text-xs font-mono leading-relaxed">
                    {JSON.stringify(lead, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
