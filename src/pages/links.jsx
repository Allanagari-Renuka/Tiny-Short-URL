import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, ExternalLink, Edit3, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Links = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from("urls")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUrls(data || []);
    } catch (error) {
      console.error("Error fetching URLs:", error);
      toast.error("Failed to load links");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (shortCode) => {
    try {
      const url = `${window.location.origin}/${shortCode}`;
      await navigator.clipboard.writeText(url);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleOpen = (shortCode) => {
    const url = `${window.location.origin}/${shortCode}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this link?")) return;
    try {
      const { error } = await supabase.from("urls").delete().eq("id", id);
      if (error) throw error;
      toast.success("Link deleted");
      fetchUrls();
    } catch {
      toast.error("Failed to delete link");
    }
  };

  if (loading) {
    return <div className="p-8">Loading links...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Link Management</h1>
        <Card className="shadow-soft border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/50 border-b border-border text-sm font-semibold text-muted-foreground">
                <tr>
                  <th className="py-4 px-6">Short Code</th>
                  <th className="py-4 px-6 hidden md:table-cell">Long URL</th>
                  <th className="py-4 px-6 text-center">Clicks</th>
                  <th className="py-4 px-6 text-center">Last Clicked</th>
                  <th className="py-4 px-6 text-center">Created On</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {urls.map((url) => (
                  <tr key={url.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 font-medium">
                      {url.short_code}
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell truncate max-w-[450px]">
                      {url.original_url}
                    </td>
                    <td className="py-4 px-6 text-center">{url.clicks || 0}</td>
                    <td className="py-4 px-6 text-center">{url.last_clicked ? new Date(url.last_clicked).toLocaleString() : "—"}</td>
                    <td className="py-4 px-6 text-center">{new Date(url.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(url.short_code)}
                          title="Copy short link"
                          className="hover:bg-primary/10 hover:text-primary"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpen(url.short_code)}
                          title="Open short link"
                          className="hover:bg-accent/10 hover:text-accent"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        {/* Edit URL functionality to be added if needed */}
                        {/* <Button variant="ghost" size="sm" title="Edit URL" disabled>
                          <Edit3 className="w-4 h-4" />
                        </Button> */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(url.id)}
                          title="Delete URL"
                          className="hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {urls.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No links found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Links;
