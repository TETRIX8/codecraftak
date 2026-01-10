import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import Tasks from "./pages/Tasks";
import TaskDetail from "./pages/TaskDetail";
import Review from "./pages/Review";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Users from "./pages/Users";
import UserProfile from "./pages/UserProfile";
import Messages from "./pages/Messages";
import Topics from "./pages/Topics";
import TopicDetail from "./pages/TopicDetail";
import Games from "./pages/Games";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/review" element={<Review />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/:id" element={<UserProfile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/topics/:id" element={<TopicDetail />} />
              <Route path="/games" element={<Games />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
