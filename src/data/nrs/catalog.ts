export type NrStatus = 'vigente' | 'revogada';

export type NrCatalogItem = {
  code: string;
  title: string;
  status: NrStatus;
  summary: string;
  tags: string[];
  officialUrl: string;
};

export const MTE_NR_URL =
  'https://www.gov.br/trabalho-e-emprego/pt-br/assuntos/inspecao-do-trabalho/seguranca-e-saude-no-trabalho/ctpp-nrs/normas-regulamentadoras-nrs';

export const NR_CATALOG: NrCatalogItem[] = [
  { code: 'NR-1', title: 'Disposicoes gerais e gerenciamento de riscos ocupacionais', status: 'vigente', summary: 'Define disposicoes gerais, direitos, deveres e diretrizes para GRO e PGR.', tags: ['GRO', 'PGR', 'gestao de riscos', 'geral'], officialUrl: MTE_NR_URL },
  { code: 'NR-2', title: 'Inspecao previa', status: 'revogada', summary: 'Norma revogada. Mantida no catalogo para referencia historica.', tags: ['revogada', 'inspecao previa'], officialUrl: MTE_NR_URL },
  { code: 'NR-3', title: 'Embargo e interdicao', status: 'vigente', summary: 'Trata de embargo e interdicao em situacoes de risco grave e iminente.', tags: ['risco grave', 'interdicao', 'embargo'], officialUrl: MTE_NR_URL },
  { code: 'NR-4', title: 'Servicos Especializados em Seguranca e em Medicina do Trabalho', status: 'vigente', summary: 'Regras para dimensionamento e funcionamento do SESMT.', tags: ['SESMT', 'medicina do trabalho', 'seguranca do trabalho'], officialUrl: MTE_NR_URL },
  { code: 'NR-5', title: 'Comissao Interna de Prevencao de Acidentes', status: 'vigente', summary: 'Define organizacao e atribuicoes da CIPA e representantes de prevencao.', tags: ['CIPA', 'prevencao', 'acidentes'], officialUrl: MTE_NR_URL },
  { code: 'NR-6', title: 'Equipamento de Protecao Individual - EPI', status: 'vigente', summary: 'Requisitos para fornecimento, uso, treinamento e controle de EPI.', tags: ['EPI', 'capacete', 'luvas', 'oculos', 'protecao individual'], officialUrl: MTE_NR_URL },
  { code: 'NR-7', title: 'Programa de Controle Medico de Saude Ocupacional', status: 'vigente', summary: 'Estabelece diretrizes do PCMSO e acompanhamento da saude ocupacional.', tags: ['PCMSO', 'saude ocupacional', 'exames'], officialUrl: MTE_NR_URL },
  { code: 'NR-8', title: 'Edificacoes', status: 'vigente', summary: 'Requisitos de seguranca e conforto em edificacoes dos locais de trabalho.', tags: ['edificacoes', 'predio', 'estrutura', 'circulacao'], officialUrl: MTE_NR_URL },
  { code: 'NR-9', title: 'Avaliacao e controle das exposicoes ocupacionais a agentes fisicos, quimicos e biologicos', status: 'vigente', summary: 'Orienta avaliacao e controle de exposicoes ocupacionais a agentes ambientais.', tags: ['agentes fisicos', 'agentes quimicos', 'agentes biologicos', 'exposicao'], officialUrl: MTE_NR_URL },
  { code: 'NR-10', title: 'Seguranca em instalacoes e servicos em eletricidade', status: 'vigente', summary: 'Medidas de controle para trabalhos com eletricidade e instalacoes eletricas.', tags: ['eletricidade', 'painel eletrico', 'choque', 'bloqueio'], officialUrl: MTE_NR_URL },
  { code: 'NR-11', title: 'Transporte, movimentacao, armazenagem e manuseio de materiais', status: 'vigente', summary: 'Regras para movimentacao, armazenagem e manuseio seguro de materiais.', tags: ['movimentacao', 'empilhadeira', 'carga', 'armazenagem'], officialUrl: MTE_NR_URL },
  { code: 'NR-12', title: 'Seguranca no trabalho em maquinas e equipamentos', status: 'vigente', summary: 'Requisitos de protecao, dispositivos de seguranca e operacao de maquinas.', tags: ['maquinas', 'equipamentos', 'protecoes', 'partes moveis'], officialUrl: MTE_NR_URL },
  { code: 'NR-13', title: 'Caldeiras, vasos de pressao, tubulacoes e tanques metalicos de armazenamento', status: 'vigente', summary: 'Requisitos para integridade, inspecao e operacao de equipamentos pressurizados.', tags: ['caldeiras', 'vasos de pressao', 'tubulacoes', 'tanques'], officialUrl: MTE_NR_URL },
  { code: 'NR-14', title: 'Fornos', status: 'vigente', summary: 'Requisitos de seguranca para construcao, instalacao e operacao de fornos.', tags: ['fornos', 'calor', 'queimaduras'], officialUrl: MTE_NR_URL },
  { code: 'NR-15', title: 'Atividades e operacoes insalubres', status: 'vigente', summary: 'Caracteriza atividades insalubres e limites de tolerancia aplicaveis.', tags: ['insalubridade', 'ruido', 'calor', 'agentes'], officialUrl: MTE_NR_URL },
  { code: 'NR-16', title: 'Atividades e operacoes perigosas', status: 'vigente', summary: 'Caracteriza atividades perigosas e condicoes de periculosidade.', tags: ['periculosidade', 'inflamaveis', 'explosivos', 'energia eletrica'], officialUrl: MTE_NR_URL },
  { code: 'NR-17', title: 'Ergonomia', status: 'vigente', summary: 'Parametros para adaptacao das condicoes de trabalho as caracteristicas dos trabalhadores.', tags: ['ergonomia', 'postura', 'mobiliario', 'levantamento'], officialUrl: MTE_NR_URL },
  { code: 'NR-18', title: 'Seguranca e saude no trabalho na industria da construcao', status: 'vigente', summary: 'Requisitos de seguranca para obras, canteiros e atividades da construcao.', tags: ['construcao', 'obra', 'canteiro', 'andaime'], officialUrl: MTE_NR_URL },
  { code: 'NR-19', title: 'Explosivos', status: 'vigente', summary: 'Requisitos para atividades com explosivos, armazenamento e manuseio.', tags: ['explosivos', 'detonacao', 'armazenamento'], officialUrl: MTE_NR_URL },
  { code: 'NR-20', title: 'Seguranca e saude no trabalho com inflamaveis e combustiveis', status: 'vigente', summary: 'Controles para instalacoes e atividades com inflamaveis e combustiveis.', tags: ['inflamaveis', 'combustiveis', 'posto', 'tanque'], officialUrl: MTE_NR_URL },
  { code: 'NR-21', title: 'Trabalhos a ceu aberto', status: 'vigente', summary: 'Medidas de protecao para atividades realizadas a ceu aberto.', tags: ['ceu aberto', 'sol', 'chuva', 'intemperies'], officialUrl: MTE_NR_URL },
  { code: 'NR-22', title: 'Seguranca e saude ocupacional na mineracao', status: 'vigente', summary: 'Requisitos de seguranca e saude para mineracao e atividades correlatas.', tags: ['mineracao', 'mina', 'britagem', 'lavra'], officialUrl: MTE_NR_URL },
  { code: 'NR-23', title: 'Protecao contra incendios', status: 'vigente', summary: 'Requisitos gerais de protecao e resposta contra incendios.', tags: ['incendio', 'extintor', 'evacuacao', 'emergencia'], officialUrl: MTE_NR_URL },
  { code: 'NR-24', title: 'Condicoes sanitarias e de conforto nos locais de trabalho', status: 'vigente', summary: 'Regras para instalacoes sanitarias, conforto, higiene e areas de apoio.', tags: ['sanitario', 'higiene', 'vestiario', 'refeitorio'], officialUrl: MTE_NR_URL },
  { code: 'NR-25', title: 'Residuos industriais', status: 'vigente', summary: 'Diretrizes para gerenciamento seguro de residuos industriais.', tags: ['residuos', 'descarte', 'contaminacao'], officialUrl: MTE_NR_URL },
  { code: 'NR-26', title: 'Sinalizacao de seguranca', status: 'vigente', summary: 'Padroniza sinalizacao, cores e identificacao de seguranca.', tags: ['sinalizacao', 'cores', 'rotulagem', 'avisos'], officialUrl: MTE_NR_URL },
  { code: 'NR-27', title: 'Registro profissional do tecnico de seguranca do trabalho', status: 'revogada', summary: 'Norma revogada. Mantida no catalogo para referencia historica.', tags: ['revogada', 'tecnico de seguranca'], officialUrl: MTE_NR_URL },
  { code: 'NR-28', title: 'Fiscalizacao e penalidades', status: 'vigente', summary: 'Procedimentos de fiscalizacao e criterios de penalidades.', tags: ['fiscalizacao', 'penalidades', 'autos de infracao'], officialUrl: MTE_NR_URL },
  { code: 'NR-29', title: 'Seguranca e saude no trabalho portuario', status: 'vigente', summary: 'Requisitos de SST aplicaveis ao trabalho portuario.', tags: ['portuario', 'porto', 'carga'], officialUrl: MTE_NR_URL },
  { code: 'NR-30', title: 'Seguranca e saude no trabalho aquaviario', status: 'vigente', summary: 'Requisitos de SST para atividades aquaviarias.', tags: ['aquaviario', 'embarcacao', 'navio'], officialUrl: MTE_NR_URL },
  { code: 'NR-31', title: 'Seguranca e saude no trabalho na agricultura, pecuaria, silvicultura, exploracao florestal e aquicultura', status: 'vigente', summary: 'Requisitos de SST para atividades rurais, florestais e aquicultura.', tags: ['rural', 'agricultura', 'pecuaria', 'florestal'], officialUrl: MTE_NR_URL },
  { code: 'NR-32', title: 'Seguranca e saude no trabalho em servicos de saude', status: 'vigente', summary: 'Medidas de protecao para trabalhadores em servicos de saude.', tags: ['saude', 'hospital', 'biologico', 'perfurocortante'], officialUrl: MTE_NR_URL },
  { code: 'NR-33', title: 'Seguranca e saude nos trabalhos em espacos confinados', status: 'vigente', summary: 'Requisitos para identificacao, entrada e trabalho em espacos confinados.', tags: ['espaco confinado', 'atmosfera', 'vigia', 'resgate'], officialUrl: MTE_NR_URL },
  { code: 'NR-34', title: 'Condicoes e meio ambiente de trabalho na industria da construcao, reparacao e desmonte naval', status: 'vigente', summary: 'Requisitos de SST para construcao, reparacao e desmonte naval.', tags: ['naval', 'estaleiro', 'solda', 'desmonte'], officialUrl: MTE_NR_URL },
  { code: 'NR-35', title: 'Trabalho em altura', status: 'vigente', summary: 'Requisitos para planejamento, organizacao e execucao de trabalho em altura.', tags: ['altura', 'queda', 'cinto', 'ancoragem'], officialUrl: MTE_NR_URL },
  { code: 'NR-36', title: 'Seguranca e saude no trabalho em empresas de abate e processamento de carnes e derivados', status: 'vigente', summary: 'Requisitos de SST para frigorificos, abate e processamento de carnes.', tags: ['frigorifico', 'abate', 'carnes', 'facas'], officialUrl: MTE_NR_URL },
  { code: 'NR-37', title: 'Seguranca e saude em plataformas de petroleo', status: 'vigente', summary: 'Requisitos de SST em plataformas de petroleo.', tags: ['petroleo', 'plataforma', 'offshore'], officialUrl: MTE_NR_URL },
  { code: 'NR-38', title: 'Seguranca e saude no trabalho nas atividades de limpeza urbana e manejo de residuos solidos', status: 'vigente', summary: 'Requisitos para limpeza urbana e manejo de residuos solidos.', tags: ['limpeza urbana', 'residuos solidos', 'coleta'], officialUrl: MTE_NR_URL },
];
