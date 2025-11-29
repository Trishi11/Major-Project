import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { CourseCatalog } from "@/components/CourseCatalog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Lab = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [userFullName, setUserFullName] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    } else {
      // Fetch user profile to get full name
      fetchUserProfile();
    }
  }, [user, navigate]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }
      
      setUserFullName(data?.full_name || null);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header with Logout */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold neon-text">Virtual Science Lab</h1>
            <p className="text-sm text-muted-foreground">Welcome, {userFullName || user.email}</p>
          </div>
          <Button
            onClick={signOut}
            variant="outline"
            className="glass-panel holographic-border text-foreground hover:glow-cyan"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-24 pb-12">
        {user && <CourseCatalog userFullName={userFullName} userEmail={user.email} />}
      </div>
    </div>
  );
};

export default Lab;