// frontend/src/components/dashboard/DashboardSummary.js
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, ListGroup, Spinner, Alert } from 'react-bootstrap';
// import projectService from '../../services/projectService'; // Example for fetching recent projects
// import { Link } from 'react-router-dom';
// import { formatDate } from '../../utils/helpers';

// Example: Charting library (you'd need to install it: npm install chart.js react-chartjs-2)
// import { Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const DashboardSummary = () => {
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(false); // Set to true if fetching data
  const [error, setError] = useState('');

  // Example: Fetch recent projects
  /*
  useEffect(() => {
    const fetchRecent = async () => {
      setLoading(true);
      try {
        // You might need a specific endpoint for "recent" or sort/slice all projects
        const allProjects = await projectService.getAllProjects();
        setRecentProjects(allProjects.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)); // Get latest 5
      } catch (err) {
        setError('Could not load recent projects.');
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);
  */

  // Example Chart Data (Replace with actual data)
  const projectStatusData = {
    labels: ['Ongoing', 'Completed', 'Failed/Cancelled'],
    datasets: [
      {
        label: 'Project Statuses',
        data: [5, 12, 2], // Replace with actual counts from your stats
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)', // Blue
          'rgba(75, 192, 192, 0.6)', // Green
          'rgba(255, 99, 132, 0.6)',  // Red
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Project Overview by Status' },
    },
  };


  if (loading) return <div className="text-center p-3"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Row className="mt-4">
      <Col md={6} className="mb-3">
        <Card>
          <Card.Header as="h5">Recent Activity / Projects</Card.Header>
          <Card.Body>
            {recentProjects.length > 0 ? (
              <ListGroup variant="flush">
                {recentProjects.map(project => (
                  <ListGroup.Item key={project._id} /*as={Link} to={`/tracking/project/${project._id}`} action*/>
                    {project.projectName} - <span className="text-muted small">{/*formatDate(project.createdAt)*/} (Status: {project.status})</span>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p>No recent projects to display. (Data fetching example commented out)</p>
            )}
            <p className="mt-3">This area can show lists of active jobs, recent completions, or alerts.</p>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6} className="mb-3">
        <Card>
          <Card.Header as="h5">Project Status Overview</Card.Header>
          <Card.Body>
            {/* <Bar options={chartOptions} data={projectStatusData} /> */}
            <p className="text-center mt-3">
                Chart placeholder. Install a charting library (e.g., Chart.js with react-chartjs-2)
                and uncomment the chart code to display visualizations.
            </p>
          </Card.Body>
        </Card>
      </Col>
      {/* Add more summary cards or charts as needed */}
    </Row>
  );
};

export default DashboardSummary;