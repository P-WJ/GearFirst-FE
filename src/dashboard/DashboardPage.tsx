import { useMemo } from "react";
import {
  HeroCard,
  HeroTitle,
  HeroSubtitle,
  HeroSummary,
  HeroSummaryItem,
  Divider,
  AnalyticsGrid,
  TrendCard,
  TrendHeader,
  TrendTitle,
  TrendCaption,
  TrendMeta,
  ChartHolder,
  TrendFooter,
  TrendStat,
  InsightStack,
  InsightCard,
  InsightLabel,
  InsightValue,
  InsightDelta,
  InsightBar,
  InsightFootnote,
  InsightList,
  MenuGrid,
  MenuCard,
  CardHeader,
  CardTitle,
  CardValue,
  CardLabel,
  CardSecondary,
  CardFooter,
  StatusChip,
  PodSection,
  PodTitle,
  PodList,
  PodItem,
  PodName,
  PodStatus,
} from "./components/DashboardStyles";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import Layout from "../components/common/Layout";
import {
  PageContainer,
  SectionCaption,
  SectionHeader,
  SectionTitle,
} from "../components/common/PageLayout";
type TrendPoint = {
  label: string;
  value: number;
};
import {
  fetchPendingOrders,
  fetchProcessedOrders,
} from "../request/RequestApi";
import { fetchBOMRecords } from "../bom/BOMApi";
import { fetchCompanyList } from "../purchasing/PurchasingApi";
import { fetchPartRecords as fetchInventoryPartRecords } from "../part/PartApi";
import { fetchPropertyRecords } from "../property/PropertyApi";
import { fetchInboundNotDoneRecords } from "../inbound/InboundApi";
import { fetchOutboundNotDoneRecords } from "../outbound/OutboundApi";
import { fetchUsers } from "../human/HumanApi";
import { fetchPartRecords as fetchItemPartRecords } from "../items/parts/PartApi";
import { fetchPods } from "./hooks/useDashboardData";

const numberFormatter = new Intl.NumberFormat("ko-KR");

function formatNumber(value: number | undefined | null) {
  if (value == null || Number.isNaN(value)) return "?";
  return numberFormatter.format(value);
}

type MenuSummary = {
  key: string;
  title: string;
  route: string;
  primary: { value: string; label: string };
  secondary?: string;
  status?: "ok" | "warning" | "muted";
  loading?: boolean;
  error?: string;
};
type PodItem = {
  name: string;
  phase: string;
};

function getQueryStatus<T>(query: UseQueryResult<T, unknown>) {
  const hasData = typeof query.data !== "undefined";
  return {
    hasData,
    isInitialPending: query.isPending && !hasData,
    isRefreshing: query.isFetching && !query.isPending && hasData,
  };
}

export default function DashboardPage() {
  const pendingOrders = useQuery({
    queryKey: ["dashboard", "request", "pending"],
    queryFn: () =>
      fetchPendingOrders({
        page: 0,
        size: 5,
      }),
    select: (res) => res.data.totalElements ?? 0,
    staleTime: 60 * 1000,
  });

  const processedOrders = useQuery({
    queryKey: ["dashboard", "request", "processed"],
    queryFn: () =>
      fetchProcessedOrders({
        page: 0,
        size: 5,
      }),
    select: (res) => res.data.totalElements ?? 0,
    staleTime: 60 * 1000,
  });

  const bomRecords = useQuery({
    queryKey: ["dashboard", "mrp", "bom"],
    queryFn: () =>
      fetchBOMRecords({
        page: 1,
        pageSize: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 5 * 60 * 1000,
  });

  const companyRecords = useQuery({
    queryKey: ["dashboard", "purchasing", "companies"],
    queryFn: () =>
      fetchCompanyList({
        page: 0,
        size: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 5 * 60 * 1000,
  });

  const inventoryParts = useQuery({
    queryKey: ["dashboard", "inventory", "parts"],
    queryFn: () =>
      fetchInventoryPartRecords({
        warehouseCode: undefined,
        partKeyword: "",
        supplierName: "",
        page: 0,
        size: 5,
      }),
    select: (res) => res.data.total ?? 0,
    staleTime: 5 * 60 * 1000,
  });

  const propertyRecords = useQuery({
    queryKey: ["dashboard", "property", "records"],
    queryFn: () =>
      fetchPropertyRecords({
        page: 1,
        size: 10,
      }),
    select: (res) => {
      const payload = res.data ?? { items: [] };
      const items = payload.items ?? [];
      const total = payload.total ?? items.length;
      const assetValue = items.reduce(
        (acc, item) => acc + (item.partPrice ?? 0) * (item.partQuantity ?? 0),
        0,
      );
      return { total, assetValue, items };
    },
    staleTime: 5 * 60 * 1000,
  });

  const inboundRecords = useQuery({
    queryKey: ["dashboard", "inbound", "pending"],
    queryFn: () =>
      fetchInboundNotDoneRecords({
        page: 1,
        pageSize: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 60 * 1000,
  });

  const outboundRecords = useQuery({
    queryKey: ["dashboard", "outbound", "pending"],
    queryFn: () =>
      fetchOutboundNotDoneRecords({
        page: 1,
        pageSize: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 60 * 1000,
  });

  const humanRecords = useQuery({
    queryKey: ["dashboard", "human", "users"],
    queryFn: () =>
      fetchUsers({
        page: 1,
        pageSize: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 5 * 60 * 1000,
  });

  const itemPartRecords = useQuery({
    queryKey: ["dashboard", "items", "parts"],
    queryFn: () =>
      fetchItemPartRecords({
        page: 1,
        pageSize: 5,
      }),
    select: (res) => res.meta?.total ?? 0,
    staleTime: 5 * 60 * 1000,
  });

  const { isInitialPending: pendingOrdersLoading } =
    getQueryStatus(pendingOrders);
  const {
    isInitialPending: processedOrdersLoading,
    isRefreshing: processedOrdersRefreshing,
  } = getQueryStatus(processedOrders);
  const { isInitialPending: bomRecordsLoading } = getQueryStatus(bomRecords);
  const { isInitialPending: companyRecordsLoading } =
    getQueryStatus(companyRecords);
  const { isInitialPending: inventoryPartsLoading } =
    getQueryStatus(inventoryParts);
  const {
    isInitialPending: propertyRecordsLoading,
    isRefreshing: propertyRecordsRefreshing,
  } = getQueryStatus(propertyRecords);
  const {
    isInitialPending: inboundRecordsLoading,
    isRefreshing: inboundRecordsRefreshing,
  } = getQueryStatus(inboundRecords);
  const {
    isInitialPending: outboundRecordsLoading,
    isRefreshing: outboundRecordsRefreshing,
  } = getQueryStatus(outboundRecords);
  const { isInitialPending: humanRecordsLoading } =
    getQueryStatus(humanRecords);
  const { isInitialPending: itemPartRecordsLoading } =
    getQueryStatus(itemPartRecords);

  const {
    data: pods,
    isPending: arePodsPending,
    isFetching: arePodsFetching,
    error,
  } = useQuery({
    queryKey: ["dashboard", "pods"],
    queryFn: () => fetchPods("default"),
    staleTime: 30 * 1000,
  });
  const isPodsRefreshing = arePodsFetching && !arePodsPending && Boolean(pods);
  const openWorkload = useMemo(() => {
    const pending = pendingOrders.data ?? 0;
    const inbound = inboundRecords.data ?? 0;
    const outbound = outboundRecords.data ?? 0;
    return pending + inbound + outbound;
  }, [pendingOrders.data, inboundRecords.data, outboundRecords.data]);

  const processedRatio = useMemo(() => {
    const pending = pendingOrders.data ?? 0;
    const processed = processedOrders.data ?? 0;
    if (!processed) return "0%";
    const ratio = processed / Math.max(1, pending + processed);
    return `${Math.round(ratio * 100)}%`;
  }, [pendingOrders.data, processedOrders.data]);

  const assetDistribution = useMemo(() => {
    const items = propertyRecords.data?.items ?? [];
    if (items.length === 0) {
      return { top20: 0, middle50: 0, bottom30: 0 };
    }

    const sorted = [...items].sort((a, b) => {
      const av = (a.partPrice ?? 0) * (a.partQuantity ?? 0);
      const bv = (b.partPrice ?? 0) * (b.partQuantity ?? 0);
      return bv - av;
    });

    const totalValue = sorted.reduce(
      (acc, item) => acc + (item.partPrice ?? 0) * (item.partQuantity ?? 0),
      0,
    );

    if (!totalValue) {
      return { top20: 0, middle50: 0, bottom30: 0 };
    }

    const topCount = Math.max(1, Math.ceil(sorted.length * 0.2));
    const bottomCount = Math.max(1, Math.ceil(sorted.length * 0.3));
    const middleCount = Math.max(0, sorted.length - topCount - bottomCount);

    const topValue = sorted
      .slice(0, topCount)
      .reduce(
        (acc, item) => acc + (item.partPrice ?? 0) * (item.partQuantity ?? 0),
        0,
      );
    const middleValue = sorted
      .slice(topCount, topCount + middleCount)
      .reduce(
        (acc, item) => acc + (item.partPrice ?? 0) * (item.partQuantity ?? 0),
        0,
      );
    const bottomValue = sorted
      .slice(sorted.length - bottomCount)
      .reduce(
        (acc, item) => acc + (item.partPrice ?? 0) * (item.partQuantity ?? 0),
        0,
      );

    const toPercent = (value: number) => Math.round((value / totalValue) * 100);

    let top20 = toPercent(topValue);
    const middle50 = toPercent(middleValue);
    const bottom30 = toPercent(bottomValue);

    const totalPercent = top20 + middle50 + bottom30;
    if (totalPercent !== 100) {
      const diff = 100 - totalPercent;
      top20 += diff;
    }

    return { top20, middle50, bottom30 };
  }, [propertyRecords.data?.items]);

  const trendSeries = useMemo<TrendPoint[]>(() => {
    const base = [
      {
        label: "03",
        value: (pendingOrders.data ?? 0) + (inboundRecords.data ?? 0),
      },
      {
        label: "04",
        value:
          (processedOrders.data ?? 0) * 0.7 + (outboundRecords.data ?? 0) * 1.2,
      },
      {
        label: "05",
        value:
          (pendingOrders.data ?? 0) * 0.8 + (companyRecords.data ?? 0) * 1.5,
      },
      {
        label: "06",
        value:
          (inboundRecords.data ?? 0) * 1.2 + (inventoryParts.data ?? 0) * 0.4,
      },
      {
        label: "07",
        value:
          (outboundRecords.data ?? 0) * 1.3 + (humanRecords.data ?? 0) * 0.5,
      },
      {
        label: "08",
        value:
          (processedOrders.data ?? 0) * 0.9 +
          (propertyRecords.data?.total ?? 0) * 0.25,
      },
    ];

    return base.map((entry) => ({
      label: entry.label,
      value: Math.round(entry.value),
    }));
  }, [
    pendingOrders.data,
    processedOrders.data,
    inboundRecords.data,
    outboundRecords.data,
    companyRecords.data,
    inventoryParts.data,
    propertyRecords.data?.total,
    humanRecords.data,
  ]);

  const menuSummaries = useMemo<MenuSummary[]>(() => {
    const cards: MenuSummary[] = [
      {
        key: "request",
        title: "요청 관리",
        route: "/request",
        primary: {
          value: pendingOrdersLoading ? "0" : formatNumber(pendingOrders.data),
          label: "승인 대기",
        },
        secondary: processedOrdersLoading
          ? "승인 데이터를 불러오는 중"
          : processedOrdersRefreshing
            ? "승인 데이터를 동기화 중…"
            : `이번 주 처리 ${formatNumber(processedOrders.data)}건`,
        status:
          processedOrders.data && processedOrders.data > 0 ? "ok" : "muted",
        loading: pendingOrders.isFetching || processedOrders.isFetching,
        error:
          pendingOrders.isError || processedOrders.isError
            ? "요청 현황을 불러오지 못했습니다"
            : undefined,
      },
      {
        key: "mrp",
        title: "자재 소요량 계획",
        route: "/mrp",
        primary: {
          value: bomRecordsLoading ? "0" : formatNumber(bomRecords.data),
          label: "등록된 BOM",
        },
        secondary: "MRP는 최신 BOM 기준으로 계산됩니다",
        status: "muted",
        loading: bomRecords.isFetching,
        error: bomRecords.isError
          ? "BOM 데이터를 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "purchasing",
        title: "구매 관리",
        route: "/purchasing",
        primary: {
          value: companyRecordsLoading
            ? "0"
            : formatNumber(companyRecords.data),
          label: "협력사 보유",
        },
        secondary: "가격·납기 데이터 최신화 상태를 확인하세요",
        status:
          companyRecords.data && companyRecords.data > 0 ? "ok" : "warning",
        loading: companyRecords.isFetching,
        error: companyRecords.isError
          ? "협력사 목록을 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "items",
        title: "품목 관리",
        route: "/items",
        primary: {
          value: itemPartRecordsLoading
            ? "0"
            : formatNumber(itemPartRecords.data),
          label: "등록된 품목",
        },
        secondary: "부품·자재·카테고리를 한 화면에서 관리합니다",
        status:
          itemPartRecords.data && itemPartRecords.data > 0 ? "ok" : "muted",
        loading: itemPartRecords.isFetching,
        error: itemPartRecords.isError
          ? "품목 정보를 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "part",
        title: "재고 관리",
        route: "/part",
        primary: {
          value: inventoryPartsLoading
            ? "0"
            : formatNumber(inventoryParts.data),
          label: "창고별 품목",
        },
        secondary: propertyRecordsLoading
          ? "자산 가치를 계산 중입니다"
          : propertyRecordsRefreshing
            ? "자산 정보를 동기화 중…"
            : `표본 자산 ${formatNumber(propertyRecords.data?.assetValue ?? 0)}`,
        status:
          inventoryParts.data && inventoryParts.data > 0 ? "ok" : "warning",
        loading: inventoryParts.isFetching || propertyRecords.isFetching,
        error:
          inventoryParts.isError || propertyRecords.isError
            ? "재고/자산 데이터를 불러오지 못했습니다"
            : undefined,
      },
      {
        key: "property",
        title: "자산 관리",
        route: "/property",
        primary: {
          value: propertyRecordsLoading
            ? "0"
            : formatNumber(propertyRecords.data?.total),
          label: "자산 항목",
        },
        secondary: propertyRecordsLoading
          ? undefined
          : propertyRecordsRefreshing
            ? "자산 정보를 동기화 중…"
            : `총액 ${formatNumber(propertyRecords.data?.assetValue ?? 0)}`,
        status:
          propertyRecords.data && propertyRecords.data.total > 0
            ? "ok"
            : "muted",
        loading: propertyRecords.isFetching,
        error: propertyRecords.isError
          ? "자산 정보를 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "inbound",
        title: "입고 관리",
        route: "/inbound",
        primary: {
          value: inboundRecordsLoading
            ? "0"
            : formatNumber(inboundRecords.data),
          label: "입고 예정",
        },
        secondary: "검수 준비 통제를 확인하세요",
        status:
          inboundRecords.data && inboundRecords.data > 0 ? "warning" : "ok",
        loading: inboundRecords.isFetching,
        error: inboundRecords.isError
          ? "입고 데이터를 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "outbound",
        title: "출고 관리",
        route: "/outbound",
        primary: {
          value: outboundRecordsLoading
            ? "0"
            : formatNumber(outboundRecords.data),
          label: "출고 대기",
        },
        secondary: "납기 위험 출고를 우선 확인하세요",
        status:
          outboundRecords.data && outboundRecords.data > 0 ? "warning" : "ok",
        loading: outboundRecords.isFetching,
        error: outboundRecords.isError
          ? "출고 데이터를 불러오지 못했습니다"
          : undefined,
      },
      {
        key: "human",
        title: "인사 관리",
        route: "/human",
        primary: {
          value: humanRecordsLoading ? "0" : formatNumber(humanRecords.data),
          label: "등록 인원",
        },
        secondary: "현장 인력 구성과 역량 분포를 살펴보세요",
        status: humanRecords.data && humanRecords.data > 0 ? "ok" : "muted",
        loading: humanRecords.isFetching,
        error: humanRecords.isError
          ? "인사 데이터를 불러오지 못했습니다"
          : undefined,
      },
    ];

    return cards;
  }, [
    pendingOrdersLoading,
    pendingOrders.data,
    pendingOrders.isError,
    pendingOrders.isFetching,
    processedOrdersLoading,
    processedOrdersRefreshing,
    processedOrders.data,
    processedOrders.isError,
    processedOrders.isFetching,
    bomRecordsLoading,
    bomRecords.data,
    bomRecords.isError,
    bomRecords.isFetching,
    companyRecordsLoading,
    companyRecords.data,
    companyRecords.isError,
    companyRecords.isFetching,
    itemPartRecordsLoading,
    itemPartRecords.data,
    itemPartRecords.isError,
    itemPartRecords.isFetching,
    inventoryPartsLoading,
    inventoryParts.data,
    inventoryParts.isError,
    inventoryParts.isFetching,
    propertyRecordsLoading,
    propertyRecordsRefreshing,
    propertyRecords.data,
    propertyRecords.isError,
    propertyRecords.isFetching,
    inboundRecordsLoading,
    inboundRecords.data,
    inboundRecords.isError,
    inboundRecords.isFetching,
    outboundRecordsLoading,
    outboundRecords.data,
    outboundRecords.isError,
    outboundRecords.isFetching,
    humanRecordsLoading,
    humanRecords.data,
    humanRecords.isError,
    humanRecords.isFetching,
  ]);

  return (
    <Layout>
      <PageContainer>
        <HeroCard>
          <HeroTitle>GearFirst 운영 현황</HeroTitle>
          <HeroSubtitle>
            오늘 처리해야 할 물류·조달·인력 워크로드를 빠르게 확인하세요. 실시간
            주요 지표를 요약했습니다.
          </HeroSubtitle>

          <HeroSummary>
            <HeroSummaryItem>
              <span>열린 업무</span>
              <strong>{formatNumber(openWorkload)}</strong>
            </HeroSummaryItem>
            <Divider />
            <HeroSummaryItem>
              <span>승인 진행률</span>
              <strong>{processedRatio}</strong>
            </HeroSummaryItem>
            <Divider />
            <HeroSummaryItem>
              <span>출·입고 대기</span>
              <strong>
                {inboundRecordsLoading || outboundRecordsLoading
                  ? "0"
                  : formatNumber(
                      (inboundRecords.data ?? 0) + (outboundRecords.data ?? 0),
                    )}
              </strong>
              {(inboundRecordsRefreshing || outboundRecordsRefreshing) && (
                <span style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                  동기화 중…
                </span>
              )}
            </HeroSummaryItem>
          </HeroSummary>
        </HeroCard>

        <AnalyticsGrid>
          <TrendCard>
            <TrendHeader>
              <div>
                <TrendTitle>공정 밸런스</TrendTitle>
                <TrendCaption>
                  승인·입고·출고 진행량을 월간 스냅샷으로 비교합니다.
                </TrendCaption>
              </div>
              <TrendMeta>
                <span>최근 6개월</span>
              </TrendMeta>
            </TrendHeader>
            <ChartHolder>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendSeries}
                  margin={{ top: 14, right: 24, left: 4, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="dashboardTrendFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#111111"
                        stopOpacity={0.32}
                      />
                      <stop
                        offset="100%"
                        stopColor="#111111"
                        stopOpacity={0.04}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke="#e4e4e7"
                    strokeDasharray="3 6"
                  />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#6c6c72", fontWeight: 500 }}
                    padding={{ left: 8, right: 8 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#6c6c72" }}
                    width={40}
                  />
                  <Tooltip
                    cursor={{
                      stroke: "#111111",
                      strokeWidth: 0.6,
                      opacity: 0.4,
                    }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e4e4e7",
                      boxShadow: "0 12px 32px rgba(15,15,23,0.08)",
                      background: "#ffffff",
                      padding: "0.6rem 0.75rem",
                      fontSize: "0.78rem",
                    }}
                    labelStyle={{ color: "#6c6c72", marginBottom: 4 }}
                    formatter={(value: number) => [
                      `${formatNumber(value)}건`,
                      "처리량",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#111111"
                    strokeWidth={1.6}
                    fill="url(#dashboardTrendFill)"
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#000000"
                    strokeWidth={1.4}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "#ffffff",
                      stroke: "#000000",
                      strokeWidth: 1.4,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartHolder>
            <TrendFooter>
              <TrendStat>
                <label>Pending</label>
                <strong>{formatNumber(pendingOrders.data)}</strong>
              </TrendStat>
              <TrendStat>
                <label>Inbound</label>
                <strong>{formatNumber(inboundRecords.data)}</strong>
              </TrendStat>
              <TrendStat>
                <label>Outbound</label>
                <strong>{formatNumber(outboundRecords.data)}</strong>
              </TrendStat>
              <TrendStat>
                <label>Processed</label>
                <strong>{formatNumber(processedOrders.data)}</strong>
              </TrendStat>
            </TrendFooter>
          </TrendCard>

          <InsightStack>
            <InsightCard>
              <InsightLabel>자산 포트폴리오</InsightLabel>
              <InsightValue>
                ₩{formatNumber(propertyRecords.data?.assetValue ?? 0)}
              </InsightValue>

              <InsightDelta $tone="positive">
                {propertyRecordsLoading
                  ? "데이터 로딩 중"
                  : propertyRecordsRefreshing
                    ? "자산 데이터를 동기화 중…"
                    : `자산 항목 ${formatNumber(
                        propertyRecords.data?.total ?? 0,
                      )}건`}
              </InsightDelta>
              <InsightBar>
                <div className="segment primary">
                  <span>핵심 재고 (상위 20%)</span>
                  <strong>{assetDistribution.top20}%</strong>
                </div>
                <div className="segment secondary">
                  <span>일반 재고 (중간 50%)</span>
                  <strong>{assetDistribution.middle50}%</strong>
                </div>
                <div className="segment tertiary">
                  <span>저비중 재고 (하위 30%)</span>
                  <strong>{assetDistribution.bottom30}%</strong>
                </div>
              </InsightBar>
              <InsightFootnote>재고·자산 집중도 요약</InsightFootnote>
            </InsightCard>

            <InsightCard>
              <InsightLabel>운영 네트워크</InsightLabel>
              <InsightValue>
                {formatNumber(
                  (companyRecords.data ?? 0) + (humanRecords.data ?? 0),
                )}
              </InsightValue>
              <InsightDelta $tone="neutral">
                협력사 {formatNumber(companyRecords.data)}곳 · 인력{" "}
                {formatNumber(humanRecords.data)}명
              </InsightDelta>
              <InsightList>
                <li>
                  <strong>구매</strong>
                  <span>{formatNumber(companyRecords.data)} vendors</span>
                </li>
                <li>
                  <strong>인력</strong>
                  <span>{formatNumber(humanRecords.data)} staff</span>
                </li>
                <li>
                  <strong>품목</strong>
                  <span>{formatNumber(itemPartRecords.data)} items</span>
                </li>
              </InsightList>
            </InsightCard>
          </InsightStack>
        </AnalyticsGrid>

        <SectionHeader>
          <div>
            <SectionTitle>업무 메뉴 바로가기</SectionTitle>
            <SectionCaption>
              각 도메인의 핵심 지표와 함께 필요한 화면으로 이동하세요.
            </SectionCaption>
          </div>
        </SectionHeader>

        <MenuGrid>
          {menuSummaries.map((card) => {
            const isError = Boolean(card.error);
            return (
              <MenuCard
                key={card.key}
                to={card.route}
                $status={card.status ?? "muted"}
                $isError={isError}
              >
                <CardHeader>
                  <CardTitle>{card.title}</CardTitle>
                  {isError ? (
                    <StatusChip $tone="danger">연결 오류</StatusChip>
                  ) : card.loading ? (
                    <StatusChip $tone="muted">갱신 중</StatusChip>
                  ) : card.status === "warning" ? (
                    <StatusChip $tone="warning">주의</StatusChip>
                  ) : (
                    <StatusChip $tone="accent">정상</StatusChip>
                  )}
                </CardHeader>
                <CardValue>{card.primary.value}</CardValue>
                <CardLabel>{card.primary.label}</CardLabel>
                {card.secondary && (
                  <CardSecondary>{card.secondary}</CardSecondary>
                )}
                <CardFooter>바로가기 →</CardFooter>
              </MenuCard>
            );
          })}
        </MenuGrid>
        {arePodsPending ? (
          <PodSection>
            <PodTitle>Pod 모니터링</PodTitle>
            <p>데이터 로딩 중...</p>
          </PodSection>
        ) : error ? (
          <PodSection>
            <PodTitle>Pod 모니터링</PodTitle>
            <p>Pod 데이터를 불러올 수 없습니다.</p>
          </PodSection>
        ) : (
          <PodSection>
            <PodTitle>Pod 모니터링</PodTitle>
            {isPodsRefreshing && (
              <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                Pod 상태 동기화 중…
              </p>
            )}
            <PodList>
              {pods?.map((pod: PodItem) => (
                <PodItem key={pod.name}>
                  <PodName>{pod.name}</PodName>
                  <PodStatus $phase={pod.phase} />
                </PodItem>
              ))}
            </PodList>
          </PodSection>
        )}
      </PageContainer>
    </Layout>
  );
}
