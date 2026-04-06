import { Link } from "react-router-dom";

export function GlobalFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <Link to="/" className="text-xl font-semibold tracking-tight text-[#1a1a1a] flex items-center gap-2">
            <span className="text-black text-2xl">💰</span> budgetadvisor.ai
          </Link>
          <p className="text-sm text-gray-500 font-medium mt-2">© {new Date().getFullYear()} budgetadvisor.ai. All rights reserved.</p>
        </div>
        <div className="flex gap-8 text-sm font-medium text-gray-500">
          <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
          <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Cookie Policy</a>
        </div>
      </div>
    </footer>
  );
}
