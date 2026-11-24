# Nala Clinic — Landing page

Landing page estática (HTML + CSS + JS puro, sem build) para a **Nala Clinic | Estética Sumaré**.
Feita para receber tráfego do Google Ads e da busca orgânica, com CTA para WhatsApp.

## Antes de publicar (obrigatório)

| O quê | Onde |
|---|---|
| Número do WhatsApp (`55` + DDD + número) | `assets/js/main.js` → `CONFIG.whatsapp` |
| ID do Google Ads + rótulo da conversão | `CONFIG.googleAdsId`, `CONFIG.googleAdsLeadLabel` |
| GA4 (opcional) | `CONFIG.ga4Id` |
| Domínio oficial (hoje `www.nalaclinic.com.br`) | `index.html` (canonical, og, JSON-LD), `politica-de-privacidade.html`, `sitemap.xml`, `robots.txt` |
| Telefone e endereço completo no JSON-LD | `index.html` → bloco `application/ld+json` (`telephone`, `streetAddress`, `postalCode`) |
| Razão social / CNPJ no rodapé | `index.html` → `footer__legal` |
| Foto real (opcional) | `assets/img/sobre.webp` + instruções em `style.css` (`.photo-frame__img`) |

## Deploy

- **Vercel:** importe o repositório; framework “Other”, sem comando de build. `vercel.json` aplica os cabeçalhos de segurança.
- **Netlify / Cloudflare Pages:** diretório de publicação = raiz. O arquivo `_headers` aplica os mesmos cabeçalhos.

Segurança incluída: CSP estrita (sem `unsafe-inline`; o único script inline é liberado por hash), HSTS,
`X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`. O site não tem backend nem banco de dados:
o formulário só monta a mensagem e abre o WhatsApp.

> Se você editar o script inline `document.documentElement.classList.add('js')` no `<head>`,
> recalcule o hash SHA-256 e atualize a CSP em `vercel.json` e `_headers`.

## Google Ads

- Tags só carregam **após o aceite de cookies** (LGPD). Cada clique em CTA de WhatsApp (`data-track`) e envio do formulário
  dispara a conversão `AW-…/rótulo` e o evento GA4 `generate_lead`.
- Crie no Google Ads uma conversão do tipo “Lead / Contato” e cole o rótulo em `CONFIG.googleAdsLeadLabel`.
- Use o domínio final como URL final dos anúncios; parâmetros `gclid`/UTM são preservados.

## SEO

Title/description com palavra-chave local, H1 único, Open Graph + imagem 1200×630, JSON-LD
(`BeautySalon` + `WebSite` + `FAQPage`), sitemap, robots, canonical, `hreflang`, metas geo, PWA manifest.
Após publicar: envie o sitemap no Google Search Console e vincule o site ao Perfil da Empresa no Google.

## Estrutura

```
index.html                  página principal
politica-de-privacidade.html
404.html
assets/css/style.css        identidade visual + animações 3D
assets/js/main.js           CONFIG, WhatsApp, consentimento, tracking, efeitos 3D
assets/img/                 favicon, ícones, og-image
vercel.json / _headers      cabeçalhos de segurança e cache
robots.txt / sitemap.xml / site.webmanifest
```
