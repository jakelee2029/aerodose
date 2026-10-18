export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="border-b border-line bg-canvas px-4 py-5">
      <div className="mx-auto max-w-[1440px]">
        <h1 id="hero-title" className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          How much radiation do you get from flying?
        </h1>
        <p className="mt-2 max-w-[75ch] text-base text-fg-soft">
          Every flight passes through cosmic radiation that the atmosphere normally blocks. For most travelers it is tiny.
          For people who fly for work it adds up, and passengers rarely see their own number. AeroDose estimates the
          dose for any flight, shows who it adds up for, and helps you ask for better tracking.
        </p>
      </div>
    </section>
  );
}
