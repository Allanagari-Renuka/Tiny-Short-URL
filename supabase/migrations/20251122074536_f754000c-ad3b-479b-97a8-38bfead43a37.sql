-- Create URLs table for storing shortened links
CREATE TABLE public.urls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_url TEXT NOT NULL,
  short_code VARCHAR(10) NOT NULL UNIQUE,
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for fast short_code lookups
CREATE INDEX idx_urls_short_code ON public.urls(short_code);

-- Create analytics table for tracking clicks
CREATE TABLE public.url_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url_id UUID NOT NULL REFERENCES public.urls(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  referrer TEXT,
  user_agent TEXT,
  ip_address TEXT
);

-- Create index for analytics queries
CREATE INDEX idx_analytics_url_id ON public.url_analytics(url_id);
CREATE INDEX idx_analytics_clicked_at ON public.url_analytics(clicked_at);

-- Enable Row Level Security
ALTER TABLE public.urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.url_analytics ENABLE ROW LEVEL SECURITY;

-- Public can read URLs (needed for redirects)
CREATE POLICY "Anyone can read URLs"
  ON public.urls
  FOR SELECT
  USING (true);

-- Public can create URLs (no auth required)
CREATE POLICY "Anyone can create URLs"
  ON public.urls
  FOR INSERT
  WITH CHECK (true);

-- Public can read analytics
CREATE POLICY "Anyone can read analytics"
  ON public.url_analytics
  FOR SELECT
  USING (true);

-- Public can create analytics (for click tracking)
CREATE POLICY "Anyone can create analytics"
  ON public.url_analytics
  FOR INSERT
  WITH CHECK (true);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_urls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_urls_timestamp
  BEFORE UPDATE ON public.urls
  FOR EACH ROW
  EXECUTE FUNCTION public.update_urls_updated_at();