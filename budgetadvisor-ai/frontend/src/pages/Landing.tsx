import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ScanLine,
  PieChart,
  Lightbulb,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function Landing() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 glass-nav border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold tracking-tight">
            <span className="text-accent">•</span> budgetadvisor.ai
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Log In
            </Link>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
          <button className="md:hidden p-2" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden border-t border-border bg-card px-4 py-4 space-y-3">
            <a href="#features" onClick={() => setMobileMenu(false)} className="block text-sm py-2">
              Features
            </a>
            <a href="#how-it-works" onClick={() => setMobileMenu(false)} className="block text-sm py-2">
              How It Works
            </a>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" asChild className="flex-1">
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="hero-gradient relative overflow-hidden pb-12 sm:pb-24">
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-40 text-center">
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
            className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tighter text-balance leading-[1.05]"
          >
            Your spending, <span className="text-accent">understood</span>.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1, duration: 0.5, ease: [0.2, 0, 0, 1] }}
            className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Scan receipts, track categories, and get AI-powered advice — built for families across Europe.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2, duration: 0.5, ease: [0.2, 0, 0, 1] }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button asChild size="lg">
              <Link to="/register">
                Get Started Free <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#how-it-works">See How It Works</a>
            </Button>
          </motion.div>
        </div>

        {/* Phone mockup */}
        <div className="relative max-w-sm mx-auto px-4 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.2, 0, 0, 1] }}
            className="relative bg-card rounded-[2.5rem] shadow-2xl border border-border overflow-hidden aspect-[9/16] max-h-[420px]"
          >
            <div className="p-6 pt-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-muted-foreground">Overview 2025</p>
                  <p className="text-sm font-medium mt-0.5">Account Balances</p>
                </div>
              </div>
              <p className="text-3xl font-semibold tabular">£7,482.15</p>
              <p className="text-xs text-success mt-1">▲ 54.09%</p>
              <div className="mt-6 h-16 flex items-end gap-1">
                {[32, 28, 35, 42, 38, 48].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-accent/20 rounded-t"
                    style={{ height: `${h * 1.2}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Floating chips — hidden on small screens to prevent clipping */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="hidden sm:block absolute -left-16 top-8 glass-card px-4 py-3 text-sm"
          >
            <p className="text-muted-foreground text-xs">Saved this year</p>
            <p className="font-semibold tabular">£2,400</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="hidden sm:block absolute -right-16 top-24 glass-card px-4 py-3 text-sm"
          >
            <p className="text-muted-foreground text-xs">Scan accuracy</p>
            <p className="font-semibold tabular">94%</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="hidden sm:block absolute left-1/2 -translate-x-1/2 -bottom-6 glass-card px-4 py-3 text-sm"
          >
            <p className="text-muted-foreground text-xs">Categories</p>
            <p className="font-semibold tabular">8 tracked</p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-4 py-12 sm:py-24">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center mb-8 sm:mb-16">
          Everything you need to understand your spending
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              icon: ScanLine,
              title: "Receipt Scanning with AI Vision",
              desc: "Point your camera at any receipt. Our AI extracts every line item in seconds.",
            },
            {
              icon: PieChart,
              title: "Smart Category Breakdown",
              desc: "See exactly where your money goes with automatic categorisation across 9 categories.",
            },
            {
              icon: Lightbulb,
              title: "Personalised Budget Advice",
              desc: "Get weekly AI insights tailored to your household's spending patterns.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.2, 0, 0, 1] }}
              className="glass-card p-8 space-y-4"
            >
              <div className="size-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <f.icon className="size-5 text-accent" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-secondary/50 py-12 sm:py-24">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center mb-8 sm:mb-16">How it works</h2>
          <div className="space-y-0 relative">
            <div className="absolute left-6 top-8 bottom-8 w-px bg-border hidden sm:block" />
            {[
              {
                step: "1",
                title: "Upload a receipt photo",
                desc: "Snap a photo or drag and drop. We support JPG, PNG, WebP, HEIC, and PDF.",
              },
              {
                step: "2",
                title: "AI extracts and categorises every item",
                desc: "Our vision model reads line items, prices, and promotions automatically.",
              },
              {
                step: "3",
                title: "Get insights tailored to your household",
                desc: "Weekly advice on where to save, what to swap, and how to hit your budget.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-6 py-8"
              >
                <div className="relative z-10 size-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-semibold shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="max-w-5xl mx-auto px-4 py-12 sm:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "50,000+", label: "receipts scanned" },
            { value: "£1.2M", label: "tracked" },
            { value: "12", label: "European countries" },
            { value: "Free", label: "to start" },
          ].map((s) => (
            <div key={s.label} className="space-y-1">
              <p className="text-2xl sm:text-3xl font-semibold tabular">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-semibold">
              <span className="text-accent">•</span> budgetadvisor.ai
            </p>
            <p className="text-sm text-muted-foreground mt-1">Your money, finally clear.</p>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 budgetadvisor.ai. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
