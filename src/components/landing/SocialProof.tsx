export function SocialProof() {
  return (
    <section className="py-24 border-y border-zinc-800/50 bg-zinc-950/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-10">
          Trusted by innovative teams worldwide
        </p>
        <div className="mx-auto grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          {/* Mock Logos made with CSS/SVG for premium look */}
          <div className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 flex items-center justify-center grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
            <span className="text-xl font-bold font-mono tracking-tighter text-zinc-300">ACME Corp</span>
          </div>
          <div className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 flex items-center justify-center grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
            <span className="text-xl font-bold italic tracking-tight text-zinc-300">Globex</span>
          </div>
          <div className="col-span-2 max-h-12 w-full object-contain lg:col-span-1 flex items-center justify-center grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
            <span className="text-xl font-extrabold tracking-widest text-zinc-300">SOYUZ</span>
          </div>
          <div className="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1 flex items-center justify-center grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
            <span className="text-xl font-medium tracking-normal text-zinc-300">Initech</span>
          </div>
          <div className="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1 flex items-center justify-center grayscale opacity-50 hover:opacity-100 hover:grayscale-0 transition-all duration-300">
            <span className="text-xl font-black tracking-tighter text-zinc-300">Umbrella</span>
          </div>
        </div>
      </div>
    </section>
  );
}
