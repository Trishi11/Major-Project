import { useState, useEffect, useRef } from "react";
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

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [animatedElements, setAnimatedElements] = useState<Set<string>>(new Set());
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  
  const aboutRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const authRef = useRef<HTMLDivElement>(null);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroTextRef = useRef<HTMLParagraphElement>(null);
  const flaskIconRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      // Check if elements are in view and add animation classes
      const elements = [
        { ref: card1Ref, id: 'card1' },
        { ref: card2Ref, id: 'card2' },
        { ref: authRef, id: 'auth' },
        { ref: heroTitleRef, id: 'heroTitle' },
        { ref: heroTextRef, id: 'heroText' },
        { ref: flaskIconRef, id: 'flaskIcon' },
        { ref: footerRef, id: 'footer' }
      ];
      
      elements.forEach(({ ref, id }) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
          
          if (isVisible && !animatedElements.has(id)) {
            setAnimatedElements(prev => new Set(prev).add(id));
            ref.current.classList.add('animate-visible');
          }
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [animatedElements]);

  // Add a new useEffect for initial animations
  useEffect(() => {
    // Trigger initial animations after component mounts
    const timer = setTimeout(() => {
      setAnimatedElements(prev => new Set(prev).add('heroTitle'));
      setAnimatedElements(prev => new Set(prev).add('heroText'));
      setAnimatedElements(prev => new Set(prev).add('flaskIcon'));
      
      if (heroTitleRef.current) heroTitleRef.current.classList.add('animate-visible');
      if (heroTextRef.current) heroTextRef.current.classList.add('animate-visible');
      if (flaskIconRef.current) flaskIconRef.current.classList.add('animate-visible');
    }, 100);
    
    return () => clearTimeout(timer);
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
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse animate-fade-in delay-1000" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-pulse delay-700 animate-fade-in delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000 animate-fade-in delay-1000" />
        {/* Additional floating elements for more engagement */}
        <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-primary/5 rounded-full blur-2xl animate-bounce delay-300 animate-fade-in delay-1000" />
        <div className="absolute bottom-1/3 left-1/3 w-40 h-40 bg-secondary/5 rounded-full blur-2xl animate-bounce delay-1000 animate-fade-in delay-1000" />
      </div>

      {/* Header with Login Button */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border hover:bg-background/90 transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={scrollToAuth}>
            <div className="transform group-hover:rotate-12 transition-transform duration-300">
              <Beaker className="w-8 h-8 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">Virtual Chemistry Lab</span>
          </div>
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
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background"></div>
        </div>
        
        {/* Floating lab equipment icons in hero section */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Beaker className="absolute top-20 left-10 w-16 h-16 text-primary/20 animate-pulse animate-fade-in delay-700" />
          <FlaskConical className="absolute top-40 right-20 w-20 h-20 text-secondary/20 animate-pulse delay-300 animate-fade-in delay-800" />
          <TestTube2 className="absolute bottom-40 left-1/4 w-12 h-12 text-accent/20 animate-pulse delay-700 animate-fade-in delay-900" />
          <Beaker className="absolute bottom-20 right-10 w-14 h-14 text-primary/20 animate-pulse delay-1000 animate-fade-in delay-1000" />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div ref={flaskIconRef} className="inline-block mb-6 transform hover:scale-110 transition-transform duration-300 cursor-pointer animate-fade-in" onClick={scrollToAuth}>
              <div className="relative">
                <FlaskConical className="w-20 h-20 text-primary glow-cyan mx-auto" />
                <div className="absolute inset-0 animate-ping opacity-20">
                  <FlaskConical className="w-20 h-20 text-primary mx-auto" />
                </div>
              </div>
            </div>
            <h1 ref={heroTitleRef} className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight text-glow-cyan animate-fade-in">
              Virtual Chemistry Lab – Learn, Experiment, Explore
            </h1>
            <p ref={heroTextRef} className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto animate-fade-in delay-300">
              Experience cutting-edge simulation-based chemistry learning with realistic reactions, 
              interactive equipment, and guided experiments designed for students and learners worldwide.
            </p>
            <div className="flex justify-center mt-8">
              <Button 
                onClick={scrollToAuth}
                size="lg" 
                className="text-lg px-8 py-6 shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all bg-gradient-to-r from-primary to-secondary text-white animate-fade-in delay-500"
              >
                Enter Lab
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-card/30 backdrop-blur-sm" id="about">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-16">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-12 animate-fade-in">
              About the Virtual Chemistry Lab Platform
            </h2>
            
            <div className="space-y-12">
              {/* Card 1: Image Left, Text Right */}
              <Card ref={card1Ref} className="overflow-hidden bg-card/70 border-border backdrop-blur-md hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 transform hover:-translate-y-2 rounded-2xl border-2 animate-slide-up group cursor-pointer">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-full flex items-center justify-center p-8 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-l-2xl group-hover:from-primary/20 group-hover:to-secondary/20 transition-all duration-300 animate-fade-in delay-100">
                    <img 
                      src={chemistryLab1} 
                      alt="Chemistry Laboratory Equipment" 
                      className="w-48 h-48 object-contain transition-transform duration-300 group-hover:scale-110 animate-fade-in delay-200"
                    />
                  </div>
                  <div className="p-10 flex flex-col justify-center animate-fade-in delay-300">
                    <div className="flex items-center gap-4 mb-5 animate-fade-in delay-400">
                      <div className="p-4 rounded-xl bg-primary/15 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/25 animate-fade-in delay-500">
                        <FlaskConical className="w-10 h-10 text-primary" />
                      </div>
                      <h3 className="text-3xl font-bold text-foreground animate-fade-in delay-600">Realistic Simulations</h3>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-6 animate-fade-in delay-700">
                      Experience immersive chemistry experiments in a safe virtual environment with realistic reactions and laboratory equipment.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Card 2: Text Left, Image Right */}
              <Card ref={card2Ref} className="overflow-hidden bg-card/70 border-border backdrop-blur-md hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 transform hover:-translate-y-2 rounded-2xl border-2 animate-slide-up delay-200 group cursor-pointer">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="p-10 flex flex-col justify-center order-2 md:order-1 animate-fade-in delay-300">
                    <div className="flex items-center gap-4 mb-5 animate-fade-in delay-400">
                      <div className="p-4 rounded-xl bg-secondary/15 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-secondary/25 animate-fade-in delay-500">
                        <Beaker className="w-10 h-10 text-secondary" />
                      </div>
                      <h3 className="text-3xl font-bold text-foreground animate-fade-in delay-600">Interactive Learning</h3>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-6 animate-fade-in delay-700">
                      Follow guided experiments and explore chemistry at your own pace with dynamic visualizations and scientifically accurate simulations.
                    </p>
                  </div>
                  <div className="relative h-64 md:h-full flex items-center justify-center p-8 bg-gradient-to-br from-secondary/10 to-accent/10 order-1 md:order-2 rounded-r-2xl group-hover:from-secondary/20 group-hover:to-accent/20 transition-all duration-300 animate-fade-in delay-800">
                    <img 
                      src={chemistryLab2} 
                      alt="Virtual Chemistry Experiments" 
                      className="w-48 h-48 object-contain transition-transform duration-300 group-hover:scale-110 animate-fade-in delay-900"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section ref={authRef} id="auth-section" className="py-20 bg-background animate-fade-in relative overflow-hidden">
        {/* Combined background animations for login form */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Floating animations from top of page */}
          <div className="absolute top-16 left-16 text-neon-cyan/15 animate-bounce animate-fade-in delay-300">
            <Beaker size={28} />
          </div>
          <div className="absolute bottom-16 right-16 text-neon-purple/15 animate-bounce delay-500 animate-fade-in delay-500">
            <FlaskConical size={28} />
          </div>
          <div className="absolute top-24 right-24 text-accent/15 animate-bounce delay-1000 animate-fade-in delay-700">
            <TestTube2 size={28} />
          </div>
          
          {/* Floating icons from hero section */}
          <Beaker className="absolute top-1/3 left-12 w-10 h-10 text-primary/10 animate-pulse animate-fade-in delay-300" />
          <FlaskConical className="absolute top-1/2 right-16 w-14 h-14 text-secondary/10 animate-pulse delay-300 animate-fade-in delay-400" />
          <TestTube2 className="absolute bottom-1/3 left-1/3 w-8 h-8 text-accent/10 animate-pulse delay-700 animate-fade-in delay-500" />
          
          {/* Additional floating icons around login form */}
          <Beaker className="absolute top-20 left-20 w-8 h-8 text-neon-cyan/10 animate-pulse animate-fade-in delay-600" />
          <FlaskConical className="absolute top-20 right-20 w-12 h-12 text-neon-purple/10 animate-pulse delay-300 animate-fade-in delay-700" />
          <TestTube2 className="absolute bottom-20 left-20 w-6 h-6 text-accent/10 animate-pulse delay-700 animate-fade-in delay-800" />
          <Beaker className="absolute bottom-20 right-20 w-10 h-10 text-primary/10 animate-pulse delay-1000 animate-fade-in delay-900" />
          
          {/* Blinking animations */}
          <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-neon-cyan/5 rounded-full blur-3xl animate-pulse animate-fade-in delay-300" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-neon-purple/5 rounded-full blur-3xl animate-pulse delay-700 animate-fade-in delay-500" />
          <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000 animate-fade-in delay-700" />
          
          {/* Additional interactive elements */}
          <div className="absolute top-10 left-10 w-24 h-24 bg-primary/5 rounded-full blur-xl animate-ping opacity-30 delay-500 animate-fade-in delay-400" />
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-secondary/5 rounded-full blur-xl animate-ping opacity-30 delay-1000 animate-fade-in delay-600" />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto relative z-10">
            <Card className="relative overflow-hidden border-primary/30 shadow-2xl shadow-primary/20 backdrop-blur-2xl bg-card/95 glass-panel holographic-border transform transition-all duration-300 hover:scale-[1.02] group">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 animate-pulse"></div>
              
              <div className="relative p-10 space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                  <div className="flex justify-center gap-4 mb-8">
                    <div className="transform hover:rotate-12 transition-transform duration-300 cursor-pointer animate-fade-in delay-100">
                      <Beaker className="w-12 h-12 text-primary animate-pulse" />
                    </div>
                    <div className="transform hover:rotate-12 transition-transform duration-300 delay-150 cursor-pointer animate-fade-in delay-200">
                      <FlaskConical className="w-12 h-12 text-secondary animate-pulse delay-150" />
                    </div>
                    <div className="transform hover:rotate-12 transition-transform duration-300 delay-300 cursor-pointer animate-fade-in delay-300">
                      <TestTube2 className="w-12 h-12 text-accent animate-pulse delay-300" />
                    </div>
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-fade-in delay-400">
                    {isLogin ? "Welcome Back" : "Create Account"}
                  </h2>
                  <p className="text-muted-foreground text-lg animate-fade-in delay-500">
                    {isLogin 
                      ? "Sign in to access your virtual lab" 
                      : "Join our community of chemistry enthusiasts"}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in delay-600">
                  {!isLogin && (
                    <div className="space-y-3 animate-fade-in delay-700">
                      <Label htmlFor="fullName" className="text-foreground text-lg">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Dr. Marie Curie"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required={!isLogin}
                        className="bg-input/60 border-2 border-border focus:border-primary focus:glow-cyan transition-all py-6 text-lg rounded-xl hover:shadow-md hover:shadow-primary/10"
                      />
                    </div>
                  )}

                  <div className="space-y-3 animate-fade-in delay-800">
                    <Label htmlFor="email" className="text-foreground text-lg">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="chemist@lab.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-input/60 border-2 border-border focus:border-primary focus:glow-cyan transition-all py-6 text-lg rounded-xl hover:shadow-md hover:shadow-primary/10"
                    />
                  </div>

                  <div className="space-y-3 animate-fade-in delay-900">
                    <Label htmlFor="password" className="text-foreground text-lg">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-input/60 border-2 border-border focus:border-primary focus:glow-cyan transition-all py-6 text-lg rounded-xl hover:shadow-md hover:shadow-primary/10"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full shadow-xl shadow-primary/40 hover:shadow-primary/60 transition-all glow-cyan font-bold text-lg py-7 rounded-xl transform hover:scale-105 duration-300 mt-6 animate-fade-in delay-1000"
                    disabled={loading}
                  >
{loading ? (
                      <span className="flex items-center gap-3">
                        <div className="w-5 h-5 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                        {isLogin ? "Entering Lab..." : "Creating Account..."}
                      </span>
                    ) : (
                      <>
                        <FlaskConical className="w-6 h-6 mr-2" />
                        {isLogin ? "Enter Lab" : "Create Account"}
                      </>
                    )}
                  </Button>
                </form>

                {/* Toggle */}
                <div className="text-center pt-6 border-t-2 border-border/50 mt-4 animate-fade-in delay-1000">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-base text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {isLogin ? (
                      <>
                        Don't have an account?{" "}
                        <span className="text-primary font-bold hover:underline">Sign Up</span>
                      </>
                    ) : (
                      <>
                        Already have an account?{" "}
                        <span className="text-primary font-bold hover:underline">Enter Lab</span>
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
      <footer ref={footerRef} className="py-12 border-t border-border bg-card/30">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="animate-fade-in">
              <h4 className="text-foreground font-semibold mb-4">Menu</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="animate-fade-in delay-100"><a href="#" className="hover:text-primary transition-colors">Home</a></li>
                <li className="animate-fade-in delay-200"><a href="#about" className="hover:text-primary transition-colors">About us</a></li>
                <li className="animate-fade-in delay-300"><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div className="animate-fade-in delay-200">
              <h4 className="text-foreground font-semibold mb-4">Feedback</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="animate-fade-in delay-300"><a href="#" className="hover:text-primary transition-colors">Email</a></li>
                <li className="animate-fade-in delay-400"><a href="#" className="hover:text-primary transition-colors">Chat</a></li>
                <li className="animate-fade-in delay-500"><a href="#" className="hover:text-primary transition-colors">Help</a></li>
              </ul>
            </div>
            <div className="animate-fade-in delay-400">
              <h4 className="text-foreground font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="animate-fade-in delay-500"><a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Facebook</a></li>
                <li className="animate-fade-in delay-600"><a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Instagram</a></li>
                <li className="animate-fade-in delay-700"><a href="" onClick={() => window.location.reload()} className="hover:text-primary transition-colors">Website</a></li>
              </ul>
            </div>
            <div className="animate-fade-in delay-600">
              <div className="flex items-center gap-2 mb-4">
                <Beaker className="w-6 h-6 text-primary animate-fade-in delay-700" />
                <span className="text-foreground font-bold animate-fade-in delay-700">Virtual Chemistry Lab</span>
              </div>
              <p className="text-muted-foreground text-sm animate-fade-in delay-800">
                123 Thritrisan Science City<br />
                KA, India
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground text-sm animate-fade-in delay-1000">
            <p>© 2025 Virtual Chemistry Lab. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Auth;
