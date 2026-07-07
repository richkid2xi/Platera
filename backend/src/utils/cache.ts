import NodeCache from 'node-cache';

// Standard TTL of 5 minutes. In memory cache.
export const menuCache = new NodeCache({ stdTTL: 300, checkperiod: 120 });
