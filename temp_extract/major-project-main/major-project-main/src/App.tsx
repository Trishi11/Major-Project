import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import Auth from "./pages/Auth";
import Lab from "./pages/Lab";
import NotFound from "./pages/NotFound";
import LabScene from "@/lab/scenes/LabScene";
import DecompositionExperiment from "@/lab/components/experiments/DecompositionExperiment";
import PermanganateReductionExperiment from "@/lab/components/experiments/PermanganateReductionExperiment";
import BurnerTest from "./pages/BurnerTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/lab/decomposition-reaction/run" element={<DecompositionExperiment />} />
            <Route path="/lab/permanganate-reduction/run" element={<PermanganateReductionExperiment />} />
            {/* Removed specific route for potassium-permanganate-reduction to use generic LabScene */}
            <Route path="/lab/burner-test" element={<BurnerTest />} />
            <Route path="/lab/:slug/run" element={<LabScene />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;