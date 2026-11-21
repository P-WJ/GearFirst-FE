import styled, { css } from "styled-components";
import { Table } from "./PageLayout";

export const TableScroll = styled.div<{ $maxHeight?: number | string }>`
  max-height: ${({ $maxHeight = 160 }) =>
    typeof $maxHeight === "number" ? `${$maxHeight}px` : $maxHeight};
  overflow: auto;
  border: 1px solid #edf1f5;
  border-bottom: none;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 8px;
  }
`;

export const StickyTable = styled(Table)<{
  $stickyTop?: number;
  $headerBg?: string;
  $zebra?: boolean;
  $colWidths?: string[];
  $rowHeight?: number | string;
  $compact?: boolean;
  $verticalLines?: boolean;
  $sticky?: boolean;
}>`
  table-layout: fixed;
  width: 100%;
  border-collapse: collapse;

  thead th {
    position: sticky;
    top: ${({ $stickyTop = 0 }) => `${$stickyTop}px`};
    z-index: 1;
    background: ${({ $headerBg = "#fafbfc" }) => $headerBg};
  }

  ${({ $zebra = true }) =>
    $zebra &&
    css`
      tbody tr:nth-child(even) td {
        background: #fcfdff;
      }
    `}

  th, td {
    border-bottom: 1px solid #f0f0f0;
  }

  ${({ $verticalLines = true }) =>
    $verticalLines
      ? css`
          th,
          td {
            border-right: 1px solid #e5e7eb;
          }
          th:last-child,
          td:last-child {
            border-right: none;
          }
        `
      : css`
          th,
          td {
          }
        `}

  ${({ $colWidths }) =>
    $colWidths &&
    $colWidths
      .map(
        (width, i) => css`
          th:nth-child(${i + 1}),
          td:nth-child(${i + 1}) {
            width: ${width};
          }
        `
      )
      .reduce(
        (acc, cur) =>
          css`
            ${acc}${cur}
          `
      )}

  ${({ $rowHeight }) =>
    $rowHeight &&
    css`
      th,
      td {
        height: ${typeof $rowHeight === "number"
          ? `${$rowHeight}px`
          : $rowHeight};
        line-height: 1.4;
      }
    `}

  ${({ $compact }) =>
    $compact &&
    css`
      th,
      td {
        padding: 0.4rem 0;
        font-size: 0.8rem;
        line-height: 1.4;
        height: auto;
      }
      th {
        font-weight: 600;
      }
    `}
`;

export const ScrollStickyTable = styled(StickyTable)``;
