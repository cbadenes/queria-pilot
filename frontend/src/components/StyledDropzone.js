import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const StyledDropzone = ({ setFile }) => {
    const [file, setLocalFile] = useState(null);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file && file.type === 'application/pdf') {
            const fileUrl = URL.createObjectURL(file);
            setLocalFile(fileUrl);
            //setFile(fileUrl);
            setFile(acceptedFiles[0]);
        } else {
            alert('Please drop a PDF file.');
        }
    };

    const discardFile = () => {
        setLocalFile(null);
        setFile(null); // Informar al componente padre que el archivo ha sido descartado
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'application/pdf',
        noClick: file !== null,
        noKeyboard: file !== null
    });

    return (
        <div {...getRootProps()}>
            <input {...getInputProps()} />
            {!file && (
                <div style={{ border: '2px dashed #007bff', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
                    {isDragActive ?
                        <p>Drop the PDF here ...</p> :
                        <p>Drag 'n' drop a PDF here, or click to select a PDF</p>
                    }
                </div>
            )}
            {file && (
                <div>
                    <div style={{ height: '500px', marginTop: '20px' }}>
                        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`}>
                            <Viewer fileUrl={file} plugins={[defaultLayoutPluginInstance]} />
                        </Worker>
                    </div>
                    <button onClick={discardFile} style={{ marginTop: '10px' }}>
                        Discard PDF
                    </button>
                </div>
            )}
        </div>
    );
};

export default StyledDropzone;
