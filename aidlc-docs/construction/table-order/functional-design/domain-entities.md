# 도메인 엔티티 (Domain Entities) — Unit: table-order

기술 중립적 관점에서 도메인 엔티티와 관계, 불변식을 정의합니다.

---

## 엔티티 목록 및 속성

### Store (매장)
| 속성 | 타입 | 설명 |
|------|------|------|
| id | string | 매장 식별자 (PK) |
| name | string | 매장 이름 |
| created_at | datetime | 생성 시각 |

### Table (테이블)
| 속성 | 타입 | 설명 |
|------|------|------|
| id | string | 테이블 식별자 (PK) |
| store_id | string | 소속 매장 (FK) |
| table_number | int | 테이블 번호 (매장 내 유일) |
| password | string | 테이블 로그인 비밀번호 |

**불변식**: (store_id, table_number)는 유일해야 함.

### TableSession (테이블 세션)
| 속성 | 타입 | 설명 |
|------|------|------|
| id | string | 세션 식별자 (PK) |
| table_id | string | 테이블 (FK) |
| store_id | string | 매장 (FK) |
| started_at | datetime | 세션 시작 시각 |
| ended_at | datetime\|null | 세션 종료 시각 |
| is_active | bool | 활성 여부 |

**불변식**: 한 테이블에 활성(is_active=true) 세션은 최대 1개. (Q2=B: 로그인 시 세션 시작)

### Category (카테고리)
| 속성 | 타입 | 설명 |
|------|------|------|
| id | string | PK |
| store_id | string | 매장 (FK) |
| name | string | 카테고리명 |
| sort_order | int | 노출 순서 |

### MenuItem (메뉴 항목)
| 속성 | 타입 | 설명 |
|------|------|------|
| id | string | PK |
| store_id | string | 매장 (FK) |
| category_id | string | 카테고리 (FK) |
| name | string | 메뉴명 |
| price | int | 가격 (원, 0 이상 정수 — Q4=B) |
| description | string\|null | 설명 |
| image_url | string\|null | 이미지 경로 (로컬 업로드) |
| sort_order | int | 노출 순서 |
| is_available | bool | 판매 가능 여부 |

### Order (주문)
| 속성 | 타입 | 설명 |
|------|------|------|
| id | string | PK |
| store_id | string | 매장 (FK) |
| table_id | string | 테이블 (FK) |
| session_id | string | 세션 (FK) |
| order_number | int | 매장 전체 순차 번호 (Q1=A) |
| status | enum | pending \| preparing \| completed |
| total_amount | int | 총 금액 (항목 합계) |
| created_at | datetime | 주문 시각 |

### OrderItem (주문 항목)
| 속성 | 타입 | 설명 |
|------|------|------|
| id | string | PK |
| order_id | string | 주문 (FK, CASCADE) |
| menu_item_id | string | 메뉴 참조 |
| menu_item_name | string | 주문 시점 메뉴명 스냅샷 (Q5=A) |
| quantity | int | 수량 (1 이상) |
| unit_price | int | 주문 시점 단가 스냅샷 (Q5=A) |

**불변식**: quantity ≥ 1. menu_item_name/unit_price는 주문 시점 값으로 고정(스냅샷).

### OrderHistory (과거 주문 이력)
| 속성 | 타입 | 설명 |
|------|------|------|
| id | string | PK |
| store_id | string | 매장 (FK) |
| table_id | string | 테이블 (FK) |
| session_id | string | 세션 (FK) |
| order_number | int | 원 주문번호 |
| status | enum | 이동 시점 상태 |
| total_amount | int | 총 금액 |
| items_json | string | 주문 항목 스냅샷 (JSON) |
| created_at | datetime | 원 주문 시각 |
| archived_at | datetime | 이력 이동(이용 완료) 시각 |

---

## 엔티티 관계 (Relationships)

```
Store 1 ── N Table
Store 1 ── N Category
Store 1 ── N MenuItem
Category 1 ── N MenuItem
Table 1 ── N TableSession
TableSession 1 ── N Order
Order 1 ── N OrderItem
TableSession 1 ── N OrderHistory   (이용 완료 시 Order → OrderHistory)
```

## 상태 열거형 (Enums)

### OrderStatus
- `pending` (대기중) — 주문 생성 직후 기본값
- `preparing` (준비중)
- `completed` (완료)

전이 정책: 자유 전환 허용 (Q3=B). 단, 위 3개 값만 유효.

---

## 데이터 보존 정책
- **스냅샷 원칙 (Q5=A)**: OrderItem과 OrderHistory.items_json은 주문 시점의 메뉴명과 단가를 보존. 이후 메뉴 수정/삭제가 과거 내역에 영향을 주지 않음.
- **이력 이동**: 세션 이용 완료 시 해당 세션의 Order/OrderItem을 OrderHistory로 이동하고 원본은 삭제.
