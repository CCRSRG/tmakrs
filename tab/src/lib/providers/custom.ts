import type { AIRequest, AIResponse } from '@/types';
import { t } from '@/lib/i18n';
import { AIProvider } from './base';
import { callAI } from '@/lib/services/ai-client';

export class CustomProvider extends AIProvider {
  name = 'custom';
  models = ['custom-model'];

  async generateTags(
    request: AIRequest,
    apiKey: string,
    model: string = 'gpt-4o',
    apiUrl?: string,
    customPrompt?: string
  ): Promise<AIResponse> {
    try {
      if (!apiUrl) {
        throw new Error(t('error_custom_ai_url_required'));
      }

      const prompt = this.buildPrompt(request, customPrompt);

      const { content } = await callAI({
        provider: 'custom',
        apiKey,
        apiUrl,
        model,
        prompt,
        maxTokens: 500,
        temperature: 0.7
      });

      return this.parseResponse(content);
    } catch (error) {
      throw this.handleError(error, 'Custom');
    }
  }
}
