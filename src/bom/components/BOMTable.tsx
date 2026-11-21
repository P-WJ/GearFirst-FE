import { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Table, Td, Th } from "../../components/common/PageLayout";
import BOMDetailModal from "./BOMDetailModal";

import {
  type BOMRecord,
  type DeleteBOMMaterialsDTO,
} from "../BOMTypes";
import { bomKeys, deleteBOMMaterials } from "../BOMApi";

export default function BOMTable({ rows }: { rows: BOMRecord[] }) {
  const safeRows: BOMRecord[] = Array.isArray(rows) ? rows : [];

  const [selectedRecord, setSelectedRecord] = useState<BOMRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const openDetail = (rec: BOMRecord) => {
    setSelectedRecord(rec);
    setIsModalOpen(true);
  };

  const closeDetail = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedRecord(null), 0);
  };

  const deleteMut = useMutation<{ ok: boolean }, Error, DeleteBOMMaterialsDTO>({
    mutationFn: deleteBOMMaterials,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: bomKeys.records,
        exact: false,
      });
      if (selectedRecord?.bomCodeId != null) {
        await queryClient.invalidateQueries({
          queryKey: bomKeys.materials(String(selectedRecord.bomCodeId)),
        });
      }
    },
    onError: (e) => alert(e.message ?? "자재 삭제 중 오류가 발생했습니다."),
  });

  const handleDelete = async (dto: DeleteBOMMaterialsDTO) => {
    if (!Number.isFinite(Number(dto.partId))) {
      alert("부품이 선택되지 않았습니다.");
      return;
    }
    if (!Array.isArray(dto.materialIds) || dto.materialIds.length === 0) {
      alert("삭제할 자재를 선택하세요.");
      return;
    }
    await deleteMut.mutateAsync(dto);
    closeDetail();
  };

  return (
    <>
      <Table>
        <thead>
          <tr>
            <Th>BOM 번호</Th>
            <Th>BOM 코드</Th>
            <Th>카테고리</Th>
            <Th>부품 번호</Th>
            <Th>부품코드</Th>
            <Th>부품명</Th>
            <Th>작성일자</Th>
          </tr>
        </thead>
        <tbody>
          {safeRows.length === 0 ? (
            <tr>
              <Td colSpan={7} style={{ textAlign: "center", color: "#9ca3af" }}>
                데이터가 없습니다.
              </Td>
            </tr>
          ) : (
            safeRows.map((r) => (
              <tr
                key={r.bomCodeId}
                style={{ cursor: "pointer" }}
                onClick={() => openDetail(r)}
              >
                <Td>{r.bomCodeId}</Td>
                <Td>{r.bomCode}</Td>
                <Td>{r.category}</Td>
                <Td>{r.partId}</Td>
                <Td>{r.partCode}</Td>
                <Td>{r.partName}</Td>
                <Td>{r.createdDate}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <BOMDetailModal
        record={selectedRecord}
        isOpen={isModalOpen}
        onClose={closeDetail}
        onDelete={handleDelete}
      />

    </>
  );
}
