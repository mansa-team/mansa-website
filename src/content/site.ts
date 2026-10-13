const rawFormId = process.env.NEXT_PUBLIC_FORMSPREE_ID || '';
export const site = {
  name: 'Mansa S.A.',
  description:
    'Tecnologia e educação para aproximar a classe média brasileira do investimento de longo prazo. Um projeto em desenvolvimento, aberto a investidores no projeto, parceiros e apoiadores.',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'mansafin.team@gmail.com',
  github: 'https://github.com/mansa-team',
  researchUrl: 'https://github.com/mansa-team/musa#readme',
  serverUrl: 'https://github.com/mansa-team/server#readme',
  formId: /^[a-zA-Z0-9]{6,}$/.test(rawFormId) ? rawFormId : '',
};

export const principles = [
  {
    id: 'perspectiva',
    title: 'Perspectiva',
    short: 'Entender antes de decidir.',
    description:
      'Olhar para as empresas, seus fundamentos e seu contexto. Nossa pesquisa parte do investimento em valor: compreender o que existe por trás de uma ação.',
    label: 'A informação ganha contexto',
  },
  {
    id: 'constancia',
    title: 'Constância',
    short: 'Dar espaço ao longo prazo.',
    description:
      'Estudamos como a organização de aportes periódicos e o acompanhamento da carteira podem ajudar a construir uma rotina de investimento mais consciente.',
    label: 'O tempo ganha continuidade',
  },
  {
    id: 'compreensao',
    title: 'Compreensão',
    short: 'Aprender durante o caminho.',
    description:
      'Queremos que a tecnologia também explique. Educação integrada à experiência, para que cada pessoa compreenda melhor as escolhas que faz.',
    label: 'A experiência ganha sentido',
  },
];

export const research = [
  {
    title: 'Dados que encontram contexto.',
    category: 'Dados de mercado',
    text: 'Estruturas para reunir informações de empresas brasileiras, seus fundamentos e seu histórico.',
    status: 'Em desenvolvimento',
  },
  {
    title: 'Pesquisa que vira ferramenta.',
    category: 'Inteligência aplicada',
    text: 'Modelos e estudos para interpretar informações financeiras e apoiar uma experiência mais compreensível.',
    status: 'Em pesquisa',
  },
  {
    title: 'Uma visão de conjunto.',
    category: 'Organização da carteira',
    text: 'Recursos em desenvolvimento para acompanhar posições, aportes e a composição de uma carteira.',
    status: 'Em desenvolvimento',
  },
];
