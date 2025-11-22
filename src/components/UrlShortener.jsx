import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Link2, Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const UrlShortener = () => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Access base URL safely in client-side rendering
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const generateShortCode = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  };

  const handleShorten = async () => {
    if (!url || !url.startsWith("http")) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }

    setIsLoading(true);
    try {
      const shortCode = generateShortCode();
      const { data, error } = await supabase
        .from("urls")
        .insert({
          original_url: url,
          short_code: shortCode,
        })
        .select()
        .single();

      if (error) throw error;

      const displayUrl = baseUrl + "/" + data.short_code;

      setShortUrl(displayUrl);
      toast.success("URL shortened successfully!");
    } catch (error) {
      console.error("Error shortening URL:", error);
      toast.error(error?.message || "Failed to shorten URL");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Shorten Your <span className="gradient-text">Links</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create short, memorable links and track their performance
          </p>
        </div>

        <Card className="p-6 md:p-8 shadow-card border-border/50 bg-card animate-fade-in">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">
                Paste your long URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="url"
                  placeholder="https://example.com/very/long/url/that/needs/shortening"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleShorten()}
                  className="flex-1 h-12 text-base border-border focus:ring-2 focus:ring-primary"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleShorten}
                  disabled={isLoading || !url}
                  className="h-12 px-8 bg-gradient-primary hover:shadow-glow transition-all duration-300"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Shorten URL
                    </>
                  )}
                </Button>
              </div>
            </div>

            {shortUrl && (
              <div className="space-y-3 pt-4 border-t border-border animate-fade-in">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-primary" />
                  Your shortened URL
                </label>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    value={shortUrl}
                    readOnly
                    className="flex-1 h-12 text-base font-medium bg-muted/50 border-border"
                  />
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="h-12 px-6 border-border hover:bg-primary hover:text-primary-foreground transition-colors"
                    size="lg"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
};

export default UrlShortener;

