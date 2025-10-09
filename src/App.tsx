import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { CMS } from "./pages/CMS";
import SlideshowPage from "./pages/SlideshowPage";
import HomePage from "./pages/HomePage";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import MapsPage from "./pages/MapsPage";
import Admin from "./pages/Admin";
import { VideoFramePage } from "./pages/VideoFramePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/jakhabitat">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home-page" element={<HomePage />} />
          <Route path="/cms" element={<CMS />} />
          <Route path="/slideshow" element={<SlideshowPage />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          <Route path="/maps" element={<MapsPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/video-frame" element={<VideoFramePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
