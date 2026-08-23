import { Outlet } from "react-router-dom";
import { Link2 } from "lucide-react";
import Navbar from "./components/layout/Navbar";
import { AnimatePresence, motion } from "framer-motion";

const Layout = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Star field */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
      >
        <div className="absolute left-[7%] top-[9%] h-1 w-1 rounded-full bg-white/25" />
        <div className="absolute left-[16%] top-[27%] h-[3px] w-[3px] rounded-full bg-white/20" />
        <div className="absolute left-[24%] top-[12%] h-1 w-1 rounded-full bg-white/30" />
        <div className="absolute left-[34%] top-[42%] h-[3px] w-[3px] rounded-full bg-white/20" />
        <div className="absolute left-[45%] top-[18%] h-1 w-1 rounded-full bg-white/25" />
        <div className="absolute left-[56%] top-[31%] h-[3px] w-[3px] rounded-full bg-white/20" />
        <div className="absolute left-[67%] top-[11%] h-1 w-1 rounded-full bg-white/25" />
        <div className="absolute left-[77%] top-[38%] h-[3px] w-[3px] rounded-full bg-white/20" />
        <div className="absolute left-[89%] top-[18%] h-1 w-1 rounded-full bg-white/30" />
        <div className="absolute left-[94%] top-[52%] h-[3px] w-[3px] rounded-full bg-white/20" />

        <div className="absolute left-[5%] top-[72%] h-[3px] w-[3px] rounded-full bg-white/20" />
        <div className="absolute left-[19%] top-[84%] h-1 w-1 rounded-full bg-white/25" />
        <div className="absolute left-[38%] top-[73%] h-[3px] w-[3px] rounded-full bg-white/20" />
        <div className="absolute left-[57%] top-[87%] h-1 w-1 rounded-full bg-white/25" />
        <div className="absolute left-[73%] top-[76%] h-[3px] w-[3px] rounded-full bg-white/20" />
        <div className="absolute left-[87%] top-[86%] h-1 w-1 rounded-full bg-white/25" />
      </div>

      {/* Purple ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[40%] h-[500px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-950/10 blur-[120px]"
        aria-hidden="true"
      />

      {/* Overlapping navbar */}
      <Navbar />

      <main className="relative z-10">
        {/* Global branding */}
        <section className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 pt-20 sm:pt-24">
          {/* Link icon */} 
          <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] shadow-[0_0_30px_rgba(139,92,246,0.08)]">
            <Link2 className="h-6 w-6 text-white/90" strokeWidth={2} />
          </div>

          {/* Brand */}
          <h1 className="mt-5 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text px-2 py-4 text-5xl font-bold tracking-[-0.03em] text-transparent sm:text-6xl">
            ReDirect.ly
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-center text-sm font-medium text-zinc-500 sm:text-base">
            Secure, fast, and reliable URL shortening service.
          </p>
        </section>

        {/* Route content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{
              opacity: 0,
              y: 12,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.98,
            }}
            transition={{
              duration: 0.22,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;
