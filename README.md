<p align="middle">
  <img width="300px" src="docs/maison_lavin_600x120_transparent_smaller.png"/>
</p>
<h3 align="middle">LWC·Flow·Apex·Agentforce로 구현한 Luxury Customer 360 & Order-to-Care CRM</h3>

<br/>

## 📝 작품소개

MAISON-LAVIN은 **럭셔리 패션 브랜드의 주문제작, 구매, 케어·리페어까지 전 과정을 Salesforce CRM으로 통합한 End-to-End 고객 경험 플랫폼**입니다.  

기존 패션 브랜드의 고객 경험은 마케팅, 영업, 서비스, 오프라인 매장이 서로 분리되어 운영되어 왔습니다.  
본 프로젝트는 **Lead → 주문 → 제작 → 픽업 → 사후 케어**로 이어지는 전 과정을 하나의 CRM 구조로 통합하여,  
고객과 브랜드의 모든 접점을 **하나의 Customer 360 뷰로 관리하는 디지털 럭셔리 CRM**을 구현하는 것을 목표로 합니다.

<br/>

## 🌁 프로젝트 배경

럭셔리 브랜드는 고객과의 관계가 단발성 구매가 아닌 **장기적인 신뢰와 반복 구매**로 이어져야 합니다.  
하지만 실제 현장에서는 다음과 같은 문제가 반복됩니다.

- 고객 정보가 영업, CS, 매장, 온라인 채널에 분산
- 주문제작, 견적, 제작, 픽업, 수선 이력이 하나의 시스템에서 추적되지 않음
- 고객의 구매 이력과 케어 이력이 연결되지 않아 개인화 서비스가 어려움  

MAISON-LAVIN은 이 문제를 해결하기 위해  
**Salesforce Sales Cloud · Service Cloud · Experience Cloud · Agentforce를 결합하여  
고객 라이프사이클 전체를 하나의 CRM 구조로 재설계**하는 것을 목표로 구축되었습니다.

<br/>

## 🎞 Demo — Customer Journey Scenarios

### 🟦 Scene #1 — Lead → Order (Sales)
잠재 고객이 팝업과 AI 상담을 통해 유입되어  
주문 제작과 견적 승인, 결제까지 이어지는 디지털 구매 여정

- [팝업 & AI 상담으로 Lead 유입](https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/demo-lead.mp4)
- [견적 생성 및 Opportunity 관리](https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/demo-opportunity.mp4)
- [제품 커스터마이저 & 주문 제작](https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/demo-createProduct.mp4)

---

### 🟩 Scene #2 — Care & Repair (Service)
구매 이후 일정 시간이 지난 고객에게  
케어 알림, AI 상담, 수선 접수, 진행 관리, 만족도 조사까지 연결되는 사후 관리 흐름

- [케어 알림 & 리페어 접수](https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/demo-repair.mp4)
- [고객 설문 & 만족도 조사](https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/demo-survey.mp4)

---

### 🟨 Scene #3 — Customer 360 & Executive View
임원이 고객, 주문, 케어, 성과를 하나의 화면에서 확인하는 통합 운영 뷰

- [Customer 360 & KPI 대시보드](https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/demo-dashboard.mp4)


<br/>

## ⭐ 주요 기능

---

### 1️⃣ Lead → Account → Opportunity → Case 기반 전체 고객 여정 관리

- Web-to-Lead 기반 잠재 고객 자동 유입 구조 반영
- Flow 기반 Lead → Account/Opportunity 전환 및 상태 흐름 연결
- 주문/케어 이력이 고객 레코드에 누적되는 운영 구조 설계

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/create_lead.png" width="650" />
</p>

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/lead_page.png" width="650" />
</p>

---

### 2️⃣ LWC 기반 제품 커스터마이저 및 견적서 생성

- LWC 기반 제품 옵션 선택 UI 구성
- 커스터마이징 결과가 Opportunity/Quotation에 반영되도록 데이터 흐름 설계
- Visualforce 기반 PDF 견적서 생성 구조 적용

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/create_quotation.png" width="650" />
</p>

---

### 3️⃣ Experience Cloud 고객 포털 (로그인, 주문 조회, 견적 확인)

- 고객 로그인/회원가입 흐름 기반 접근 제어
- 견적서(PDF) 및 주문 제작 진행 상태 확인
- 고객-직원 간 커뮤니케이션을 위한 접점 제공

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/quotation_check.png" width="650" />
</p>

---

### 4️⃣ Customer 360 통합 콘솔

- 고객 기본 정보 + 주문/견적/자산/케어 이력 통합 조회
- 고객 여정 단계별 핵심 정보 요약
- 담당자가 한 화면에서 Next Action을 판단 가능한 구조

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/customer360.png" width="650" />
</p>

---

### 5️⃣ Omni-Channel 상담 및 Case 관리

- Agentforce 기반 1차 응대 및 문의 분류
- Omni-Channel을 통한 상담원 라우팅 및 인계 흐름
- Case 진행 상태 공유 및 내부 코멘트 기반 협업 구조

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/repair_agentforce.png" width="650" />
</p>

<br/>

## 🔨 프로젝트 구조

### Entity Relationship Diagram (ERD)

![ERD](https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/erd_maisonlavin.png)

주요 객체:
- Lead, Account, Opportunity, Case
- Order, Asset, Quotation, Interaction  

모든 데이터는 **Customer 360 콘솔**에서 통합 조회됩니다.

<br/>

## 🔧 Stack

**Salesforce**
- Sales Cloud
- Service Cloud
- Experience Cloud
- Data Cloud
- Agentforce  

**Development**
- Apex
- Lightning Web Components (LWC)
- Visualforce
- Flow
- Omni-Channel
- Web-to-Lead
- Knowledge  

**Integration**
- REST API (주소 검색, 지도 연동)

<br/>

## 💡 기대효과

- 고객의 구매·제작·케어 이력을 하나의 CRM에서 통합 관리
- AI 기반 개인화 추천을 통한 재구매율 향상
- 영업·CS·매장의 데이터 통합 협업 환경 구축
- 실제 럭셔리 브랜드 CRM 구축을 위한 표준 아키텍처로 활용 가능

<br/>

## 🙋‍♂️ Team

| 역할 | 이름 |
|------|------|
| PL · Salesforce Developer & Admin | 김은수 |
| PM · Salesforce Admin | 이영호 |
| Salesforce Admin | 강은혜 |
| Salesforce Developer | 강민형 |

---

**MAISON-LAVIN은 단순한 기능 데모가 아니라  
럭셔리 브랜드의 End-to-End CRM 아키텍처를 Salesforce로 구현한 실전형 프로젝트입니다.**
