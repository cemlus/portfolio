---
title: The fastest node was also the flakiest
date: 2026-03-28
tag: Distributed Systems
summary: Three scheduling policies for GridNode, and why the winning one is the only one that lets a machine lose work by being unreliable.
---

GridNode hands compute jobs to a pool of volunteered machines. The machines are
not a fleet I control. They are laptops and spare boxes that join, take work,
and leave — sometimes politely, usually not. Everything downstream of that
sentence is the interesting part.

The scheduler went through three shapes before one of them held.

## Round-robin, because it was obvious

The first placement policy was the one you write without thinking: keep a
rotating pointer, hand the next job to the next available node. It is fair in
the only sense round-robin is ever fair — every node gets its turn.

It fragments capacity. Spreading small jobs evenly across every node leaves
every node with a little room and no node with enough. A large job then waits,
not because the pool is full, but because the free space is in the wrong shape.
Small jobs kept arriving and kept getting placed, and the large ones sat behind
them.

Fairness at the node level produced starvation at the job level. Those are not
the same objective, and round-robin only optimises the first one.

## Rank on free capacity, because fragmentation was the problem

So stop rotating and start choosing: score every node by how much room it has,
send the job to the best score. This fixes the fragmentation directly. It also
introduces a worse bug.

The node with the most free capacity is, very often, the node that just dropped
its last job. Failure *creates* the free capacity that wins the next auction. A
machine with a bad network or a habit of going to sleep would fail a job, come
back looking like the emptiest node in the pool, and immediately be handed
another one.

> Ranking on free capacity alone means unreliability is rewarded, because
> failure is indistinguishable from availability.

The measurement that killed this one was simply watching which node IDs kept
appearing in the requeue logs and noticing they were the same IDs winning
placement. The fastest machine in the pool was also the flakiest, and the
policy had no way to know the difference.

## Best Fit, with history as the tiebreak

The policy that survived has two parts, and it needs both.

**Best Fit** for placement: pick the node whose remaining capacity is the
*smallest* that still fits the job. Packing jobs tightly leaves the large
contiguous gaps intact instead of shaving a little off every node, which is the
fragmentation fix.

**Trust Score** for the tiebreak: when several nodes fit equally well, rank
them on completion history. A node that finishes what it accepts drifts up; a
node that drops jobs drifts down.

The tiebreak is the whole point. It gives failure a cost that lands on the
machine that caused it. A flaky node still gets work — it is not banned, and it
can climb back — but it stops winning ties against nodes that finish. Over
enough scheduling rounds, an unreliable machine starves itself out of the pool
without anyone maintaining a blocklist by hand.

## Failure as a status change, not an error

Placement policy only matters if a dropped job is recoverable in the first
place. Every running job heartbeats. A missed heartbeat requeues the job
automatically, which turns a node vanishing mid-run into a state transition
rather than an incident. Nothing pages; the job goes back on the queue and gets
placed again — this time, thanks to the Trust Score, probably somewhere else.

This is what makes the pool's unreliability survivable rather than merely
observable. The scheduler assumes nodes disappear, so a node disappearing is
not news.

## The other assumption: the code is hostile

Separate from scheduling, but the same instinct. Every workload on GridNode is
third-party code submitted by someone else, so every workload runs inside a
gVisor sandbox. The threat model is not "this job might have a bug." It is
"this job was written to get out."

That decision costs some syscall performance and buys the ability to run
untrusted code on machines that belong to other people, which is the only way
the product exists at all.

---

If there is a general lesson in this it is narrow but real: a scheduling policy
encodes what you believe about your machines. Round-robin believes they are
interchangeable. Free-capacity ranking believes they are honest. Best Fit with a
history tiebreak believes they are neither, which — for a pool of volunteered
hardware — is the only one of the three that is true.

The source is on [GitHub](https://github.com/cemlus/gridNode).
