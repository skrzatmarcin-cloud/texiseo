# TexiSEO.ai & Enterprise — Pełna Architektura Aplikacji

**Data:** 2026-04-19  
**Status:** Produkcyjny  
**Typ:** React + Base44 Backend as a Service

---

## 📋 Spis Treści
1. [Struktura Aplikacji](#struktura-aplikacji)
2. [System Autoryzacji](#system-autoryzacji)
3. [Menu Główne & Nawigacja](#menu-główne--nawigacja)
4. [Moduły Brandów](#moduły-brandów)
5. [Encje (Baza Danych)](#encje-baza-danych)
6. [Przepływy Danych](#przepływy-danych)
7. [Komponenty UI](#komponenty-ui)

---

## 📁 Struktura Aplikacji

```
src/
├── pages/                          # Strony główne aplikacji
│   ├── WelcomeScreen.jsx          # Hub selektor (8 brandów)
│   ├── TexiSEOAdmin.jsx           # Panel administratora
│   ├── TeacherHub.jsx             # Platform nauczycieli
│   ├── BusinessHub.jsx            # System zarządzania firmami
│   ├── ContentIdeas.jsx           # Generator pomysłów SEO
│   ├── Clusters.jsx               # Tematy tematyczne
│   ├── PagesModule.jsx            # Zarządzanie stronami
│   ├── BriefBuilder.jsx           # Tworzenie briefów
│   ├── BriefDetail.jsx            # Edycja briefu
│   ├── InternalLinks.jsx          # Linki wewnętrzne
│   ├── FAQSchema.jsx              # FAQ sekcje
│   ├── RefreshCenter.jsx          # Odświeżanie treści
│   ├── SEOQAChecker.jsx           # QA strony
│   ├── PublishingQueue.jsx        # Kanban publikacji
│   ├── WordPress.jsx              # Integracja WordPress
│   ├── Automations.jsx            # Automatyzacje
│   ├── Integrations.jsx           # Zarządzanie integracjami
│   ├── BacklinkSystem.jsx         # System backlinkowy
│   ├── ContentEngine.jsx          # Generator treści multi-platform
│   ├── SocialMedia.jsx            # Zarządzanie social media
│   ├── Analytics.jsx              # Google Search Console
│   ├── ExecutionCenter.jsx        # Panel wykonania
│   ├── CompetitorIntel.jsx        # Analiza konkurencji
│   ├── SEOAutopilot.jsx           # Autopilot SEO
│   ├── SecurityMonitor.jsx        # Monitoring bezpieczeństwa
│   ├── BusinessDirectory.jsx      # Katalog firm
│   ├── SettingsPage.jsx           # Ustawienia aplikacji
│   ├── DemoLogin.jsx              # Demo login
│   ├── PrivacyPolicy.jsx          # Polityka prywatności
│   └── SelfPromotionHub.jsx       # Self-promotion (SEO dla TexiSEO)
│
├── components/
│   ├── Layout.jsx                 # Layout główny + sidebar
│   ├── LoginGate.jsx              # Gate autentykacji
│   ├── PublicSupportChat.jsx      # Chat wsparcia
│   ├── CookieBanner.jsx           # Banner ciasteczek
│   ├── LanguageSwitcher.jsx       # Przełącznik języka
│   ├── PageHeader.jsx             # Header strony
│   │
│   ├── admin/
│   │   └── RequestsTab.jsx        # Tab zgłoszeń
│   │
│   ├── teachers/                  # Komponenty nauczycieli
│   │   ├── TeacherList.jsx        # Lista nauczycieli
│   │   ├── TeacherForm.jsx        # Formularz nauczyciela
│   │   ├── TeacherPlanner.jsx     # Planer lekcji
│   │   ├── TeacherPayroll.jsx     # Rozliczenia
│   │   ├── TeacherChat.jsx        # Chat z nauczycielami
│   │   ├── TeacherCourseManager.jsx
│   │   ├── TeacherStats.jsx       # Statystyki
│   │   ├── LiveLessonsPanel.jsx   # Live lekcje
│   │   ├── MarketplaceView.jsx    # Marketplace
│   │   ├── CourseMarketplace.jsx  # Sprzedaż kursów
│   │   ├── CommissionPanel.jsx    # System prowizji
│   │   └── AdminPanel.jsx         # Admin panel
│   │
│   ├── business/                  # Komponenty biznesu
│   │   ├── CompaniesPanel.jsx     # Lista firm
│   │   ├── CompanyForm.jsx        # Formularz firmy
│   │   ├── InventoryPanel.jsx     # Zarządzanie magazynem
│   │   └── ProductionPanel.jsx    # Zarządzanie produkcją
│   │
│   ├── content/                   # Komponenty content
│   │   ├── ContentIdeaEditor.jsx
│   │   ├── ContentIdeasTable.jsx
│   │   └── ContentIdeasCards.jsx
│   │
│   ├── backlinks/                 # System backlinkowy
│   │   ├── BacklinkOpportunitiesTab.jsx
│   │   ├── ExecutionPanel.jsx
│   │   ├── ApprovalQueueTab.jsx
│   │   ├── BacklinkDatabase.jsx
│   │   └── BacklinkPerformance.jsx
│   │
│   ├── wordpress/                 # Integracja WordPress
│   │   ├── WPConnectionSettings.jsx
│   │   ├── WPContentSync.jsx
│   │   ├── WPContentMapping.jsx
│   │   ├── WPDraftPublishing.jsx
│   │   ├── WPHealthDashboard.jsx
│   │   └── WPSyncLogs.jsx
│   │
│   ├── briefs/                    # Brief builder
│   │   └── BriefSectionBlock.jsx
│   │
│   ├── pages/                     # Page management
│   │   ├── PageHealthPanel.jsx
│   │   ├── PageRecommendationsPanel.jsx
│   │   └── PageWeaknessPanel.jsx
│   │
│   ├── queue/                     # Publishing queue
│   │   ├── KanbanBoard.jsx
│   │   └── QueueTable.jsx
│   │
│   ├── faq/                       # FAQ manager
│   │   └── FAQEditor.jsx
│   │
│   ├── dashboard/                 # Dashboard components
│   │   ├── HomeHub.jsx
│   │   ├── ClusterSnapshot.jsx
│   │   ├── ContentByStatus.jsx
│   │   ├── RecommendedActions.jsx
│   │   ├── TopOpportunities.jsx
│   │   └── WeakPages.jsx
│   │
│   └── ui/                        # Shadcn UI components
│       ├── button.jsx
│       ├── input.jsx
│       ├── select.jsx
│       ├── card.jsx
│       ├── dialog.jsx
│       ├── tabs.jsx
│       └── ... (40+ komponenty)
│
├── functions/                     # Backend functions (Deno)
│   ├── wordpressProxy.js         # Proxy do WordPress
│   ├── wordpressAutoImport.js    # Auto-import z WordPress
│   ├── wordpressInjectLink.js    # Inject linki do WordPress
│   ├── gscProxy.js               # Google Search Console proxy
│   ├── backlinkAgent.js          # AI agent backlinkowy
│   ├── competitorAgent.js        # AI agent konkurencji
│   ├── securityAgent.js          # AI agent bezpieczeństwa
│   ├── linkExchangeAgent.js      # AI agent link exchange
│   ├── generateIdeas.js          # Generator pomysłów
│   ├── clusterGapDetection.js    # Detekcja luk w klastrach
│   ├── pageAuditTrigger.js       # Audit stron
│   └── approvalToBrief.js        # Zatwierdzenie → Brief
│
├── agents/                        # AI Agents
│   ├── brand_seo_agent.json      # SEO agent dla brandy
│   ├── texiseo_support_agent.json # Support agent
│   └── enterprise_business_agent.json # Business agent
│
├── entities/                      # JSON Schemas
│   ├── Competitors.json
│   ├── Teachers.json
│   ├── BusinessClients.json
│   ├── InventoryItems.json
│   ├── ProductionOrders.json
│   ├── TeacherLessons.json
│   ├── TeacherPayments.json
│   ├── BusinessDirectory.json
│   ├── LoginAttempts.json
│   ├── ClientRequests.json
│   ├── ContentIdeas.json
│   ├── Pages.json
│   ├── Clusters.json
│   ├── FAQItems.json
│   ├── RefreshTasks.json
│   ├── Backlinks.json
│   ├── BacklinkOpportunities.json
│   ├── InternalLinkSuggestions.json
│   ├── PublishingQueue.json
│   ├── Briefs.json
│   ├── WordPressSettings.json
│   ├── WordPressSyncLog.json
│   ├── WordPressContentMap.json
│   ├── PlatformSettings.json
│   ├── Suppliers.json
│   ├── TeacherMessages.json
│   ├── TeacherCourses.json
│   ├── BrandRules.json
│   ├── TrafficData.json
│   ├── ContentItems.json
│   ├── Recommendations.json
│   ├── SecurityAlerts.json
│   ├── LinkExchanges.json
│   ├── CompetitorAnalysis.json
│   ├── ExecutionLogs.json
│   ├── PlatformPosts.json
│   └── BacklinkMaterials.json
│
├── lib/
│   ├── AuthContext.jsx           # Kontekst autoryzacji
│   ├── HubContext.jsx            # Kontekst wybranych hubów
│   ├── LanguageContext.jsx       # Kontekst języka (PL/EN)
│   ├── i18n.js                   # Translacje
│   ├── query-client.js           # React Query config
│   ├── utils.js                  # Utility functions
│   ├── pageHealth.js             # Health scoring
│   ├── seoQA.js                  # QA rules
│   ├── constants.js              # Stałe
│   ├── polishCities.js           # Lista miast polski
│   ├── PageNotFound.jsx          # 404 page
│   └── app-params.js
│
├── api/
│   └── base44Client.js           # SDK klient
│
├── utils/
│   └── index.ts                  # Utility exports
│
├── hooks/
│   └── use-mobile.jsx            # Responsive hook
│
├── App.jsx                       # Router główny
├── index.css                     # Design tokens
├── main.jsx                      # Entry point
├── index.html                    # HTML
├── tailwind.config.js            # Tailwind config
└── vite.config.js
```

---

## 🔐 System Autoryzacji

### Role Dostępu:
```
┌─────────────────────────────────────────────────┐
│ SUPERADMIN (Marcin)                             │
│ - Pełny dostęp do wszystkich 4 brandów          │
│ - Admin panel (zgłoszenia, użytkownicy)         │
│ - Wszystkie menu i funkcje                      │
│ - Zarządzanie ustawieniami                      │
├─────────────────────────────────────────────────┤
│ ADMIN USER                                      │
│ - Dostęp do przypisanych funkcji                │
│ - Może zapraszać nowych użytkowników            │
│ - Ograniczony dostęp do admin panel             │
├─────────────────────────────────────────────────┤
│ REGULAR USER                                    │
│ - Dostęp do podstawowych funkcji                │
│ - Własne dane i ustawienia                      │
│ - Brak dostępu do admin panelu                  │
├─────────────────────────────────────────────────┤
│ DEMO MODE (PublicUser)                          │
│ - Read-only dostęp                              │
│ - Demo data (nauczyciele, firmy)                │
│ - Bez możliwości edycji                         │
└─────────────────────────────────────────────────┘
```

### Login Credentials:
```
🔑 SUPERADMIN
   Username: Marcin
   Password: Marcinek2026!
   
🔑 ADMIN
   Username: TexiAdmin
   Password: TxSEO@Admin2026!
   
📧 Admin Email: skrzatmarcin@gmail.com

🎬 DEMO MODE
   - Bez hasła
   - Dwa typu demo:
     1. Teacher Hub (LinguaToons demo)
     2. Business Hub (Enterprise demo)
```

---

## 📍 Menu Główne & Nawigacja

### WelcomeScreen (Home / "/" route)

Selektor 8 Hubów:

```
┌─────────────────────────────────────────────────────────────────┐
│                     TexiSEO.ai & Enterprise                     │
│                      Witaj w [UserCompany]                      │
├─────────────────────────────────────────────────────────────────┤
│
│  1️⃣ BEZPIECZEŃSTWO (Security Center)
│     └─ Security Mo... → /security
│     └─ WordPress → /wordpress
│     └─ Backlinki → /backlinks
│     └─ Automations → /automations
│
│  2️⃣ SEO NARZĘDZIA
│     └─ Pomysły tre... → /content-ideas
│     └─ Klastry → /clusters
│     └─ Strony → /pages
│     └─ Brief Builder → /brief-builder
│     └─ Linki wewn. → /internal-links
│     └─ Publikacje → /publishing-queue
│
│  3️⃣ KATALOG FIRM
│     └─ Katalog → /directory
│     └─ Konkurenci → /competitors
│     └─ Link Exch... → /backlinks
│     └─ SEO Autopilot → /seo-autopilot
│
│  4️⃣ TEACHERS HUB (LinguaToons)
│     └─ Nauczyciele → /teachers
│     └─ Planer lekcji → /teachers
│     └─ Lekcje Live → /teachers
│     └─ Rozliczenia → /teachers
│
│  5️⃣ ANALITYKA
│     └─ Analytics → /analytics
│     └─ Content En... → /content-engine
│     └─ Social Media → /social-media
│     └─ Exec. Center → /execution-center
│
│  6️⃣ BUSINESS HUB
│     └─ Firmy → /business
│     └─ Magazyn → /business
│     └─ Produkcja → /business
│     └─ Dostawcy → /business
│
│  7️⃣ SEO AUTOPROMOCJA
│     └─ Generator treści → /self-promotion
│     └─ Analiza konkurencji → /self-promotion
│     └─ Mapa słów klucz. → /self-promotion
│     └─ Agent SEO AI → /self-promotion
│
│  👑 TEXISEO ADMIN (Superadmin only)
│     └─ Dashboard → /texiseo-admin
│     └─ Zgłoszenia → /texiseo-admin
│     └─ Użytkownicy → /texiseo-admin
│     └─ Płatności → /texiseo-admin
│
├─────────────────────────────────────────────────────────────────┤
│ [Strona Główna] [Ustawienia] [Integracje] · [🎬 Spróbuj Demo]  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Moduły Brandów

### 1️⃣ TexiSEO.ai (SEO Platform)

**Ścieżka:** `/texiseo-admin?brand=texiseo`

**Taby:**
- 📊 **Dashboard** — Overview SEO, zgłoszenia, statystyki
- 🔍 **SEO Tools** — Pomysły, briefs, content planning
- 🔗 **Backlinki** — Monitoring, acquisition, performance
- 🌐 **WordPress** — Sync, publikacja, health check
- 💬 **Zgłoszenia** — Client requests, AI responses, escalation

**Funkcjonalności:**
```
✅ ContentIdeas — Generator pomysłów treści
✅ Clusters — Organizacja topików
✅ Pages — Audit i health scoring
✅ BriefBuilder — Tworzenie briefów
✅ InternalLinks — Sugestie i injections
✅ FAQSchema — FAQ organizacja
✅ PublishingQueue — Kanban publikacji
✅ WordPress Integration — Auto-sync + publish
✅ BacklinkSystem — Acquisition + monitoring
✅ Competitors — Analiza konkurencji
✅ SEOAutopilot — Automatyczne skanowanie
```

---

### 2️⃣ LinguaToons (Teacher Platform)

**Ścieżka:** `/texiseo-admin?brand=linguatoons`

**Taby:**
- 📊 **Dashboard** — Nauczyciele, lekcje, rozliczenia
- 👨‍🏫 **Nauczyciele** — CRUD nauczycieli, profile, dane
- 📚 **Lekcje** — Planer, live sessions, homework
- 💰 **Rozliczenia** — Payroll, invoices, payments

**Funkcjonalności:**
```
✅ TeacherHub (10 tabs)
   ├─ Marketplace — katalog nauczycieli
   ├─ Courses — sprzedaż kursów
   ├─ Teachers — CRUD, profile
   ├─ Planer — harmonogram lekcji
   ├─ Live — Google Meet integracja
   ├─ Wiadomości — chat
   ├─ Rozliczenia — payroll
   ├─ Prowizje — commission system
   ├─ Statystyki — analytics
   └─ Admin — panel zarządzania
```

---

### 3️⃣ Enterprise (Business Management)

**Ścieżka:** `/texiseo-admin?brand=enterprise`

**Taby:**
- 📊 **Dashboard** — Firmy, użytkownicy, płatności
- 🏢 **Firmy** — CRUD, profile, kontakty
- 👥 **Użytkownicy** — Zarządzanie dostępem
- 💳 **Płatności** — Invoices, subscriptions

**Funkcjonalności:**
```
✅ BusinessHub (5 tabs)
   ├─ Companies — CRUD firm, profile
   ├─ Inventory — Magazyn, stock management
   ├─ Production — Zlecenia produkcji
   ├─ Suppliers — Dostawcy, kontakty
   └─ Reports — Raporty finansowe
```

---

### 4️⃣ Security (Admin Center)

**Ścieżka:** `/texiseo-admin?brand=security`

**Funkcjonalności:**
```
✅ SecurityMonitor
   ├─ Login Attempts — Tracking logowań
   ├─ Security Alerts — Alerty bezpieczeństwa
   ├─ IP Blocking — Blokowanie IP
   └─ AI Risk Assessment — Ocena ryzyka
```

---

## 📊 Encje (Baza Danych)

### SEO & Content

| Encja | Pola | Przeznaczenie |
|-------|------|---------------|
| **ContentIdeas** | title, keyword, content_type, status, priority_score | Pomysły na artykuły |
| **Clusters** | name, pillar_page_id, authority_score, support_content_count | Tematyczne klastery |
| **Pages** | url, title, page_type, status, trust_score, cta_type | Strony w serwisie |
| **Briefs** | content_idea_id, brief_title, h2_structure, faq, meta | Briefs artykułów |
| **PublishingQueue** | content_idea_id, current_status, assigned_to, due_date | Pipeline publikacji |
| **FAQItems** | question, answer, related_page_id, faq_type | FAQ sekcje |
| **RefreshTasks** | page_id, task_type, priority, status | Zadania refresh |
| **InternalLinkSuggestions** | source_page_id, target_page_id, relevance_score | Linki wewnętrzne |

### Backlinki

| Encja | Pola | Przeznaczenie |
|-------|------|---------------|
| **Backlinks** | domain, url, anchor_text, type, status | Istniejące backlinki |
| **BacklinkOpportunities** | prospect_url, niche, difficulty, relevance | Nowe okazje |
| **BacklinkMaterials** | title, content_url, pitch | Materiały do wysłania |
| **LinkExchanges** | partner, mutual, status | Wymiana linków |
| **Competitors** | name, url, niche, notes, active | Monitorowanie konkurencji |

### Nauczyciele (LinguaToons)

| Encja | Pola | Przeznaczenie |
|-------|------|---------------|
| **Teachers** | first_name, email, languages, hourly_rate, status | Profil nauczyciela |
| **TeacherLessons** | teacher_id, lesson_date, language, level, status | Lekcje |
| **TeacherPayments** | teacher_id, amount, paid, invoice_id | Płatności |
| **TeacherMessages** | teacher_id, message, direction, read | Chat |
| **TeacherCourses** | teacher_id, course_title, price, enrolled_count | Kursy |

### Biznes (Enterprise)

| Encja | Pola | Przeznaczenie |
|-------|------|---------------|
| **BusinessClients** | company_name, nip, regon, email, status | Firmy klienckie |
| **InventoryItems** | name, sku, quantity, unit_price, status | Magazyn |
| **ProductionOrders** | product_name, quantity_ordered, status, priority | Zlecenia |
| **Suppliers** | name, nip, email, categories, rating | Dostawcy |
| **BusinessDirectory** | business_name, category, city, languages | Katalog |

### Administracja

| Encja | Pola | Przeznaczenie |
|-------|------|---------------|
| **ClientRequests** | type, message, ai_response, status, priority | Zgłoszenia klientów |
| **LoginAttempts** | ip_address, username_tried, success, fail_count | Audyt logowań |
| **SecurityAlerts** | alert_type, severity, description, resolved | Alerty systemu |
| **ExecutionLogs** | function_name, status, result, timestamp | Logi wykonań |
| **PlatformSettings** | key, value, category | Ustawienia |

### Integracje

| Encja | Pola | Przeznaczenie |
|-------|------|---------------|
| **WordPressSettings** | blog_url, api_key, categories, status | WP config |
| **WordPressSyncLog** | post_id, sync_date, status | Historia sync |
| **WordPressContentMap** | content_idea_id, wp_post_id | Mapowanie |

---

## 🔄 Przepływy Danych

### 1️⃣ Przepływ SEO

```
WelcomeScreen
    ↓
ContentIdeas (generator pomysłów)
    ↓
[AI: InvokeLLM] → generate ideas
    ↓
Save to ContentIdeas entity
    ↓
Clusters (organizacja topików)
    ↓
BriefBuilder (tworzenie briefów)
    ↓
Briefs entity
    ↓
PublishingQueue (kanban)
    ↓
WordPress Integration
    ↓
WP automatycznie publikuje post
    ↓
BacklinkSystem (budowanie backlinkow)
    ↓
Analytics (monitoring)
```

### 2️⃣ Przepływ Nauczycieli

```
WelcomeScreen
    ↓
TeacherHub → Marketplace
    ↓
TeacherList (CRUD nauczycieli)
    ↓
Teachers entity
    ↓
TeacherPlanner (harmonogram lekcji)
    ↓
TeacherLessons entity
    ↓
LiveLessonsPanel (Google Meet)
    ↓
TeacherPayroll (rozliczenia)
    ↓
TeacherPayments entity
    ↓
CommissionPanel (prowizje)
```

### 3️⃣ Przepływ Biznesu

```
WelcomeScreen
    ↓
BusinessHub → Companies
    ↓
CompanyForm → CRUD firm
    ↓
BusinessClients entity
    ↓
InventoryPanel (magazyn)
    ↓
InventoryItems entity
    ↓
ProductionPanel (zlecenia)
    ↓
ProductionOrders entity
    ↓
Reports (raporty)
```

### 4️⃣ Przepływ Zgłoszeń

```
PublicSupportChat (widget) lub LoginGate
    ↓
User submits request/question/feature
    ↓
[AI: InvokeLLM] → AI response
    ↓
Save to ClientRequests entity
    ↓
TexiSEOAdmin → Requests tab
    ↓
Admin reviews (status, priority, escalation)
    ↓
[Optional] SendEmail to admin
    ↓
Mark as resolved/implemented
```

---

## 🎨 Komponenty UI

### Layout Główny
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (Layout.jsx)                                   │
│  ├─ Logo                                                │
│  ├─ Navigation (dynamiczna wg aktywnego hubu)          │
│  ├─ Home/Settings/Integrations                          │
│  └─ Collapse toggle                                     │
├─────────────────────────────────────────────────────────┤
│ HEADER                                                  │
│ ├─ Search                                               │
│ ├─ Language switcher                                    │
│ ├─ Hub label                                            │
│ ├─ User avatar                                          │
│ └─ Logout button                                        │
├─────────────────────────────────────────────────────────┤
│ CONTENT AREA                                            │
│ ├─ Page content                                         │
│ ├─ Optional: Hub back-button strip                      │
│ └─ Dynamic per page                                     │
└─────────────────────────────────────────────────────────┘
```

### Shadcn UI Components Used
```
✅ Button, Input, Select, Card, Dialog
✅ Tabs, Badge, Alert, Avatar
✅ Dropdown, Menu, Popover, Tooltip
✅ Toast, Accordion, Collapsible
✅ Progress, Slider, Calendar, Switch
✅ Radio Group, Checkbox, Label
✅ Form, Textarea, Aspect Ratio
✅ Scroll Area, Separator, Skeleton
✅ Sidebar, Sheet, Drawer
✅ Context Menu, Command
✅ Hover Card, Pagination
✅ Chart (Recharts integration)
```

---

## 🔌 Integracje Zewnętrzne

```
Base44 SDK Methods:
├─ base44.entities.*.list()           # Read entities
├─ base44.entities.*.create()         # Create records
├─ base44.entities.*.update()         # Update records
├─ base44.entities.*.delete()         # Delete records
├─ base44.entities.*.filter()         # Filter with query
├─ base44.entities.*.subscribe()      # Real-time updates
├─ base44.auth.me()                   # Get current user
├─ base44.auth.updateMe()             # Update user data
├─ base44.auth.redirectToLogin()      # Trigger login
├─ base44.users.inviteUser()          # Invite new user
├─ base44.functions.invoke()          # Call backend function
├─ base44.integrations.Core.InvokeLLM() # AI LLM calls
├─ base44.integrations.Core.SendEmail() # Email
├─ base44.integrations.Core.UploadFile() # File upload
├─ base44.analytics.track()           # Event tracking
├─ base44.agents.*                    # AI agents
└─ base44.connectors.*                # OAuth connectors
```

### Zewnętrzne APIs:
```
✅ WordPress REST API (wordpressProxy)
✅ Google Search Console (gscProxy)
✅ Google Analytics (future)
✅ Google Drive (future)
✅ Stripe (future - payments)
✅ Slack (webhooks)
✅ Zapier (automation)
```

---

## 🚀 Backend Functions

| Funkcja | Cel | Trigger |
|---------|-----|---------|
| **wordpressProxy** | Proxy do WP REST API | Manual / Integration |
| **wordpressInjectLink** | Inject linki do postów | Backlink approval |
| **wordpressAutoImport** | Auto-import postów | Scheduled |
| **gscProxy** | Google Search Console data | Scheduled |
| **backlinkAgent** | AI backlink acquisition | Scheduled daily |
| **competitorAgent** | AI competitor analysis | Manual |
| **securityAgent** | AI security scanning | Scheduled |
| **generateIdeas** | Content ideas generator | Manual |
| **clusterGapDetection** | Find missing topics | Scheduled |
| **pageAuditTrigger** | Page health audit | Scheduled |

---

## 🤖 AI Agents

```
1️⃣ brand_seo_agent.json
   └─ Tools: ContentIdeas, Pages, Clusters
   └─ WhatsApp: Enabled
   └─ Use: "Pomóż mi generować pomysły SEO"

2️⃣ texiseo_support_agent.json
   └─ Tools: ClientRequests, Pages
   └─ WhatsApp: Enabled
   └─ Use: "Chat support" (public)

3️⃣ enterprise_business_agent.json
   └─ Tools: BusinessClients, InventoryItems, ProductionOrders
   └─ WhatsApp: Enabled
   └─ Use: "Zarządzanie firmą"
```

---

## 🎯 Key Flows

### New User Onboarding
```
1. Login/Register
2. Choose hub (if demo, pick teacher/business)
3. Fill company info (CompanyForm)
4. Select language/preferences
5. Redirect to hub
```

### Content Publishing Pipeline
```
1. Generate idea (AI)
2. Organize in cluster
3. Create brief
4. Review brief (QA)
5. Publish to queue
6. Admin approves
7. Auto-sync to WordPress
8. Monitor performance
```

### Teacher Lesson Booking
```
1. Teacher sets availability
2. Student books lesson
3. Email invitation sent
4. Google Meet link generated
5. Lesson recorded/notes saved
6. Payment processed
7. Commission calculated
```

### Backlink Acquisition
```
1. Find opportunities (AI scan)
2. Generate content/pitch
3. Outreach to prospects
4. Track approval status
5. Inject link to WordPress
6. Monitor backlink status
7. Report performance
```

---

## 📈 Analytics & Monitoring

```
✅ Page health scoring (20+ metrics)
✅ SEO performance tracking
✅ Backlink monitoring
✅ Teacher performance analytics
✅ Business revenue reports
✅ Login attempt tracking
✅ AI cost monitoring
✅ Error/execution logs
```

---

## 🔐 Security

```
✅ AuthContext (JWT tokens)
✅ AdminGuard (role-based access)
✅ Login attempt tracking (LoginAttempts entity)
✅ IP blocking (30 min after 3 failed attempts)
✅ Email alerts for admins
✅ HTTPS only
✅ Rate limiting (future)
✅ 2FA (future)
```

---

## 📱 Responsiveness

```
✅ Mobile-first design
✅ Tailwind CSS breakpoints
✅ Sidebar collapses on mobile
✅ Dropdown menus for navigation
✅ Touch-friendly buttons/inputs
✅ Optimized for iPad/tablet
```

---

## 🎨 Design System

```
Color Scheme:
├─ Primary: #6366F1 (Indigo)
├─ Secondary: #E2E8F0 (Slate light)
├─ Destructive: #EF4444 (Red)
├─ Success: #10B981 (Green)
├─ Warning: #F59E0B (Amber)
└─ Sidebar: #0F1729 (Dark slate)

Typography:
├─ Font: Inter
├─ H1: 2xl bold
├─ H2: xl bold
├─ Body: sm regular
└─ Small: xs regular

Spacing:
├─ Base unit: 0.25rem (4px)
├─ Gap: 4, 6, 8, 12, 16px
└─ Padding: 4, 6, 8, 12, 16px
```

---

## 🔔 Notifications

```
✅ Toast notifications (Sonner)
✅ Email notifications (Core.SendEmail)
✅ WhatsApp (Agent webhooks)
✅ In-app alerts
✅ Browser notifications (future)
```

---

## 🌍 Internationalization

```
Languages Supported:
├─ 🇵🇱 Polish (pl) — default
├─ 🇬🇧 English (en)
└─ More via i18n.js

Toggle: LanguageSwitcher (top right)
```

---

## 🚀 Deployment

```
Platform: Base44
Build: Vite + React
Backend: Deno Deploy functions
Database: Base44 managed
Storage: Base44 file storage
Auth: Base44 auth (email + password)
```

---

## 📞 Support

```
Public Chat: PublicSupportChat widget
├─ AI-powered
├─ Route to ClientRequests
├─ Admin escalation

In-App: Contact icons/links
Admin: /texiseo-admin → Requests tab
```

---

**Koniec dokumentacji.**  
*Ostatnia aktualizacja: 2026-04-19*