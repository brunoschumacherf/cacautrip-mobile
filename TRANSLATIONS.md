# Idiomas do aplicativo

O app oferece Português (padrão), English e Español. O seletor fica no login, no cabeçalho de todas as páginas e em Minha conta → Editar dados e preferências. A escolha muda os textos sem recriar a sessão ou apagar formulários e é salva localmente (localStorage na web; SecureStore no aparelho).

`src/i18n/catalog.tsv` contém uma expressão da interface por linha: português, inglês e espanhol, separados por `|`. `catalog.json` é o catálogo carregado pelo Metro. Ao editar traduções, regenere o JSON com o trecho abaixo no PowerShell, na pasta cacautrip-mobile:

```powershell
$catalog = [ordered]@{}
foreach ($line in Get-Content src/i18n/catalog.tsv) {
  $columns = $line.Split('|')
  if ($columns.Length -eq 3) { $catalog[$columns[0]] = @($columns[1], $columns[2]) }
}
$catalog | ConvertTo-Json -Depth 5 | Set-Content src/i18n/catalog.json
```

Use `LocalizedText` para textos nativos, os componentes de `ui` para formulários e botões, e `useLanguage().t` para atributos, acessibilidade e elementos DOM. Use `translate` de `i18n/core` em utilitários sem React. Textos compostos com parâmetros ficam em `patterns` no mesmo arquivo; os valores interpolados mantêm o conteúdo original. Valores continuam em reais e datas de entrada continuam no formato exigido pela API; a apresentação de datas e moedas usa o locale selecionado.

Mensagens de chat e suporte, nomes, endereços e descrições cadastradas permanecem no idioma original. Use `translate={false}` em `LocalizedText`, `Title` e `Muted` para conteúdo de usuários. Não existe chamada a tradutor externo. Expressões ausentes no catálogo mantêm o original em português. A tradução desta entrega é da interface Expo, incluindo a web; o painel Rails /gestao mantém seu idioma atual.

Não foram executados testes, lint, build nem servidor, seguindo a preferência de validação manual desta conversa.
