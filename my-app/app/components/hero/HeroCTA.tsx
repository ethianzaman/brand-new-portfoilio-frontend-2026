import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Reveal from "@/app/components/motion/Reveal";

export default function HeroCTA() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 md:pb-20">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-3xl bg-indigo-600 p-8 sm:p-10 md:p-14 dark:bg-indigo-700">
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="animate-aurora absolute -top-20 -right-10 h-72 w-72 rounded-full bg-sky-400/40 blur-3xl" />
            <div className="animate-aurora-slow absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-violet-400/30 blur-3xl" />
          </div>
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <h2 className="mb-2 text-2xl font-bold text-white md:text-4xl">
                Have a project in mind?
              </h2>
              <p className="text-indigo-100">
                Let&apos;s work together and build something great.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="btn-shine shrink-0 gap-2 bg-white font-semibold text-indigo-600 transition-all hover:-translate-y-0.5 hover:bg-indigo-50"
            >
              <Link href="/contact">
                Get in touch <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
