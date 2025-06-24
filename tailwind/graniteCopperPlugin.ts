import plugin from 'tailwindcss/plugin';

/**
 * Enhanced memorial platform color palette with emotional consideration.
 * Colors are designed to be comforting, respectful, and supportive for grieving families.
 * Shades follow Tailwind's 50 → 900 convention for consistency.
 */
const graniteCopperPlugin = plugin.withOptions(() => {
  return function () {
    // This plugin only extends the Tailwind theme via the `theme` return below.
  };
}, () => {
  return {
    theme: {
      extend: {
        colors: {
          // Softer, warmer granite palette for comfort
          granite: {
            50:  '#FAFAF9', // Softer than pure white
            100: '#F5F5F4', // Warmer light gray
            200: '#E7E5E4', // Gentle medium light
            300: '#D6D3D1', // Soft medium
            400: '#A8A29E', // Muted medium
            500: '#78716C', // Warm neutral
            600: '#57534E', // Deeper warm gray
            700: '#44403C', // Rich warm dark
            800: '#292524', // Deep warm
            900: '#1C1917', // Almost black but warm
          },
          // Warmer, more comforting copper accent
          copper: {
            50:  '#FEF7F0', // Very light warm
            100: '#FEEBC8', // Light peachy
            200: '#FBD38D', // Soft golden
            300: '#F6AD55', // Warm medium
            400: '#ED8936', // Rich warm
            500: '#DD6B20', // Main copper (softer than before)
            600: '#C05621', // Deep copper
            700: '#9C4221', // Rich brown-copper
            800: '#7B341E', // Deep warm brown
            900: '#652B19', // Dark warm brown
          },
          // Gentle, calming blue tones for peace and serenity
          serenity: {
            50:  '#F0F9FF', // Very light sky
            100: '#E0F2FE', // Light peaceful blue
            200: '#BAE6FD', // Soft sky blue
            300: '#7DD3FC', // Gentle blue
            400: '#38BDF8', // Clear blue
            500: '#0EA5E9', // Peaceful blue
            600: '#0284C7', // Deeper calm
            700: '#0369A1', // Rich peaceful
            800: '#075985', // Deep serene
            900: '#0C4A6E', // Navy calm
          },
          // Soft, healing lavender tones for emotional support
          lavender: {
            50:  '#FAF5FF', // Lightest lavender
            100: '#F3E8FF', // Very light purple
            200: '#E9D5FF', // Soft lavender
            300: '#D8B4FE', // Gentle purple
            400: '#C084FC', // Medium lavender
            500: '#A855F7', // Healing purple
            600: '#9333EA', // Rich lavender
            700: '#7C3AED', // Deep purple
            800: '#6B21A8', // Strong purple
            900: '#581C87', // Deep healing
          },
          // Warmer, more comforting pearl grays
          pearl: {
            50:  '#FEFEFE', // Almost white with warmth
            100: '#FDFDFC', // Very light warm
            200: '#F8F8F7', // Soft warm light
            300: '#F1F1F0', // Gentle warm
            400: '#E0E0DF', // Soft medium
            500: '#B5B5B3', // Warm medium gray
            600: '#94948F', // Deeper warm gray
            700: '#757570', // Rich warm gray
            800: '#54544F', // Deep warm
            900: '#2F2F2A', // Dark warm gray
          },
          // Gentle sage green for nature and growth
          sage: {
            50:  '#F6F7F6', // Very light sage
            100: '#ECEFEC', // Light sage
            200: '#D9DDD9', // Soft sage
            300: '#B8C5B8', // Gentle sage
            400: '#8FA68F', // Medium sage
            500: '#6B7C6B', // Main sage
            600: '#586158', // Deeper sage
            700: '#474F47', // Rich sage
            800: '#353A35', // Deep sage
            900: '#252825', // Dark sage
          },
          // Soft blush for warmth and comfort
          blush: {
            50:  '#FDF6F6', // Very light blush
            100: '#FBEAEA', // Light warm pink
            200: '#F5CCCC', // Soft blush
            300: '#EBA3A3', // Gentle blush
            400: '#DC7474', // Medium blush
            500: '#C85A5A', // Main blush
            600: '#A84848', // Deeper blush
            700: '#8A3A3A', // Rich blush
            800: '#6B2D2D', // Deep blush
            900: '#4F2222', // Dark blush
          },
        },
      },
    },
  };
});

export default graniteCopperPlugin; 