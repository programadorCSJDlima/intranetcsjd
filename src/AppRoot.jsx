import './App.css';
import React, { useEffect, useMemo, useState } from 'react';
import CardView from './components/Card';
import ModalViewMenu from './components/ModalMenu';
import ModalViewCumpleanios from './components/ModalCumpleanios';
import MarketingPage from './components/MarketingPage';

export default function AppRoot() {
  const currentYear = new Date().getFullYear();
  const [imagePath, setImagePath] = useState('');
  const [modalLink, setModalLink] = useState('');
  const [onEat, setOnEat] = useState(false);
  const [onBirthay, setOnBirthday] = useState(false);
  const [pathname, setPathname] = useState(window.location.pathname);

  const base = import.meta.env.BASE_URL;
  const asset = (path) => `${base}${path}`;
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const configUrl = asset('images/publicacion/config.json');
  const uploadUrl = asset('api/marketing-upload.php');

  const isMarketingRoute = useMemo(() => {
    const expectedPath = `${normalizedBase}/marketing`;
    return pathname === expectedPath || pathname === `${expectedPath}/`;
  }, [normalizedBase, pathname]);

  useEffect(() => {
    const updatePathname = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', updatePathname);
    return () => window.removeEventListener('popstate', updatePathname);
  }, []);

  useEffect(() => {
    fetch(configUrl, { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (!data.modalImage) {
          return;
        }

        const modalImage = data.modalImage.startsWith('http')
          ? data.modalImage
          : asset(data.modalImage.replace(/^\/+/, ''));

        setImagePath(modalImage);
        setModalLink(data.modalLink || '');
      })
      .catch((error) => console.error('Error cargando config', error));
  }, [configUrl]);

  const openMarketingRoute = () => {
    const nextPath = `${normalizedBase}/marketing`;
    window.history.pushState({}, '', nextPath);
    setPathname(nextPath);
  };

  const goHome = () => {
    const nextPath = normalizedBase || '/';
    window.history.pushState({}, '', nextPath);
    setPathname(nextPath);
  };

  if (isMarketingRoute) {
    return (
      <MarketingPage
        baseUrl={`${window.location.origin}${base}`}
        configUrl={configUrl}
        uploadUrl={uploadUrl}
        onBack={goHome}
      />
    );
  }

  return (
    <div className="cuerpo-color min-h-screen w-full">
      <header className="cabecera-color text-white py-4 mb-2 shadow-md">
        <div className="px-4 max-w-screen-xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="bg-white w-24 rounded-2xl h-10 flex justify-center mr-5">
              <img
                src={asset('images/sign.png')}
                alt="Logo Clinica San Juan de Dios"
                className="w-auto rounded-2xl h-10"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Intranet Clinica San Juan de Dios
            </h1>
          </div>

          <button
            type="button"
            onClick={openMarketingRoute}
            className="rounded-full border border-white/40 px-4 py-2 text-sm font-semibold hover:bg-white hover:text-sky-700 transition"
          >
            Marketing
          </button>
        </div>
      </header>

      <main className="px-4 pb-8 w-full max-w-screen-xl mx-auto">
        <section className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-3">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-3">
              General
            </h2>
            <div className="grid gap-4">
              <CardView img={asset('images/gcolas.png')} title="" link="http://10.10.0.135:9091/icola/" />
              <div className="grid grid-cols-2 gap-4">
                <CardView img={asset('images/powerbi.png')} title="" link="https://app.powerbi.com/groups/me/reports/1ba43cd1-607f-4041-b216-35f640272ed7/ReportSection2c86bdabbd1ecafa6224?" />
                <CardView img={asset('images/outlook.png')} title="" link="https://outlook.cloud.microsoft/mail/" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CardView img={asset('images/office365.png')} title="" link="https://www.microsoft365.com/?auth=2&home=1" />
                <CardView img={asset('images/registro_citas.png')} title="ANDREUX" link="https://telemed.clinicasanjuandedioslima.org/ANDREUX/index.php" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-3">
              Accesos directos
            </h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <CardView img={asset('images/servicedesk.png')} title="Soporte Tecnico" link="https://wa.me/51965379331?text=Hola%20Buenos%20dias" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CardView img={asset('images/capacitaciones.png')} title="Capacitaciones" link="https://wa.me/51944575982?text=Hola%20Buenos%20dias" />
              </div>
              <CardView img={asset('images/pagina_clinica.png')} title="Pagina Web Clinica San Juan de Dios" link="https://clinicalima.sanjuandedios.pe/" />
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-3">
              Festivos y mas...
            </h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <span onClick={() => setOnEat(true)}>
                  <CardView img={asset('images/cumpleanios_csjd.png')} />
                </span>
                <span onClick={() => setOnBirthday(true)}>
                  <CardView img={asset('images/menu_csjd.png')} />
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CardView img={asset('images/archivos.png')} link="/" />
                <CardView img={asset('images/directorio.png')} link="/" />
              </div>
             
            </div>
          </div>

          <div className="lg:col-span-4">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-3">
              Mas
            </h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <CardView img={asset('images/incidentes-eventos.png')} title="Incidentes y Eventos Adversos" link="https://forinead.clinicasanjuandedioslima.com/" />
                <CardView img={asset('images/turecibo.png')} title="Tu Recibo" link="https://rh.softlandcapitalhumano.com/LogIn/LogOn?ReturnUrl=" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CardView img={asset('images/chequeo.png')} title="Chequeo Medico" link="https://api.whatsapp.com/send?phone=51944576001&text=%C2%A1Hola%2C%20Cl%C3%ADnica%20San%20Juan%20de%20Dios%20Lima!%20Deseo%20informaci%C3%B3n%20sobre%20sus%20servicios%20y%20especialidades%2C%20por%20favor%20%3C3" />
                <CardView img={asset('images/seguridad-salud.png')} title="Seguridad en el trabajo CSJD" link="https://www.oracle.com/database/technologies/appdev/ocmt.html" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="cabecera-color text-white py-2 mt-6 w-full text-center">
        <p className="text-sm">&copy; {currentYear} Clinica San Juan de Dios. Todos los derechos reservados.</p>
      </footer>

      <ModalViewCumpleanios
        isOpen={onEat}
        onClose={() => setOnEat(false)}
        img={imagePath}
        link={modalLink}
      />

      <ModalViewMenu
        isOpen={onBirthay}
        onClose={() => setOnBirthday(false)}
        img={imagePath}
        link={modalLink}
      />
    </div>
  );
}
