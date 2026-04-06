import { Link } from "react-router-dom";
import { GlobalFooter } from "@/components/GlobalFooter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function Landing() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      {/* Nav */}
      <header className="absolute top-0 w-full z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold tracking-tight text-[#1a1a1a] flex items-center gap-2">
            <span className="text-black text-2xl">💰</span> budgetadvisor.ai
          </Link>
          <nav className="hidden md:flex items-center gap-8"></nav>
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/login"
              className="text-sm font-medium text-[#1a1a1a] hover:text-gray-600 transition-colors px-3 py-2"
            >
              Log In
            </Link>
            <Button asChild className="rounded-full bg-[#1a1a1a] text-white hover:bg-black/80 px-6 font-medium shadow-none">
              <Link to="/register">Get started</Link>
            </Button>
          </div>
          <button className="md:hidden p-2 text-[#1a1a1a]" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-white border-b border-gray-100 px-4 py-4 space-y-3 shadow-sm absolute w-full left-0 top-20">
            <div className="flex gap-2 pt-2">
              <Button variant="outline" asChild className="flex-1 rounded-full border-gray-200">
                <Link to="/login">Log In</Link>
              </Button>
              <Button asChild className="flex-1 rounded-full bg-[#1a1a1a] text-white">
                <Link to="/register">Get started</Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden pt-36 pb-20 sm:pt-48 sm:pb-32 bg-gradient-to-b from-[#F5F6FE] to-white">
        <div className="max-w-4xl mx-auto px-4 text-center z-10 relative">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
            className="inline-flex items-center gap-2 mb-8 bg-white/60 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium text-gray-700 shadow-sm border border-purple-100"
          >
            <span className="text-purple-500">✨</span> Budget Advisor App
          </motion.div>
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
            className="text-5xl sm:text-7xl lg:text-[5rem] font-semibold tracking-tight text-balance leading-[1.05] text-[#1a1a1a] mb-6"
          >
            Manage Your Family<br className="hidden sm:block" /> Finances with AI
          </motion.h1>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1, duration: 0.5, ease: [0.2, 0, 0, 1] }}
            className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            An AI-powered advisor that will help families manage their expenses and get unclaimed benefits seamlessly.
          </motion.p>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2, duration: 0.5, ease: [0.2, 0, 0, 1] }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="rounded-full bg-[#A297FF] hover:bg-[#8e81f1] text-white px-8 h-14 text-base font-semibold shadow-md shadow-purple-500/20">
              <Link to="/register">
                Get started
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="rounded-full border-none bg-white text-[#A297FF] hover:bg-gray-50 px-8 h-14 text-base font-semibold shadow-sm">
              <a href="#how-it-works">Learn More</a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Section 1 & 2 wrapper */}
      <section className="bg-white py-20 sm:py-32">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1a1a1a] mb-6 font-[Handlee,sans-serif]">
              Family Budget management
            </h2>
            <p className="text-xl text-gray-600 font-[Handlee,sans-serif]">
              Track expenses across all your individual spending and family spending. It all starts with a simple steps.
            </p>
          </div>

          <div className="space-y-24 md:space-y-40">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
               <div className="order-2 md:order-1 h-full min-h-[350px] flex items-center justify-center p-10 bg-[#FDF9F3] rounded-[2.5rem] border border-orange-100">
                <div className="space-y-6">
                   <div className="size-16 rounded-2xl bg-white shadow-sm border border-orange-100 flex items-center justify-center text-3xl">
                      🤖
                   </div>
                   <h3 className="text-3xl font-semibold text-[#1a1a1a]">1. Snap your receipt</h3>
                   <p className="text-xl text-gray-600 leading-relaxed">
                     Take a photo of any receipt - our AI pulls the merchant, date, and amount automatically (in 150+ currencies).
                   </p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="bg-[#FAF9F8] rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden aspect-square md:aspect-auto md:h-[550px]">
                   <div className="absolute inset-x-8 top-12 bottom-0 bg-white rounded-t-[2rem] shadow-2xl border border-gray-200 overflow-hidden flex flex-col transform transition-transform hover:-translate-y-2 duration-500">
                      <div className="h-14 border-b border-gray-100 flex items-center px-6 justify-between bg-gray-50/50">
                        <div className="text-sm font-semibold text-gray-500">Scanning Receipt...</div>
                        <div className="size-3 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981] animate-pulse"></div>
                      </div>
                      <div className="flex-1 bg-gray-100 p-6 relative">
                        <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop" alt="Receipt" className="w-full h-full object-cover rounded-xl" />
                        <div className="absolute inset-x-6 top-1/3 h-1 bg-[#A297FF] shadow-[0_0_12px_#A297FF] animate-[pulse_2s_ease-in-out_infinite]"></div>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div className="order-1 md:order-1">
                <div className="bg-[#F8F9FA] rounded-[2.5rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden aspect-square md:aspect-auto md:h-[550px] flex items-center justify-center">
                  <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 space-y-6 transform transition-transform hover:-translate-y-2 duration-500">
                     <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                       <span className="font-semibold text-xl text-gray-800">Extracted Items</span>
                       <span className="text-[#A297FF] font-semibold text-xl">£42.50</span>
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                          <div className="size-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">☕</div>
                          <div>
                            <div className="font-semibold text-gray-800">Coffee Shop</div>
                            <div className="text-sm text-gray-500 font-medium">Food & Drink</div>
                          </div>
                          <div className="ml-auto font-semibold text-gray-800">£4.50</div>
                        </div>
                        <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                          <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">🛒</div>
                          <div>
                            <div className="font-semibold text-gray-800">Grocery Store</div>
                            <div className="text-sm text-gray-500 font-medium">Groceries</div>
                          </div>
                          <div className="ml-auto font-semibold text-gray-800">£38.00</div>
                        </div>
                     </div>
                     <div className="pt-2">
                       <Button className="w-full rounded-2xl h-14 bg-[#1a1a1a] text-white hover:bg-black/90 text-lg shadow-lg">
                         Submit expense
                       </Button>
                     </div>
                  </div>
                </div>
              </div>
               <div className="order-2 md:order-2 h-full min-h-[350px] flex items-center p-10 bg-[#F4FBDE] rounded-[2.5rem] border border-green-100">
                <div className="space-y-6">
                   <div className="size-16 rounded-2xl bg-white shadow-sm border border-green-100 flex items-center justify-center text-3xl">
                      ✅
                   </div>
                   <h3 className="text-3xl font-semibold text-[#1a1a1a]">2. Submit</h3>
                   <p className="text-xl text-gray-600 leading-relaxed">
                     Real time extraction of information that you can edit. and Submit it - Expenses are organized into a report for you. Just tap Submit when you're ready.
                   </p>
                </div>
              </div>
            </div>

            {/* Step 3: AI powered budget advisor agent */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <div className="order-1 md:order-1">
                 <div className="bg-white p-4 rounded-[2.5rem] shadow-xl border border-gray-100 transform transition-transform hover:-translate-y-2 duration-500">
                   <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop" alt="Student using app" className="rounded-[2rem] object-cover aspect-square md:aspect-[4/3] w-full" />
                 </div>
              </div>
              <div className="order-2 md:order-2 h-full min-h-[350px] flex items-center p-10 bg-[#F5F6FE] rounded-[2.5rem] border border-purple-100">
                 <div className="space-y-6">
                   <div className="size-16 rounded-2xl bg-white shadow-sm border border-purple-100 flex items-center justify-center text-3xl">
                      🧠
                   </div>
                   <h3 className="text-3xl font-semibold text-[#1a1a1a]">AI powered budget advisor agent.</h3>
                   <p className="text-xl text-gray-600 leading-relaxed">
                     Your personal 24/7 advisor available to advise you on your spending. Wondering how much you have been spending? Ask your agent to break down your expenses. Before spending ask agent if this meets your budget.
                   </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Benefits Agent */}
      <section className="py-24 sm:py-32 bg-[#FAF9F8] overflow-hidden border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1a1a1a] mb-6">Benefits Agent</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We have an agent that will find different benefits and bring them to the door step of the users. Thousands of families in Europe miss billions of Euros in unclaimed benefits. Our benefits agent helps to find benefits.
          </p>
        </div>

        {/* Carousel / Marquee */}
        <div className="relative flex overflow-x-hidden group pb-12 w-full max-w-[100vw]">
          <div className="flex animate-marquee group-hover:[animation-play-state:paused] gap-8 px-8 cursor-grab active:cursor-grabbing">
            {[1, 2, 3].map((item, idx) => (
              <div key={`benefits-1-${idx}`} className="flex-none w-[350px] sm:w-[550px] bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row transition-transform hover:scale-[1.02] duration-300">
                <div className="sm:w-2/5 aspect-[4/3] sm:aspect-auto">
                  <img src={[
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=600&auto=format&fit=crop"
                  ][idx]} alt="Benefit category" className="w-full h-full object-cover" />
                </div>
                <div className="p-8 sm:w-3/5 flex flex-col justify-center">
                  <h4 className="text-2xl font-semibold text-[#1a1a1a] mb-3">
                    {["Grocery Vouchers", "Child Support", "Energy Grants"][idx]}
                  </h4>
                  <p className="text-gray-500 text-lg leading-relaxed">
                    {["Are you eligible for monthly supermarket subsidies? Our agent will check.", "Find out if you qualify for childcare benefits in your local area.", "Claim up to £400 towards your winter energy costs seamlessly."][idx]}
                  </p>
                </div>
              </div>
            ))}
             {[1, 2, 3].map((item, idx) => (
              <div key={`benefits-2-${idx}`} className="flex-none w-[350px] sm:w-[550px] bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col sm:flex-row transition-transform hover:scale-[1.02] duration-300">
                <div className="sm:w-2/5 aspect-[4/3] sm:aspect-auto">
                  <img src={[
                    "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=600&auto=format&fit=crop"
                  ][idx]} alt="Benefit category" className="w-full h-full object-cover" />
                </div>
                <div className="p-8 sm:w-3/5 flex flex-col justify-center">
                  <h4 className="text-2xl font-semibold text-[#1a1a1a] mb-3">
                    {["Grocery Vouchers", "Child Support", "Energy Grants"][idx]}
                  </h4>
                  <p className="text-gray-500 text-lg leading-relaxed">
                    {["Are you eligible for monthly supermarket subsidies? Our agent will check.", "Find out if you qualify for childcare benefits in your local area.", "Claim up to £400 towards your winter energy costs seamlessly."][idx]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Wrapper */}
      <section className="bg-white py-32">
         <div className="max-w-4xl mx-auto px-4 text-center">
           <h2 className="text-4xl md:text-[3.5rem] font-semibold tracking-tight text-[#1a1a1a] mb-10 leading-[1.1]">
             Ready to be in control of your grocery shopping and do you to ensure you don't leave any penny unclaimed
           </h2>
           <Button asChild size="lg" className="rounded-full bg-[#A297FF] hover:bg-[#8e81f1] text-white px-10 h-16 text-xl shadow-md shadow-purple-500/20">
              <Link to="/register">Join budgetadvisor.ai</Link>
           </Button>
         </div>
      </section>

      <GlobalFooter />
    </div>
  );
}
