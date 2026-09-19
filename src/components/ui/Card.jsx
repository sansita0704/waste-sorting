export default function Card({ className = "", children }) {
  return (
    <section className={`rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-md ${className}`}>
      {children}
    </section>
  );
}
