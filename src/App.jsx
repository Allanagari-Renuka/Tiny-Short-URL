import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index.jsx";
import Redirect from "./pages/Redirect.jsx";
import NotFound from "./pages/NotFound.jsx";

import Links from "./pages/links.jsx";
import Create from "./pages/create.jsx";
import PerLinkAnalytics from "./pages/code/shortCode.jsx";
import GlobalAnalytics from "./pages/analytics.jsx";
import QRCodePage from "./pages/qr/shortCode.jsx";
import Settings from "./pages/settings.jsx";
import Admin from "./pages/admin.jsx";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const showNavbar = location.pathname !== "/";

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/links" element={<Links />} />
        <Route path="/create" element={<Create />} />
        <Route path="/code/:shortCode" element={<PerLinkAnalytics />} />
        <Route path="/analytics" element={<GlobalAnalytics />} />
        <Route path="/qr/:shortCode" element={<QRCodePage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path=":shortCode" element={<Redirect />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
