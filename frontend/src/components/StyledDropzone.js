import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const StyledDropzone = ({ file, setFile }) => {
    const [fileUrl, setFileUrl] = useState(null);
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file && file.type === 'application/pdf') {
            setFile(file);  // Almacenar el archivo en el estado principal
        } else {
            alert('Por favor, sube un archivo PDF.');
        }
    };

    useEffect(() => {
        // Crear la URL del blob solo cuando el archivo cambie
        if (file) {
            const fileBlobUrl = URL.createObjectURL(file);
            setFileUrl(fileBlobUrl);

            // Liberar la URL del blob cuando se desmonte o cambie el archivo
            return () => {
                URL.revokeObjectURL(fileBlobUrl);
            };
        }
    }, [file]);

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
                        <p>Suelte el PDF aquí ...</p> :
                        <p>Arrastre y suelte un PDF aquí, o haga clic para seleccionar un PDF</p>
                    }
                </div>
            )}
            {file && fileUrl && (
                <div>
                    <div style={{ height: '500px', marginTop: '20px' }}>
                        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`}>
                            <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
                        </Worker>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StyledDropzone;
