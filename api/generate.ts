import { Configuration, OpenAIApi } from 'openai';

export const config = {
  runtime: 'edge',
};

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function (req: any, res: any) {
  const { materia, tema } = req.body;

  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: 'OpenAI API key not configured, please follow instructions in README.md',
      },
    });
    return;
  }

  const materiaPrompt = materia || '';
  const temaPrompt = tema || '';

  if (materiaPrompt.trim().length === 0 || temaPrompt.trim().length === 0) {
    res.status(400).json({
      error: {
        message: 'Please enter a valid materia and tema',
      },
    });
    return;
  }

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: generatePrompt(materiaPrompt, temaPrompt) }],
      temperature: 0.6,
      stream: false, // <-- A MUDANÇA ESTÁ AQUI
    });
    
    // Altera a forma de aceder à resposta
    const responseContent = completion.data.choices[0].message?.content;

    res.status(200).json({ result: responseContent });
  } catch (error: any) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        },
      });
    }
  }
}

function generatePrompt(materia: string, tema: string) {
  const formattedMateria = materia[0].toUpperCase() + materia.slice(1).toLowerCase();
  const formattedTema = tema[0].toUpperCase() + tema.slice(1).toLowerCase();
  return `Generate a multiple choice question about ${formattedTema} in the field of ${formattedMateria}.`;
}
