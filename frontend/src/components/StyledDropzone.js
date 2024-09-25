import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const StyledDropzone = () => {
    const [file, setFile] = useState(null);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file && file.type === 'application/pdf') {
            setFile(URL.createObjectURL(file));
        } else {
            alert('Please drop a PDF file.');
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'application/pdf'
    });

    return (
            <div {...getRootProps()} style={{ border: '2px dashed #007bff', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
                <input {...getInputProps()} />
                {
                    isDragActive ?
                    <p>Drop the PDF here ...</p> :
                    <p>Drag 'n' drop a PDF here, or click to select a PDF</p>
                }
                {file && (
                    <div style={{ height: '500px', marginTop: '20px' }}>
                        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`}>
                            <Viewer fileUrl={file} plugins={[defaultLayoutPluginInstance]} />
                        </Worker>
                    </div>
                )}
            </div>
        );
};

export default StyledDropzone;
