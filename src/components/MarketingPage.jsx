import React, { useEffect, useMemo, useState } from 'react';

const acceptedTypes = ['image/jpeg'];

export default function MarketingPage({ baseUrl, configUrl, uploadUrl, onBack }) {
  const [currentImage, setCurrentImage] = useState('');
  const [currentLink, setCurrentLink] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [linkValue, setLinkValue] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const effectivePreview = useMemo(() => previewUrl || currentImage, [previewUrl, currentImage]);

  useEffect(() => {
    let ignore = false;

    fetch(configUrl, { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('No se pudo leer la configuracion actual.');
        }

        return response.json();
      })
      .then((data) => {
        if (ignore) {
          return;
        }

        setCurrentImage(data.modalImage || '');
        setCurrentLink(data.modalLink || '');
        setLinkValue(data.modalLink || '');
      })
      .catch(() => {
        if (ignore) {
          return;
        }

        setStatus({
          type: 'error',
          message: 'No se pudo cargar la configuracion actual del popup.',
        });
      });

    return () => {
      ignore = true;
    };
  }, [configUrl]);

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
        const debugMessage = result.debug
          ? ` ${JSON.stringify(result.debug)}`
          : '';
        throw new Error((result.message || 'No se pudo guardar la imagen.') + debugMessage);
      }

      setCurrentImage(result.modalImage || '');
      setCurrentLink(result.modalLink || '');
      setLinkValue(result.modalLink || '');
      setSelectedFile(null);
      setStatus({ type: 'success', message: 'Popup actualizado correctamente.' });

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Ocurrio un error al subir la imagen.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen cuerpo-color text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-100">Marketing</p>
            <h1 className="text-3xl md:text-4xl font-bold">Actualizar popup institucional</h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-white/40 px-5 py-2 text-sm font-semibold hover:bg-white hover:text-sky-700 transition"
          >
            Volver
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl bg-white text-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Cargar nueva imagen</h2>
            <p className="text-sm text-slate-600 mb-6">
              La imagen se reemplaza en la carpeta servida por Apache y se refleja en el popup.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" htmlFor="marketing-image">
                  Imagen del popup
                </label>
                <input
                  id="marketing-image"
                  type="file"
                  accept=".jpg,.jpeg"
                  onChange={handleFileChange}
                  className="block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:text-white file:cursor-pointer"
                />
                <p className="mt-2 text-xs text-slate-500">
                  El archivo se guardara siempre como <code>marketing-popup.jpg</code>.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" htmlFor="marketing-link">
                  Enlace del popup
                </label>
                <input
                  id="marketing-link"
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

          <section className="rounded-3xl bg-slate-950/20 border border-white/15 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold mb-4">Vista previa</h2>

            <div className="rounded-3xl overflow-hidden bg-slate-900/60 min-h-[280px] flex items-center justify-center">
              {effectivePreview ? (
                <img
                  src={effectivePreview}
                  alt="Vista previa del popup"
                  className="w-full h-full object-cover"
                />
              ) : (
                <p className="text-sm text-cyan-100 px-6 text-center">
                  Aun no hay una imagen seleccionada ni configurada.
                </p>
              )}
            </div>

            <div className="mt-4 text-sm text-cyan-50/90 space-y-2">
              <p>
                <span className="font-semibold">Imagen actual:</span>{' '}
                {currentImage ? (
                  <a href={currentImage} target="_blank" rel="noreferrer" className="underline break-all">
                    {currentImage}
                  </a>
                ) : (
                  'No configurada'
                )}
              </p>
              <p>
                <span className="font-semibold">Link actual:</span>{' '}
                {currentLink || 'Sin enlace'}
              </p>
              <p>
                <span className="font-semibold">Base actual:</span> {baseUrl}
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
