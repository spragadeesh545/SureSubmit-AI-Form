import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:8080/api/forms')
            .then((response) => response.json())
            .then((data) => {
                setForms(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching forms:", error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your forms...</div>;
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem', color: '#333' }}>My Form Dashboard</h1>
            
            {forms.length === 0 ? (
                <p>You haven't created any forms yet!</p>
            ) : (
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                    gap: '1.5rem' 
                }}>
                    {forms.map((form) => (
                        <div key={form.id} style={{ 
                            border: '1px solid #ddd', 
                            padding: '1.5rem', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                            backgroundColor: '#fff'
                        }}>
                            <h2 style={{ marginTop: 0, fontSize: '1.25rem', color: '#2c3e50' }}>
                                {form.title || `Untitled Form #${form.id}`}
                            </h2>
                            <span style={{ 
                                display: 'inline-block',
                                padding: '4px 8px', 
                                backgroundColor: '#e8f5e9', 
                                color: '#2e7d32', 
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                marginBottom: '1rem'
                            }}>
                                {form.status}
                            </span>
                            
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#555' }}>Fields Included:</h4>
                            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#666', fontSize: '0.9rem' }}>
                                {form.fields.map((field, index) => (
                                    <li key={index}>{field}</li>
                                ))}
                            </ul>

                            <button 
                                onClick={() => navigate(`/form/${form.id}`)}
                                style={{ 
                                    marginTop: '1.5rem', 
                                    width: '100%', 
                                    padding: '0.75rem',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}>
                                Open Form
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;