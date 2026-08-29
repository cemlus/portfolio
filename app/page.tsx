import SiteHeader from '@/components/SiteHeader';
import Notebook from '@/components/Notebook';

export default function Home() {
  return (
    <>
      <SiteHeader
        title="Three systems, and how I got them wrong first."
        say={
          <>
            The wrong hypothesis, the measurement that killed it, <em>the fix that survived.</em>
          </>
        }
        meta="13.08s → 2.62s · 0.00% errors · +27% throughput"
      />
      <Notebook />
    </>
  );
}
