import React, { useState } from "react";
import { Navbar, Nav, Container, Form, FormControl } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
import { Search } from "lucide-react";

function NavBar({ activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [query, setQuery] = useState("");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleSearch = () => {
        if (!query) return;
        navigate(`/search-results?query=${encodeURIComponent(query)}`);
        setQuery("");
    };

    return (
        <Navbar
            bg="light"
            expand="lg"
            className="shadow-sm mb-4 fixed-top"
            style={{
                backgroundColor: "#ffffff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
        >
            <Container>
                <Navbar.Brand
                    style={{
                        color: "#0047F9",
                        fontWeight: "700",
                        cursor: "pointer",
                    }}
                    onClick={() => navigate("/home")}
                >
                    SurveyApp
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link
                            active={activeTab === "my"}
                            onClick={() => setActiveTab("my")}
                        >
                            내 설문
                        </Nav.Link>
                        <Nav.Link
                            active={activeTab === "joined"}
                            onClick={() => setActiveTab("joined")}
                        >
                            참여한 설문
                        </Nav.Link>
                    </Nav>

                    {/* 검색창 */}
                    <Form
                        className="d-flex me-3 align-items-center"
                        onSubmit={(e) => e.preventDefault()}
                        style={{ width: "400px" }}
                    >
                        <FormControl
                            type="search"
                            placeholder="설문 검색"
                            className="me-2 flex-grow-1"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <Search
                            size={22}
                            color="#0047F9"
                            style={{ cursor: "pointer" }}
                            onClick={handleSearch}
                        />
                    </Form>

                    <Nav>
                        {user && (
                            <>
                                <Navbar.Text className="me-3">
                                    안녕하세요, {user.name}님
                                </Navbar.Text>
                                <Nav.Link
                                    onClick={handleLogout}
                                    className="text-danger"
                                >
                                    로그아웃
                                </Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavBar;
