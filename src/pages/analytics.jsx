import Analytics  from "@/components/Analytics";

const GlobalAnalytics = () => {
  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Global Analytics Dashboard</h1>
        <Analytics />
        {/* Additional charts like daily clicks, clicks by device, clicks by domain 
            can be added here by extending Analytics component or creating new components */}
      </div>
    </div>
  );
};

export default GlobalAnalytics;
