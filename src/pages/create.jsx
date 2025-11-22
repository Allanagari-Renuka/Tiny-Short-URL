import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Link2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Create = () => {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateUrl = (val) => /^https?:\/\/\S+$/.test(val);

  const validateCustomCode = (val) => /^[a-zA-Z0-9-_]{3,20}$/.test(val);

  const handleShorten = async () => {
    if (!validateUrl(url)) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }
    if (customCode && !validateCustomCode(customCode)) {
      toast.error("Custom code must be 3-20 characters, alphanumeric, dash or underscore");
      return;
    }

    setIsLoading(true);
    try {
      // Check if custom code already exists
      if (customCode) {
        const { data: existing } = await supabase
          .from("urls")
          .select("id")
          .eq("short_code", customCode)
          .single();
        if (existing) {
          toast.error("Custom code already in use, please pick another.");
          setIsLoading(false);
          return;
        }
      } else {
        // Generate random code
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code = "";
        for (let i = 0; i < 6; i++) {
          code += chars[Math.floor(Math.random() * chars.length)];
        }
        setCustomCode(code);
      }

      const shortCode = customCode || shortUrl.split('/').pop();

      const { data, error } = await supabase
        .from("urls")
        .insert({ original_url: url, short_code: shortCode })
        .select()
        .single();

      if (error) throw error;

      const shortenedUrl = `${window.location.origin}/${data.short_code}`;
      setShortUrl(shortenedUrl);
      toast.success("URL shortened successfully!");
    } catch (error) {
      console.error("Error shortening URL:", error);
      toast.error(error.message || "Failed to shorten URL");
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
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold mb-6 text-center">Create a Short Link</h1>

        <Card className="p-6 shadow-card border-border bg-card">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="url">
                Enter Long URL
              </label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/very/long/url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1" htmlFor="customCode">
                Custom Short Code (optional)
              </label>
              <Input
                id="customCode"
                type="text"
                placeholder="custom-code"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Alphanumeric, dash or underscore, 3-20 characters.
              </p>
            </div>

            <Button
              onClick={handleShorten}
              disabled={isLoading || !url}
              size="lg"
              className="w-full flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Short Link"}
            </Button>

            {shortUrl && (
              <div className="mt-4">
                <label className="block text-sm font-semibold mb-1">Your Shortened URL</label>
                <div className="flex gap-3">
                  <Input type="text" readOnly value={shortUrl} />
                  <Button onClick={handleCopy} variant="outline" size="lg">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Create;
