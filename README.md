# Vistora — Análise assistida de riscos

Aplicativo mobile (Expo) para técnicos e gestores registrarem situações de campo.

## Stack

- Expo + TypeScript
- Expo Router + Metro
- NativeWind + Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- Firebase Storage

## Configuração

```bash
npm install
cp .env.example .env
npm start
```

No Console Firebase, habilite Authentication (Email/Password), Firestore e Storage. Contas de usuário devem ser criadas pela administração (sem cadastro público no app).

Documento esperado em `users/{uid}`:

```
uid, name, email, role (technician|manager), status (active|inactive), createdAt, updatedAt?
```

Regras sugeridas: ver `firestore.rules` (leitura do próprio perfil; escrita bloqueada no cliente).

## Estrutura atual (Sprint 1)

```
app/
  (auth)/login     # Login + recuperação de senha
  (app)/           # Home, Nova Análise, Histórico, Perfil
components/ui/     # Design system
components/access/ # Gates de perfil/inativo
lib/access.ts      # Labels e módulos por perfil
```

## Escopo

**Pronto:** autenticação, perfis, navegação, home, estrutura de nova análise, histórico vazio, perfil, usuário inativo.

**Próximas sprints:** câmera/galeria, upload, IA, riscos, medidas de controle, NRs.
