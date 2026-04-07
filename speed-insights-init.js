/**
 * Vercel Speed Insights initialization
 * This file imports and initializes Speed Insights for the application
 */
import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Speed Insights
injectSpeedInsights({
    debug: false
});
