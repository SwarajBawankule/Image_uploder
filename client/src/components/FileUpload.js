import React, { Fragment, useState } from "react";
import { Formik, Form } from "formik";

import Message from "./Message";
import Progress from "./Progress";
import axios from "axios";
import * as Yup from "yup"; // For validation

// File validation schema using Yup
const validationSchema = Yup.object().shape({
  file: Yup.mixed().required("A file is required"),
});

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("Choose File");
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState("");
  const [uploadPercentage, setUploadPercentage] = useState(0);

  // Max file size (5 MB in bytes)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  // Allowed file types (e.g., only images)
  const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

  const onFileChange = (e, setFieldValue) => {
    const selectedFile = e.target.files[0];

    // Validate file size
    if (selectedFile && selectedFile.size > MAX_FILE_SIZE) {
      setMessage("File size exceeds the 5 MB limit");
      setFile(null);
      setFilename("Choose File");
      return;
    }

    // Validate file type
    if (selectedFile && !ALLOWED_FILE_TYPES.includes(selectedFile.type)) {
      setMessage("Invalid file type. Only images are allowed.");
      setFile(null);
      setFilename("Choose File");
      return;
    }

    setFile(selectedFile);
    setFilename(selectedFile.name);
    setMessage("");
    setFieldValue("file", selectedFile); // Set file in Formik's state
  };

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (ProgressEvent) => {
          setUploadPercentage(
            parseInt(Math.round((ProgressEvent.loaded * 100) / ProgressEvent.total))
          );
          // Clear percentage after 10 seconds
          setTimeout(() => setUploadPercentage(0), 10000);
        },
      });

      const { fileName, filePath } = res.data;
      setUploadedFile({ fileName, filePath });
      setMessage("File Uploaded");

      // Clear file input after upload
      resetForm();
      setFile(null);
      setFilename("Choose File");
    } catch (err) {
      if (err.response && err.response.status === 500) {
        setMessage("There was a problem with the server");
      } else {
        setMessage(err.response ? err.response.data.msg : "File upload failed");
      }
      setUploadPercentage(0); // Reset the progress bar on error
    }
    setSubmitting(false); // Disable submit button after submission
  };

  return (
    <Fragment>
      {message && <Message msg={message} />}
      <Formik
        initialValues={{ file: null }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ setFieldValue, isSubmitting }) => (
          <Form>
            <div className="custom-file mb-4">
              <input
                type="file"
                className="custom-file-input"
                id="customFile"
                onChange={(e) => onFileChange(e, setFieldValue)}
              />
              <label className="custom-file-label" htmlFor="customFile">
                {filename}
              </label>
            </div>

            <Progress percentage={uploadPercentage} />

            <button
              type="submit"
              className="btn btn-primary btn-block mt-4"
              disabled={isSubmitting || !file} // Disable button if submitting or no file
            >
              {isSubmitting ? "Uploading..." : "Upload"}
            </button>
          </Form>
        )}
      </Formik>

      {uploadedFile.filePath ? (
        <div className="row mt-5">
          <div className="col-md-6 m-auto">
            <h3 className="text-center">{uploadedFile.fileName}</h3>
            <img style={{ width: "100%" }} src={uploadedFile.filePath} alt="Uploaded File" />
          </div>
        </div>
      ) : null}
    </Fragment>
  );
};

export default FileUpload;
