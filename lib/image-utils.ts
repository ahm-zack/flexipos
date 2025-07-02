/**
 * Utility function to get fallback image URL for different food categories
 */
export function getFallbackImageUrl(category: string): string {
  const fallbacks: Record<string, string> = {
    pizza: '/placeholder-pizza.svg',
    pie: '/placeholder-pie.svg',
    'mini-pie': '/placeholder-pie.svg',
    sandwich: '/placeholder-sandwich.svg',
  };
  
  return fallbacks[category.toLowerCase()] || '/placeholder-pizza.svg';
}

/**
 * Check if an image URL is from via.placeholder.com (which may not be accessible)
 */
export function isPlaceholderUrl(url: string): boolean {
  return url.includes('via.placeholder.com');
}

/**
 * Get a reliable image URL - returns local fallback if the URL is from via.placeholder.com
 */
export function getReliableImageUrl(url: string, category: string): string {
  if (isPlaceholderUrl(url)) {
    return getFallbackImageUrl(category);
  }
  return url;
}
