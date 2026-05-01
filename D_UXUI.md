# Delight Dashboard — UX/UI Documentation

---

## 1. 제품 개요

Delight Dashboard는 NAVER 내부 AI 에이전트 운영 플랫폼이다. Org 관리자·워크스페이스 관리자·에이전트 빌더가 에이전트의 생애주기(Build → Staging → Production)를 한 곳에서 관리한다. 단일 SPA(React + React Router)로 구성되며, 별도 페이지 전환 없이 컨텍스트 기반 레이아웃이 전환된다.

---

## 2. 사용자 Role 및 접근 제어

에이전트 플랫폼을 사용하는 역할은 세 가지이며, Role마다 보이는 UI와 가능한 액션이 다르다.

| 기능 | Org Admin | Workspace Admin | Agent Builder / Operator |
|---|---|---|---|
| 새 워크스페이스 생성 | ✓ | ✓ | — |
| 새 에이전트 생성 | ✓ | ✓ | — |
| Build (Dev·Staging·Prod) | ✓ | ✓ | ✓ |
| Promote to Staging/Prod | ✓ | ✓ | ✓ |
| Profile 아바타 색상 | violet | blue | teal |

- Role 전환은 TopBar Profile 드롭다운에서 즉시 가능 (시뮬레이션 목적).
- 각 Role은 고유한 페르소나로 대표된다: Org Admin = Sora Kim, Workspace Admin = Minho Park, Builder = Jisoo Lee.
- Role 전환 시 메뉴 접근 권한·New 버튼 표시·프로필 아바타 색상이 동시에 변경된다.
- Dashboard 화면에서는 Role마다 표시되는 지표와 Action Items가 다르다.

---

## 3. 정보 구조 (Information Architecture)

```
Organization
└── Workspace (복수)
    └── Agent (복수)
        ├── Overview         — 에이전트 상태·파이프라인·지표
        ├── Build
        │   ├── Development  — 에이전트 설정·시뮬레이션
        │   ├── Staging      — (variant) 전환 확인 후 접근
        │   └── Production   — (variant) 잠금·경고 레이어 추가
        ├── Test             — 테스트 결과·품질 체크 (Evaluate 하위)
        └── Evaluate         — 성과 지표·Top Issues·트렌드
```

**위계 원칙**
- Org > Workspace > Agent 순으로 범위가 좁아진다.
- 에이전트를 선택하지 않으면 Workflow(Build·Test·Evaluate) 메뉴는 비활성된다.
- 환경(Dev / Staging / Prod)은 에이전트 스코프 안에서만 의미를 가진다.

---

## 4. 레이아웃 구조 (AppShell)

```
┌─ TopBar (h-14, 전체 너비) ─────────────────────────────────────────┐
├─ LeftRail (68px) ─┬─ Context Panel (240px) ─┬─ Main Content (flex-1) ┤
│                   │  (라우트 종속)           │                        │
│                   │                          │                        │
└───────────────────┴──────────────────────────┴────────────────────────┘
```

**Main Content 스크롤 정책**
- `/evaluate`, `/build/*`: `overflow-hidden` + 내부 flex로 높이 고정 (스크롤 없음, 영역별 독립 스크롤).
- 나머지: `overflow-auto` (페이지 전체 스크롤).

**반응형 분기**
| 구간 | 동작 |
|---|---|
| < 768px (Mobile) | "Desktop Recommended" 안내 화면만 표시 |
| 768–1023px (Tablet) | Context Panel 숨김 + amber 배너 표시 |
| ≥ 1024px (Desktop) | 풀 레이아웃 |

---

## 5. Navigation 모델

앱의 내비게이션은 세 레이어가 협력해 작동한다.

### 5-1. LeftRail (1차 내비게이션)
- 항상 고정. 너비 68px.
- **Dashboard · Workspace · Agent** 3개 글로벌 목적지 + 하단 Settings.
- 클릭 시 해당 목적지에 맞는 Context Panel을 자동으로 연다.
- 에이전트 컨텍스트가 없으면 Workflow 아이템은 비활성.

### 5-2. Context Panel (2차 내비게이션)
- LeftRail 바로 오른쪽. 너비 240px. 라우트에 따라 표시 여부가 결정된다.
  - `/agent`, `/build`, `/evaluate` → **Agent Panel** (에이전트 목록 + 서브 내비)
  - `/workspace` → **Workspace Panel** (워크스페이스 목록)
  - `/` (Home) → 표시되지 않음
- 헤더의 **ChevronLeft 버튼**으로만 접힌다 (접히면 완전히 숨겨짐). 접힌 상태에서 LeftRail 클릭 또는 Build 라우트 진입 시 자동으로 열린다.
- `/build` 라우트 내부 이동 중에는 패널이 항상 열려 있도록 강제된다.

### 5-3. TopBar 브레드크럼 (3차 컨텍스트)
- 현재 위치를 **Workspace → Agent** 드롭다운 체인으로 표시.
- Home에서는 브레드크럼 없이 로고만 표시.
- `/agent` 페이지: 에이전트 드롭다운이 전체 에이전트 목록을 보여주며, 워크스페이스 sub-label(`#WORKSPACENAME`)을 표시.
- 다른 라우트: 현재 워크스페이스에 속한 에이전트만 표시.
- 오른쪽 끝: ENV 스위처(에이전트 Workflow 라우트에서만 표시) · 검색(⌘K) · 알림 · Profile 드롭다운.

---

## 6. 전역 상태 흐름 (AppState)

```
App.tsx
  ├── role: Role                  — 현재 선택된 역할
  ├── workspace: Workspace        — 선택된 워크스페이스
  ├── agent: Agent                — 선택된 에이전트
  ├── environment: Environment    — Dev / Staging / Production
  └── setters...
```

- `workspace`와 `agent`는 mockData에서 id로 참조해 파생.
- `environment`는 라우트 진입 시 자동 설정된다:
  - `/build/development` → Development
  - `/build/production-safety` · `/evaluate` → Production (잠금)
- Context Panel의 에이전트 선택 → `setAgentId` → TopBar 브레드크럼 + 모든 페이지 데이터 갱신.

---

## 7. Key Screens

### 7-1. Dashboard (`/`)
**목적**: Org/Workspace 전체의 에이전트 건강 상태를 한눈에 파악.

**레이아웃**
- Context Panel 없음. 콘텐츠 영역 전체 너비 사용.
- 상단: Role별 요약 지표 카드 4개 (total / risk / attention / stable 톤).
- 중단 좌: Action Items — 즉각 개입이 필요한 에이전트 카드 리스트. tone(risk·attention·stable)으로 시각적 우선순위 표시.
- 중단 우: Quick Jump — 자주 접근하는 에이전트 바로가기 카드.
- 하단 좌: Recent Activity — 타임라인 형식의 최근 이벤트.
- 하단 우: Upcoming — 예정된 배포·평가 일정.

**설계 의도**: Role마다 보이는 지표와 Action Items가 다르다. Org Admin은 전체 워크스페이스 현황, Workspace Admin은 자신의 워크스페이스 에이전트, Builder는 자신이 담당한 에이전트에 집중하도록 구성.

---

### 7-2. Workspace Overview (`/workspace`)
**목적**: 특정 워크스페이스 내 에이전트 목록 관리 및 상태 파악.

**레이아웃**
- Context Panel: Workspace Panel (워크스페이스 목록 + 검색 + 필터).
- 상단: 워크스페이스 헤더 (이름·메타·액션 버튼).
- 중단: 에이전트 테이블 (Grid/List 토글).
  - 각 행: 에이전트명 · Dev/Staging/Prod 환경별 상태 뱃지 · 마지막 업데이트 · 담당자.
- 필터: 상태(At Risk·Attention·Stable 등) + 환경(Dev·Staging·Prod) + 정렬(Risk first / Recently updated / A-Z).

**설계 의도**: 에이전트를 선택하기 전 단계. "어떤 에이전트가 지금 문제인가"를 빠르게 스캔하는 게 핵심이므로 환경별 상태를 한 행에 모두 표시.

---

### 7-3. Agent Overview (`/agent`)
**목적**: 선택된 에이전트의 현재 상태·파이프라인·최근 태스크를 종합적으로 표시.

**레이아웃**
- 상단 카드 (Primary): 에이전트 헤더 + Dev→Staging→Prod 파이프라인 카드 + Issue 페이지네이터.
- 중단: 4개 Metric 카드 (Conversations / Success rate / Resolution time / Escalation rate).
- 하단 카드: Recent Tasks (Grid/List 토글). 상태별 색상 구분 (Resolved=green, Escalated=amber, Failed=red).

**설계 의도**: Build/Evaluate 진입 전 에이전트의 전반적 건강도를 파악하는 허브 역할. 파이프라인 카드의 Stable·Attention·At Risk 뱃지가 어느 환경에서 문제가 있는지 즉시 노출한다.

---

### 7-4. Agent Build (`/build/development`)
**목적**: 에이전트 설정(프롬프트·도구·파라미터)을 편집하고 Staging/Production으로 Promote.

**레이아웃 (3-column)**
```
[Context Panel] | [설정 편집 영역] | [Simulated Preview 채팅]
```
- 좌: 설정 섹션 — System Prompt · Tools · Behavior Parameters · Knowledge Base. 각 섹션 헤더에 status 뱃지.
- 우: Simulated Preview — 실시간 채팅 시뮬레이션. 유저 버블은 반투명 stone 톤(`bg-stone-900/[0.12]`), 봇 버블은 white.
- 하단 바: 환경 파이프라인 진행도 + Promote 버튼. 모든 섹션 Ready일 때 활성.

**설계 의도**: Context Panel을 Build 진입 시 항상 열어두는 것은 에이전트를 빠르게 전환하며 설정을 비교하기 위함. 편집 영역과 프리뷰가 나란히 배치된 것은 변경사항을 즉시 확인하게 하기 위함.

#### Variant A — Staging 환경
- Development에서 ENV 스위처로 Staging 선택 시 amber 확인 모달 표시.
- "Development에서 작업 중인 내용이 있을 수 있다"는 경고 + 취소/전환 버튼 (전환 버튼: `bg-stone-800`).

#### Variant B — Production 환경 (`/build/production-safety`)
- ENV Production으로 고정(locked). 다른 환경 탭 비활성.
- Production 선택 시 더 강한 경고 모달 (red 아이콘, `backdrop-blur`, `bg-red-600` 전환 버튼).
- "실제 사용자에게 즉시 반영" 문구로 위험도 강조.
- 기본 편집 잠금 상태. 명시적 unlock 액션이 필요하도록 설계해 실수 방지.

---

### 7-5. Agent Evaluate (`/evaluate`)
**목적**: 에이전트의 성과 데이터를 분석하고 이슈를 파악.

**레이아웃 (2-column, 고정 높이)**
```
[Left: Metrics + Top Issues] | [Right: Performance Overview + Key Signals]
```
- 좌 상단: 4개 Metric 카드.
- 좌 하단: Top Issues 테이블 — 실패(Failed)·에스컬레이션(Escalated) 태스크만 필터링해 표시. 각 행: 태스크명·환경태그·시간 + 상태 뱃지 + View 버튼. 테이블이 남은 높이를 flex로 채움.
- 우 상단: Performance Overview — 꺾은선 차트. 포인트(dot) 호버 시에만 툴팁 표시. 툴팁은 `createPortal`로 `document.body`에 렌더링해 `overflow:hidden` 컨테이너를 탈출, 최상단 레이어 보장.
- 우 하단: Key Signals — 주요 텍스트 지표 카드들.

**설계 의도**: 좌우 2-column은 "무엇이 문제인가(Issues + Metrics)"와 "추세는 어떤가(Chart + Signals)"를 동시에 보여주기 위함. 고정 높이 레이아웃은 차트와 테이블이 스크롤 없이 한 화면에 들어오도록 한다.

---

## 8. 반복 Interaction Patterns

### 8-1. 환경 스위처 (ENV Switcher)
- TopBar 오른쪽, Workflow 라우트에서만 표시.
- Development → Staging 전환: amber 확인 모달.
- Development/Staging → Production 전환: red 강조 확인 모달 + backdrop blur.
- 특정 라우트에서 환경 고정(locked): `/evaluate`, `/build/production-safety` → Production 고정, 다른 탭 비활성.

### 8-2. 브레드크럼 드롭다운
- Workspace·Agent 각각 드롭다운으로 전환 가능.
- 선택된 항목에 Check 아이콘 + 폰트 세미볼드로 현재 위치 표시.
- 외부 클릭 시 닫힘 (`mousedown` 이벤트 기반).

### 8-3. Context Panel 접기/펴기
- 헤더 ChevronLeft 버튼: 패널 접힘 (완전히 숨겨짐, 빈 영역도 없음).
- LeftRail의 Workspace·Agent 항목 클릭: 패널 자동으로 펴짐.
- `/build` 라우트 이동 시: 강제로 펴짐.

### 8-4. 고급 필터 팝오버
- Context Panel 헤더 Filter 아이콘 클릭 → 패널 왼쪽에 팝오버 등장.
- 필터 적용 시 아이콘 옆에 accent dot 표시.
- 외부 클릭 닫힘.

### 8-5. 커맨드 팔레트
- `⌘K` 또는 TopBar 검색 아이콘으로 오픈.
- 전체 에이전트·워크스페이스 전역 검색.

---

## 9. 디자인 시스템 참고

| 토큰 | 값 / 용도 |
|---|---|
| `bg-sidebar` / `bg-canvas` | 좌측 네비게이션 배경 / 메인 콘텐츠 배경 |
| `text-ink` / `text-muted` | 주요 텍스트 / 보조 텍스트 |
| `border-line` | 기본 구분선 색상 |
| `text-accent` / `bg-accent` | 강조 색상 (CTA, 선택 상태) |
| `text-success` / `text-warning` / `text-danger` | 상태 색상 (Stable / Attention / Risk) |
| Section 헤더 스타일 | `text-[13px] font-bold uppercase tracking-wide text-ink` |
| Metric Card | `label + value + trend(↑↓) + detail` 4-요소 구조 |
| 환경 식별 원칙 | 구조(위치·잠금)로 Dev/Staging/Prod 구분, 색상은 상태(Stable·Risk)에만 사용 |

---

## 10. Edge Cases

| 상황 | 동작 |
|---|---|
| 에이전트 미선택 상태 | Sidebar의 Overview·Build·Test·Evaluate 비활성 (cursor-not-allowed) |
| Tablet 뷰포트 (768–1023px) | Context Panel 완전히 숨김, amber 배너로 사용자에게 안내 |
| Mobile 뷰포트 (< 768px) | 전체 화면을 "Desktop Recommended" 안내 화면으로 대체 |
| `/evaluate` 진입 | ENV 자동으로 Production으로 설정되고 스위처 잠금 |
| `/build/production-safety` 진입 | ENV Production 고정, 편집 기본 잠금 상태 |
| Agent 드롭다운 (`/agent` 페이지) | 현재 워크스페이스 필터 없이 전체 에이전트 표시, 각 항목에 `#WORKSPACE` sub-label |
| Agent 드롭다운 (다른 페이지) | 현재 워크스페이스 소속 에이전트만 표시 |
| Context Panel 접힌 상태에서 Build 진입 | 패널 자동으로 열림 |
| Build 내 Staging/Prod 전환 시도 | 확인 모달 없이 전환되지 않음 (항상 모달 경유) |
| agentPageData에 없는 agent ID | `agentPageData["refund-review"]` fallback 데이터로 표시 |
| Prod 환경 활성화 애니메이션 | `prod-tab-glow` 클래스 + key 변경으로 CSS 애니메이션 재생 |
| Role 전환 | 즉시 반영 — 메뉴 접근 권한·New 버튼 표시 여부·프로필 아바타 색상 동시 변경 |
