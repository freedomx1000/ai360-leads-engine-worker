import { useLeadStats, useLeads } from "@/hooks/use-leads";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { Link } from "wouter";
import { 
  Users, 
  Target, 
  Activity, 
  TrendingUp, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useLeadStats();
  const { data: recentLeads, isLoading: leadsLoading } = useLeads();

  const statCards = [
    {
      title: "Total Leads",
      value: stats?.total ?? 0,
      icon: Users,
      color: "bg-blue-500",
      description: "All leads in system"
    },
    {
      title: "Avg Score",
      value: stats?.avgScore ?? 0,
      icon: Target,
      color: "bg-purple-500",
      description: "Across processed leads"
    },
    {
      title: "Processed",
      value: stats?.processed ?? 0,
      icon: CheckCircle2,
      color: "bg-emerald-500",
      description: "Fully enriched data"
    },
    {
      title: "Pending",
      value: stats?.pending ?? 0,
      icon: Clock,
      color: "bg-amber-500",
      description: "Awaiting analysis"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          {/* Action buttons could go here */}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="border-border/50 shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat, i) => (
            <Card key={i} className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative group">
              <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
                <stat.icon className={`w-24 h-24 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <CardContent className="p-6">
                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg mb-4`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold font-display tracking-tight">{stat.value}</h3>
                  <p className="font-medium text-muted-foreground">{stat.title}</p>
                </div>
                <div className="mt-4 flex items-center text-xs text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mr-2" />
                  {stat.description}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Leads Table */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-display">Recent Leads</CardTitle>
            <Link href="/leads" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              View All
            </Link>
          </CardHeader>
          <CardContent>
            {leadsLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 text-left">
                      <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-2">Name</th>
                      <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</th>
                      <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right pr-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {recentLeads?.slice(0, 5).map((lead) => (
                      <tr key={lead.id} className="group hover:bg-muted/50 transition-colors border-b border-border/40 last:border-0">
                        <td className="py-4 pl-2 font-medium">
                          <Link href={`/leads/${lead.id}`} className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                              {lead.name?.charAt(0) || lead.email.charAt(0)}
                            </div>
                            <div>
                              <div className="text-foreground group-hover:text-primary transition-colors">{lead.name || "Unknown"}</div>
                              <div className="text-xs text-muted-foreground">{lead.email}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-4 text-muted-foreground">{lead.company || "-"}</td>
                        <td className="py-4">
                          <LeadStatusBadge status={lead.status} />
                        </td>
                        <td className="py-4 text-right pr-2 text-muted-foreground">
                          {lead.createdAt ? format(new Date(lead.createdAt), 'MMM d') : '-'}
                        </td>
                      </tr>
                    ))}
                    {!recentLeads?.length && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No leads found. Create one to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed / System Health */}
        <Card className="border-border/50 shadow-sm bg-gradient-to-b from-card to-muted/20">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6 border-l-2 border-border space-y-8">
              {[
                { title: "Engine Started", time: "2m ago", desc: "Worker processes initialized", type: "system" },
                { title: "Batch Processing", time: "15m ago", desc: "Completed enrichment for 12 leads", type: "success" },
                { title: "API Limit Warning", time: "1h ago", desc: "Approaching Clearbit rate limit", type: "warning" },
              ].map((item, i) => (
                <div key={i} className="relative">
                  <span className={`absolute -left-[29px] top-0 w-3 h-3 rounded-full border-2 border-background 
                    ${item.type === 'success' ? 'bg-emerald-500' : item.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'} 
                  `} />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-foreground">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.desc}</span>
                    <span className="text-[10px] text-muted-foreground/60 font-mono uppercase mt-1">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-border/50">
               <div className="flex items-center justify-between text-sm">
                 <span className="text-muted-foreground">Worker Status</span>
                 <span className="flex items-center gap-2 text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                   Operational
                 </span>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
