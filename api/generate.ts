import { Configuration, OpenAIApi } from 'openai';

export const config = {
  runtime: 'edge',
};

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function (req: Request) {
  // A variável 'res' não é mais necessária aqui
  const { materia, tema } = await req.json();

  if (!configuration.apiKey) {
    return new Response(JSON.stringify({
      error: {
        message: 'OpenAI API key not configured, please follow instructions in README.md',
      },
    }), { status: 500 });
  }

  const materiaPrompt = materia || '';
  const temaPrompt = tema || '';

  if (materiaPrompt.trim().length === 0 || temaPrompt.trim().length === 0) {
    return new Response(JSON.stringify({
      error: {
        message: 'Please enter a valid materia and tema',
      },
    }), { status: 400 });
  }

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: generatePrompt(materiaPrompt, temaPrompt) }],
      temperature: 0.6,
    });
    
    const responseContent = completion.data.choices[0].message?.content;

    return new Response(JSON.stringify({ result: responseContent }), { status: 200 });
  } catch (error: any) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      return new Response(JSON.stringify(error.response.data), { status: error.response.status });
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      return new Response(JSON.stringify({
        error: {
          message: 'An error occurred during your request.',
        },
      }), { status: 500 });
    }
  }
}

function generatePrompt(materia: string, tema: string) {
  const formattedMateria = materia[0].toUpperCase() + materia.slice(1).toLowerCase();
  const formattedTema = tema[0].toUpperCase() + tema.slice(1).toLowerCase();
  return `Generate a multiple choice question about ${formattedTema} in the field of ${formattedMateria}.`;
}
