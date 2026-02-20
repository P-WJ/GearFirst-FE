import React, { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import styled from "styled-components";
import { connectSSE, markAsRead } from "../NotificationApi";
import type { NotificationItem } from "../NotificationTypes";

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const BellButton = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: #ffffff;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background: #f1f1f1;
  }
`;

const Badge = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 9px;
  height: 9px;
  background: #e53935;
  border-radius: 50%;
  border: 2px solid white;
`;

const Dropdown = styled.div`
  position: absolute;
  right: 0;
  top: 48px;
  width: 340px;
  max-height: 420px;
  overflow-y: auto;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  animation: fadeIn 0.2s ease-in-out;
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 스크롤 부드럽게 */
  -webkit-overflow-scrolling: touch;
`;

const NotificationItemBox = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  background: #fff;
  transition: background 0.2s ease;

  &:hover {
    background: #f9fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Title = styled.div`
  font-size: 0.92rem;
  font-weight: 700;
  color: #222;
  margin-bottom: 4px;
`;

const Message = styled.div`
  font-size: 0.83rem;
  color: #6b7280;
  line-height: 1.3;
`;

export const NotificationList: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [connected, setConnected] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null); // SSE 유지용 ref
  const isMock = Boolean(import.meta.env && import.meta.env.DEV);

  // SSE 최초 연결
  useEffect(() => {
    if (isMock) {
      setConnected(true);
      setNotifications([
        {
          id: 101,
          message: "입고 예정 3건이 등록되었습니다.",
          type: "inbound",
          eventId: "INBOUND-20260105-001",
          receiver: "본사",
          read: false,
        },
        {
          id: 102,
          message: "출고 지연 1건이 발생했습니다.",
          type: "outbound",
          eventId: "OUTBOUND-20260105-002",
          receiver: "본사",
          read: false,
        },
        {
          id: 103,
          message: "재고 안전수량 미달 품목이 감지되었습니다.",
          type: "stock",
          eventId: "STOCK-ALERT-003",
          receiver: "본사",
          read: false,
        },
      ]);
      return;
    }

    if (eventSourceRef.current) return; // 이미 연결되어 있으면 스킵

    const receiver = "본사";
    // console.log("SSE 연결 시작");

    const es = connectSSE(
      receiver,
      (data) => {
        // console.log("새 알림 수신:", data);

        if (typeof data === "string") {
          // console.warn("문자열 데이터 수신:", data);
          return;
        }
        // 새 알림 객체 생성
        const newItem: NotificationItem = {
          id: data.id ?? Date.now(),
          message: data.message ?? "(메시지 없음)",
          type: data.type ?? "notice",
          eventId: data.eventId ?? "",
          receiver: receiver,
          read: false,
        };
        // 누적 (최신이 위로)
        setNotifications((prev) => [newItem, ...prev]);
      },
      (err) => {
        console.error("SSE 오류:", err);
        setConnected(false);
      },
    );

    es.onopen = () => {
      // console.log("[SSE] 연결 성공");
      setConnected(true);
    };

    eventSourceRef.current = es;
    // cleanup 시 연결 닫기
    return () => {
      // console.log("SSE 연결 해제");
      es.close();
      eventSourceRef.current = null;
    };
  }, []);

  // 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = async (id: number) => {
    try {
      await markAsRead(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("읽음 처리 실패:", err);
    }
  };

  return (
    <Wrapper ref={dropdownRef}>
      <BellButton onClick={() => setIsOpen((prev) => !prev)} aria-label="알림">
        <Bell size={24} className="text-white" />
      </BellButton>
      {notifications.some((n) => !n.read) && <Badge />}

      {isOpen && (
        <Dropdown>
          {connected ? (
            notifications.length > 0 ? (
              notifications.map((n) => (
                <NotificationItemBox
                  key={n.id}
                  onClick={() => handleItemClick(n.id)}
                >
                  <Title>{n.type}</Title>
                  <Message>{n.message}</Message>
                </NotificationItemBox>
              ))
            ) : (
              <div style={{ textAlign: "center", color: "#888", padding: 12 }}>
                아직 알림이 없습니다.
              </div>
            )
          ) : (
            <div style={{ textAlign: "center", color: "#777", padding: 12 }}>
              서버와 연결 중...
            </div>
          )}
        </Dropdown>
      )}
    </Wrapper>
  );
};
