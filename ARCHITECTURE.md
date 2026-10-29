# Organização do aplicativo

`src/app/` contém apenas rotas e layout do Expo Router.

`src/features/` organiza telas e regras por domínio:
- auth: entrada e cadastro.
- explore: catálogo, detalhe de destino, mapas e emergência.
- trips: roteiros e recomendações.
- professionals: listagem, detalhe, cadastro em etapas, painel e desempenho.
- bookings: proposta, agenda, reserva e pagamento.
- wallet: saldos e extrato.
- chat: conversas entre participantes.
- profile: conta, preferências e privacidade.
- subscriptions: planos de destaque.
- notifications: avisos e lembretes.
- support: assistente de ajuda e atendimento humano.
- admin: aprovação, catálogo, moderação e operação.

`src/components/` concentra a interface compartilhada. Os arquivos de compatibilidade de reservas apenas reexportam os componentes do domínio.
`src/lib/data.js` normaliza os contratos da API antes de entregar dados às telas.
`src/hooks/useResource.js` atualiza telas ao ganhar foco e ignora respostas de requisições anteriores.
`src/context/SessionContext.js` trata sessão e expiração de credenciais.

## Jornadas

Turista: Explorar → detalhe → roteiro → profissionais → proposta → Reservas → pagamento → avaliação.
Profissional: Conta → cadastro em três etapas → aprovação → Painel → Agenda → conclusão → Carteira.
Administração: Conta → Administração → análise de perfis / conteúdo / suporte / pagamentos.

A navegação inferior acompanha o perfil ativo. Cadastro, preferências e desempenho possuem telas próprias.

## Contrato do desempenho

`GET /professional_profiles/mine` retorna um array de objetos com `reviews`, `availability`, contagens e valores.
O controller constrói o array antes de chamar `render`; o cliente também normaliza arrays opcionais.

## Limites de integração

Gov.br, cartão, Pix e repasses permanecem simulados. O Pix confirma no quarto polling.
As recomendações de roteiros usam preços e disponibilidade do catálogo; a integração de IA do suporte continua configurável por gateway.
Mapas exigem internet. Não há download automático de tiles para uso offline.
Google requer configuração de um provedor externo e não é apresentado como login funcional sem essa integração.
Alertas de clima e segurança dependem do cadastro administrativo de informações confiáveis.

Esta alteração foi gerada sem executar o app, testes, builds, migrations ou instalação de dependências.

## Trilhas dos guias

O domínio src/features/trails reúne catálogo, página pública, itinerário, editor, calendário de saídas e participantes. A reserva mantém o contrato existente em features/bookings. As rotas novas são /trilhas, /trilhas/[id], /minhas-trilhas e /trilha-editor.

