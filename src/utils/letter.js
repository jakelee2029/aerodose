import { SCENARIOS, scenarioDoseUsv, formatDose, PUBLIC_GUIDELINE_USV } from '../physics/scenarios.js';

export const RECIPIENTS = {
  rep: { label: 'My U.S. Representative', greeting: 'Dear Representative,', subject: 'A question about radiation tracking for people who fly' },
  airline: { label: 'An airline safety department', greeting: 'Dear Safety Department,', subject: 'A question about cosmic radiation tracking for your crews' },
};

function personalLine({ logTotalUsv, roundTripUsv }) {
  if (logTotalUsv > 0) {
    const pct = ((logTotalUsv / PUBLIC_GUIDELINE_USV) * 100).toFixed(1);
    return `Over the last 12 months, the flights I logged add up to about ${formatDose(logTotalUsv)}, which is ${pct}% of the 1 mSv yearly guideline for the public.`;
  }
  return `A single round trip between New York and London adds about ${formatDose(roundTripUsv)}.`;
}

function crewLine(crewUsv) {
  const times = (crewUsv / PUBLIC_GUIDELINE_USV).toFixed(1);
  return `For people who fly for work the totals are much larger. My estimate for a flight attendant on 6 London round trips a month is about ${formatDose(crewUsv)} a year, roughly ${times} times the public guideline.`;
}

/**
 * @param {{recipient: 'rep'|'airline', name?: string, place?: string, logTotalUsv?: number, f107?: number}} p
 * @returns {{subject: string, body: string}}
 */
export function buildLetter({ recipient, name = '', place = '', logTotalUsv = 0, f107 = 150 }) {
  const r = RECIPIENTS[recipient] ?? RECIPIENTS.rep;
  const crew = SCENARIOS.find(s => s.id === 'crew');
  const crewUsv = scenarioDoseUsv(crew, f107);
  const roundTripUsv = (crewUsv / crew.legs[0].count) * 2;
  const who = name.trim() || '[your name]';
  const where = place.trim() || '[your town]';

  const intro = `My name is ${who} and I am from ${where}. I used the app, AeroDose (https://aerodose.vercel.app/), a free web app that estimates the cosmic radiation a flight adds, using published FAA and ICRP methods.`;

  const findings = [
    personalLine({ logTotalUsv, roundTripUsv }),
    crewLine(crewUsv),
    'The FAA recommends that airlines inform crew about radiation exposure (Advisory Circular 120-61B). I could not find a requirement that airlines measure it and report it to the people who fly.',
  ].map(l => `- ${l}`).join('\n');

  const questions = recipient === 'airline'
    ? [
      'Do you give crew members an estimate of their yearly cosmic radiation dose?',
      'How do you handle scheduling for crew who tell you they are pregnant?',
      'Could you share route-level dose information with the people who fly your routes?',
    ]
    : [
      'Are U.S. airlines required to measure aircrew radiation exposure and share it with crew? If not, would you support requiring it?',
      'Could the FAA publish simple route-level dose information for crew and passengers?',
      'Would your office be willing to look at AeroDose and tell me what would make it more useful to your community?',
    ];

  const body = [
    r.greeting,
    '',
    intro,
    '',
    'What I found:',
    findings,
    '',
    'My questions:',
    questions.map((q, i) => `${i + 1}. ${q}`).join('\n'),
    '',
    'Thank you for your time.',
    '',
    'Sincerely,',
    who,
  ].join('\n');

  return { subject: r.subject, body };
}
