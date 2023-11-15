import React, { useState, useEffect } from 'react';
import { useSpring, animated } from "react-spring";
import './AddTestPage.css';

function AddTestPage() {
  const [test, setTest] = useState({
    Title: '',
    Description: '',
    Category: '',
    Duration: 0,
    Questions: '',
    ImageBase64: '',
  });

  const [isComponentVisible, setComponentVisible] = useState(false);

  useEffect(() => {
    setComponentVisible(true);
  }, []);

  const fadeIn = useSpring({
    opacity: isComponentVisible ? 1 : 0,
    from: { opacity: 0 },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'Duration') {
      const duration = parseInt(value, 10);
      setTest({ ...test, [name]: duration });
    } else {
      setTest({ ...test, [name]: value });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64Image = e.target.result.split(',')[1];
      setTest({ ...test, ImageBase64: base64Image });
    };

    reader.readAsDataURL(file);
    setTest({ ...test, ImageName: file.name });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const questionsArray = test.Questions.split(',').map((str) => parseInt(str.trim(), 10));
      const updatedTest = { ...test, Questions: questionsArray };

      const response = await fetch('http://localhost:8080/test/post', {
        method: 'POST',
        body: JSON.stringify(updatedTest),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Handle success
      } else {
        // Handle failure
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <animated.div style={fadeIn}>
      <form className="add-test-form" onSubmit={handleSubmit}>
        <h2 className="add-test-headline">Add a Test</h2>
        <label className="add-test-label">
          Title:
          <input type="text" name="Title" value={test.Title} onChange={handleInputChange} className="add-test-input" />
        </label>
        <label className="add-test-label">
          Description:
          <input type="text" name="Description" value={test.Description} onChange={handleInputChange} className="add-test-input" />
        </label>
        <label className="add-test-label">
          Category:
          <input type="text" name="Category" value={test.Category} onChange={handleInputChange} className="add-test-input" />
        </label>
        <label className="add-test-label">
          Duration:
          <input type="number" name="Duration" value={test.Duration} onChange={handleInputChange} className="add-test-input" />
        </label>
        <label className="add-test-label">
          Questions (comma-separated):
          <input type="text" name="Questions" value={test.Questions} onChange={handleInputChange} className="add-test-input" />
        </label>
        <label className="add-test-label">
          Image:
          <input type="file" name="ImageBase64" onChange={handleImageUpload} className="add-test-input" />
        </label>
        <button type="submit" className="add-test-button">Upload Test</button>
      </form>
      </animated.div>
  );
}

export default AddTestPage;