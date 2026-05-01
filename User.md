# Delight Dashboard — User Documentation

---

## 1. 전제 컨텍스트

이 문서는 **NAVER** 사내 AI 에이전트 운영 플랫폼을 가정하고 작성되었다. NAVER는 네이버페이·쇼핑·고객센터 등 다양한 서비스 도메인에 AI 에이전트를 배포해 운영하며, 각 에이전트는 실제 사용자 인터랙션(환불 처리, 결제 오류 대응, 상품 카탈로그 관리 등)을 담당한다.

Delight Dashboard는 이 에이전트들을 빌드·테스트·배포·모니터링하는 내부 팀들이 사용하는 도구다. 에이전트 하나의 설정 실수가 수백만 사용자에게 영향을 줄 수 있기 때문에, 환경별 단계적 배포(Dev → Staging → Production)와 명시적 확인 절차가 UX에 깊이 설계되어 있다.

---

## 2. 사용자 역할 유형

플랫폼의 사용자는 크게 두 가지 역할 유형으로 구분된다. 세부 페르소나는 이 두 유형 안에 속한다.

### Scaling Operator
에이전트를 직접 만들기보다 **운영이 잘 돌아가는가**에 집중하는 역할. 여러 워크스페이스·에이전트에 걸친 전체 현황을 모니터링하고, 이상 징후를 감지해 적절한 시점에 개입한다. 에이전트 수가 늘어날수록 개별 에이전트를 직접 관리하기 어렵기 때문에, 포트폴리오 뷰와 리스크 우선순위 정렬이 핵심 도구다.

- **주요 화면**: Dashboard, Workspace Overview, Agent Overview, Evaluate
- **해당 페르소나**: Sora Kim (Org Admin) — 순수 Scaling Operator. Org 전체를 조감하며 에이전트 내용엔 직접 관여하지 않음.

### Agent Builder
에이전트의 설정을 설계하고 반복적으로 수정하며, **에이전트가 올바르게 동작하는가**에 집중하는 역할. 프롬프트·도구·파라미터를 조정하고, 시뮬레이션으로 즉시 검증하며, 안정성이 확인되면 상위 환경으로 Promote한다.

- **주요 화면**: Build (Development·Staging·Production), Evaluate Top Issues
- **해당 페르소나**: Jisoo Lee (Agent Builder / Operator) — 순수 Agent Builder. 설정을 직접 만들고 반복하는 데 집중.

> **Minho Park (Workspace Admin)** 은 두 역할의 중간 지점이다. 워크스페이스 단위로 에이전트들을 운영하는 Scaling Operator이면서, 동시에 빌드 결과물을 검토하고 Staging/Production Promote를 승인하는 Agent Builder 접점도 가진다. Sora보다 범위가 좁고 실무에 더 가까우며, Jisoo보다 운영 책임이 크다.

---

## 3. 사용자 페르소나

### Persona A — Sora Kim (Org Admin)
- **소속**: NAVER AI 에이전트 운영팀 총괄
- **주요 책임**: 전체 워크스페이스 및 에이전트 포트폴리오 건강 상태 관리, 새 워크스페이스·에이전트 생성 승인
- **주요 관심사**: "지금 어느 에이전트가 Production에서 문제를 일으키고 있나?", "어느 워크스페이스가 리소스가 부족한가?"
- **사용 패턴**: 주로 Dashboard에서 전체 현황을 파악하고, 이슈가 있는 에이전트로 drill-down.

### Persona B — Minho Park (Workspace Admin)
- **소속**: 네이버페이 AI 서비스팀 리드
- **주요 책임**: 네이버페이 워크스페이스 내 에이전트들의 배포 승인, 성과 관리, 팀원 온보딩
- **주요 관심사**: "우리 팀 에이전트들이 Staging 통과 준비가 됐나?", "Production 지표가 지난 주 대비 어떻게 변했나?"
- **사용 패턴**: Workspace Overview에서 팀 에이전트 상태를 점검하고 Evaluate 화면에서 성과 지표를 리뷰.

### Persona C — Jisoo Lee (Agent Builder / Operator)
- **소속**: 네이버페이 AI 서비스팀 에이전트 개발자
- **주요 책임**: 에이전트 프롬프트 설계·수정, 시뮬레이션 테스트, Staging Promote 요청
- **주요 관심사**: "내가 수정한 프롬프트가 실제로 원하는 방식으로 응답하나?", "어떤 태스크가 계속 실패하고 있나?"
- **사용 패턴**: Build 화면에서 대부분의 시간을 보내며, Evaluate Top Issues로 실패 케이스를 확인하고 설정을 반복적으로 수정.

---

## 4. Jobs-to-be-done

| Role | Job |
|---|---|
| Org Admin | 전체 에이전트 포트폴리오의 리스크를 한눈에 파악하고, 긴급 개입이 필요한 상황을 빠르게 식별하고 싶다. |
| Workspace Admin | 내 팀 에이전트들의 배포 상태와 성과를 추적하고, 안전하게 Production에 올릴 수 있는 시점을 판단하고 싶다. |
| Agent Builder | 에이전트 설정을 빠르게 반복·수정하고, 변경사항이 실제로 올바르게 동작하는지 즉시 확인하고 싶다. |

---

## 5. Pain Points (이 대시보드가 해결하는 문제)

- **파편화된 모니터링**: 에이전트별로 별도 도구를 사용하면 전체 현황을 파악하기 위해 여러 화면을 오가야 한다. → Dashboard가 전체 포트폴리오 뷰를 제공.
- **배포 실수 리스크**: 검증 없이 Production에 바로 반영하면 실제 사용자에게 즉시 영향. → 환경별 단계적 배포 + 확인 모달로 실수 방지.
- **설정 변경과 결과 확인의 분리**: 에이전트 설정을 바꾸고 나서 결과를 확인하려면 별도 도구가 필요하다. → Build 화면에서 설정·시뮬레이션 프리뷰를 나란히 제공.
- **역할별 정보 과부하**: 모든 역할에게 같은 정보를 보여주면 노이즈가 많아진다. → Role 기반으로 Dashboard 지표·Action Items·접근 권한을 차별화.

---

## 6. 사용자 시나리오

### 시나리오 1 — Production 에이전트 이슈 감지 및 대응
**주인공**: Sora Kim (Org Admin)

> 월요일 오전, Sora는 대시보드를 열어 주간 현황을 확인한다. Action Items 섹션에 "Refund Review Agent — Production escalation rate 급등"이 Risk 톤으로 표시되어 있다. 해당 에이전트 카드를 클릭해 Agent Overview로 이동하고, 파이프라인 카드에서 Production 환경이 "At Risk"임을 확인한다. Evaluate 화면으로 이동해 Top Issues 테이블에서 반복 실패 태스크 패턴을 발견하고, Jisoo에게 Build 수정을 요청한다.

**핵심 터치포인트**: Dashboard Action Items → Agent Overview 파이프라인 → Evaluate Top Issues

---

### 시나리오 2 — 신규 에이전트 빌드 및 Staging 배포
**주인공**: Jisoo Lee (Agent Builder)

> Jisoo는 네이버페이 환불 플로우를 처리하는 신규 에이전트를 설계한다. Build > Development 화면에서 System Prompt를 작성하고, 우측 Simulated Preview에서 실제 사용자 메시지에 어떻게 응답하는지 확인한다. Tools·Knowledge Base 섹션까지 Ready 상태가 되면 하단 Promote 버튼이 활성화된다. Staging 전환 확인 모달을 통해 의도적으로 Staging으로 올린다.

**핵심 터치포인트**: Build Development 설정 편집 → Simulated Preview → Promote 버튼 → Staging 확인 모달

---

### 시나리오 3 — 워크스페이스 에이전트 성과 리뷰
**주인공**: Minho Park (Workspace Admin)

> Minho는 분기 리뷰를 앞두고 네이버페이 워크스페이스 내 에이전트들의 성과를 점검한다. Workspace Overview에서 에이전트 테이블을 "Risk first" 정렬로 보고 주의가 필요한 에이전트를 선별한다. 각 에이전트를 클릭해 Evaluate 화면의 Performance Overview 차트에서 최근 2주 트렌드를 확인하고, 성과가 좋은 에이전트는 그대로 두고 문제 에이전트는 Jisoo에게 수정 지시를 내린다.

**핵심 터치포인트**: Workspace Overview 테이블 → Agent Evaluate 차트 → Key Signals

---

### 시나리오 4 — 긴급 Production 설정 변경
**주인공**: Minho Park (Workspace Admin)

> 실시간으로 Production 에이전트가 잘못된 환불 안내를 하고 있다는 보고를 받는다. Minho는 Build > Production Safety 화면으로 이동해 현재 Production 설정을 확인한다. ENV가 Production으로 고정되어 있으며 편집이 기본 잠금 상태임을 확인하고, 잠금을 해제한 뒤 프롬프트의 해당 조건 분기를 수정한다. 수정 후 즉시 반영되지 않도록 Staging을 거쳐 재검증한다.

**핵심 터치포인트**: Build Production Safety → 편집 잠금 해제 → 설정 수정 → Staging 재검증

---

## 7. 유저 플로우

### Flow 1 — 이슈 발견 → 수정 사이클

```
Dashboard
  └─ Action Items에서 Risk 에이전트 발견
      └─ 에이전트 클릭 → Agent Overview
          ├─ 파이프라인: 어느 환경에 문제가 있는지 확인
          ├─ Recent Tasks: 어떤 태스크가 실패하는지 확인
          └─ Evaluate로 이동
              ├─ Top Issues: 실패·에스컬레이션 패턴 분석
              ├─ Performance Overview 차트: 트렌드 확인
              └─ Build Development로 이동
                  ├─ 설정 수정 (Prompt / Tools / Parameters)
                  ├─ Simulated Preview로 즉시 검증
                  └─ Promote → Staging 확인 모달 → Staging 배포
```

---

### Flow 2 — 신규 에이전트 온보딩

```
LeftRail: Workspace 클릭 → Context Panel: Workspace Panel 열림
  └─ Workspace Overview
      └─ New Agent 버튼 (Org Admin / Workspace Admin만 활성)
          └─ 에이전트 기본 정보 설정
              └─ Build Development
                  ├─ System Prompt 작성
                  ├─ Tools 연결
                  ├─ Behavior Parameters 설정
                  ├─ Knowledge Base 등록
                  └─ 모든 섹션 Ready → Promote 활성
                      └─ Staging 확인 모달 → Staging 전환
                          └─ 검증 후 Production 확인 모달 → Production 배포
```

---

### Flow 3 — 일상 모니터링 (Org Admin)

```
Dashboard (매일 접속)
  ├─ 지표 카드: 전체 risk / attention / stable 카운트 확인
  ├─ Action Items: 개입 필요한 에이전트 우선순위 확인
  │   └─ 에이전트 CTA 클릭 → 해당 Agent Overview / Evaluate 직행
  ├─ Quick Jump: 자주 보는 에이전트 빠른 접근
  └─ Upcoming: 예정된 배포·평가 일정 확인
```

---

### Flow 4 — 에이전트 전환 (Context 변경)

```
어느 화면에 있든 에이전트를 바꾸는 방법은 2가지:

방법 A — Context Panel
  └─ 에이전트 목록에서 다른 에이전트 클릭
      └─ Agent Overview로 이동 + TopBar 브레드크럼 갱신

방법 B — TopBar 브레드크럼
  └─ Agent 드롭다운 클릭
      ├─ /agent 페이지: 전체 에이전트 목록 (workspace sub-label 표시)
      └─ 다른 페이지: 현재 워크스페이스 소속 에이전트만 표시
          └─ 선택 → 동일 라우트 유지, 에이전트 컨텍스트만 교체
```
