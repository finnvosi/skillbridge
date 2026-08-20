"use client";

import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { FadeUp } from "@/components/motion";

const faqItems = [
  {
    question: "Is SkillBridge only for tech roles?",
    answer:
      "No. Any student with real, demonstrable work can build a verified record and get discovered. That includes design, data, writing, operations, engineering, and more.",
  },
  {
    question: "How is a profile verified?",
    answer:
      "Each project is attested by the employer or lecturer who saw the work. There is no self-claiming badge. Verification tells you who reviewed the evidence and what they confirmed.",
  },
  {
    question: "Does it cost students anything?",
    answer:
      "Creating a student profile and applying is free. Employers pay to post and manage verified opportunities.",
  },
  {
    question: "Where does my record live?",
    answer:
      "With you. Your record is portable, so when you move cities or roles, your proof moves with you instead of staying locked in one inbox.",
  },
];

export function FaqManifesto() {
  return (
    <section
      className="border-b border-gray-200 bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
      aria-labelledby="faq-title"
    >
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-12 lg:gap-20">
        <FadeUp className="lg:col-span-4">
          <p className="label-mono">Questions</p>
          <h2
            id="faq-title"
            className="display mt-5 max-w-[8ch] text-5xl leading-[0.94] sm:text-6xl"
          >
            The short version.
          </h2>
          <p className="mt-6 max-w-[34ch] text-base leading-relaxed text-gray-600">
            The useful answers before you decide whether SkillBridge is for you.
          </p>
          <Link
            href="/auth/register"
            className="group mt-8 inline-flex min-h-11 items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
          >
            Start with proof
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </FadeUp>

        <div className="lg:col-span-8">
          {faqItems.map((item, index) => (
            <FadeUp key={item.question} delay={index * 0.05}>
              <details
                className="group border-t border-gray-200"
                open={index === 0}
              >
                <summary className="-mx-3 flex min-h-[88px] cursor-pointer list-none items-center justify-between gap-6 rounded-xl px-3 py-5 transition-colors duration-300 group-open:bg-[#F6F1FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 sm:-mx-5 sm:px-5 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start gap-4 sm:gap-6">
                    <span className="pt-1 font-mono text-[10px] tracking-[0.18em] text-primary/55 transition-colors group-open:text-primary">
                      0{index + 1}
                    </span>
                    <span className="font-display text-xl font-bold tracking-[-0.02em] text-gray-900 transition-colors group-open:text-primary sm:text-2xl">
                      {item.question}
                    </span>
                  </span>
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-primary transition-colors group-hover:border-primary/40 group-open:border-primary group-open:bg-primary group-open:text-white"
                    aria-hidden="true"
                  >
                    <Plus className="h-4 w-4 transition-transform duration-200 group-open:rotate-45" />
                  </span>
                </summary>
                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr]">
                  <div className="overflow-hidden">
                    <div className="mb-5 ml-10 border-l-2 border-primary/25 bg-[#FBF9FF] px-5 py-4 sm:ml-14 sm:px-6">
                      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-primary/65">
                        Answer
                      </p>
                      <p className="mt-2 max-w-[58ch] text-base leading-relaxed text-gray-600">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </details>
            </FadeUp>
          ))}
          <div className="border-t border-gray-200" />
        </div>
      </div>
    </section>
  );
}
