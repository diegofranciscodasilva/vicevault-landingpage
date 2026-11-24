# ViceVault Landing Page

Landing page estática e responsiva, em português, para a campanha demonstrativa da loja gamer fictícia ViceVault. Apresenta a pré-venda de GTA VI, ofertas, consoles e acessórios.

## Conteúdo e funcionalidades

- Hero da campanha, ofertas, catálogo de produtos, benefícios, depoimentos, contato, FAQ, garantias e newsletter.
- Navegação responsiva com menu mobile, indicação da seção ativa e links para voltar ao topo.
- Filtros para o catálogo e para as perguntas frequentes; o FAQ também usa um accordion com um item aberto por vez.
- Contadores regressivos para o lançamento e para uma oferta; o prazo da oferta é mantido no `localStorage`.
- Modal nativo `<dialog>` para reproduzir o trailer em um iframe do YouTube.
- Validação no cliente para contato e newsletter, além de notificações demonstrativas para ações do carrinho.
- HTML semântico, rótulos ARIA, link para pular ao conteúdo e suporte à preferência por movimento reduzido.

## Tecnologias

- HTML, CSS e JavaScript vanilla; sem framework, dependências ou etapa de build.
- Fontes e ícones Material Symbols carregados do Google Fonts.
- Imagens hospedadas externamente; a página precisa de conexão à internet para carregá-las junto às fontes e ao trailer.

## Executar localmente

Não é necessário instalar pacotes. No PowerShell, na raiz do projeto, inicie um servidor estático:

```powershell
python -m http.server 8000
```

Abra `http://localhost:8000` no navegador. Como alternativa, use a extensão Live Server do VS Code.

## Estrutura

```text
index.html
README.md
robots.txt
sitemap.xml
assets/
  css/
    style.css
  js/
    script.js
```

## Limitações da demonstração

As interações são locais e não enviam nem armazenam pedidos ou dados de usuários em um serviço:

- O carrinho apenas exibe uma notificação; não há checkout.
- O formulário de contato valida os campos e mostra uma confirmação local, mas não envia a mensagem.
- A newsletter valida o e-mail e mostra uma confirmação local, mas não cadastra o usuário.

Preços, ofertas, avaliações, endereço e outros dados da loja são conteúdo demonstrativo. Antes de usar comercialmente, substitua esses dados e conecte os formulários e o carrinho aos serviços reais.

## Publicação

O domínio `vicevault.com.br` aparece como exemplo nos metadados e nos arquivos `robots.txt` e `sitemap.xml`. Antes de publicar:

1. Substitua o domínio de exemplo pelo domínio real no HTML, em `robots.txt` e em `sitemap.xml`.
2. Publique os arquivos na raiz do site e configure HTTPS.
3. Revise os links externos, as imagens remotas e o vídeo incorporado.
4. Conecte os formulários e o fluxo de compra a um backend ou provedor apropriado.

## 👨‍💻 Autor

### Diego Francisco da Silva

Desenvolvedor Front-End em formação e estudante de Engenharia de Software.

- **[Site Empresa](https://diegofranciscodasilva.github.io/dev-software-web/)**: dev.software.web Site Empresa
- **[LinkedIn](https://www.linkedin.com/in/diego-francisco-da-silva/)**: diego-francisco-da-silva
- **[GitHub](https://github.com/diegofranciscodasilva)**: diegofranciscodasilva
- **[Instagram](https://www.instagram.com/diego_francisco_da_silva/)**: @diego_francisco_da_silva
- **[Instagram](https://www.instagram.com/dev.software.web/)**: @dev.software.web

---

Feito com ❤️ por Diego.
