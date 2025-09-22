/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


declare var marked: any;

const ADMIN_EMAIL = 'admin@medpack.com';
const ADMIN_PASSWORD = 'Melchior21';

const subjectsData = {
    semiologia: {
        title: "Semiologia Médica",
        placeholder: "Ex: Semiologia da ascite, manobra de Mathieu...",
        reference: "livros e materiais de estudo de Semiologia Médica de nível universitário",
        topics: ["Exame Físico Geral", "Sistema Cardiovascular", "Sistema Respiratório", "Abdome", "Sistema Nervoso", "Icterícia", "Cefaleia", "Lesões de Pele"]
    },
    farmacologia: {
        title: "Farmacologia Geral",
        placeholder: "Ex: Farmacocinética, AINEs, Anti-hipertensivos...",
        reference: "livros e materiais de estudo de Farmacologia Geral de nível universitário",
        topics: ["Farmacocinética", "Farmacodinâmica", "Drogas Adrenérgicas", "Drogas Colinérgicas", "AINEs", "Opioides", "Anti-hipertensivos", "Antibióticos"]
    },
    pediatria: {
        title: "Pediatria (SCA)",
        placeholder: "Ex: Anamnese Pediátrica, Crescimento e Desenvolvimento...",
        reference: "materiais de estudo de nível universitário sobre Pediatria e Puericultura",
        topics: ["Consulta Pediátrica", "Crescimento", "Desenvolvimento", "Recém-nascido", "Icterícia Neonatal", "Suplementação", "Desnutrição", "Ectoscopia"]
    },
    tecnicas_operatorias: {
        title: "Técnicas Operatórias",
        placeholder: "Ex: Fios de sutura, nós cirúrgicos, diérese...",
        reference: "livros e materiais de estudo de Técnica Operatória e Cirurgia Experimental de nível universitário",
        topics: ["Princípios da Cirurgia", "Instrumental Cirúrgico", "Fios e Suturas", "Nós Cirúrgicos", "Diérese", "Hemostasia", "Síntese", "Assepsia e Antissepsia"]
    },
    patologia: {
        title: "Patologia Médica",
        placeholder: "Ex: Inflamação aguda, neoplasias, lesão celular...",
        reference: "livros e materiais de estudo de Patologia Médica Geral de nível universitário",
        topics: ["Lesão Celular", "Inflamação Aguda", "Inflamação Crônica", "Reparo Tecidual", "Distúrbios Hemodinâmicos", "Neoplasias", "Imunopatologia", "Doenças Infecciosas"]
    },
    propedeutica: {
        title: "Propedêutica Aplicada",
        placeholder: "Ex: Anamnese, exame físico especial, raciocínio clínico...",
        reference: "livros e materiais de estudo de Propedêutica Médica de nível universitário",
        topics: ["Anamnese", "Exame Físico Geral", "Raciocínio Clínico", "Sinais Vitais", "Exame da Cabeça e Pescoço", "Exame do Tórax", "Exame do Abdome", "Exame Neurológico"]
    }
};

let currentSubject = 'semiologia';
let currentDifficulty = 'Médio';
let currentQuestionType = 'Aberta';
let currentQuestionData: any = {};
let selectedOption: string | null = null;
let answerChecked = false;

const allElements = {
    // Auth elements
    authContainer: document.getElementById('auth-container')!,
    appContainer: document.getElementById('app-container')!,
    loginForm: document.getElementById('login-form') as HTMLFormElement,
    signupForm: document.getElementById('signup-form') as HTMLFormElement,
    loginEmailInput: document.getElementById('login-email') as HTMLInputElement,
    loginPasswordInput: document.getElementById('login-password') as HTMLInputElement,
    loginError: document.getElementById('login-error')!,
    signupNameInput: document.getElementById('signup-name') as HTMLInputElement,
    signupEmailInput: document.getElementById('signup-email') as HTMLInputElement,
    signupPasswordInput: document.getElementById('signup-password') as HTMLInputElement,
    signupError: document.getElementById('signup-error')!,
    showSignupBtn: document.getElementById('show-signup-btn')!,
    showLoginBtn: document.getElementById('show-login-btn')!,
    logoutBtn: document.getElementById('logout-btn')!,

    // Admin Panel
    adminPanel: document.getElementById('admin-panel')!,
    pendingUsersList: document.getElementById('pending-users-list')!,

    // App elements
    subjectSelector: document.getElementById('subject-selector')!,
    modeSwitcher: document.getElementById('mode-switcher')!,
    aulaMode: document.getElementById('aula-mode')!,
    questaoMode: document.getElementById('questao-mode')!,
    aulaSearchInput: document.getElementById('aula-search-input') as HTMLInputElement,
    aulaSearchBtn: document.getElementById('aula-search-btn') as HTMLButtonElement,
    suggestedTopicsContainer: document.getElementById('suggested-topics')!,
    aulaSkeletonLoader: document.getElementById('aula-skeleton-loader')!,
    aulaContentWrapper: document.getElementById('aula-content-wrapper')!,
    aulaContent: document.getElementById('aula-content')!,
    switchToQuestaoBtn: document.getElementById('switch-to-questao-btn')!,
    searchInput: document.getElementById('search-input') as HTMLInputElement,
    difficultySelector: document.getElementById('difficulty-selector')!,
    typeSelector: document.getElementById('type-selector')!,
    generateBtn: document.getElementById('generate-btn') as HTMLButtonElement,
    questionContainer: document.getElementById('question-container')!,
    questionText: document.getElementById('question-text')!,
    optionsContainer: document.getElementById('options-container')!,
    userAnswerSection: document.getElementById('user-answer-section')!,
    userAnswerInput: document.getElementById('user-answer-input') as HTMLTextAreaElement,
    checkBtnContainer: document.getElementById('check-btn-container')!,
    checkBtn: document.getElementById('check-btn') as HTMLButtonElement,
    aiFeedbackContainer: document.getElementById('ai-feedback-container')!,
    aiFeedbackTitle: document.getElementById('ai-feedback-title')!,
    aiFeedbackContent: document.getElementById('ai-feedback-content')!,
    answerContainer: document.getElementById('answer-container')!,
    answerTitle: document.getElementById('answer-title')!,
    answerText: document.getElementById('answer-text')!,
    deepenTopicBtn: document.getElementById('deepen-topic-btn')!,
    clinicalCaseBtn: document.getElementById('clinical-case-btn')!,
    explainSimplyBtn: document.getElementById('explain-simply-btn')!,
    geminiOutputContainer: document.getElementById('gemini-output-container')!,
    geminiOutputTitle: document.getElementById('gemini-output-title')!,
    geminiOutputContent: document.getElementById('gemini-output-content')!
};

// --- INITIALIZATION & ADMIN SETUP ---

function initializeApp() {
    // Ensure the admin account exists with the specified credentials
    const users = JSON.parse(localStorage.getItem('med_users') || '{}');
    if (!users[ADMIN_EMAIL]) {
        users[ADMIN_EMAIL] = {
            name: 'Administrador',
            password: ADMIN_PASSWORD,
            status: 'approved',
            role: 'admin'
        };
        localStorage.setItem('med_users', JSON.stringify(users));
    }
    
    // Check for an active session to continue the app flow
    checkSession();
}

// --- AUTHENTICATION & ADMIN LOGIC ---

function showAuthScreen() {
    allElements.authContainer.classList.remove('hidden');
    allElements.appContainer.classList.add('hidden');
}

function showApp() {
    allElements.authContainer.classList.add('hidden');
    allElements.appContainer.classList.remove('hidden');
    setSubject('semiologia');
}

function handleLogin(e: Event) {
    e.preventDefault();
    const email = allElements.loginEmailInput.value;
    const password = allElements.loginPasswordInput.value;
    const users = JSON.parse(localStorage.getItem('med_users') || '{}');
    const user = users[email];
    
    if (user && user.password === password) {
        if (user.status !== 'approved') {
            allElements.loginError.textContent = 'Sua conta está aguardando aprovação.';
            allElements.loginError.classList.remove('hidden');
            return;
        }

        localStorage.setItem('med_session', JSON.stringify({ email, name: user.name, role: user.role }));
        allElements.loginError.classList.add('hidden');
        showApp();
        if (user.role === 'admin') {
            showAdminUI();
        }
    } else {
        allElements.loginError.textContent = 'Email ou senha inválidos.';
        allElements.loginError.classList.remove('hidden');
    }
}

function handleSignup(e: Event) {
    e.preventDefault();
    const name = allElements.signupNameInput.value;
    const email = allElements.signupEmailInput.value;
    const password = allElements.signupPasswordInput.value;
    const users = JSON.parse(localStorage.getItem('med_users') || '{}');

    if (users[email]) {
        allElements.signupError.textContent = 'Este email já está cadastrado.';
        allElements.signupError.classList.remove('hidden');
        return;
    }

    if (!name || !email || !password) {
        allElements.signupError.textContent = 'Todos os campos são obrigatórios.';
        allElements.signupError.classList.remove('hidden');
        return;
    }

    const newUser: any = { name, password, status: 'pending' };

    // Auto-approve and assign admin role to the special admin email, in case it was deleted
    if (email.toLowerCase() === ADMIN_EMAIL) {
        newUser.status = 'approved';
        newUser.role = 'admin';
    }

    users[email] = newUser;
    localStorage.setItem('med_users', JSON.stringify(users));

    allElements.signupError.textContent = 'Solicitação enviada! Aguarde a aprovação do administrador para fazer login.';
    allElements.signupError.className = 'text-green-700 text-sm text-center';
    allElements.signupError.classList.remove('hidden');
    allElements.signupForm.reset();
}

function handleLogout() {
    localStorage.removeItem('med_session');
    allElements.adminPanel.classList.add('hidden'); // Hide admin panel on logout
    showAuthScreen();
}

function checkSession() {
    const sessionData = localStorage.getItem('med_session');
    if (sessionData) {
        const session = JSON.parse(sessionData);
        showApp();
        if (session.role === 'admin') {
            showAdminUI();
        }
    } else {
        showAuthScreen();
    }
}

function showAdminUI() {
    allElements.adminPanel.classList.remove('hidden');
    renderPendingUsers();
}

function renderPendingUsers() {
    const users = JSON.parse(localStorage.getItem('med_users') || '{}');
    const pendingUsers = Object.entries(users).filter(([, user]: [string, any]) => user.status === 'pending');

    if (pendingUsers.length === 0) {
        allElements.pendingUsersList.innerHTML = '<p class="text-amber-800">Nenhuma solicitação pendente no momento.</p>';
        return;
    }

    allElements.pendingUsersList.innerHTML = pendingUsers.map(([email, user]: [string, any]) => `
        <div class="flex items-center justify-between bg-white/60 p-3 rounded-lg shadow-sm">
            <div>
                <p class="font-semibold text-slate-800">${user.name}</p>
                <p class="text-sm text-slate-500">${email}</p>
            </div>
            <button data-email="${email}" class="approve-btn bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-transform hover:scale-105">Aprovar</button>
        </div>
    `).join('');
}

function approveUser(email: string) {
    const users = JSON.parse(localStorage.getItem('med_users') || '{}');
    if (users[email]) {
        users[email].status = 'approved';
        localStorage.setItem('med_users', JSON.stringify(users));
        renderPendingUsers(); // Refresh the list
    }
}


// --- END OF AUTHENTICATION & ADMIN LOGIC ---

// VERSÃO NOVA E SEGURA
async function callGeminiApi(systemPrompt: string, userQuery: string, isJson = false): Promise<string> {
    try {
        // 1. Faz uma chamada para a NOSSA API de back-end no endereço /api/generate
        const response = await fetch('/api/generate', {
            method: 'POST', // Usa o método POST, como definimos no back-end
            headers: {
                'Content-Type': 'application/json', // Avisa que estamos enviando dados em formato JSON
            },
            // 2. Envia os dados (prompt, query, etc.) no corpo da requisição
            body: JSON.stringify({
                systemPrompt,
                userQuery,
                isJson
            }),
        });

        // 3. Se a resposta do nosso back-end não for de sucesso, lança um erro
        if (!response.ok) {
            throw new Error(`Erro na chamada da API: ${response.statusText}`);
        }

        // 4. Pega a resposta JSON do nosso back-end
        const data = await response.json();

        // 5. Retorna o texto que o back-end recebeu do Gemini
        return data.text;

    } catch (error) {
        console.error("Erro ao chamar o back-end:", error);
        throw error;
    }
}

function formatApiResponse(text: string) {
    return marked.parse(text);
}

function formatAnswerText(text: string) {
     return marked.parse(text);
}

function setSubject(subjectKey: string) {
    currentSubject = subjectKey;
    
    allElements.subjectSelector.querySelector('.active')?.classList.remove('active');
    allElements.subjectSelector.querySelector(`[data-subject="${subjectKey}"]`)?.classList.add('active');

    const { topics, title, placeholder } = subjectsData[subjectKey as keyof typeof subjectsData];
    allElements.suggestedTopicsContainer.innerHTML = topics.map(topic => 
        `<button class="control-btn p-3 rounded-lg font-medium text-sm">${topic}</button>`
    ).join('');
    
    allElements.aulaSearchInput.placeholder = `Pesquise em ${title}...`;
    allElements.searchInput.placeholder = placeholder;
    
    document.getElementById('switch-to-questao-container')?.classList.add('hidden');
    allElements.aulaContentWrapper.classList.remove('hidden');
    allElements.aulaContent.innerHTML = `<p class="text-slate-500 text-center">O resumo da sua aula aparecerá aqui.</p>`;
}

allElements.subjectSelector.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest('button');
    if(button && button.dataset.subject) {
        setSubject(button.dataset.subject);
    }
});

function switchMode(mode: 'aula' | 'questao') {
    allElements.modeSwitcher.querySelector('.active')?.classList.remove('active');
    allElements.modeSwitcher.querySelector(`[data-mode="${mode}"]`)?.classList.add('active');

    const modeToShow = (mode === 'aula') ? allElements.aulaMode : allElements.questaoMode;
    const modeToHide = (mode === 'aula') ? allElements.questaoMode : allElements.aulaMode;
    
    if (modeToShow.classList.contains('hidden')) {
        modeToHide.classList.add('animate-fade-out');
        modeToHide.addEventListener('animationend', () => {
            modeToHide.classList.add('hidden');
            modeToHide.classList.remove('animate-fade-out');
            
            modeToShow.classList.remove('hidden');
            modeToShow.classList.add('animate-fade-in');
            modeToShow.addEventListener('animationend', () => {
                modeToShow.classList.remove('animate-fade-in');
            }, { once: true });

        }, { once: true });
    }
}

allElements.modeSwitcher.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const button = target.closest('button');
    if (button && button.dataset.mode) {
        const mode = button.dataset.mode as 'aula' | 'questao';
        if (mode === 'questao') {
            allElements.searchInput.value = allElements.aulaSearchInput.value;
        }
        switchMode(mode);
    }
});


async function searchAula() {
    const searchTerm = allElements.aulaSearchInput.value.trim();
    if (!searchTerm) {
        alert("Por favor, digite um tema para a aula.");
        return;
    }
    
    allElements.aulaContentWrapper.classList.add('hidden');
    document.getElementById('switch-to-questao-container')?.classList.add('hidden');
    allElements.aulaSkeletonLoader.classList.remove('hidden');
    allElements.aulaSearchBtn.disabled = true;

    const subjectInfo = subjectsData[currentSubject as keyof typeof subjectsData];
    const systemPrompt = `Você é um professor de medicina especialista em ${subjectInfo.title}. Com base no tema fornecido, escreva um resumo claro, didático e conciso sobre o assunto, como se fosse uma mini-aula, baseando-se em ${subjectInfo.reference}. Foque nos pontos-chave. Use formatação Markdown para organizar o conteúdo (ex: '# Título Principal', '## Subtítulo', '**negrito**' para ênfase, e listas com '*' ou '-'). Responda em português.`;
    const userQuery = `Gere uma mini-aula sobre: "${searchTerm}".`;

    try {
        const aiResponse = await callGeminiApi(systemPrompt, userQuery);
        allElements.aulaContent.innerHTML = formatApiResponse(aiResponse);
        allElements.aulaContentWrapper.classList.remove('hidden');
        document.getElementById('switch-to-questao-container')?.classList.remove('hidden');

    } catch (error) {
        allElements.aulaContent.innerHTML = `<p class="text-red-500 text-center">Erro ao carregar a aula. Por favor, tente novamente.</p>`;
        allElements.aulaContentWrapper.classList.remove('hidden');
    } finally {
        allElements.aulaSkeletonLoader.classList.add('hidden');
        allElements.aulaSearchBtn.disabled = false;
    }
}

allElements.aulaSearchBtn.addEventListener('click', searchAula);
allElements.suggestedTopicsContainer.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if(target.tagName === 'BUTTON') {
        allElements.aulaSearchInput.value = target.textContent || '';
        searchAula();
    }
});

function setupSelector(selectorElement: HTMLElement, stateUpdater: (value: string) => void) {
    selectorElement.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const button = target.closest('button');
        const datasetKey = button ? Object.keys(button.dataset)[0] : undefined;
        if (button && datasetKey && button.dataset[datasetKey]) {
            selectorElement.querySelector('.active')?.classList.remove('active');
            button.classList.add('active');
            stateUpdater(button.dataset[datasetKey]!);
        }
    });
}

setupSelector(allElements.difficultySelector, (difficulty) => currentDifficulty = difficulty);
setupSelector(allElements.typeSelector, (type) => currentQuestionType = type);

function displayQuestion(data: any) {
    currentQuestionData = data;
    allElements.questionText.textContent = data.q;
    allElements.questionText.classList.remove('text-slate-500', 'text-center');
    allElements.questionContainer.classList.remove('items-center', 'justify-center');
    allElements.checkBtnContainer.classList.remove('hidden');
    allElements.checkBtn.disabled = false;
    allElements.checkBtn.textContent = currentQuestionType === 'Aberta' ? 'Corrigir com IA' : 'Ver Resposta';

    if (currentQuestionType === 'Aberta') {
        allElements.answerTitle.textContent = 'Resposta Esperada:';
        allElements.answerText.innerHTML = formatAnswerText(data.a);
        allElements.userAnswerSection.classList.remove('hidden');
        allElements.optionsContainer.classList.add('hidden');
    } else {
        allElements.answerTitle.textContent = 'Explicação:';
        allElements.answerText.innerHTML = formatAnswerText(data.explanation);
        allElements.userAnswerSection.classList.add('hidden');
        allElements.optionsContainer.innerHTML = '';
        Object.entries(data.options).forEach(([key, value]) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'option-btn w-full text-left p-4 rounded-lg font-medium transition-all duration-200';
            optionBtn.dataset.option = key;
            optionBtn.innerHTML = `<span class="font-bold mr-2">${key}.</span> ${value}`;
            optionBtn.onclick = () => {
                if (answerChecked) return;
                const selectedBtn = allElements.optionsContainer.querySelector('.selected');
                if (selectedBtn) selectedBtn.classList.remove('selected');
                optionBtn.classList.add('selected');
                selectedOption = key;
            };
            allElements.optionsContainer.appendChild(optionBtn);
        });
        allElements.optionsContainer.classList.remove('hidden');
    }
}

async function generateQuestion() {
    const searchTerm = allElements.searchInput.value.trim();
    if (!searchTerm) {
        alert("Por favor, digite um tema para a questão.");
        return;
    }
    resetQuizAreaForGeneration();
    allElements.questionText.innerHTML = '<div class="loader"></div>';
    
    const subjectInfo = subjectsData[currentSubject as keyof typeof subjectsData];
    let systemPrompt, userQuery;
    
    if (currentQuestionType === 'Aberta') {
        systemPrompt = `Você é um professor de medicina especialista em ${subjectInfo.title} e criador de questões para provas de residência. Baseado em ${subjectInfo.reference}, gere UMA pergunta ABERTA (dissertativa) e sua respectiva resposta detalhada. A pergunta deve ser clinicamente relevante e desafiadora. Formate a saída estritamente como um objeto JSON com as chaves 'q' e 'a'.`;
    } else { 
        systemPrompt = `Você é um professor de medicina especialista em ${subjectInfo.title}. Baseado em ${subjectInfo.reference}, gere UMA pergunta de MÚLTIPLA ESCOLHA com quatro alternativas (A, B, C, D), focada em um cenário clínico ou sinal semiológico. Apenas uma alternativa deve ser correta. Forneça também a chave da alternativa correta e uma explicação detalhada. Formate a saída como um objeto JSON com as chaves 'q' (string), 'options' (objeto com chaves A,B,C,D), 'correct' (string, ex: "C"), e 'explanation' (string).`;
    }
    userQuery = `Tema: "${searchTerm}". Nível de Dificuldade: ${currentDifficulty}.`;

    try {
        const aiResponse = await callGeminiApi(systemPrompt, userQuery, true);
        const cleanResponse = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const newQuestionData = JSON.parse(cleanResponse);
        displayQuestion(newQuestionData);
    } catch (error) {
        allElements.questionText.textContent = "Erro ao gerar a questão. Tente novamente.";
        allElements.questionText.classList.add('text-red-500');
    } finally {
        allElements.generateBtn.disabled = false;
    }
}

async function checkAnswer() {
    if (currentQuestionType === 'Aberta') {
        await checkOpenAnswer();
    } else {
        checkClosedAnswer();
    }
}

function checkClosedAnswer() {
    if (!selectedOption) {
        alert("Por favor, selecione uma alternativa.");
        return;
    }
    answerChecked = true;
    const correctKey = currentQuestionData.correct;
    
    document.querySelectorAll('.option-btn').forEach(btn => {
        const key = (btn as HTMLElement).dataset.option;
        if (key === correctKey) btn.classList.add('correct');
        if (key === selectedOption && key !== correctKey) btn.classList.add('incorrect');
    });
    
    allElements.answerContainer.classList.remove('hidden');
    allElements.checkBtn.disabled = true;
}

async function checkOpenAnswer() {
    const userAnswer = allElements.userAnswerInput.value.trim();
    if (!userAnswer) {
        showFeedback('Atenção', '<p class="text-yellow-900">Por favor, escreva uma resposta para ser corrigida.</p>', 'yellow');
        return;
    }
    allElements.checkBtn.disabled = true;
    showFeedback('Avaliando...', '<div class="loader"></div>', 'blue');
    
    const subjectInfo = subjectsData[currentSubject as keyof typeof subjectsData];
    const systemPrompt = `Você é um professor de ${subjectInfo.title}. Avalie a resposta do aluno em comparação com a resposta correta fornecida, focando na precisão dos termos técnicos e na lógica clínica. Comece com '**Correto**', '**Parcialmente Correto**' ou '**Incorreto**'. Em seguida, forneça um feedback construtivo em 2-3 frases. Responda em português.`;
    const userQuery = `Pergunta: "${currentQuestionData.q}"\n\nResposta Correta: "${currentQuestionData.a}"\n\nResposta do Aluno: "${userAnswer}"`;

    try {
        const feedbackText = await callGeminiApi(systemPrompt, userQuery);
        const formattedFeedback = marked.parse(feedbackText);
        showFeedback('Avaliação da IA', formattedFeedback);
        
        if (feedbackText.toLowerCase().includes('**correto**')) setFeedbackTheme('green');
        else if (feedbackText.toLowerCase().includes('**parcialmente correto**')) setFeedbackTheme('yellow');
        else setFeedbackTheme('red');

        allElements.answerContainer.classList.remove('hidden');
    } catch (error) {
        showFeedback('Erro na Avaliação', '<p class="text-red-900">Não foi possível obter a avaliação.</p>', 'red');
    }
}

async function runGeminiFeature(title: string, systemPrompt: string, userQuery: string, contentProcessor: (res: string) => string, isJson = false) {
    showGeminiOutputLoader(title);
    try {
        const aiResponse = await callGeminiApi(systemPrompt, userQuery, isJson);
        allElements.geminiOutputTitle.textContent = `✨ ${title}`;
        allElements.geminiOutputContent.innerHTML = contentProcessor(aiResponse);
    } catch (error) {
        showGeminiOutputError(`Não foi possível gerar: ${title}.`);
    }
}

function deepenTopic() {
    const subjectInfo = subjectsData[currentSubject as keyof typeof subjectsData];
    const systemPrompt = `Você é um criador de questões para provas de residência em ${subjectInfo.title}. Com base na pergunta/resposta a seguir, crie UM novo par de pergunta e resposta ABERTA que aprofunde o tópico. Formate sua saída como um objeto JSON com as chaves 'q' e 'a'.`;
    const userQuery = `Exemplo: {\"q\": \"${currentQuestionData.q}\", \"a\": \"${currentQuestionData.a || currentQuestionData.explanation}\"}`;
    runGeminiFeature("Aprofundar Tópico", systemPrompt, userQuery, (res) => {
        const cleanResponse = res.replace(/```json/g, '').replace(/```/g, '').trim();
        const newData = JSON.parse(cleanResponse);
        currentQuestionType = 'Aberta';
        allElements.typeSelector.querySelector('.active')?.classList.remove('active');
        allElements.typeSelector.querySelector('[data-type="Aberta"]')!.classList.add('active');
        displayQuestion(newData);
        resetQuizAreaForNewQuestion();
        return "Nova questão aberta carregada acima.";
    }, true);
}

function generateClinicalCase() {
    const systemPrompt = "Você é um professor de medicina. Crie um breve caso clínico (150-200 palavras) que ilustre o conceito da resposta a seguir. Formate a resposta usando Markdown, com títulos como '## Apresentação do Paciente'.";
    const userQuery = `Conceito Chave: "${currentQuestionData.a || currentQuestionData.explanation}"`;
    runGeminiFeature("Caso Clínico", systemPrompt, userQuery, (res) => formatApiResponse(res));
}

function explainSimply() {
    const systemPrompt = "Você é um médico didático. Explique o seguinte conceito em termos simples para um estudante no início do curso, usando uma analogia. Mantenha a explicação concisa (cerca de 100 palavras).";
    const userQuery = `Conceito: "${currentQuestionData.a || currentQuestionData.explanation}"`;
    runGeminiFeature("Explicação Simplificada", systemPrompt, userQuery, (res) => formatApiResponse(res));
}

function showGeminiOutputLoader(title: string) {
    allElements.geminiOutputContainer.classList.remove('hidden');
    allElements.geminiOutputTitle.textContent = title;
    allElements.geminiOutputContent.innerHTML = '<div class="loader"></div>';
}

function showGeminiOutputError(message: string) {
    allElements.geminiOutputTitle.textContent = "Erro";
    allElements.geminiOutputContent.innerHTML = `<p class="text-red-900">${message}</p>`;
}

function showFeedback(title: string, content: string, theme = 'blue') {
    allElements.aiFeedbackContainer.classList.remove('hidden');
    allElements.aiFeedbackTitle.textContent = title;
    allElements.aiFeedbackContent.innerHTML = content;
    setFeedbackTheme(theme);
}

function setFeedbackTheme(theme: string) {
    const themes = {
        green: { bg: 'bg-green-50', border: 'border-green-200', title: 'text-green-800' },
        yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', title: 'text-yellow-800' },
        red: { bg: 'bg-red-50', border: 'border-red-200', title: 'text-red-800' },
        blue: { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-800' }
    };
    const selectedTheme = themes[theme as keyof typeof themes] || themes.blue;
    allElements.aiFeedbackContainer.className = `p-6 rounded-xl ${selectedTheme.bg} ${selectedTheme.border}`;
    allElements.aiFeedbackTitle.className = `font-bold mb-2 ${selectedTheme.title}`;
}

function resetQuizAreaForGeneration() {
    allElements.questionText.textContent = '';
    allElements.questionText.classList.add('text-slate-500', 'text-center');
    allElements.questionContainer.classList.add('items-center', 'justify-center');
    ['userAnswerSection', 'optionsContainer', 'answerContainer', 'aiFeedbackContainer', 'geminiOutputContainer', 'checkBtnContainer'].forEach(id => (allElements as any)[id].classList.add('hidden'));
    allElements.generateBtn.disabled = true;
    allElements.userAnswerInput.value = '';
    selectedOption = null;
    answerChecked = false;
}

function resetQuizAreaForNewQuestion() {
    allElements.userAnswerInput.value = '';
    selectedOption = null;
    answerChecked = false;
    ['answerContainer', 'aiFeedbackContainer', 'geminiOutputContainer'].forEach(id => (allElements as any)[id].classList.add('hidden'));
}

// Initial page load setup
document.addEventListener('DOMContentLoaded', () => {
    // Auth listeners
    allElements.loginForm.addEventListener('submit', handleLogin);
    allElements.signupForm.addEventListener('submit', handleSignup);
    allElements.logoutBtn.addEventListener('click', handleLogout);

    allElements.showSignupBtn.addEventListener('click', () => {
        allElements.loginForm.classList.add('hidden');
        allElements.signupForm.classList.remove('hidden');
        allElements.signupError.classList.add('hidden');
        allElements.loginError.classList.add('hidden');
    });

    allElements.showLoginBtn.addEventListener('click', () => {
        allElements.signupForm.classList.add('hidden');
        allElements.loginForm.classList.remove('hidden');
        allElements.signupError.classList.add('hidden');
        allElements.loginError.classList.add('hidden');
    });

    // Admin listener
    allElements.pendingUsersList.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const approveBtn = target.closest('.approve-btn');
        if (approveBtn instanceof HTMLElement && approveBtn.dataset.email) {
            approveUser(approveBtn.dataset.email);
        }
    });

    // App listeners
    allElements.generateBtn.addEventListener('click', generateQuestion);
    allElements.checkBtn.addEventListener('click', checkAnswer);
    allElements.deepenTopicBtn.addEventListener('click', deepenTopic);
    allElements.clinicalCaseBtn.addEventListener('click', generateClinicalCase);
    allElements.explainSimplyBtn.addEventListener('click', explainSimply);
    
    // Initialize app: setup admin account if needed and check for session
    initializeApp();
});