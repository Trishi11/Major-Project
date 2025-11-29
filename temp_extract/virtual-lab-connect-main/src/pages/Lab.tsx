import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const Lab = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Virtual Chemistry Lab</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
        <div className="bg-card border border-border rounded-lg p-8">
          <p className="text-muted-foreground text-lg">
            Welcome to your virtual chemistry lab, {user?.fullName || user?.email}!
          </p>
          <p className="text-muted-foreground mt-4">
            Your lab experiments and tools will appear here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Lab;
