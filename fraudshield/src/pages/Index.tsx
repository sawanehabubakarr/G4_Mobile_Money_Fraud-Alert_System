import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, BarChart3, Users, ArrowRight, CheckCircle } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold tracking-tight">FraudShield</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-risk-high/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8">
              <Shield className="h-4 w-4" />
              Real-time Fraud Detection
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Protect Your Mobile Money
              <span className="block text-primary">Transactions</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Advanced fraud detection system that monitors transactions in real-time,
              identifies suspicious patterns, and protects your financial ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="gap-2 text-lg px-8">
                  Start Protecting Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/40 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "99.9%", label: "Detection Accuracy" },
              { value: "<50ms", label: "Response Time" },
              { value: "10M+", label: "Transactions Protected" },
              { value: "24/7", label: "Real-time Monitoring" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comprehensive Fraud Protection
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our multi-layered approach ensures your transactions are protected at every step
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: AlertTriangle,
                title: "Real-time Alerts",
                description: "Instant notifications for suspicious activities with detailed risk assessments",
                color: "text-risk-high",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Comprehensive dashboards with transaction patterns and fraud trends",
                color: "text-primary",
              },
              {
                icon: Shield,
                title: "Rule-based Detection",
                description: "Customizable fraud rules with adjustable thresholds and risk weights",
                color: "text-risk-safe",
              },
              {
                icon: Users,
                title: "User Management",
                description: "Role-based access control with admin and user dashboards",
                color: "text-primary",
              },
              {
                icon: CheckCircle,
                title: "Transaction Verification",
                description: "Multi-factor verification for high-risk transactions",
                color: "text-risk-safe",
              },
              {
                icon: BarChart3,
                title: "Detailed Reports",
                description: "Export comprehensive reports and audit logs for compliance",
                color: "text-risk-medium",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl border border-border/40 bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300"
              >
                <feature.icon className={`h-10 w-10 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Secure Your Transactions?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Join thousands of businesses protecting their mobile money ecosystem with FraudShield
          </p>
          <Link to="/auth">
            <Button size="lg" className="gap-2 text-lg px-8">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="font-semibold">FraudShield</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 FraudShield. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
