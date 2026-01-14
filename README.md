<p align="middle">
  <img width="500px" src="docs/maison_lavin_600x120_transparent_smaller.png"/>
</p>
<h3 align="middle">LWC·Flow·Apex·Agentforce로 구현한 Luxury Customer 360 & Order-to-Care CRM</h3>

<br/>

## 📝 작품소개

MAISON-LAVIN은 **럭셔리 패션 브랜드의 주문제작, 구매, 케어·리페어까지 전 과정을 Salesforce CRM으로 통합한 End-to-End 고객 경험 플랫폼**입니다.  
 
본 프로젝트는 **Lead → 주문 → 제작 → 픽업 → 사후 케어**로 이어지는 전 과정을 하나의 CRM 구조로 통합하여,  
고객과 브랜드의 모든 접점을 **하나의 Customer 360 뷰로 관리하는 디지털 럭셔리 CRM**을 구현하는 것을 목표로 하였습니다.

<br/>

## 🌁 프로젝트 배경

### 비즈니스 배경: 럭셔리 패션 산업의 고객 경험 고도화

럭셔리 패션 산업는 단순히 제품을 판매하는 것을 넘어,  
**고객의 라이프스타일과 정체성을 함께 설계하는 경험 산업**으로 진화하고 있습니다.  

이러한 산업 패러다임에 따라 MAISON-LAVIN은 경험 중심과 디지털 전환을 기반으로 **온・오프라인의 경계가 없는 고객 경험을 연결하는 과제에 직면해 있습니다.**

---

### ⚠️ 기존 서비스의 문제점 (AS-IS)

**1. 분산된 고객 데이터와 채널**
- 고객 데이터와 커뮤니케이션 채널이 영업, 매장, CS, 이메일 등으로 분산
- 고객은 반복적으로 설명해야 하고, 직원은 수동 확인에 의존

**2. 수동적 고객 경험**
- 고객은 직원의 설명과 처리 결과를 기다리는 구조
- 주문·제작·케어 상태를 실시간으로 확인할 수 없음

**3. 반복 업무 중심의 운영**
- 단순 문의·진행 확인에 인력이 소모
- 직원이 고객 관리와 의사결정에 집중하기 어려운 구조


### 🎯 프로젝트 목표 (TO-BE)

**1. 통합된 CRM 고객 관리 (Single Customer View)**
- 고객 데이터와 모든 접점을 Salesforce CRM으로 통합
- 고객과 직원이 하나의 고객 뷰에서 상태와 이력을 실시간 확인

**2. 참여형 고객 경험 (Participating Client Experience)**
- Experience Cloud를 통해 고객이 직접  
  주문, 제작, 케어 진행 상황을 확인하고 참여
- 디지털 채널을 중심으로 고객 경험이 확장

**3. AI 기반 생산성 향상**
- Agentforce를 통한 1차 응대 및 가이드 제공
- 반복 업무는 AI가 처리하고, 직원은  
  관계 관리와 의사결정에 집중하는 운영 구조 구현

<br/>

## 🎞 Demo — Customer Journey Scenarios

### Scene #1 — Lead → Order (Sales)
잠재 고객이 팝업을 통해 유입되어  
주문 제작과 견적 승인, 결제까지 이어지는 디지털 구매 여정

- [팝업으로 Lead 유입](https://github.com/user-attachments/assets/0716fa21-ec7a-4782-9d1d-476a88a36406)
- [AI 구매 상담 & 제품 커스터마이저 활용 주문 접수](https://github.com/user-attachments/assets/5e08c209-4af4-481c-87ba-001ca287e794)
- [견적 생성 및 Opportunity 관리](https://github.com/user-attachments/assets/674da8bb-2f9d-4db9-b03c-2ff4c3b59b4e)

---

### Scene #2 — Care & Repair (Service)
구매 이후 일정 시간이 지난 고객에게  
케어 알림, AI 상담, 수선 접수, 진행 관리, 만족도 조사까지 연결되는 사후 관리 흐름

- [케어 알림 & 리페어 접수](https://github.com/user-attachments/assets/709e3083-fdde-4514-9b97-af824e0af29a)
- [고객 설문 & 만족도 조사](https://github.com/user-attachments/assets/3b63eef9-9985-4893-8edc-219bdfe6ea59)

---

### Scene #3 — Customer 360 & Executive View
임원이 고객, 주문, 케어, 성과를 하나의 화면에서 확인하는 통합 운영 뷰

- [Customer 360 & KPI 대시보드](https://github.com/user-attachments/assets/c838a809-7c17-456d-b631-5e2eddd063d1)

<br/>

## ⭐ 주요 기능

### 1. Lead → Account → Opportunity → Case 기반 전체 고객 여정 관리

- Web-to-Lead 기반 잠재 고객 자동 유입 구조 반영
- Flow 기반 Lead → Account/Opportunity 전환 및 상태 흐름 연결
- 주문/케어 이력이 고객 레코드에 누적되는 운영 구조 설계

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/create_lead.png" width="450" />
</p>

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/lead_page.png" width="850" />
</p>

---

### 2. LWC 기반 제품 커스터마이저 및 견적서 생성

- LWC 기반 제품 옵션 선택 UI 구성
- 커스터마이징 결과가 Opportunity/Quotation에 반영되도록 데이터 흐름 설계
- Visualforce 기반 PDF 견적서 생성 구조 적용

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/customizer.png" width="650" />
</p>

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/create_quotation.png" width="850" />
</p>

---

### 3. Experience Cloud 고객 포털 (로그인, 주문 조회, 견적 확인)

- 고객 로그인/회원가입 흐름 기반 접근 제어
- 견적서(PDF) 및 주문 제작 진행 상태 확인
- 고객-직원 간 커뮤니케이션을 위한 접점 제공

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/quotation_check.png" width="850" />
</p>

---

### 4. Customer 360 통합 콘솔

- 고객 기본 정보 + 주문/견적/자산/케어 이력 통합 조회
- 고객 여정 단계별 핵심 정보 요약
- 담당자가 한 화면에서 Next Action을 판단 가능한 구조

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/customer360.png" width="850" />
</p>

---

### 5. Omni-Channel 상담 및 Case 관리

- Agentforce 기반 1차 응대 및 문의 분류
- Omni-Channel을 통한 상담원 라우팅 및 인계 흐름
- Case 진행 상태 공유 및 내부 코멘트 기반 협업 구조

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/repair_agentforce.png" width="850" />
</p>

<br/>

## 🔨 프로젝트 구조

### Entity Relationship Diagram (ERD)

<p>
  <img src="https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/erd_maisonlavin.png" width="550" />
</p>

주요 객체:
- Lead, Account, Opportunity, Case
- Order, Asset, Quotation, Interaction  

모든 데이터는 **Customer 360 콘솔**에서 통합 조회됩니다.

<br/>

## 🔧 Stack

### Frontend (CRM UI & Customer Portal)

**Language**  
JavaScript (ES6+), HTML, CSS  

**Library & Framework**  
Lightning Web Components (LWC), SLDS (Salesforce Lightning Design System)  

**Tools**  
Salesforce Lightning App Builder, Salesforce Lightning Experience, VS Code (SFDX)

### Backend (CRM Logic & Automation)

**Language**  
Apex  

**AI Engine**  
Agentforce (Agent Builder, Prompt Builder – AI Wardrobing Agent)  

**Automation**  
Flow Builder (Lead Conversion Flow, Order Process Flow, Care & Repair Flow, Email & Notification Flow)  

**Database**  
Salesforce Objects (Lead, Account, Opportunity, Case, Order, Asset, Quotation, Interaction, Messaging Session 등)  

**Routing & Service**  
Omni-Channel (Agentforce → Human Agent → Case 기반 상담 흐름)

**Integration**
- REST API (주소 검색, 지도 연동)

<br/>

## 💡 기대효과

- **고객 데이터 통합 관리** : 구매, 주문제작, 케어를 하나의 CRM 흐름으로 연결하여 일관된 고객 관계를 유지
- **개인화 기반 매출 증대** : 고객의 취향과 행동 데이터를 활용해 맞춤 추천과 재구매 기회를 창출
- **조직 간 협업 구조** : 영업, 매장, 서비스 조직이 동일한 고객 데이터를 공유하며 효율적으로 협업
- **디지털 럭셔리 운영 모델** : 럭셔리 브랜드에 적합한 CRM 아키텍처의 표준 사례로 활용 가능

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
