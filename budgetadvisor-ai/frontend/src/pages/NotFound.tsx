import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { GlobalFooter } from "@/components/GlobalFooter";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#F5F6FE] to-white">
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-7xl font-semibold text-[#1a1a1a] tabular mb-4">404</p>
          <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
          <p className="text-gray-500 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="size-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
      <GlobalFooter />
    </div>
  );
};

export default NotFound;
