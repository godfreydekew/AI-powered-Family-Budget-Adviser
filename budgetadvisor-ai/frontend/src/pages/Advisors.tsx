import { Link } from "react-router-dom";
import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout";
import { ArrowRight, TrendingDown, ShieldCheck } from "lucide-react";

const ADVISORS = [
  {
    to: "/advisor",
    icon: TrendingDown,
    iconBg: "bg-primary",
    iconColor: "text-primary-foreground",
    accentLine: "bg-primary",
    title: "Budget Advisor",
    tagline: "Understand your spending",
    description:
      "Ask about your receipts, monthly totals, category breakdowns, budget forecasts, and savings. Powered by your real transaction data.",
    prompts: [
      "How much did I spend this month?",
      "Will I go over budget?",
      "Show me my last receipt",
    ],
  },
  {
    to: "/benefits",
    icon: ShieldCheck,
    iconBg: "bg-accent",
    iconColor: "text-accent-foreground",
    accentLine: "bg-accent",
    title: "Benefits Advisor",
    tagline: "Know what you're entitled to",
    description:
      "Ask about UK benefits — eligibility criteria, payment rates, how to apply, managed migration, and your appeal rights.",
    prompts: [
      "Am I eligible for Universal Credit?",
      "How much is the carer element?",
      "How do I appeal a decision?",
    ],
  },
];

export default function AdvisorsPage() {
  return (
    <AuthenticatedLayout>
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        {/* Heading */}
        <div className="space-y-1.5">
          <h1 className="text-3xl font-semibold tracking-tight">Advisors</h1>
          <p className="text-muted-foreground text-sm">
            Choose an advisor to get started — each one is trained on a different knowledge base.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {ADVISORS.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.to}
                to={a.to}
                className="group relative flex flex-col rounded-2xl border border-border bg-card shadow-finio-sm hover:shadow-finio-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
              >
                {/* Top accent line */}
                <div className={`h-0.5 w-full ${a.accentLine}`} />

                <div className="flex flex-col gap-4 p-6 flex-1">
                  {/* Icon + title */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`size-11 rounded-xl ${a.iconBg} flex items-center justify-center shadow-sm`}
                    >
                      <Icon className={`size-5 ${a.iconColor}`} />
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-150 mt-1" />
                  </div>

                  <div>
                    <h2 className="text-base font-semibold">{a.title}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.tagline}</p>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {a.description}
                  </p>

                  {/* Example prompts */}
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                      Example questions
                    </p>
                    <ul className="space-y-1">
                      {a.prompts.map((p) => (
                        <li
                          key={p}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <span className="size-1 rounded-full bg-muted-foreground/40 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
