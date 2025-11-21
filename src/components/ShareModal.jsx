// ShareModal.jsx
import React, { useState, useEffect } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";

const ShareModal = ({ show, handleClose, onShare }) => {
    const [emails, setEmails] = useState("");
    const [shareLink, setShareLink] = useState("");

    useEffect(() => {
        if (show) {
            setEmails("");
            setShareLink("");
        }
    }, [show]);

    const handleShareClick = async () => {
        const emailArray = emails
            .split(",")
            .map((e) => e.trim())
            .filter((e) => e !== "");

        if (onShare) {
            // Home에서 createShare 호출 → 반환된 링크 받기
            const link = await onShare(emailArray);
            if (link) setShareLink(link);
        }
    };

    const handleCopy = () => {
        if (shareLink) {
            navigator.clipboard.writeText(shareLink);
            alert("클립보드에 복사되었습니다!");
        }
    };

    const handleOpenLink = () => {
        if (shareLink) {
            window.open(shareLink, "_blank");
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>설문 공유</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group className="mb-3">
                    <Form.Label>공유할 이메일 (콤마로 구분)</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="example1@test.com, example2@test.com"
                        value={emails}
                        onChange={(e) => setEmails(e.target.value)}
                    />
                </Form.Group>

                {shareLink && (
                    <InputGroup className="mb-3">
                        <Form.Control readOnly value={shareLink} />
                        <Button
                            variant="outline-secondary"
                            onClick={handleCopy}
                        >
                            복사
                        </Button>
                        <Button
                            variant="outline-primary"
                            onClick={handleOpenLink}
                        >
                            열기
                        </Button>
                    </InputGroup>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    닫기
                </Button>
                <Button variant="primary" onClick={handleShareClick}>
                    링크 생성
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ShareModal;
