<p align="middle">
  <img width="300px" src="docs/maison_lavin_600x120_transparent_smaller.png"/>
</p>
<h1 align="middle">MAISON-LAVIN</h1>
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

## 🎞 Demo

**GitHub Release 시연 영상**

- Lead → 고객 전환  
https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/demo-lead.mp4  

- 견적 및 주문 제작  
https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/demo-opportunity.mp4  

- 제품 커스터마이저  
https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/demo-createProduct.mp4  

- Customer 360 & 대시보드  
https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/demo-dashboard.mp4  

- 리페어 & 사후 관리  
https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/demo-repair.mp4  

- 고객 설문 & 피드백  
https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/demo-survey.mp4  

<br/>

## ⭐ 주요 기능

- Lead → Account → Opportunity → Case 기반 전체 고객 여정 관리
- LWC 기반 제품 커스터마이저 및 견적서 생성
- Experience Cloud 고객 포털 (로그인, 주문 조회, 견적 확인)
- Customer 360 통합 콘솔
- Omni-Channel 상담 및 Case 관리
- Agentforce 기반 AI 추천 (Next Best Look)

<br/>

## 🔨 프로젝트 구조

ERD  
https://github.com/Eungu-Kim/maison-lavin-project/releases/download/v1.0/erd_maisonlavin.png  

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
