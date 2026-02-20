import styled, { css } from "styled-components";
import { Link } from "react-router-dom";

const HeroCard = styled.section`
  background: #ffffff;
  border-radius: 22px;
  padding: 2rem 2.4rem;
  border: 1px solid #e4e4e7;
  box-shadow: 0 24px 48px rgba(15, 15, 23, 0.05);
  margin-bottom: 2rem;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(1.6rem, 2.3vw, 2.1rem);
  letter-spacing: -0.02em;
  color: #0f0f11;
`;

const HeroSubtitle = styled.p`
  margin: 0.75rem 0 0;
  font-size: 0.96rem;
  color: #5e5e63;
  line-height: 1.5;
`;

const HeroSummary = styled.div`
  margin-top: 1.8rem;
  display: inline-flex;
  padding: 0.95rem 1.25rem;
  border-radius: 999px;
  border: 1px solid #e4e4e7;
  background: rgba(17, 17, 17, 0.03);
  gap: 1.25rem;
  align-items: center;
`;

const HeroSummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  font-size: 0.8rem;
  color: #6c6c72;

  strong {
    font-size: 1.2rem;
    font-weight: 700;
    color: #0f0f11;
    letter-spacing: -0.01em;
  }
`;

const Divider = styled.span`
  width: 1px;
  height: 36px;
  background: rgba(17, 17, 17, 0.12);
`;

const AnalyticsGrid = styled.div`
  display: grid;
  gap: 1.75rem;
  grid-template-columns: minmax(0, 2.2fr) minmax(0, 1fr);
  margin-bottom: 2rem;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr;
  }
`;

const TrendCard = styled.section`
  border-radius: 22px;
  border: 1px solid #e4e4e7;
  background: #ffffff;
  padding: 1.8rem;
  box-shadow: 0 24px 48px rgba(15, 15, 23, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TrendHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const TrendTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #111111;
`;

const TrendCaption = styled.p`
  margin: 0.4rem 0 0;
  font-size: 0.82rem;
  color: #6c6c72;
  max-width: 320px;
  line-height: 1.45;
`;

const TrendMeta = styled.div`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6c6c72;
`;

const ChartHolder = styled.div`
  width: 100%;
  height: 220px;
  padding: 0.3rem 0.1rem 0.9rem;
  border-radius: 18px;
  background: linear-gradient(180deg, #fafafa 0%, #ffffff 100%);
  border: 1px solid #ededf0;
`;

const TrendFooter = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
`;

const TrendStat = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;

  label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6c6c72;
  }

  strong {
    font-size: 1.05rem;
    font-weight: 600;
    color: #111111;
  }
`;

const InsightStack = styled.div`
  display: grid;
  gap: 1.4rem;
`;

const InsightCard = styled.section`
  border-radius: 22px;
  border: 1px solid #e4e4e7;
  background: #ffffff;
  padding: 1.6rem;
  box-shadow: 0 20px 42px rgba(15, 15, 23, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
`;

const InsightLabel = styled.span`
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6c6c72;
`;

const InsightValue = styled.span`
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #0f0f11;
`;

const InsightDelta = styled.span<{
  $tone: "positive" | "neutral" | "negative";
}>`
  font-size: 0.82rem;
  color: ${({ $tone }) =>
    $tone === "positive"
      ? "#0f766e"
      : $tone === "negative"
        ? "#dc2626"
        : "#52525b"};
`;

const InsightBar = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
  align-items: stretch;

  .segment {
    min-height: 70px;
    border-radius: 14px;
    padding: 0.75rem 0.85rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.2rem;
    color: #111111;
    border: 1px solid rgba(17, 17, 17, 0.12);
    background: rgba(17, 17, 17, 0.04);
    overflow: hidden;
  }

  .segment strong {
    font-size: 1rem;
    line-height: 1.2;
  }

  .segment span {
    font-size: 0.72rem;
    color: #6c6c72;
    line-height: 1.2;
    white-space: normal;
    word-break: keep-all;
  }

  .segment.primary {
    background: rgba(17, 17, 17, 0.12);
  }
  .segment.secondary {
    background: rgba(17, 17, 17, 0.08);
  }
  .segment.tertiary {
    background: rgba(17, 17, 17, 0.04);
  }
`;

const InsightFootnote = styled.span`
  font-size: 0.72rem;
  color: #a1a1aa;
`;

const InsightList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  li {
    display: flex;
    justify-content: space-between;
    font-size: 0.82rem;
    color: #52525b;

    strong {
      font-weight: 600;
      color: #0f0f11;
    }
  }
`;

const MenuGrid = styled.div`
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const MenuCard = styled(Link)<{
  $status: "ok" | "warning" | "muted";
  $isError: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.6rem;
  border-radius: 20px;
  text-decoration: none;
  color: inherit;
  background: #ffffff;
  border: 1px solid #e4e4e7;
  box-shadow: 0 20px 42px rgba(15, 15, 23, 0.05);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;

  ${({ $status, $isError }) =>
    !$isError &&
    ($status === "ok"
      ? css`
          border-color: rgba(17, 17, 17, 0.12);
        `
      : $status === "warning"
        ? css`
            border-color: rgba(17, 17, 17, 0.25);
          `
        : css`
            border-color: #e4e4e7;
          `)}

  ${({ $isError }) =>
    $isError &&
    css`
      border-color: rgba(239, 68, 68, 0.65);
    `}

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 28px 52px rgba(15, 15, 23, 0.08);
    border-color: rgba(17, 17, 17, 0.28);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.02rem;
  font-weight: 600;
  color: #111111;
`;

const CardValue = styled.div`
  margin-top: 1.4rem;
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f0f11;
  letter-spacing: -0.01em;
`;

const CardLabel = styled.div`
  margin-top: 0.45rem;
  font-size: 0.82rem;
  color: #52525b;
`;

const CardSecondary = styled.p`
  margin: 1.2rem 0 0;
  font-size: 0.78rem;
  line-height: 1.5;
  color: #6c6c72;
`;

const CardFooter = styled.div`
  margin-top: auto;
  padding-top: 1.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #0f0f11;
`;

const StatusChip = styled.span<{
  $tone: "accent" | "warning" | "danger" | "muted";
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.28rem 0.8rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  ${({ $tone }) => {
    switch ($tone) {
      case "accent":
        return css`
          background: rgba(17, 17, 17, 0.08);
          color: #0f0f11;
          border: 1px solid rgba(17, 17, 17, 0.18);
        `;
      case "warning":
        return css`
          background: rgba(250, 204, 21, 0.18);
          color: #854d0e;
          border: 1px solid rgba(250, 204, 21, 0.45);
        `;
      case "danger":
        return css`
          background: rgba(248, 113, 113, 0.18);
          color: #991b1b;
          border: 1px solid rgba(248, 113, 113, 0.42);
        `;
      case "muted":
      default:
        return css`
          background: rgba(152, 152, 162, 0.18);
          color: #63636a;
          border: 1px solid rgba(152, 152, 162, 0.28);
        `;
    }
  }}
`;

const PodSection = styled.section`
  margin-top: 2.4rem;
  padding: 1.6rem;
  background: #ffffff;
  border: 1px solid #e4e4e7;
  border-radius: 18px;
  box-shadow: 0 20px 42px rgba(15, 15, 23, 0.05);
`;

const PodTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 600;
  color: #0f0f11;
  margin-bottom: 1.2rem;
`;

const PodList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.6rem;
`;

const PodItem = styled.li`
  position: relative;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid #e4e4e7;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PodName = styled.span`
  font-size: 0.85rem;
  color: #111111;
  word-break: break-all;
`;

const PodStatus = styled.span<{ $phase: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  ${({ $phase }) =>
    $phase === "Running"
      ? css`
          background-color: #16a34a; /* 초록불 */
          box-shadow: 0 0 6px #16a34a66;
        `
      : css`
          background-color: #dc2626; /* 빨강불 */
          box-shadow: 0 0 6px #dc262666;
        `}
`;

export {
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
  PodStatus
};



