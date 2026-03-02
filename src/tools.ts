/**
 * Nexus MCP Tools
 * Example payment-gated tools that demonstrate the Nexus platform
 */

import type { ToolConfig } from './types.js';

/**
 * Example: Weather API (payment-gated)
 */
const weatherTool: ToolConfig = {
  name: 'get_weather',
  description: 'Get current weather data for any city. Costs 0.10 USDC per request.',
  price: '0.10',
  inputSchema: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: 'City name (e.g., "London", "New York")',
      },
      payment: {
        type: 'object',
        description: 'X402 payment proof',
        properties: {
          signature: { type: 'string' },
          deadline: { type: 'number' },
          nonce: { type: 'string' },
          amount: { type: 'string' },
        },
      },
    },
    required: ['city'],
  },
  handler: async (args: any) => {
    const { city } = args;
    
    // Mock weather API call (replace with real API)
    // In production, you'd call OpenWeatherMap, WeatherAPI, etc.
    return {
      city,
      temperature: Math.round(Math.random() * 30 + 5),
      condition: ['Sunny', 'Cloudy', 'Rainy', 'Snowy'][Math.floor(Math.random() * 4)],
      humidity: Math.round(Math.random() * 40 + 40),
      timestamp: new Date().toISOString(),
    };
  },
};

/**
 * Example: AI Image Generation (payment-gated)
 */
const imageGenTool: ToolConfig = {
  name: 'generate_image',
  description: 'Generate an AI image using DALL-E or Stable Diffusion. Costs 0.50 USDC per image.',
  price: '0.50',
  inputSchema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'Text description of the image to generate',
      },
      style: {
        type: 'string',
        description: 'Image style (realistic, anime, oil-painting, etc.)',
        enum: ['realistic', 'anime', 'oil-painting', 'digital-art'],
      },
      payment: {
        type: 'object',
        description: 'X402 payment proof',
      },
    },
    required: ['prompt'],
  },
  handler: async (args: any) => {
    const { prompt, style = 'realistic' } = args;
    
    // Mock image generation (replace with real API like Replicate, OpenAI, etc.)
    return {
      imageUrl: `https://api.placeholder.com/generated/${encodeURIComponent(prompt)}`,
      prompt,
      style,
      generatedAt: new Date().toISOString(),
    };
  },
};

/**
 * Example: Web Search (payment-gated)
 */
const webSearchTool: ToolConfig = {
  name: 'search_web',
  description: 'Search the web and get real-time results. Costs 0.15 USDC per search.',
  price: '0.15',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query',
      },
      maxResults: {
        type: 'number',
        description: 'Maximum number of results (1-10)',
        minimum: 1,
        maximum: 10,
      },
      payment: {
        type: 'object',
        description: 'X402 payment proof',
      },
    },
    required: ['query'],
  },
  handler: async (args: any) => {
    const { query, maxResults = 5 } = args;
    
    // Mock search results (replace with real API like Brave Search, SerpAPI, etc.)
    const results = Array.from({ length: Math.min(maxResults, 5) }, (_, i) => ({
      title: `Result ${i + 1} for "${query}"`,
      url: `https://example.com/result${i + 1}`,
      snippet: `This is a search result snippet for ${query}...`,
    }));
    
    return {
      query,
      results,
      totalResults: results.length,
      searchedAt: new Date().toISOString(),
    };
  },
};

/**
 * Example: Data Analysis (payment-gated)
 */
const dataAnalysisTool: ToolConfig = {
  name: 'analyze_data',
  description: 'Analyze CSV/JSON data and generate insights. Costs 0.25 USDC per analysis.',
  price: '0.25',
  inputSchema: {
    type: 'object',
    properties: {
      data: {
        type: 'string',
        description: 'CSV or JSON data to analyze',
      },
      analysisType: {
        type: 'string',
        description: 'Type of analysis to perform',
        enum: ['summary', 'trends', 'anomalies', 'correlations'],
      },
      payment: {
        type: 'object',
        description: 'X402 payment proof',
      },
    },
    required: ['data', 'analysisType'],
  },
  handler: async (args: any) => {
    const { data, analysisType } = args;
    
    // Mock data analysis (replace with real analysis library)
    return {
      analysisType,
      insights: [
        'Data contains 100 records',
        'Average value: 42.5',
        'Detected 3 outliers',
        'Strong positive correlation between X and Y',
      ],
      timestamp: new Date().toISOString(),
    };
  },
};

/**
 * Free tool: Get service info (no payment required)
 */
const infoTool: ToolConfig = {
  name: 'get_service_info',
  description: 'Get information about available Nexus services. FREE - no payment required.',
  price: '0',
  inputSchema: {
    type: 'object',
    properties: {},
  },
  handler: async () => {
    return {
      service: 'Nexus MCP',
      version: '1.0.0',
      description: 'Payment-gated API platform powered by X402 and Thirdweb',
      availableTools: [
        { name: 'get_weather', price: '0.10 USDC' },
        { name: 'generate_image', price: '0.50 USDC' },
        { name: 'search_web', price: '0.15 USDC' },
        { name: 'analyze_data', price: '0.25 USDC' },
      ],
      paymentMethods: ['USDC on Base', 'USDC on Arbitrum'],
      documentation: 'https://github.com/yourusername/nexus-mcp',
    };
  },
};

export const tools: ToolConfig[] = [
  infoTool,
  weatherTool,
  imageGenTool,
  webSearchTool,
  dataAnalysisTool,
];
