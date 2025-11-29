import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";
import { Beaker, FlaskConical, TestTube2, ArrowDown } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import chemistryLab1 from "@/assets/chemistry-lab-1.jpg";
import chemistryLab2 from "@/assets/chemistry-lab-2.jpg";

const authSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
});

const Landing = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/lab");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = isLogin
        ? { email, password }
        : { email, password, fullName };
      
      authSchema.parse(data);

      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
          navigate("/lab");
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("User already registered")) {
            toast.error("This email is already registered. Please sign in.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created! Welcome to the lab!");
          navigate("/lab");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToAuth = () => {
    document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Login Button */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Beaker className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Virtual Chemistry Lab</span>
          </div>
          <Button onClick={scrollToAuth} variant="default" className="shadow-lg shadow-primary/20">
            Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroBanner} 
            alt="Virtual Chemistry Lab" 
            className="w-full h-full object-cover transition-opacity duration-300"
            style={{ opacity: Math.max(0.4 - scrollY / 1000, 0.1) }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
              Virtual Chemistry Lab – Learn, Experiment, Explore
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Experience cutting-edge simulation-based chemistry learning with realistic reactions, 
              interactive equipment, and guided experiments designed for students and learners worldwide.
            </p>
            <Button 
              onClick={scrollToAuth}
              size="lg" 
              className="mt-8 text-lg px-8 py-6 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all"
            >
              Get Started
              <ArrowDown className="ml-2 animate-bounce" />
            </Button>
          </div>
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Beaker className="absolute top-1/4 left-10 w-16 h-16 text-primary/20 animate-pulse" />
          <FlaskConical className="absolute top-1/3 right-20 w-20 h-20 text-secondary/20 animate-pulse delay-300" />
          <TestTube2 className="absolute bottom-1/4 left-1/4 w-12 h-12 text-accent/20 animate-pulse delay-700" />
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-16">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-12">
              About the Virtual Chemistry Lab Platform
            </h2>
            
            <div className="space-y-12">
              {/* Card 1: Image Left, Text Right */}
              <Card className="overflow-hidden bg-card/50 border-border backdrop-blur-sm hover:shadow-lg hover:shadow-primary/10 transition-all animate-fade-in">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-48 md:h-full flex items-center justify-center p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
                    <img 
                      src={chemistryLab1} 
                      alt="Chemistry Laboratory Equipment" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <FlaskConical className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground">Realistic Simulations</h3>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Experience immersive chemistry experiments in a safe virtual environment with realistic reactions and laboratory equipment.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Card 2: Text Left, Image Right */}
              <Card className="overflow-hidden bg-card/50 border-border backdrop-blur-sm hover:shadow-lg hover:shadow-secondary/10 transition-all animate-fade-in">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-8 flex flex-col justify-center order-2 md:order-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-secondary/10">
                        <Beaker className="w-8 h-8 text-secondary" />
                      </div>
                      <h3 className="text-2xl font-semibold text-foreground">Interactive Learning</h3>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Follow guided experiments and explore chemistry at your own pace with dynamic visualizations and scientifically accurate simulations.
                    </p>
                  </div>
                  <div className="relative h-48 md:h-full flex items-center justify-center p-8 bg-gradient-to-br from-secondary/5 to-accent/5 order-1 md:order-2">
                    <img 
                      src={chemistryLab2} 
                      alt="Virtual Chemistry Experiments" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-section" className="py-16 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-md mx-auto">
            <Card className="relative overflow-hidden border-primary/20 shadow-2xl shadow-primary/10 backdrop-blur-xl bg-card/90">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-pulse"></div>
              
              <div className="relative p-8 space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="flex justify-center gap-2 mb-4">
                    <Beaker className="w-8 h-8 text-primary animate-pulse" />
                    <FlaskConical className="w-8 h-8 text-secondary animate-pulse delay-150" />
                    <TestTube2 className="w-8 h-8 text-accent animate-pulse delay-300" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {isLogin ? "Welcome Back" : "Create Account"}
                  </h2>
                  <p className="text-muted-foreground">
                    {isLogin 
                      ? "Sign in to access your virtual lab" 
                      : "Join our community of chemistry enthusiasts"}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-foreground">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Dr. Marie Curie"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={!isLogin}
                        className="bg-input/50 border-border focus:border-primary transition-all"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="chemist@lab.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-input/50 border-border focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-foreground">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-input/50 border-border focus:border-primary transition-all"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        {isLogin ? "Signing In..." : "Creating Account..."}
                      </span>
                    ) : (
                      isLogin ? "Sign In" : "Sign Up"
                    )}
                  </Button>
                </form>

                {/* Toggle */}
                <div className="text-center pt-4 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isLogin ? (
                      <>
                        Don't have an account?{" "}
                        <span className="text-primary font-semibold hover:underline">Sign Up</span>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <span className="text-primary font-semibold hover:underline">Sign In</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-card/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-foreground font-semibold mb-4">Menu</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Home</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#about" className="hover:text-primary transition-colors">About us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-4">Feedback</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Linkedin</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-semibold mb-4">Privacy Policy</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Beaker className="w-6 h-6 text-primary" />
                <span className="text-foreground font-bold">Virtual Chemistry Lab</span>
              </div>
              <p className="text-muted-foreground text-sm">
                123 Lab Street<br />
                Science City, SC 12345<br />
                United States
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground text-sm">
            <p>© 2025 Virtual Chemistry Lab. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
