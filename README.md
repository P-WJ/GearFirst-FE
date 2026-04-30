# GearFirst Frontend

자동차 부품 운영 ERP를 위한 React 기반 프론트엔드입니다. 요청, 구매, 품목, 재고, 자산, 입출고, 인사, 차량 모델 관리 기능을 하나의 웹 콘솔로 통합했습니다.

이 저장소는 프론트엔드 전용 저장소이며, 백엔드 서버와 인증 서버는 포함하지 않습니다.

## 현재 상태

- 초기에는 실제 백엔드 연동을 전제로 개발했습니다.
- 현재는 백엔드 서버 미가동 상태로 인해 `MSW + auth bypass` 기반 mock 중심 개발 환경으로 운영하고 있습니다.
- 현재 공개 배포본도 `MSW + auth bypass` 기반 데모 환경입니다.
- 백엔드가 가동되는 환경에서는 `onUnhandledRequest: "bypass"`를 이용해, 핸들러에 없는 API만 실제 서버로 보내는 하이브리드 연동이 가능합니다.
- 연동 완료된 API는 MSW 핸들러에서 제거하면서 실서버 호출로 점진 전환할 수 있습니다.

## 주요 기능

- 운영 대시보드: 요청, 협력사, 재고, 자산, 입출고, 인력 데이터를 요약해 보여줍니다.
- 요청 / 구매 관리: 목록 조회, 검색, 기간 필터, 상태 분기, 비교 흐름을 제공합니다.
- 품목 / 재고 / 자산 관리: 부품, 자재, 카테고리, 재고, 자산을 도메인별 화면으로 관리합니다.
- 입고 / 출고 / 인사 / 차량 모델 관리: 운영 화면과 상세 흐름을 제공합니다.
- 인증 / 권한: OAuth2 Authorization Code + PKCE 기반 로그인 구조와 보호 라우트를 적용했습니다.

## 기술 스택

| 영역         | 스택                                                        |
| ------------ | ----------------------------------------------------------- |
| Framework    | React 19, React Router 7, Vite 7                            |
| Language     | TypeScript                                                  |
| State / Data | TanStack React Query, fetch API                             |
| UI           | styled-components, Recharts, react-datepicker, lucide-react |
| Mocking      | MSW                                                         |
| Quality      | ESLint                                                      |
| Deployment   | Vercel                                                      |

## 실행 방법

### 1. 의존성 설치

```bash
npm ci
```

### 2. 환경 파일 생성

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

### 3. 실행 모드 선택

#### 로컬 UI 개발 / 데모 확인

```bash
npm run dev
```

- `npm run dev`에서는 MSW가 항상 켜집니다.
- 핸들러에 등록된 API는 mock 응답을 반환합니다.
- 핸들러에 없는 요청만 실제 서버로 bypass 됩니다.
- `VITE_AUTH_BYPASS=true`면 인증 서버 없이 주요 화면 흐름을 확인할 수 있습니다.

#### 실백엔드 스모크 테스트

`.env` 예시:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_AUTH_SERVER=http://localhost:8080/auth
VITE_CLIENT_ID=gearfirst-client
VITE_REDIRECT_URI=http://localhost:4173/auth/callback
VITE_USE_MOCK=false
VITE_AUTH_BYPASS=false
```

실행:

```bash
npm run build
npm run preview
```

- `build + preview`에서는 `VITE_USE_MOCK` 값에 따라 mock 사용 여부가 결정됩니다.
- `.env`를 바꿨다면 `preview`만 다시 켜는 것이 아니라 `build`를 다시 해야 합니다.
- `VITE_REDIRECT_URI`와 인증 서버에 등록된 콜백 주소가 `preview` 포트와 정확히 일치해야 로그인 검증이 가능합니다.

## 주요 환경 변수

| 변수                    | 설명                                           |
| ----------------------- | ---------------------------------------------- |
| `VITE_API_BASE_URL`     | API 기본 주소                                  |
| `VITE_AUTH_SERVER`      | OAuth2 authorize/token 서버 주소               |
| `VITE_CLIENT_ID`        | OAuth2 client id                               |
| `VITE_REDIRECT_URI`     | 로그인 콜백 URI                                |
| `VITE_USE_MOCK`         | `preview` 또는 배포 환경에서 mock 사용 여부    |
| `VITE_AUTH_BYPASS`      | `true`면 인증 서버 없이 bypass 로그인 사용     |
| `VITE_USER_ME_ENDPOINT` | 사용자 정보 조회 API override가 필요할 때 사용 |

## 구현 포인트

- React Query: 목록 조회에서 페이지, 검색, 필터 조건을 `queryKey`에 반영하고, 변경 작업 이후 관련 쿼리를 재조회하는 방식으로 서버 상태를 관리합니다.
- 인증 구조: OAuth2 Authorization Code + PKCE, 토큰 재발급, `RequireAuth` / `RequireOrgType` 가드로 인증과 권한 흐름을 분리했습니다.
- Mock 전환: `onUnhandledRequest: "bypass"` 기반으로, 미완성 API만 mock에 남기고 연동 완료 API는 핸들러에서 제거하는 점진 전환 구조를 사용합니다.

## 프로젝트 구조

```txt
src/
  auth/          인증, PKCE, 토큰, 사용자 정보
  routes/        라우팅, 인증/권한 가드
  dashboard/     운영 대시보드
  request/       요청 관리
  purchasing/    구매 관리
  items/         부품, 자재, 카테고리 관리
  part/          재고 관리
  property/      자산 관리
  inbound/       입고 관리
  outbound/      출고 관리
  human/         인사 관리
  carModel/      차량 모델 관리
  user/          사용자 프로필
  notification/  알림 UI 및 SSE 연결
  components/    공통 UI 컴포넌트
  hooks/         공통 훅
  mocks/         mock handlers, mock data
  test/          테스트 설정
```

## 품질 및 배포

```bash
npm run lint
npm run build
```

- 현재 Vercel 배포는 `VITE_USE_MOCK=true`, `VITE_AUTH_BYPASS=true` 기준의 데모 배포입니다.
- 배포 성공은 mock + bypass 구성이 정상이라는 뜻이며, 실제 백엔드/인증 연동 검증을 의미하지 않습니다.
