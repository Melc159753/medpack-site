// Importa os tipos para trabalhar com as funções da Vercel e o Google GenAI
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Esta é a nossa função principal que será executada no back-end
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // 1. VERIFICAÇÃO DE SEGURANÇA
  // Garante que a requisição seja do tipo POST, para mais segurança.
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // 2. OBTENÇÃO SEGURA DA CHAVE DA API
    // A chave é lida das "Variáveis de Ambiente" do servidor.
    // Ela NUNCA é enviada para o navegador do usuário.
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('A chave da API do Gemini não foi configurada no servidor.');
    }

    // 3. RECEBENDO OS DADOS DO FRONT-END
    // Pega as informações que o front-end enviou (prompt, query, etc.)
    const { systemPrompt, userQuery, isJson } = request.body;

    // 4. CHAMADA PARA A API DO GEMINI (DO LADO SEGURO)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    const generationConfig = {
      responseMimeType: isJson ? "application/json" : "text/plain",
    };

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: userQuery }] }],
        generationConfig: generationConfig
    });

    const geminiResponse = result.response;
    
    // 5. ENVIANDO A RESPOSTA DE VOLTA PARA O FRONT-END
    // Apenas o resultado da IA é enviado, nunca a chave.
    response.status(200).json({ text: geminiResponse.text() });

  } catch (error: any) {
    // Tratamento de erros
    console.error('Erro na função de back-end:', error);
    response.status(500).json({ error: 'Ocorreu um erro ao processar sua solicitação.' });
  }
}