import React, { useState } from 'react';
import './AddQuestionPage.css';

function AddQuestionPage() {
  const [question, setQuestion] = useState({
    QuestionText: '',
    Points: '',
    MultipleSelect: false,
    ImageBase64: '',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    if (type === 'checkbox') {
      setQuestion({ ...question, [name]: checked });
    } else if (name === 'Points') {
      const points = parseInt(value, 10);
      setQuestion({ ...question, [name]: points });
    } else {
      setQuestion({ ...question, [name]: value });
    }
  };  

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64Image = e.target.result.split(',')[1];
      setQuestion({ ...question, ImageBase64: base64Image });
    };

    reader.readAsDataURL(file);
    setQuestion({ ...question, ImageName: file.name });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatedQuestion = { ...question};
        
      const response = await fetch('http://localhost:8080/question/post', {
        method: 'POST',
        body: JSON.stringify(updatedQuestion),
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
    <form className="add-question-form" onSubmit={handleSubmit}>
      <h2 className="add-question-headline">Add a Question</h2>
      <label className="add-question-label">
        Question Text:
        <input type="text" name="QuestionText" value={question.QuestionText} onChange={handleInputChange} className="add-question-input" />
      </label>
      <label className="add-question-label">
        Points:
        <input type="number" name="Points" value={question.Points} onChange={handleInputChange} className="add-question-input" />
      </label>
      <label className="add-question-label">
        Multiple Select:
        <input type="checkbox" name="MultipleSelect" value={question.MultipleSelect} onChange={handleInputChange} className="add-question-input" />
      </label>
      <label className="add-question-label">
        Image:
        <input type="file" name="ImageBase64" onChange={handleImageUpload} className="add-question-input" />
      </label>
      <button type="submit" className="add-question-button">Upload Question</button>
    </form>
  );
}

export default AddQuestionPage;