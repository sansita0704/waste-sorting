/**
 * Data contracts between the UI and your backend / ML model.
 * The UI only ever sees these shapes. Adapters in src/services convert
 * whatever your API returns into them.
 */

/**
 * @typedef {Object} Detection
 * @property {string} className          e.g. "PET Plastic Bottle"
 * @property {string} category           e.g. "Dry / Recyclable"
 * @property {number} confidence         0..1
 * @property {number} weightG            estimated grams
 * @property {string} grade              e.g. "PET-01"
 * @property {{level: string, label: string, score: number}} contamination  score 0..1
 * @property {string[]} steps            preparation checklist
 * @property {{x: number, y: number, w: number, h: number}} box  normalised 0..1, top-left origin
 * @property {DetectionBox[]} [detections]  every box in the frame, this one first
 */

/**
 * @typedef {Object} DetectionBox
 * @property {string} className
 * @property {string} category
 * @property {number} confidence         0..1
 * @property {{x: number, y: number, w: number, h: number}} box  normalised 0..1
 */

/**
 * @typedef {Object} LedgerSummary
 * @property {number} points
 * @property {number} streakDays
 * @property {number} itemsScanned
 * @property {number} accuracyPct
 * @property {number} co2OffsetKg
 * @property {{day: string, items: number}[]} weekly   last 7 days, oldest first
 */

/**
 * @typedef {Object} DropoffHub
 * @property {string} name
 * @property {number} distanceKm
 * @property {string} hours
 * @property {number} lat
 * @property {number} lng
 */

/**
 * @typedef {Object} LeaderboardEntry
 * @property {string} id
 * @property {string} name
 * @property {number} points
 * @property {number} streakDays
 * @property {boolean} [isYou]
 */

export {};
