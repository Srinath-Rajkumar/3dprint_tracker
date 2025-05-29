import React, { useContext } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';

const NavbarComponent = () => {
    const { userInfo, logout } = useContext(AuthContext);
    const { selectedProfile, clearProfile } = useApp();
    const navigate = useNavigate();

    const logoutHandler = () => {
        logout();
        clearProfile();
        navigate('/login');
    };

    const switchProfileHandler = () => {
        clearProfile();
        navigate('/profile-select');
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
            <Container fluid>
                <LinkContainer to={userInfo && selectedProfile ? '/dashboard' : (userInfo ? '/profile-select' : '/login') }>
                    <Navbar.Brand>3D Print Tracker {selectedProfile && `(${selectedProfile})`}</Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {userInfo && selectedProfile && (
                            <>
                                <LinkContainer to="/dashboard"><Nav.Link>Dashboard</Nav.Link></LinkContainer>
                                <LinkContainer to="/printers"><Nav.Link>Printers</Nav.Link></LinkContainer>
                                <LinkContainer to="/projects"><Nav.Link>All Projects</Nav.Link></LinkContainer>
                                {/* Tracking sheet link might be context-dependent or from a project page */}
                            </>
                        )}
                        
                        {userInfo && (
                            <NavDropdown title={userInfo.name} id="username"align="end">
                                <LinkContainer to="/my-profile">
                                    <NavDropdown.Item>Profile</NavDropdown.Item>
                                </LinkContainer>
                                {selectedProfile && (
                                    <NavDropdown.Item onClick={switchProfileHandler}>Switch Profile</NavDropdown.Item>
                                )}
                                {userInfo.role === 'admin' && (
                                    <>
                                        <NavDropdown.Divider />
                                        <LinkContainer to="/admin/users">
                                            <NavDropdown.Item>Manage Users</NavDropdown.Item>
                                        </LinkContainer>
                                        <LinkContainer to="/admin/costs">
                                            <NavDropdown.Item>Cost Settings</NavDropdown.Item>
                                        </LinkContainer>
                                    </>
                                )}
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
                            </NavDropdown>
                        )}
                        {!userInfo && (
                            <LinkContainer to="/login"><Nav.Link><i className="fas fa-user"></i> Sign In</Nav.Link></LinkContainer>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;