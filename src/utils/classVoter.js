/**
 * Rolling-window vote with hysteresis, over a stream of per-tick classifications.
 *
 * A stateless per-frame classifier flickers between close classes on a live
 * feed, so treating each frame as ground truth swaps the UI every tick.
 *
 * Two different thresholds turn that into one stable reading:
 *  - `adoptVotes` (high) is what a class needs to take over the display. Set
 *    above half the window so two alternating classes deadlock and neither is
 *    adopted, instead of trading the lead back and forth.
 *  - `keepVotes` (low) is all the current class needs to stay. Without this the
 *    display blanks out every time a noisy stretch dips the leader below the
 *    adopt bar - readable-but-absent is still unreadable.
 *
 * A clear challenger still takes over immediately: adopting is checked first,
 * so holding on never outranks a class that has genuinely won the window.
 */
export function createClassVoter({ windowSize, adoptVotes, keepVotes }) {
  // Two classes alternating every tick give the leader ceil(windowSize / 2)
  // votes, and with an odd window that lead changes hands as the window slides.
  // Requiring more than that is what makes perfect ambiguity hold steady rather
  // than flicker. A plain "strict majority" is not enough.
  if (adoptVotes <= Math.ceil(windowSize / 2)) {
    throw new Error(
      `adoptVotes ${adoptVotes} must exceed ${Math.ceil(windowSize / 2)} for windowSize ${windowSize}`
    );
  }
  if (keepVotes < 1 || keepVotes > adoptVotes) {
    throw new Error(`keepVotes ${keepVotes} must be between 1 and adoptVotes ${adoptVotes}`);
  }

  const votes = [];
  let shown = null;

  return {
    /**
     * @param {string|null} className this tick's pick, or null for no detection.
     * @returns {string|null} the class that should be displayed.
     */
    push(className) {
      votes.push(className);
      if (votes.length > windowSize) votes.shift();

      const counts = new Map();
      let leader = null;
      let leaderVotes = 0;
      for (const name of votes) {
        if (!name) continue;
        const count = (counts.get(name) ?? 0) + 1;
        counts.set(name, count);
        if (count > leaderVotes) {
          leader = name;
          leaderVotes = count;
        }
      }

      if (leader && leaderVotes >= adoptVotes) {
        shown = leader;
      } else if (!shown || (counts.get(shown) ?? 0) < keepVotes) {
        shown = null;
      }
      return shown;
    },
    reset() {
      votes.length = 0;
      shown = null;
    },
  };
}
