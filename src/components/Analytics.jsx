import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { supabase } from "@/integrations/supabase/client";

const COLORS = ["#00BCD4", "#4CAF50", "#FFC107", "#FF7043", "#7E57C2", "#26A69A"]; // material-like palette

// Helpers
const formatLabel = (date) =>
  new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });

const dateKey = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD

const getHostname = (ref) => {
  if (!ref) return "Direct";
  try {
    const u = new URL(ref);
    return u.hostname.replace("www.", "");
  } catch {
    return ref || "Direct";
  }
};

const classifyDevice = (ua = "") => {
  const s = ua.toLowerCase();
  if (/ipad|tablet/.test(s)) return "Tablet";
  if (/mobi|iphone|android/.test(s)) return "Mobile";
  return "Desktop";
};

const DAYS_WINDOW = 30;

const Analytics = () => {
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalLinks, setTotalLinks] = useState(0);
  const [avgClicks, setAvgClicks] = useState(0);
  const [clicksOverTime, setClicksOverTime] = useState([]);
  const [trafficSources, setTrafficSources] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);

  const buildEmptyDateSeries = () => {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - (DAYS_WINDOW - 1));
    const series = [];
    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const key = dateKey(d);
      series.push({ key, date: formatLabel(key), clicks: 0 });
    }
    return series;
  };

  const fetchAnalytics = async () => {
    try {
      // 1) Total clicks + total links
      const { data: urls, error: urlsError } = await supabase.from("urls").select("clicks");
      if (urlsError) throw urlsError;
      const totalClicksVal = urls.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
      const totalLinksVal = urls.length;
      const avgClicksVal = totalLinksVal > 0 ? Number((totalClicksVal / totalLinksVal).toFixed(2)) : 0;
      setTotalClicks(totalClicksVal);
      setTotalLinks(totalLinksVal);
      setAvgClicks(avgClicksVal);

      // 2) Pull analytics rows for last N days
      const since = new Date();
      since.setDate(since.getDate() - (DAYS_WINDOW - 1));
      const { data: analytics, error: analyticsErr } = await supabase
        .from("url_analytics")
        .select("clicked_at, referrer, user_agent")
        .gte("clicked_at", since.toISOString());
      if (analyticsErr) throw analyticsErr;

      // 3) Build time series (fill missing days with zero clicks)
      const series = buildEmptyDateSeries();
      const indexByKey = Object.create(null);
      series.forEach((pt, i) => (indexByKey[pt.key] = i));
      for (const row of analytics) {
        const k = dateKey(new Date(row.clicked_at));
        const idx = indexByKey[k];
        if (idx !== undefined) series[idx].clicks += 1;
      }
      // Drop internal key before setting state
      setClicksOverTime(series.map(({ key, ...rest }) => rest));

      // 4) Traffic sources
      const refCounts = new Map();
      for (const row of analytics) {
        const host = getHostname(row.referrer);
        refCounts.set(host, (refCounts.get(host) || 0) + 1);
      }
      const traffic = Array.from(refCounts.entries()).map(([referrer, count]) => ({ referrer, count }));
      setTrafficSources(traffic);

      // 5) Device types
      const devCounts = new Map();
      for (const row of analytics) {
        const kind = classifyDevice(row.user_agent);
        devCounts.set(kind, (devCounts.get(kind) || 0) + 1);
      }
      const devices = Array.from(devCounts.entries()).map(([device_type, count]) => ({ device_type, count }));
      setDeviceTypes(devices);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Realtime updates: refresh on urls/url_analytics changes
    const channel = supabase
      .channel("analytics-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "url_analytics" },
        () => fetchAnalytics(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "urls" },
        () => fetchAnalytics(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section id="analytics" className="py-16 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Analytics <span className="gradient-text">Dashboard</span>
          </h2>
          <p className="text-lg text-muted-foreground">Track your link performance in real-time</p>
        </div>

        {/* Row 1 - Performance Metric and Statistics */}
        <div className="grid md:grid-cols-1 gap-6 mb-6">
          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={clicksOverTime} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
                  {/* light grid similar to reference image */}
                  <CartesianGrid stroke="#D1D5DB" strokeDasharray="3 3" />

                  {/* axes with visible tick lines; slanted x labels like sample */}
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    tickLine={true}
                    axisLine={true}
                    angle={-45}
                    textAnchor="end"
                    dy={10}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    tickLine={true}
                    axisLine={true}
                    allowDecimals={false}
                    domain={[0, (dataMax) => Math.ceil((dataMax + 10) / 10) * 10]}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      color: "#111827",
                    }}
                    labelStyle={{ color: "#111827" }}
                  />

                  {/* thicker turquoise line with round white-filled points */}
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#26C6DA"
                    strokeWidth={4}
                    dot={{ r: 6, strokeWidth: 3, fill: "#FFFFFF", stroke: "#26C6DA" }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Row 2 - Totals */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-soft border-border/50 text-muted-foreground">
            <CardHeader>
              <CardTitle className="text-base">Total Clicks</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-3xl font-bold">{totalClicks}</h3>
              <p className="text-xs mt-1">Across all links</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Total Links</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-3xl font-bold">{totalLinks}</h3>
              <p className="text-xs mt-1">Total created</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Performance Metric</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{avgClicks}</p>
              <p className="text-sm text-muted-foreground">Avg. Clicks/Link</p>
            </CardContent>
          </Card>
        </div>

        {/* Row 3 - Breakdown charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={trafficSources} dataKey="count" nameKey="referrer" cx="50%" cy="50%" outerRadius={80} label>
                    {trafficSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50">
            <CardHeader>
              <CardTitle>Device Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={deviceTypes} dataKey="count" nameKey="device_type" cx="50%" cy="50%" outerRadius={80} label>
                    {deviceTypes.map((entry, index) => (
                      <Cell key={`cell-dev-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Analytics;
