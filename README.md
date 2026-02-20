# GearFirst Frontend

자동차 부품 조달/재고/입출고 운영을 위한 프론트엔드 애플리케이션입니다. 
React + TypeScript + Vite 기반이며, 도메인별 운영 화면(요청, BOM, 구매, 재고, 자산, 입출고, 인사, 차량모델)을 제공합니다.

## 핵심 기능

- 운영 대시보드: 도메인별 핵심 지표와 업무 바로가기
- 요청 관리: 승인/반려/처리 이력 조회 및 상세 확인
- 구매 관리: 업체 등록, 소싱 후보 조회, PO 생성
- 품목/BOM/재고/자산/입출고/인사 관리 화면 제공
- OAuth2 + PKCE 로그인 흐름
- MSW 기반 API 모킹 개발 환경 지원

## 기술 스택

- Framework: React 19, React Router 7
- Language: TypeScript
- Data Fetching: TanStack React Query
- Styling: styled-components
- Charts: Recharts
- Build Tool: Vite
- Mocking/Test: MSW, Vitest, Testing Library
- Lint: ESLint 9

## 프로젝트 구조

```txt
src/
  auth/           # 인증, 토큰 갱신, 로그인/콜백
  dashboard/      # 대시보드 페이지/훅/스타일
  request/        # 발주 요청 도메인
  purchasing/     # 구매/소싱 도메인
  items/          # 품목 도메인
  part/           # 재고 도메인
  inbound/        # 입고 도메인
  outbound/       # 출고 도메인
  property/       # 자산 도메인
  human/          # 인사 도메인
  routes/         # 라우팅 및 가드
  mocks/          # MSW 핸들러/데이터
```

## 상태 관리 전략

- 서버 상태: React Query (`useQuery`, `useMutation`, cache/invalidate)
- 클라이언트 상태: 컴포넌트 로컬 상태 (`useState`, `useMemo`, `useEffect`)
- 전역 상태: 인증 토큰(storage) + 최소 사용자 프로필 store

## 실행 방법

### 1) 설치

```bash
npm ci
```

### 2) 환경변수 설정

`.env.example`을 참고해 `.env` 작성:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_AUTH_SERVER=http://localhost:8080/auth
VITE_CLIENT_ID=gearfirst-client
VITE_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_USE_MOCK=false
```

### 3) 개발 서버 실행

```bash
npm run dev
```

## 스크립트

- `npm run dev`: 로컬 개발 서버
- `npm run build`: 타입체크 + 프로덕션 빌드
- `npm run lint`: ESLint 검사
- `npm run test`: Vitest watch 모드
- `npm run test:run`: 테스트 1회 + coverage
- `npm run preview`: 빌드 결과 미리보기

## 모킹(MSW) 제어

- 기본: `VITE_USE_MOCK=false`
- 모킹 활성화 시 `main.tsx`에서 worker가 시작되고, 개발 환경 API를 모킹합니다.

## 품질 게이트

- 빌드: `npm run build`
- 린트: `npm run lint`
- 테스트: `npm run test:run`
- CI: `.github/workflows/ci.yml`에서 lint/build/test 자동 실행

## 테스트 범위 (현재)

- `src/auth/utils/redirectUri.test.ts`: 리다이렉트 URI 선택 로직
- `src/purchasing/PurchasingApi.test.ts`: 구매 API 매핑 로직 (MSW API mocking)

## 배포

- SPA rewrite 설정: `vercel.json`
- 정적 빌드 산출물: `dist/`

## 향후 개선 계획

- 남아있는 hook dependency warning 정리
- 도메인별 테스트 커버리지 확대
- 대시보드 비즈니스 로직 추가 분리 및 재사용성 개선
