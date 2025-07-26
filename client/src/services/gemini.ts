import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Gemini AI service for machine translations
 * Uses the Gemini-2.0-flash model to translate text from English to Arabic
 */
class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: string = "gemini-2.0-flash";
  
  constructor() {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || "";
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Translate a single text string from English to Arabic
   * @param text The English text to translate
   * @returns Translated Arabic text
   */
  async translateToArabic(text: string): Promise<string> {
    try {
      const modelInstance = this.genAI.getGenerativeModel({ model: this.model });
      const prompt = `Please translate the following English text to Arabic. Only respond with the translation, no explanations or additional text.
      
English text: "${text}"`;

      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text();
      
      return translatedText.trim();
    } catch (error: unknown) {
      const errorObj = error as Error | unknown;
      console.error("Error translating text with Gemini:", errorObj);
      const errorMessage = errorObj instanceof Error ? errorObj.message : String(errorObj);
      throw new Error(`Translation failed: ${errorMessage}`);
    }
  }

  /**
   * Batch translate multiple text items from English to Arabic
   * @param items An array of text items to translate
   * @returns Array of translated Arabic texts in the same order
   */
  async batchTranslateToArabic(items: string[]): Promise<string[]> {
    try {
      // Check if API key is available
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      if (!apiKey) {
        throw new Error("Google API key not found. Please provide your VITE_GOOGLE_API_KEY.");
      }

      const modelInstance = this.genAI.getGenerativeModel({ model: this.model });
      
      // Join all texts with a special separator to translate in a single request
      const combinedText = items.map((text, index) => `${index + 1}. ${text}`).join("\n");
      
      const prompt = `Please translate each of these numbered English text items to Arabic. Return only the translations, maintaining the same numbering format.

English items:
${combinedText}`;

      const result = await modelInstance.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text();
      
      if (!translatedText || translatedText.trim() === "") {
        throw new Error("Empty response from Gemini API");
      }
      
      // Split the response back into individual translations
      const translationLines = translatedText.split("\n").filter(line => line.trim() !== "");
      
      // Process each line to extract the translation (remove numbering)
      const translations = translationLines.map(line => {
        // Extract the text after the number and period
        const match = line.match(/^\d+\.\s*(.*)$/);
        return match ? match[1].trim() : line.trim();
      });
      
      // Ensure we have the same number of translations as inputs
      if (translations.length !== items.length) {
        console.warn(`Translation count mismatch: expected ${items.length}, got ${translations.length}`);
        // Pad with empty strings if fewer translations received
        while (translations.length < items.length) {
          translations.push("");
        }
        // Trim if more translations received
        translations.splice(items.length);
      }
      
      return translations;
    } catch (error: unknown) {
      const errorObj = error as Error | unknown;
      console.error("Error batch translating with Gemini:", error);
      
      // Extract meaningful error message
      let errorMessage = "Unknown error occurred";
      if (errorObj instanceof Error) {
        errorMessage = errorObj.message;
      } else if (typeof errorObj === 'string') {
        errorMessage = errorObj;
      } else if (errorObj && typeof errorObj === 'object' && 'message' in errorObj) {
        errorMessage = String((errorObj as any).message);
      }
      
      // Handle specific error cases
      if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key')) {
        throw new Error("Invalid Google API key. Please check your VITE_GOOGLE_API_KEY environment variable.");
      } else if (errorMessage.includes('QUOTA_EXCEEDED')) {
        throw new Error("Google API quota exceeded. Please try again later or check your billing.");
      } else if (errorMessage.includes('RATE_LIMIT_EXCEEDED')) {
        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
      }
      
      throw new Error(`Batch translation failed: ${errorMessage}`);
    }
  }
}

// Create and export a singleton instance
const geminiService = new GeminiService();
export default geminiService;