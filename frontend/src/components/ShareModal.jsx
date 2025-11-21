import React, { useState, useEffect } from "react";
import { Modal, Button, InputGroup, Form } from "react-bootstrap";

const ShareModal = ({ show, handleClose, onShare }) => {
    const [shareLink, setShareLink] = useState("");

    useEffect(() => {
        if (show) {
            setShareLink("");
        }
    }, [show]);

    const handleShareClick = async () => {
        if (onShare) {
            const link = await onShare([]); // 이메일 없이 링크 생성
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
                <Modal.Title>설문 공유 링크</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {shareLink ? (
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
                ) : (
                    <p>아래 버튼을 눌러 공유 링크를 생성하세요.</p>
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
