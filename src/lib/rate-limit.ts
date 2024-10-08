const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

// Configuration for the rate limiter
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS = +(process.env.MAX_REQUESTS_PER_WINDOW || 4); // Max 5 requests per window

export function rateLimit(ip: string): boolean {
	const now = Date.now();
	const requestInfo = rateLimitStore.get(ip);

	if (!requestInfo) {
		// First request from this IP in the current window
		rateLimitStore.set(ip, { count: 1, timestamp: now });
		return true; // Allow the request
	}

	const { count, timestamp } = requestInfo;

	if (now - timestamp > RATE_LIMIT_WINDOW) {
		// Time window has passed, reset the counter
		rateLimitStore.set(ip, { count: 1, timestamp: now });
		return true; // Allow the request
	}
	if (count >= MAX_REQUESTS) {
		// Max requests reached within the time window
		return false; // Deny the request
	}
	// Increment the count for this IP within the same window
	rateLimitStore.set(ip, { count: count + 1, timestamp });
	return true; // Allow the request
}
