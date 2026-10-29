# Cacautrip — Expo / React Native / Web

A navegação agora usa Expo Router em `src/app`. Componentes, hooks e sessão ficam fora das rotas. A mesma interface atende web, Android e iOS.

## Preparação manual

Use Node compatível com o Expo 58 (22.13+ ou 24.3+). As novas dependências foram declaradas em `package.json`, sem instalação ou atualização automática do lockfile nesta alteração. Atualize as dependências e o lockfile antes de usar `npm ci`:

```bash
npx expo install expo-router expo-constants expo-linking expo-location expo-secure-store react-native-webview
npm start
```

Configure `EXPO_PUBLIC_API_URL` com o endereço da API. Em celular físico, use o IP do computador na rede local, conforme `.env.example`.

## Fluxo

1. Crie sua conta e autentique Gov.br no perfil (mock).
2. Cadastre guia e/ou motorista, incluindo referência documental, preço, região, serviços e disponibilidade.
3. Na conta administrativa, aprove o cadastro e os documentos.
4. Como turista, explore destinos, encontre profissionais e envie propostas. Pode associar guia, transporte e experiências ao mesmo roteiro.
5. Como profissional, aceite pela agenda. Como turista, pague por Pix ou cartão mock em Reservas.
6. O Pix é aprovado na quarta consulta, com intervalo de 2 segundos. Se fechar a tela, reabra Acompanhar Pix para continuar.
7. O pagamento entra como pendente na carteira do prestador. A conclusão libera o saldo líquido. O repasse é simulado.
8. Avalie o serviço concluído. Denúncias e chamados aparecem na administração.

## Telas

Explorar, profissionais, reservas, agenda, carteira, roteiros, perfil, planos, chat, notificações, emergência, suporte e administração.

Os mapas usam Leaflet e tiles do OpenStreetMap, exigindo internet. A localização é solicitada somente ao tocar em sugestões próximas. A sessão usa SecureStore no dispositivo e sessionStorage na web.

Nenhum comando de instalação, migration, execução, build ou validação foi executado nesta etapa, conforme solicitado.

## Estrutura atual

As jornadas e telas foram reorganizadas em src/features, com rotas pequenas em src/app. Cadastro profissional, preferências e desempenho possuem telas próprias; os detalhes de cada reserva concentram proposta, chat, pagamento e avaliação. Consulte ARCHITECTURE.md e REFACTOR.md.

Planos permitem autorizar renovação mensal simulada, processada pelo serviço maintenance da API. Os recursos de mapa continuam online.

