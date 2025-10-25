import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProfileCompletion from "./pages/ProfileCompletion";
import EmailConfirmation from "./pages/EmailConfirmation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/complete-profile" element={<ProfileCompletion />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          <Route path="/confirm-email" element={<EmailConfirmation />} />
          <Route path="/auth/callback" element={<EmailConfirmation />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
// import { useEffect } from "react";
// import { supabase } from "@/integrations/supabase/client";

// function App() {
//   useEffect(() => {
//     const testSupabase = async () => {
//       let { data, error } = await supabase.from("students").select("*");
//       if (error) {
//         console.error("Supabase error:", error);
//       } else {
//         console.log("Students data:", data);
//       }
//     };
//     testSupabase();
//   }, []);

//   return <h1>Hello Placement Predictor 🚀</h1>;
// }
// export default App;
