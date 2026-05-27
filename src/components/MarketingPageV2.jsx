import React, { useEffect, useState } from 'react';

const acceptedTypes = ['image/jpeg'];

const popupDefinitions = [
  {
    key: 'cumpleanios',
    title: 'Popup de cumpleanos',
    description: 'Actualiza la imagen y el enlace del modal de cumpleanos.',
    fileName: 'cumpleanios-popup.jpg',
  },
  {
    key: 'menu',
    title: 'Popup de menu diario',
    description: 'Actualiza la imagen y el enlace del modal de menu diario.',
    fileName: 'menu-popup.jpg',
  },
];

function PopupUploadCard({ popup, config, uploadUrl, onRefresh }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [linkValue, setLinkValue] = useState(config.modalLink || '');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLinkValue(config.modalLink || '');
  }, [config.modalLink]);

  useEffect(() => () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      setSelectedFile(null);
      setStatus({
        type: 'error',
        message: 'Solo se permiten imagenes JPG o JPEG.',
      });
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus({ type: '', message: '' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setStatus({ type: 'error', message: 'Selecciona una imagen antes de guardar.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('modalLink', linkValue.trim());
      formData.append('popupKey', popup.key);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      const rawBody = await response.text();
      let result;

      try {
        result = JSON.parse(rawBody);
      } catch {
        throw new Error(rawBody || 'El servidor no devolvio una respuesta valida.');
      }

      if (!response.ok || !result.success) {
        const debugMessage = result.debug ? ` ${JSON.stringify(result.debug)}` : '';
        throw new Error((result.message || 'No se pudo guardar la imagen.') + debugMessage);
      }

      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }
      setStatus({ type: 'success', message: 'Popup actualizado correctamente.' });
      onRefresh();
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Ocurrio un error al subir la imagen.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const effectivePreview = previewUrl || config.modalImage;

  return (
    <section className="rounded-3xl bg-white text-slate-900 p-6 shadow-2xl">
      <h2 className="text-xl font-bold mb-2">{popup.title}</h2>
      <p className="text-sm text-slate-600 mb-6">{popup.description}</p>

      <div className="rounded-3xl overflow-hidden bg-slate-900/90 min-h-[220px] flex items-center justify-center mb-5">
        {effectivePreview ? (
          <img src={effectivePreview} alt={popup.title} className="w-full h-full object-cover" />
        ) : (
          <p className="text-sm text-slate-300 px-6 text-center">
            Aun no hay una imagen configurada.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor={`file-${popup.key}`}>
            Imagen del popup
          </label>
          <input
            id={`file-${popup.key}`}
            type="file"
            accept=".jpg,.jpeg"
            onChange={handleFileChange}
            className="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:text-white file:cursor-pointer"
          />
          <p className="mt-2 text-xs text-slate-500">
            El archivo se guardara siempre como <code>{popup.fileName}</code>.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" htmlFor={`link-${popup.key}`}>
            Enlace del popup
          </label>
          <input
            id={`link-${popup.key}`}
            type="url"
            value={linkValue}
            onChange={(event) => setLinkValue(event.target.value)}
            placeholder="https://..."
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sky-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-sky-700 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-70 transition"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar popup'}
        </button>
      </form>

      {status.message && (
        <div
          className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
            status.type === 'success'
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {status.message}
        </div>
      )}
    </section>
  );
}

export default function MarketingPageV2({ uploadUrl, onBack, configs, refreshConfigs }) {
  return (
    <div className="min-h-screen cuerpo-color text-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-100">Marketing</p>
            <h1 className="text-3xl md:text-4xl font-bold">Administrar popups</h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold hover:bg-white hover:text-sky-700 transition"
          >
            Volver
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {popupDefinitions.map((popup) => (
            <PopupUploadCard
              key={popup.key}
              popup={popup}
              config={configs[popup.key] || {}}
              uploadUrl={uploadUrl}
              onRefresh={refreshConfigs}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
