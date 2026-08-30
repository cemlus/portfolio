---
title: The fastest node was also the flakiest
date: 2026-03-28
tag: Distributed Systems
summary: Three scheduling policies for GridNode, and why the winning one is the only one that lets a machine lose work by being unreliable.
---

GridNode delegates compute jobs—from ML training to video rendering—to a
decentralized pool of volunteered hardware. I don't control this fleet. It's
composed of random laptops and spare desktop boxes that join, take work, and
vanish—sometimes politely, usually not. Everything downstream of this reality
dictates the architecture.

The scheduler evolved through three distinct phases before we found a model that
survived contact with reality.

## Round-robin, because it was obvious

The first placement policy was the one you write on autopilot: keep a rotating
pointer, hand the next job to the next available node. It is fair, but only in the
narrowest sense—every node gets its turn.

The fatal flaw? Capacity fragmentation. Spreading small jobs evenly across the fleet
leaves every machine with a little room, but no machine with enough. When a large
job arrives, it starves in the queue—not because the pool is full, but because the
available space is in the wrong shape. Small jobs kept flowing in and getting
placed, while heavy workloads sat blocked behind them.

Fairness at the node level resulted in starvation at the job level. Round-robin only
optimizes for the former.

## Rank on free capacity, because fragmentation was the problem

To fix fragmentation, we stopped rotating and started scoring. We evaluated every
node by its available room and sent the job to the machine with the most capacity.
This solved the fragmentation issue immediately—and introduced a much worse bug.

The node with the most free capacity is often the one that just spectacularly failed
its last job. A machine with a flaky network or a habit of going to sleep would drop
a job, reappear looking like the emptiest node in the fleet, and immediately be
rewarded with new work.

> Ranking solely on free capacity means unreliability is rewarded, because to the scheduler, failure is indistinguishable from availability.

We realized this when the requeue logs showed the same node IDs failing jobs and
instantly winning new placements. The fastest machines in the pool were also the
flakiest, and the policy had no way to know the difference.

## Best Fit, with history as the tiebreak

The policy that finally stuck requires two components working in tandem.

**Best Fit (Bin Packing)** for placement: We calculate resource waste and assign the
job to the node whose remaining capacity is the tightest fit. Packing jobs densely
leaves large, contiguous resource blocks intact on other machines, permanently
solving the fragmentation problem.

**Trust Score** for the tiebreaker: When multiple nodes are equally good fits, we
rank them based on historical reliability. Nodes start at a baseline score (50.0). A
machine that successfully completes a job drifts up (+2.0). A machine that vanishes
or drops a job is severely penalized (-15.0).

This tiebreaker changes the entire game. It assigns a tangible cost to failure, and
that cost is borne by the machine that caused it. A flaky node isn't outright
banned—it can slowly climb back—but it stops winning ties against reliable nodes.
Over enough scheduling cycles, an unreliable machine naturally starves itself out of
the pool, all without anyone maintaining a manual blocklist.

## Failure as a status change, not an error

A sophisticated placement policy only matters if dropped jobs are recoverable in the
first place.

In GridNode, a background sweeper constantly monitors heartbeats. If a node goes
quiet for 3 minutes, the sweeper marks it offline, applies the Trust Score penalty,
and forcefully fails the active jobs. Crucially, this turns a node vanishing mid-run
into a routine state transition rather than a pager-triggering incident. The job
simply goes back onto the queue and gets placed again—this time, thanks to the Trust
Score, somewhere more reliable.

This architecture makes the pool's unreliability survivable rather than merely
observable. The scheduler assumes nodes will disappear, so a node disappearing isn't
an emergency.

## Safe Containerization and Secure Execution

This paranoid instinct extends beyond scheduling. Every workload on GridNode is
third-party code submitted by a stranger. The threat model isn't "this job might
have a bug." The threat model is "this job was explicitly written to break out."

To mitigate this, execution is strictly categorized and isolated:

**CPU Workloads (The MicroVM Fortress):**

Every CPU job runs completely isolated inside a **gVisor (`runsc`)** microVM
sandbox. gVisor intercepts application system calls in user space, safely emulating
the Linux kernel and preventing any malicious payloads from touching the host's
actual kernel. Furthermore, jobs run with severed external access (`--network
none`), disabled privilege escalation (`no-new-privileges`), and read-only volume
mounts to prevent lateral movement or data exfiltration.

**GPU Workloads (The `runc` Exception):**

Because gVisor currently lacks support for zero-overhead physical GPU passthrough
(like NVIDIA CUDA), GPU workloads gracefully fall back to standard Docker (`runc`).
This introduces a known hardware tradeoff: to provide high-performance rendering or
ML training, we rely on standard container boundaries, transferring the risk
acceptance to the providers who explicitly opt into GPU workloads.

That design choice costs some syscall performance for CPU jobs, but it buys the
ability to safely execute untrusted code on hardware that belongs to other people.
Without that guarantee, the product simply couldn't exist.

---

If there’s a general lesson here, it is narrow but real: a scheduling policy is
essentially an encoding of what you believe about your infrastructure.

Round-robin believes your machines are interchangeable.

Free-capacity ranking believes your machines are honest.

Best Fit with a history tiebreak believes they are neither—which, for a
decentralized pool of volunteered hardware, is the only belief that aligns with
reality.

The source is on [GitHub](https://github.com/cemlus/gridNode).
