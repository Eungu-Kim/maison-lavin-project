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

### 비즈니스 배경: 럭셔리 패션 산업의 고객 경험 고도화

럭셔리 패션 브랜드는 단순히 제품을 판매하는 것을 넘어,  
**고객의 라이프스타일과 정체성을 함께 설계하는 경험 산업**으로 진화하고 있습니다.  

MAISON-LAVIN은 주문제작, 개인화 스타일링, 사후 케어·리페어까지 포함하는  
**고객 생애 가치(LTV) 중심의 운영 모델**을 지향하는 디지털 럭셔리 브랜드입니다.

그러나 실제 운영 환경에서는  
고객 데이터가 영업, 매장, CS, 온라인 채널에 분산되어 관리되며,  
고객 경험이 단절되는 문제가 지속적으로 발생하고 있었습니다.


### ⚠️ 기존 서비스의 문제점 (Pain Points)

**1. 고객 데이터의 파편화**  
고객의 구매 이력, 주문제작 요청, 수선 기록, 상담 이력이  
서로 다른 시스템에 흩어져 관리되어,  
상담사와 매장 직원이 고객을 입체적으로 이해하기 어려웠습니다.

**2. 주문제작 및 케어 프로세스의 비표준화**  
견적, 제작, 픽업, 수선 과정이  
이메일, 전화, 수기 문서에 의존하여 처리되면서  
업무 누락 및 고객 불만이 발생했습니다.

**3. 개인화 서비스의 한계**  
고객의 과거 구매, 스타일, 케어 이력이  
통합되지 않아 AI 기반 추천이나 Next Best Action을  
실질적으로 활용할 수 없는 구조였습니다.


### 🎯 프로젝트 목표 (Objectives)

본 프로젝트는 Salesforce CRM과 Agentforce를 기반으로  
다음과 같은 디지털 전환을 목표로 합니다.

**Customer 360 구축**  
고객의 Lead, 구매, 주문제작, 자산, 케어 이력을  
하나의 고객 뷰로 통합하여  
모든 접점에서 일관된 고객 경험 제공.

**Actionable CRM 구현**  
단순한 데이터 조회가 아닌,  
견적 생성, 제작 진행, 케어 요청, 리페어 Case 생성이  
CRM 내부에서 자동으로 흐르도록 설계.

**AI 기반 개인화 운영**  
Agentforce를 활용해  
고객의 구매 패턴과 현재 장바구니를 분석하여  
Next Best Look 및 추천 제안을 제공하는 구조 구현.


### 🏷️ 시장 내 포지셔닝

| 브랜드 | 포지션 | 특징 | 한계 |
|------|------|------|------|
| 기존 럭셔리 브랜드 | 오프라인 중심 | VIP 고객 응대 강점 | 데이터 기반 개인화 한계 |
| 이커머스 패션 | 온라인 자동화 | 빠른 구매 경험 | 주문제작·케어 한계 |
| MAISON-LAVIN | Digital Luxury CRM | 주문·제작·케어를 하나의 CRM으로 통합 | 초기 CRM 설계 필요 |

MAISON-LAVIN은 기존 럭셔리 패션의 감성과  
디지털 CRM의 자동화를 결합한  
**“고객이 경험하는 럭셔리 여정을 기술로 운영하는 브랜드”**를 목표로 합니다.

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

### 1️⃣ Lead → Account → Opportunity → Case 기반 전체 고객 여정 관리

- Web-to-Lead 기반 잠재 고객 자동 유입 구조 반영
- Flow 기반 Lead → Account/Opportunity 전환 및 상태 흐름 연결
- 주문/케어 이력이 고객 레코드에 누적되는 운영 구조 설계

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/create_lead.png" width="350" />
</p>

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/lead_page.png" width="850" />
</p>

---

### 2️⃣ LWC 기반 제품 커스터마이저 및 견적서 생성

- LWC 기반 제품 옵션 선택 UI 구성
- 커스터마이징 결과가 Opportunity/Quotation에 반영되도록 데이터 흐름 설계
- Visualforce 기반 PDF 견적서 생성 구조 적용

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/create_quotation.png" width="850" />
</p>

---

### 3️⃣ Experience Cloud 고객 포털 (로그인, 주문 조회, 견적 확인)

- 고객 로그인/회원가입 흐름 기반 접근 제어
- 견적서(PDF) 및 주문 제작 진행 상태 확인
- 고객-직원 간 커뮤니케이션을 위한 접점 제공

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/quotation_check.png" width="850" />
</p>

---

### 4️⃣ Customer 360 통합 콘솔

- 고객 기본 정보 + 주문/견적/자산/케어 이력 통합 조회
- 고객 여정 단계별 핵심 정보 요약
- 담당자가 한 화면에서 Next Action을 판단 가능한 구조

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/customer360.png" width="850" />
</p>

---

### 5️⃣ Omni-Channel 상담 및 Case 관리

- Agentforce 기반 1차 응대 및 문의 분류
- Omni-Channel을 통한 상담원 라우팅 및 인계 흐름
- Case 진행 상태 공유 및 내부 코멘트 기반 협업 구조

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/repair_agentforce.png" width="850" />
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
