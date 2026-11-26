# Jessiel Estilo Masculino — Landing page

Landing page estática (HTML + CSS + JS puro, sem build) da **Jessiel Estilo Masculino**, loja física de moda
masculina no Portal Bordon, Sumaré-SP. Feita para tráfego do Google Ads e da busca orgânica, com CTA para o WhatsApp.

## Antes de publicar

| O quê | Onde |
|---|---|
| WhatsApp (já configurado: `5519993667940`) | `assets/js/main.js` → `CONFIG.whatsapp` |
| ID do Google Ads + rótulo da conversão | `CONFIG.googleAdsId`, `CONFIG.googleAdsLeadLabel` |
| GA4 (opcional) | `CONFIG.ga4Id` |
| Domínio oficial (hoje `www.jessielestilomasculino.com.br`, provisório) | `index.html` (canonical, og, JSON-LD), `politica-de-privacidade.html`, `sitemap.xml`, `robots.txt` |
| Horário de abertura e fechamento | JSON-LD em `index.html` (adicionar `openingHoursSpecification`) e seção “Visite a loja” |
| CEP, razão social e CNPJ | JSON-LD (`postalCode`) e rodapé (`footer__legal`) |
| Fotos em alta resolução (recomendado) | `assets/img/*.webp`: as atuais foram recortadas dos posts do Instagram. Troque pelos originais mantendo os nomes |

## Deploy (pasta `jessiel/` como raiz do site)

- **Vercel:** importe o repositório, defina **Root Directory = `jessiel`**, framework “Other”, sem comando de build.
  O `vercel.json` desta pasta aplica os cabeçalhos de segurança.
- **Netlify / Cloudflare Pages:** diretório de publicação = `jessiel`. O arquivo `_headers` aplica os mesmos cabeçalhos.

Segurança: CSP estrita (sem `unsafe-inline`; o único script inline é liberado por hash), HSTS, `X-Frame-Options: DENY`,
`nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP. Não há backend nem banco de dados: o formulário só monta a
mensagem e abre o WhatsApp.

> Se editar o script inline `document.documentElement.classList.add('js')` no `<head>`, recalcule o hash SHA-256
> e atualize a CSP em `vercel.json` e `_headers`.

## Google Ads

- As tags só carregam **depois do aceite de cookies** (LGPD). Cada clique em CTA de WhatsApp (`data-track`) e cada envio
  do formulário disparam a conversão `AW-…/rótulo` e o evento GA4 `generate_lead`.
- Crie no Google Ads uma conversão do tipo “Lead / Contato” e cole o rótulo em `CONFIG.googleAdsLeadLabel`.
- Sugestões de palavras-chave: *loja de roupa masculina Sumaré*, *camisa de linho masculina*, *blazer masculino Sumaré*,
  *roupa masculina para festa de fim de ano*, *moda masculina Hortolândia / Nova Odessa*. Raio sugerido: 15 km da loja.
- `gclid`/UTM são registrados na sessão e enviados como `traffic_source` no GA4.

## SEO

Title/description com palavra-chave local, H1 único, Open Graph + imagem 1200×630, JSON-LD (`ClothingStore` com
endereço e telefone, `WebSite`, `FAQPage`), sitemap, robots, canonical, `hreflang`, metas geo, manifest PWA, imagens WebP
com `width`/`height` e `loading="lazy"`.
Depois de publicar: envie o sitemap no Google Search Console e vincule o site ao **Perfil da Empresa no Google**
(o que mais pesa na busca local “perto de mim”).

## Efeitos 3D

- Hero: cena em perspectiva com dois looks em profundidade, medalhão do logo girando e parallax pelo mouse e pela rolagem.
- Seções “dobram” para cima ao entrarem na tela (`data-depth`) e o conteúdo surge em rotação 3D (`data-reveal`).
- Cards com inclinação 3D ao passar o mouse (`data-tilt`).
- Lookbook em carrossel cilíndrico 3D (arrastar, setas ou teclado).
- Tudo é desligado com `prefers-reduced-motion` (o lookbook vira uma grade).

## Estrutura

```
index.html                   página principal
politica-de-privacidade.html
404.html
assets/css/style.css         identidade visual + animações 3D
assets/js/main.js            CONFIG, WhatsApp, consentimento, tracking, efeitos 3D
assets/img/                  looks (WebP), favicon, ícones, og-image
vercel.json / _headers       cabeçalhos de segurança e cache
robots.txt / sitemap.xml / site.webmanifest
```
