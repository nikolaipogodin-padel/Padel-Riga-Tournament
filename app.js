
/*
Step 3.2 — Tournament Engine (Tours Generator)
Fixed pairs, minimal repeat opponents
*/

function generateSchedule(pairs, courts, rounds) {
    let schedule = [];
    let history = {};

    function getMatchKey(a, b) {
        return [a, b].sort().join("-");
    }

    for (let r = 0; r < rounds; r++) {
        let used = new Set();
        let roundMatches = [];

        for (let i = 0; i < pairs.length; i++) {
            if (used.has(i)) continue;

            let bestOpponent = null;
            let minPlayed = Infinity;

            for (let j = i + 1; j < pairs.length; j++) {
                if (used.has(j)) continue;

                let key = getMatchKey(i, j);
                let played = history[key] || 0;

                if (played < minPlayed) {
                    minPlayed = played;
                    bestOpponent = j;
                }
            }

            if (bestOpponent !== null) {
                let key = getMatchKey(i, bestOpponent);
                history[key] = (history[key] || 0) + 1;

                roundMatches.push([pairs[i], pairs[bestOpponent]]);
                used.add(i);
                used.add(bestOpponent);
            }
        }

        schedule.push(roundMatches.slice(0, courts));
    }

    return schedule;
}

// example
const pairs = ["P1","P2","P3","P4","P5","P6","P7","P8"];
const courts = 2;
const rounds = 6;

const schedule = generateSchedule(pairs, courts, rounds);
console.log("Schedule:", schedule);
