# Refatoração: jornada e contratos

## Correção do perfil

O endpoint `professional_profiles#mine` agora constrói `payload` antes de chamar `render`.
Isso evita a associação do bloco `do ... end` ao método errado e garante os campos calculados de desempenho.
O app normaliza `reviews` e `availability` como arrays e mantém respostas antigas fora de telas com filtros novos.

## Organização

- Rotas do Expo em `src/app`; telas e regras em `src/features`.
- Conta separada de preferências, cadastro profissional e painel de desempenho.
- Cadastro de guia/motorista em três etapas.
- Explorar e serviços exibem listas compactas; detalhes abrem em telas próprias.
- Reservas e agenda exibem listas; a tela `reserva/[id]` concentra próximos passos, chat, pagamento e avaliação.
- Barra inferior acompanha o perfil ativo.
- Recursos são atualizados ao voltar para uma tela.

## Complementos gerados

- Planejador de roteiros com orçamento, pessoas, tempo, interesses e acessibilidade.
- Sugestão de serviços com estimativas separadas de locais, guia e transporte.
- Compartilhamento por token revogável, sem dados da conta no retorno público.
- Assistente de recomendações baseado no catálogo; suporte com gateway de IA opcional.
- Renovação mensal simulada e idempotente sob bloqueio de usuário.
- Consulta dos próprios dados e abertura de solicitação de exclusão via suporte.
- Endpoint `/health`, limitação local de tentativas de autenticação, filtros de logs e CORS configurável.
- Scripts de backup e restauração manual. Restauração pede confirmação no terminal.
- Compose aguarda banco saudável e prepara migrations ao iniciar a API. O serviço maintenance processa renovações autorizadas a cada cinco minutos.

## Integrações

Gov.br, Pix, cartão e repasses continuam mockados. Pix confirma no quarto polling.
Google não é apresentado como integrado sem credenciais e um provedor configurado.
O suporte utiliza o gateway configurável `SUPPORT_AI_URL`; sem ele, identifica a ajuda local por regras.
A recomendação turística usa o catálogo e não se apresenta como resposta de IA generativa.
Mapas usam tiles online; não há cache offline de mapas nesta implementação.
Informações de clima, segurança e condições são comunicados mantidos pela administração.

## Preparação manual

Não executei instalações, migrations, builds, app, testes ou verificações nesta alteração.

Após revisar o código:

```bash
# API
docker compose up -d --build
# backup manual
bash script/backup.sh
# restauração manual, somente quando desejado
bash script/restore.sh storage/backups/SEU_ARQUIVO.dump
```

O Compose continua voltado a desenvolvimento. Em produção, configure segredos, TLS, origens CORS explícitas, backups externos com retenção e limitação de requisições no gateway. A proteção de dados requer também políticas e procedimentos de operação; o código não substitui essas definições.
