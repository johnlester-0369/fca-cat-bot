/**
 * Utility Aggregator for fca-unofficial
 *
 * WHY: Centralizes all utility functions into a flattened single entry point.
 * This allows consumers to destructure any utility function directly without 
 * needing to know its sub-folder origin.
 * 
 * ARCHITECTURAL WARNING: Spreading exports flattens the namespace. If multiple 
 * internal files export utilities with the exact same name, the module 
 * required later in this list will overwrite the earlier one.
 */

module.exports = {
    // --- Sub-folder Modules ---
    // Spreading resolves their index.js exports and merges them to the top level
    ...require('./format'),
    ...require('./loginParser'),
    ...require('./request'),
    
    // --- Top-level Utility Files ---
    ...require('./broadcast'),
    ...require('./client'),
    ...require('./constants'),
    ...require('./cookies'),
    ...require('./headers')
};