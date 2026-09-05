import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RevenueLeaks from "./pages/RevenueLeaks";
import AIInvestigation from "./pages/AIInvestigation";
import RecoveryCenter from "./pages/RecoveryCenter";
import RecoveredRevenue from "./pages/RecoveredRevenue";
import Transactions from "./pages/Transactions";
import AIAssistant from "./pages/AIAssistant";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leaks" element={<RevenueLeaks />} />
              <Route path="/investigation" element={<AIInvestigation />} />
              <Route path="/recovery" element={<RecoveryCenter />} />
              <Route path="/recovered" element={<RecoveredRevenue />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/assistant" element={<AIAssistant />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
