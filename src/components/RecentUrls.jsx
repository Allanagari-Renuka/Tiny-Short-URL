import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, Copy, ExternalLink, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const RecentUrls = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUrls();

    const channel = supabase
      .channel("urls-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "urls" },
        () => {
          fetchUrls();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUrls = async () => {
    try {
      const { data, error } = await supabase
        .from("urls")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setUrls(data || []);
    } catch (error) {
      console.error("Error fetching URLs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (shortCode) => {
    const url = `${window.location.origin}/${shortCode}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const handleOpen = (shortCode) => {
    const url = `${window.location.origin}/${shortCode}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading || urls.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Recent Links
          </h2>
        </div>

        <Card className="shadow-soft border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">
                    Short Link
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground hidden md:table-cell">
                    Original URL
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-muted-foreground">
                    Clicks
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {urls.map((url, index) => (
                  <tr
                    key={url.id}
                    className="hover:bg-muted/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                          {window.location.origin}/{url.short_code}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground truncate max-w-[300px] block">
                        {url.original_url}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {url.clicks}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(url.short_code)}
                          className="hover:bg-primary/10 hover:text-primary"
                          title="Copy short link"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpen(url.short_code)}
                          className="hover:bg-accent/10 hover:text-accent"
                          title="Open short link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </section>
  );
};
