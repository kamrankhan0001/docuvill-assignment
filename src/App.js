
import React, { useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";
import { useFormik } from "formik";
import * as Yup from "yup";

const App = () => {
  const [image, setImage] = useState(null);
  const [extractedData, setExtractedData] = useState({ name: "", documentNumber: "", expirationDate: "" });
  const [loading, setLoading] = useState(false);
  
  const webcamRef = React.useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    extractTextFromImage(imageSrc);
  };

  const extractTextFromImage = async (imageSrc) => {
    setLoading(true);
    try {
      const result = await Tesseract.recognize(imageSrc, "eng");
      const text = result.data.text;
      parseExtractedText(text);
    } catch (error) {
      console.error("Error extracting text:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseExtractedText = (text) => {
    const name = text.match(/Name:\s*(\w+\s\w+)/i)?.[1] || "";
    const documentNumber = text.match(/Document Number:\s*(\w+)/i)?.[1] || "";
    const expirationDate = text.match(/Expiration Date:\s*(\d{2}\/\d{2}\/\d{4})/i)?.[1] || "";

    setExtractedData({ name, documentNumber, expirationDate });
  };

  const formik = useFormik({
    initialValues: {
      name: extractedData.name,
      documentNumber: extractedData.documentNumber,
      expirationDate: extractedData.expirationDate,
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      documentNumber: Yup.string().required("Document number is required"),
      expirationDate: Yup.date().required("Expiration date is required"),
    }),
    onSubmit: (values) => {
      console.log("Submitted data:", values);
    },
  });

  return (
    <div className="App">
      <h1>Document Capture Prototype</h1>
      
      <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
      <button onClick={capture}>Capture Document</button>

      {loading && <p>Processing image...</p>}

      {extractedData.name && (
        <form onSubmit={formik.handleSubmit}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.name && formik.errors.name && <p>{formik.errors.name}</p>}
          </div>
          <div>
            <label>Document Number:</label>
            <input
              type="text"
              name="documentNumber"
              value={formik.values.documentNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.documentNumber && formik.errors.documentNumber && <p>{formik.errors.documentNumber}</p>}
          </div>
          <div>
            <label>Expiration Date:</label>
            <input
              type="text"
              name="expirationDate"
              value={formik.values.expirationDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.expirationDate && formik.errors.expirationDate && <p>{formik.errors.expirationDate}</p>}
          </div>
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default App;
