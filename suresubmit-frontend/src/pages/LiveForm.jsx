import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const LiveForm = () => {
    const { id } = useParams(); 
    const [form, setForm] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:8080/api/forms/${id}`)
            .then(response => response.json())
            .then(data => {
                setForm(data);
                setLoading(false);
            })
            .catch(error => console.error("Error fetching form:", error));
    }, [id]);

    if (loading) return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading form...</div>;
    if (!form) return <div style={{ textAlign: 'center', padding: '3rem' }}>Form not found!</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ border: '1px solid #ddd', padding: '2rem', borderRadius: '8px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <h1 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#0f172a' }}>
                    {form.title || `Form #${form.id}`}
                </h1>
                
                <form onSubmit={(e) => { 
                    e.preventDefault(); 
                    alert("Form works! Database submission coming next!"); 
                }}>
                    {form.fields.map((field, index) => (
                        <div key={index} style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#475569' }}>
                                {field}
                            </label>
                            <input 
                                type="text" 
                                placeholder={`Enter ${field.toLowerCase()}`}
                                required
                                style={{ 
                                    width: '100%', 
                                    padding: '0.75rem', 
                                    borderRadius: '6px', 
                                    border: '1px solid #cbd5e1',
                                    fontSize: '1rem',
                                    boxSizing: 'border-box'
                                }} 
                            />
                        </div>
                    ))}
                    <button type="submit" style={{ 
                        width: '100%', 
                        padding: '1rem', 
                        backgroundColor: '#10b981', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '6px', 
                        fontSize: '1.1rem', 
                        cursor: 'pointer', 
                        fontWeight: 'bold' 
                    }}>
                        Submit Responses
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LiveForm;