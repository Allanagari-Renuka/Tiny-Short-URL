import { useState } from "react";
import { Analytics } from "@/components/Analytics";
import { RecentUrls } from "@/components/RecentUrls";
import { UrlShortener } from "@/components/UrlShortener";

const Dashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Placeholder for future filtering functionality
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        <input
          type="text"
          placeholder="Search links..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </header>

      <main className="container mx-auto px-4 space-y-12">
        {/* Quick Actions Panel Placeholder */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            {/* Add quick action buttons or controls here */}
            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition">
              Create New Link
            </button>
            {/* Additional quick actions */}
          </div>
        </section>

        {/* Link Creation Form */}
        <section>
          <UrlShortener />
        </section>

        {/* Analytics Summary */}
        <section>
          <Analytics />
        </section>

        {/* Recent Links */}
        <section>
          <RecentUrls />
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
