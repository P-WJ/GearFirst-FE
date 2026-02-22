# GearFirst Frontend 🚗

자동차 부품 운영 ERP 프론트엔드입니다.  
요청/구매/품목/재고/자산/입출고/인사/차량모델 업무를 하나의 웹 콘솔에서 처리합니다.

## 프로젝트 요약

- 인증: OAuth2 + PKCE 로그인/콜백 + 토큰 갱신(`refresh_token`)
- 권한: `RequireAuth` + `RequireOrgType` 기반 접근 제어(본사 권한 라우트)
- 데이터: TanStack React Query로 서버 상태/캐시 관리
- 개발: `npm run dev` 시 MSW worker 자동 시작(`onUnhandledRequest: "bypass"`)

## 주요 기능 (코드 기준)

- **운영 대시보드**: 요청/재고/자산/입출고/인사 지표를 카드·차트로 통합 표시
- **요청 관리**: 승인 대기/진행/취소 목록 분리, 검색·기간·페이지 필터, 승인/반려 처리
- **구매 관리**: 전체/선정 업체 조회, 소싱 섹션, 최대 3개 업체 비교, 등록 후 목록 갱신
- **입고/출고 관리**: 예정/완료 리스트 분리, 요약 지표(완료율/지연/대기수량), 기간·검색 필터
- **인사 관리**: 직급/직무/지역 필터 + 키워드 검색, 사용자 등록 모달
- **마스터 관리**: BOM/품목/재고/자산/차량모델 모듈 분리 운영

## 기술 스택

- Framework: React 19, React Router 7, Vite 7
- Language/UI: TypeScript, styled-components, Recharts, react-datepicker
- State/Data: TanStack React Query, fetch API
- Testing/Quality: Vitest, Testing Library, ESLint 9, GitHub Actions CI
- Mocking: MSW

## 빠른 실행

### 요구사항
- Node.js 20+
- npm

### 설치 및 개발
```bash
npm ci
npm run dev
```

### 검증/빌드
```bash
npm run lint
npm run test:run
npm run build
npm run preview
```

## 환경변수 (.env.example)

아래는 코드에서 실제 참조되는 키입니다.

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_AUTH_SERVER=http://localhost:8080/auth
VITE_CLIENT_ID=gearfirst-client
VITE_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_AUTH_BYPASS=true
VITE_USER_ME_ENDPOINT=http://localhost:8080/user/api/v1/me
```

## 프로젝트 구조

```txt
src/
  auth/                # 인증/토큰/권한 가드
  dashboard/           # 운영 대시보드
  request/             # 요청 관리
  purchasing/          # 구매 관리
  items/               # 카테고리/자재/부품
  part/ property/      # 재고/자산
  inbound/ outbound/   # 입고/출고
  human/ carModel/     # 인사/차량모델
  components/common/   # 공통 UI
  routes/              # 라우팅
  mocks/               # MSW handlers/data
```

## 현재 개발 환경 메모

- 원래는 백엔드 연동 구조로 개발되었고, 현재는 백엔드 미가동 상태를 고려해 MSW 기반으로 개발 중입니다.
- `VITE_AUTH_BYPASS=true`로 인증 서버 없이 주요 플로우를 검증할 수 있습니다.
- 배포 전에는 실제 백엔드 연동 E2E 검증이 필요합니다.
