import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
// Import images for FDM, Resin, Laser if you have them
import fdmImage from '../assets/images/fdm.jpg'; 
 import resinImage from '../assets/images/resin.jpg';
import laserImage from '../assets/images/laser.jpg';

const ProfileSelectionPage = () => {
    const navigate = useNavigate();
    const { selectProfile } = useApp();

    const profiles = [
        { name: 'FDM', image: fdmImage, enabled: true, path: '/dashboard' },
        { name: 'Resin', image: resinImage, enabled: false, path: '#' },
        { name: 'Laser', image: laserImage, enabled: false, path: '#' },
    ];

    const handleProfileSelect = (profile) => {
        if (profile.enabled) {
            selectProfile(profile.name);
            navigate(profile.path);
        }
    };

    return (
        <Container className="mt-5">
            <h2 className="text-center mb-4">Select Printing Profile</h2>
            <Row className="justify-content-center">
                {profiles.map((profile) => (
                    <Col key={profile.name} md={4} className="mb-3">
                        <Card className={`text-center ${!profile.enabled ? 'bg-light' : 'profile-card'}`}>
                            <Card.Img 
                                variant="top" 
                                src={profile.image} 
                                alt={profile.name} 
                                style={{ 
                                    height: '250px', 
                                    objectFit: 'cover', 
                                    filter: !profile.enabled ? 'grayscale(100%)' : 'none',
                                    cursor: profile.enabled ? 'pointer' : 'not-allowed'
                                }}
                                onClick={() => handleProfileSelect(profile)}
                            />
                            <Card.Body>
                                <Card.Title>{profile.name}</Card.Title>
                                <Button
                                    variant={profile.enabled ? "primary" : "secondary"}
                                    onClick={() => handleProfileSelect(profile)}
                                    disabled={!profile.enabled}
                                    className="w-100"
                                >
                                    {profile.enabled ? 'Select' : 'Coming Soon'}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
            <style jsx global>{`
                .profile-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                }
            `}</style>
        </Container>
    );
};

export default ProfileSelectionPage;