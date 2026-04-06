import { Link } from "react-router-dom";
import { GlobalFooter } from "@/components/GlobalFooter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F6FE] to-white flex flex-col">
      <header className="sticky top-0 z-30 bg-transparent border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold tracking-tight text-[#1a1a1a] flex items-center">
            <span className="text-black text-2xl mr-2">💰</span> budgetadvisor.ai
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm font-medium text-gray-500 hover:text-[#1a1a1a] transition-colors px-3 py-2">Home</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="bg-white shadow-2xl border border-gray-100 p-8 sm:p-12 space-y-8 rounded-[2.5rem]">
          <h1 className="text-3xl font-bold tracking-tight text-[#1a1a1a]">Privacy Policy</h1>
          <p className="text-gray-500 text-sm font-medium">Last updated: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-gray-600">
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[#1a1a1a]">1. Introduction</h2>
              <p>Welcome to BudgetAdvisor.ai. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[#1a1a1a]">2. Information We Collect</h2>
              <p>We collect personal information that you provide to us such as name, address, contact information, passwords and security data, and payment information.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Personal Data: Email, Full Name.</li>
                <li>Financial Data: Receipt images, spending habits, categories.</li>
                <li>Analytics Data: Device information, usage patterns.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[#1a1a1a]">3. How We Use Your Information</h2>
              <p>We use personal information collected via our Website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[#1a1a1a]">4. Will Your Information be Shared with Anyone?</h2>
              <p>We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[#1a1a1a]">5. How Long Do We Keep Your Information?</h2>
              <p>We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[#1a1a1a]">6. Your Privacy Rights</h2>
              <p>In some regions, such as the European Economic Area (EEA) and United Kingdom (UK), you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.</p>
            </section>
          </div>
        </div>
      </main>

      <GlobalFooter />
    </div>
  );
}
