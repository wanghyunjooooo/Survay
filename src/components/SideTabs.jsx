// SideTabs.js
import React, { useState } from "react";
import { Tab, Nav, Card, Form } from "react-bootstrap";

const SideTabs = ({ pages }) => {
    const [activeTab, setActiveTab] = useState("toc");

    // =========================
    // 탭 내용
    // =========================
    const TocTab = () => (
        <Card className="p-2 mb-3 mt-3">
            <h6>페이지 목록</h6>
            {pages.length ? (
                pages.map((p, idx) => (
                    <div key={p.id}>
                        {idx + 1}. {p.title}
                    </div>
                ))
            ) : (
                <div>페이지가 없습니다.</div>
            )}
        </Card>
    );

    const BgColorTab = () => (
        <Card className="p-2 mb-3 mt-3">
            <h6>배경 컬러</h6>
            <Form.Control type="color" defaultValue="#ffffff" />
        </Card>
    );

    const SettingsTab = () => (
        <>
            <Card className="p-2 mb-3 mt-3">
                <h6>머릿글</h6>
                <Form.Group className="mb-2">
                    <Form.Label>설문 커버 이미지</Form.Label>
                    <Form.Control type="file" />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>설문 참여 설정</Form.Label>
                    <Form.Check type="checkbox" label="참여 허용" />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Label>참여자 권한 설정</Form.Label>
                    <Form.Control type="text" placeholder="권한 입력" />
                </Form.Group>
            </Card>

            <Card className="p-2 mb-3 mt-3">
                <h6>항목</h6>
                <Form.Group className="mb-2">
                    <Form.Label>최대 참여 수 설정</Form.Label>
                    <Form.Control type="number" placeholder="숫자 입력" />
                </Form.Group>
                <Form.Group className="mb-2">
                    <Form.Check type="checkbox" label="설문 결과 공개" />
                </Form.Group>
            </Card>
        </>
    );

    // =========================
    // 렌더링
    // =========================
    return (
        <Tab.Container activeKey={activeTab}>
            {/* 가로 탭 */}
            <Nav variant="tabs" className="mb-3 mt-3">
                <Nav.Item>
                    <Nav.Link
                        eventKey="toc"
                        onClick={() => setActiveTab("toc")}
                    >
                        목차
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="bg" onClick={() => setActiveTab("bg")}>
                        배경 컬러
                    </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link
                        eventKey="settings"
                        onClick={() => setActiveTab("settings")}
                    >
                        설문 설정
                    </Nav.Link>
                </Nav.Item>
            </Nav>

            {/* 탭 내용 */}
            <Tab.Content className="mt-3">
                <Tab.Pane eventKey="toc">
                    <TocTab />
                </Tab.Pane>
                <Tab.Pane eventKey="bg">
                    <BgColorTab />
                </Tab.Pane>
                <Tab.Pane eventKey="settings">
                    <SettingsTab />
                </Tab.Pane>
            </Tab.Content>
        </Tab.Container>
    );
};

export default SideTabs;
