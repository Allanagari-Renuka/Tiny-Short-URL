import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import QRCode from "react-qr-code";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { toast } from "sonner";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const PerLinkAnalytics = () => {
  const { shortCode } = useParams();

  const [linkData, setLinkData] = useState(null);
  const [clicksOverTime, setClicksOverTime] = useState([]);
  const [trafficSources, setTrafficSources] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shortCode) return;
    fetchLinkAnalytics(shortCode);
  }, [shortCode]);

  const fetchLinkAnalytics = async (code) => {
    setLoading(true);
    try {
      // Fetch link basic data
      let { data: link, error: linkError } = await supabase
        .from("urls")
        .select("*")
        .eq("short_code", code)
        .single();

      if (linkError || !link) {
        setLoading(false);
        setLinkData(null);
        return;
      }

      setLinkData(link);

      // Fetch click events aggregated by date for clicks over time line chart
      let { data: clicksOverTimeData } = await supabase.rpc("clicks_by_date", { short_code: code });
      // Expected format: [{ date: 'YYYY-MM-DD', clicks: number }]
      setClicksOverTime(clicksOverTimeData || []);

      // Fetch traffic source counts for pie chart
      let { data: trafficSourceData } = await supabase.rpc("clicks_by_referrer", { short_code: code });
      setTrafficSources(trafficSourceData || []);

      // Fetch device type counts for pie chart
      let { data: deviceTypeData } = await supabase.rpc("clicks_by_device", { short_code: code });
      setDeviceTypes(deviceTypeData || []);
    } catch (error) {
      console.error("Error fetching per-link analytics:", error);
      toast.error("Failed to load analytics");
      setLinkData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!linkData) {
    return <div className="p-8 text-center text-red-600">Link not found or analytics unavailable.</div>;
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-5xl space-y-12">
        <h1 className="text-4xl font-bold mb-6">
          Analytics for <span className="text-primary">{linkData.short_code}</span>
        </h1>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Original URL</CardTitle>
            </CardHeader>
            <CardContent>
              <a href={linkData.original_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                {linkData.original_url}
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Short URL & QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <a href={`${window.location.origin}/${linkData.short_code}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {window.location.origin}/{linkData.short_code}
              </a>
              <QRCode value={`${window.location.origin}/${linkData.short_code}`} />
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Link Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4 text-center">
              <div>
                <strong>Total Clicks</strong>
                <div>{linkData.clicks || 0}</div>
              </div>
              <div>
                <strong>Last Clicked</strong>
                <div>{linkData.last_clicked ? new Date(linkData.last_clicked).toLocaleString() : "Never"}</div>
              </div>
              <div>
                <strong>Created On</strong>
                <div>{new Date(linkData.created_at).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Clicks Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={clicksOverTime} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="clicks" stroke="#8884d8" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={trafficSources}
                    dataKey="count"
                    nameKey="referrer"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Device Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceTypes}
                    dataKey="count"
                    nameKey="device_type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#82ca9d"
                    label
                  >
                    {deviceTypes.map((entry, index) => (
                      <Cell key={`cell-dev-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default PerLinkAnalytics;
