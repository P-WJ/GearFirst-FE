import { Table, Th, Td } from "../../components/common/PageLayout";
import type { PendingOrderItem } from "../RequestTypes";
import { fmtDate } from "../../utils/string";

export default function OrderTable({
  rows,
  onRowClick,
}: {
  rows: PendingOrderItem[];
  onRowClick: (row: PendingOrderItem) => void;
}) {
  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>발주 번호</Th>
            <Th>발주처</Th>
            <Th>담당자</Th>
            <Th>요청 일시</Th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <Td colSpan={4} style={{ textAlign: "center", color: "#9ca3af" }}>
                데이터가 없습니다.
              </Td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.orderId}
                style={{ cursor: "pointer" }}
                onClick={() => onRowClick(row)}
              >
                <Td>{row.orderNumber}</Td>
                <Td>{row.branchCode}</Td>
                <Td>{row.engineerName}</Td>
                <Td>{fmtDate(row.requestDate)}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </>
  );
}

