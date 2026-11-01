export default function Hero() {
  return (
    <section className="relative mx-auto max-w-5xl px-4 pb-14 pt-20 text-center sm:px-6 sm:pt-28">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-slate-300">
        <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
        Your guide through unfamiliar code
      </div>
      <h1 className="mx-auto max-w-3xl text-5xl font-semibold tracking-[-0.04em] text-white sm:text-7xl">
        Understand any{" "}
        <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
          repository
        </span>{" "}
        in seconds.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
        Navigate complex open-source projects with an AI-generated map of the
        architecture, roadmap, and best place to start.
      </p>
    </section>
  );
}