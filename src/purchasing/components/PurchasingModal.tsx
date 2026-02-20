import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Overlay,
  ModalContainer,
  Header,
  HeaderLeft,
  Title,
  CloseButton,
  Section,
  SectionTitle,
  DetailGrid,
  DetailItem,
  Label,
  Input,
  Value,
} from "../../components/common/ModalPageLayout";
import Button from "../../components/common/Button";
import SingleDatePicker from "../../components/common/SingleDatePicker";
import MaterialSearchModal from "../../bom/components/MaterialSearchModal";
import type { MaterialItem, PurchasingRecord } from "../PurchasingTypes";

type Mode = "register" | "view" | "edit";

type FormState = Omit<PurchasingRecord, "purchasingId">;

interface PurchasingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormState) => void;
  initialData?: PurchasingRecord;
  mode: Mode;
}

const Suffix = styled.span`
  margin-left: 4px;
  color: #6b7280;
`;

const EMPTY_FORM: FormState = {
  materialCode: "",
  materialName: "",
  materialId: undefined,
  purchasingPrice: 0,
  company: "",
  surveyDate: "",
  expiryDate: "",
  requiredQuantityPerPeriod: 0,
  requiredPeriodInDays: 0,
  status: "등록",
};

export default function PurchasingModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: PurchasingModalProps) {
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setForm({
        materialId: initialData.materialId,
        materialCode: initialData.materialCode,
        materialName: initialData.materialName,
        purchasingDate: initialData.purchasingDate,
        company: initialData.company,
        purchasingPrice: initialData.purchasingPrice,
        surveyDate: initialData.surveyDate,
        expiryDate: initialData.expiryDate,
        status: initialData.status,
        requiredQuantityPerPeriod: initialData.requiredQuantityPerPeriod,
        requiredPeriodInDays: initialData.requiredPeriodInDays,
        orderCnt: initialData.orderCnt,
        createdAt: initialData.createdAt,
      });
      return;
    }
    setForm(EMPTY_FORM);
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const readOnly = mode === "view";

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    const numericKeys = [
      "purchasingPrice",
      "requiredQuantityPerPeriod",
      "requiredPeriodInDays",
    ] as const;

    if (numericKeys.includes(name as (typeof numericKeys)[number])) {
      update(name as keyof FormState, Number(value) as FormState[keyof FormState]);
      return;
    }

    update(name as keyof FormState, value as FormState[keyof FormState]);
  };

  const handleSelectMaterial = (selected: MaterialItem) => {
    setForm((prev) => ({
      ...prev,
      materialId: selected.id,
      materialCode: selected.materialCode,
      materialName: selected.materialName,
    }));
  };

  const handleSubmit = () => {
    const requiredFields = [
      form.materialCode,
      form.materialName,
      form.company,
      form.surveyDate,
      form.expiryDate,
      form.purchasingPrice,
      form.requiredQuantityPerPeriod,
      form.requiredPeriodInDays,
    ];

    if (requiredFields.some((value) => value === "" || value === 0)) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    onSubmit(form);
    onClose();
  };

  return (
    <Overlay>
      <ModalContainer>
        <Header>
          <HeaderLeft>
            <Title>
              구매 요청 {mode === "register" ? "등록" : mode === "edit" ? "수정" : "상세"}
            </Title>
          </HeaderLeft>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        <Section>
          <SectionTitle>자재 정보</SectionTitle>
          <DetailGrid $cols={3}>
            <DetailItem>
              <Label>자재명</Label>
              {readOnly ? <Value>{form.materialName || "-"}</Value> : <Input value={form.materialName} readOnly />}
            </DetailItem>
            <DetailItem>
              <Label>자재 코드</Label>
              {readOnly ? <Value>{form.materialCode || "-"}</Value> : <Input value={form.materialCode || ""} readOnly />}
            </DetailItem>
            <DetailItem style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
              {!readOnly && (
                <Button color="black" size="sm" onClick={() => setSearchModalOpen(true)}>
                  자재 검색
                </Button>
              )}
            </DetailItem>
          </DetailGrid>
        </Section>

        <Section>
          <SectionTitle>구매 정보</SectionTitle>
          <DetailGrid $cols={3}>
            <DetailItem>
              <Label>단가</Label>
              {readOnly ? (
                <Value>{form.purchasingPrice.toLocaleString()} 원</Value>
              ) : (
                <Input type="number" name="purchasingPrice" value={form.purchasingPrice} onChange={handleChange} />
              )}
            </DetailItem>
            <DetailItem>
              <Label>공급업체</Label>
              {readOnly ? (
                <Value>{form.company}</Value>
              ) : (
                <Input type="text" name="company" value={form.company} onChange={handleChange} />
              )}
            </DetailItem>
            <DetailItem />
            <DetailItem>
              <Label>필요 수량</Label>
              {readOnly ? (
                <Value>{form.requiredQuantityPerPeriod}</Value>
              ) : (
                <Input
                  type="number"
                  name="requiredQuantityPerPeriod"
                  value={form.requiredQuantityPerPeriod}
                  onChange={handleChange}
                />
              )}
            </DetailItem>
            <DetailItem>
              <Label>필요 기간(일)</Label>
              {readOnly ? (
                <Value>{form.requiredPeriodInDays}</Value>
              ) : (
                <Input
                  type="number"
                  name="requiredPeriodInDays"
                  value={form.requiredPeriodInDays}
                  onChange={handleChange}
                />
              )}
            </DetailItem>
            {mode === "view" && (
              <DetailItem>
                <Label>1일 기준 필요량</Label>
                <Value>
                  {Math.ceil(form.requiredQuantityPerPeriod / Math.max(1, form.requiredPeriodInDays))}
                  <Suffix>/1일</Suffix>
                </Value>
              </DetailItem>
            )}
          </DetailGrid>
        </Section>

        <Section style={{ paddingBottom: "20px" }}>
          <SectionTitle>일정 정보</SectionTitle>
          <DetailGrid $cols={3}>
            <DetailItem>
              <Label>조사일</Label>
              {readOnly ? (
                <Value>{form.surveyDate || "-"}</Value>
              ) : (
                <SingleDatePicker
                  value={form.surveyDate}
                  onChange={(value) => update("surveyDate", value)}
                  placeholder="조사일"
                />
              )}
            </DetailItem>
            <DetailItem>
              <Label>유효기간</Label>
              {readOnly ? (
                <Value>{form.expiryDate || "-"}</Value>
              ) : (
                <SingleDatePicker
                  value={form.expiryDate}
                  onChange={(value) => update("expiryDate", value)}
                  placeholder="유효기간"
                  min={form.surveyDate}
                />
              )}
            </DetailItem>
          </DetailGrid>
        </Section>

        <Section style={{ textAlign: "center" }}>
          {mode !== "view" && (
            <Button color="black" onClick={handleSubmit}>
              {mode === "edit" ? "수정" : "등록"}
            </Button>
          )}
        </Section>

        <MaterialSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          onSelect={(material) => {
            handleSelectMaterial(material);
            setSearchModalOpen(false);
          }}
        />
      </ModalContainer>
    </Overlay>
  );
}

