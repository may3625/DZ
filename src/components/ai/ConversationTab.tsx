import React, { useState } from 'react';
import { TabFormField } from '@/components/common/TabFormField';
import { ConversationalAIAssistant } from './ConversationalAIAssistant';
import { AIInsightsAndHistory } from './AIInsightsAndHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { securityEnhancements } from '@/utils/securityEnhancements';
import { localLLMClient, ChatMessage } from '@/ai/localLLMClient';

export function ConversationTab() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleAsk = async (query: string) => {
    const lang = localLLMClient.detectLanguage(query);
    const system: ChatMessage = {
      role: 'system',
      content: lang === 'ar'
        ? 'أنت مساعد قانوني للجزائر. أجب بإيجاز وبسياق قانوني.'
        : "Assistant juridique pour l'Algérie. Réponds brièvement et cite le contexte si utile."
    };

    const userMsg: ChatMessage = { role: 'user', content: query };
    const history = [...messages.filter(m => m.role !== 'system')];
    const convo = [system, ...history, userMsg];

    setMessages(prev => [...prev, userMsg]);
    const answer = await localLLMClient.chat(convo);
    const safe = securityEnhancements.encodeOutput(answer);
    setMessages(prev => [...prev, { role: 'assistant', content: safe }]);
  };

  return (
    <div className="space-y-6">
      <TabFormField
        placeholder="Poser une question à l'assistant IA juridique..."
        onSearch={handleAsk}
        onAdd={() => console.log('Nouvelle conversation')}
        onFilter={() => console.log('Filtrer conversations')}
        onSort={() => console.log('Trier conversations')}
        onExport={() => console.log('Exporter conversation')}
        onRefresh={() => console.log('Actualiser IA')}
        showActions={true}
      />

      <Card>
        <CardHeader>
          <CardTitle>Réponses de l'assistant (local)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'font-medium' : ''}>
                <strong>{m.role === 'user' ? 'Vous' : 'Assistant'}: </strong>
                <span dangerouslySetInnerHTML={{ __html: m.content }} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ConversationalAIAssistant />
      <AIInsightsAndHistory />
    </div>
  );
}
