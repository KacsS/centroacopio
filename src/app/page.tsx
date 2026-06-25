"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { affectedAreas, affectedCities } from "@/lib/affected-areas";
import { DeliveryVolunteer, ReliefCenter } from "@/lib/types";

const LOCAL_CENTERS = "relief_centers";
const LOCAL_DELIVERIES = "delivery_volunteers";

const initialCenterForm = {
  centerName: "",
  city: "",
  sector: "",
  address: "",
  description: "",
  attentionStart: "",
  attentionEnd: "",
  requiredSupplies: [] as string[],
};

const initialVolunteerForm = {
  name: "",
  city: "",
  sector: "",
  nearbyAddress: "",
  transportType: "moto" as "moto" | "carro" | "camion",
  phone: "",
};

export default function Home() {
  const [centers, setCenters] = useState<ReliefCenter[]>(() => {
    return safeReadLocal<ReliefCenter[]>(LOCAL_CENTERS) ?? [];
  });
  const [volunteers, setVolunteers] = useState<DeliveryVolunteer[]>(() => {
    return safeReadLocal<DeliveryVolunteer[]>(LOCAL_DELIVERIES) ?? [];
  });
  const [centerForm, setCenterForm] = useState(initialCenterForm);
  const [volunteerForm, setVolunteerForm] = useState(initialVolunteerForm);
  const [cityFilter, setCityFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  
  // "visualizar" o "registro_centro" o "registro_delivery"
  const [activeTab, setActiveTab] = useState<"visualizar" | "registro_centro" | "registro_delivery">("visualizar");
  const [viewType, setViewType] = useState<"centros" | "delivery">("centros");
  const [showRegisterNotice, setShowRegisterNotice] = useState(false);
  const [pendingRegisterType, setPendingRegisterType] = useState<"centro" | "delivery" | null>(null);
  const [supplyDraft, setSupplyDraft] = useState("");

  const sectorsByCity = useMemo(() => {
    if (!cityFilter) {
      return [] as string[];
    }
    return affectedAreas[cityFilter] ?? [];
  }, [cityFilter]);

  const filteredCenters = useMemo(() => {
    return centers.filter((item) => {
      const byCity = cityFilter ? item.city === cityFilter : true;
      const bySector = sectorFilter ? item.sector === sectorFilter : true;
      return byCity && bySector;
    });
  }, [centers, cityFilter, sectorFilter]);

  const filteredVolunteers = useMemo(() => {
    return volunteers.filter((item) => {
      const byCity = cityFilter ? item.city === cityFilter : true;
      const bySector = sectorFilter ? item.sector === sectorFilter : true;
      return byCity && bySector;
    });
  }, [volunteers, cityFilter, sectorFilter]);

  async function submitCenter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!centerForm.city || !centerForm.sector) {
      setStatusMessage("Selecciona ciudad y sector para registrar al centro.");
      return;
    }

    const newItem: ReliefCenter = {
      id: crypto.randomUUID(),
      centerName: centerForm.centerName.trim(),
      city: centerForm.city,
      sector: centerForm.sector,
      address: centerForm.address.trim(),
      description: centerForm.description.trim(),
      attentionStart: centerForm.attentionStart,
      attentionEnd: centerForm.attentionEnd,
      requiredSupplies: centerForm.requiredSupplies,
      createdAt: new Date().toISOString(),
    };

    if (
      !newItem.centerName ||
      !newItem.address ||
      !newItem.description ||
      !newItem.attentionStart ||
      !newItem.attentionEnd ||
      newItem.requiredSupplies.length === 0
    ) {
      setStatusMessage("Completa todos los campos obligatorios del centro de acopio.");
      return;
    }

    const next = [newItem, ...centers];
    setCenters(next);
    localStorage.setItem(LOCAL_CENTERS, JSON.stringify(next));

    void fetch("/api/centers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(centerForm),
    });

    setCenterForm(initialCenterForm);
    setSupplyDraft("");
    setStatusMessage("Centro de acopio registrado correctamente.");
    setActiveTab("visualizar");
    setViewType("centros");
    
    // Auto-scroll a la lista
    setTimeout(() => {
      document.getElementById("directorio-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  async function submitVolunteer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!volunteerForm.city || !volunteerForm.sector) {
      setStatusMessage("Selecciona ciudad y sector para registrar al voluntario.");
      return;
    }

    const newItem: DeliveryVolunteer = {
      id: crypto.randomUUID(),
      name: volunteerForm.name.trim(),
      city: volunteerForm.city,
      sector: volunteerForm.sector,
      nearbyAddress: volunteerForm.nearbyAddress.trim(),
      transportType: volunteerForm.transportType,
      phone: volunteerForm.phone.trim(),
      createdAt: new Date().toISOString(),
    };

    if (!newItem.name || !newItem.nearbyAddress || !newItem.phone) {
      setStatusMessage("Completa todos los campos obligatorios del voluntario.");
      return;
    }

    const next = [newItem, ...volunteers];
    setVolunteers(next);
    localStorage.setItem(LOCAL_DELIVERIES, JSON.stringify(next));

    void fetch("/api/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(volunteerForm),
    });

    setVolunteerForm(initialVolunteerForm);
    setStatusMessage("Voluntario de delivery registrado correctamente.");
    setActiveTab("visualizar");
    setViewType("delivery");

    // Auto-scroll a la lista
    setTimeout(() => {
      document.getElementById("directorio-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  function handleRegisterClick(type: "centro" | "delivery") {
    setPendingRegisterType(type);
    setShowRegisterNotice(true);
  }

  function handleAcceptNotice() {
    if (pendingRegisterType === "centro") {
      setActiveTab("registro_centro");
    } else if (pendingRegisterType === "delivery") {
      setActiveTab("registro_delivery");
    }
    setShowRegisterNotice(false);
    setPendingRegisterType(null);
    
    // Auto-scroll al formulario
    setTimeout(() => {
      document.getElementById("form-section")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top banner de Venezuela */}
      <div className="bg-white border-b border-slate-200 py-4 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/Flag_of_Venezuela.svg.webp"
              alt="Bandera de Venezuela"
              width={54}
              height={36}
              className="h-9 w-[54px] rounded-md border border-slate-200 object-cover shadow-sm"
              priority
            />
            <p className="text-sm font-semibold tracking-wide text-slate-700 text-center sm:text-left">
              Unidos por Venezuela: cada registro verídico aquí apoya directamente a una familia afectada.
            </p>
          </div>
          <div className="rounded-full border border-amber-500/30 bg-amber-50 px-4 py-1 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold tracking-wider text-amber-705 uppercase">
              #UnidosPorVenezuela
            </span>
          </div>
        </div>
      </div>

      {/* Main Landing / Hero (Estilo Poster / Redes sociales) */}
      <div 
        className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 overflow-hidden border-b border-slate-150"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(249, 115, 22, 0.04), transparent 45%),
            radial-gradient(circle at 90% 10%, rgba(14, 165, 233, 0.04), transparent 45%),
            radial-gradient(circle at 50% 80%, rgba(239, 68, 68, 0.02), transparent 50%)
          `,
        }}
      >
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-bold tracking-widest text-orange-700 uppercase">
            Terremoto 24 de Junio • Emergencia Nacional
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black leading-[1.1] tracking-tight text-slate-900">
            Red de Centros de <br />Acopio y Apoyo Solidario
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-3xl">
            Plataforma digital para registrar y consultar puntos de ayuda, centros de atención y voluntarios de delivery gratuito en tiempo real en las zonas afectadas de Venezuela.
          </p>

          {/* Caja global de advertencia integrada de manera profesional */}
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 p-5 backdrop-blur-md">
            <div className="flex gap-4 items-start">
              <span className="text-3xl" role="img" aria-label="Aviso">⚠️</span>
              <div>
                <h4 className="text-base font-bold text-amber-800">AVISO DE COOPERACION CRITICO</h4>
                <p className="mt-1 text-sm text-slate-700 leading-relaxed">
                  Para optimizar la logística, es indispensable <strong>comunicarse directamente con el centro antes de trasladar cualquier insumo</strong>. Esto garantiza que lleves lo que realmente se necesita hoy y que el sitio esté activo recibiendo donaciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tres Pilares Visuales / Seccion Informativa y de Acciones */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 grid gap-6 md:grid-cols-3">
        {/* Pilar 1: Centros de acopio */}
        <div className="flex flex-col justify-between rounded-3xl border border-orange-100 bg-white p-6 shadow-xs hover:shadow-md transition">
          <div>
            <span className="text-4xl" role="img" aria-label="Acopio">📦</span>
            <h3 className="mt-4 text-xl font-bold text-orange-700">Centros de Acopio</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Consulta o registra locaciones activas que están consolidando agua, alimentos no perecederos, medicamentos y ropa para las comunidades.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => {
                setActiveTab("visualizar");
                setViewType("centros");
                document.getElementById("directorio-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full rounded-xl bg-slate-100 border border-slate-200 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-200 transition"
            >
              Visualizar centros
            </button>
            <button
              onClick={() => handleRegisterClick("centro")}
              className="w-full rounded-xl bg-orange-500 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-orange-600 transition shadow-md"
            >
              Registrar nuevo centro
            </button>
          </div>
        </div>

        {/* Pilar 2: Deliveries */}
        <div className="flex flex-col justify-between rounded-3xl border border-rose-100 bg-white p-6 shadow-xs hover:shadow-md transition">
          <div>
            <span className="text-4xl" role="img" aria-label="Delivery">🏍️</span>
            <h3 className="mt-4 text-xl font-bold text-rose-700">Delivery Gratis</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Consulta o sumate a la red de camionetas, carros y motorizados voluntarios que transportan ayuda humanitaria sin costo hacia los puntos críticos.
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => {
                setActiveTab("visualizar");
                setViewType("delivery");
                document.getElementById("directorio-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full rounded-xl bg-slate-100 border border-slate-200 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-200 transition"
            >
              Visualizar deliveries
            </button>
            <button
              onClick={() => handleRegisterClick("delivery")}
              className="w-full rounded-xl bg-rose-500 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-rose-600 transition shadow-md"
            >
              Registrarse como transporte
            </button>
          </div>
        </div>

        {/* Pilar 3: Resumen ciudades afectadas */}
        <div className="flex flex-col justify-between rounded-3xl border border-sky-100 bg-white p-6 shadow-xs hover:shadow-md transition">
          <div>
            <span className="text-4xl" role="img" aria-label="Mapa">🗺️</span>
            <h3 className="mt-4 text-xl font-bold text-sky-700">Zonas Activas</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Red activa cubriendo los sectores críticos reportados en Caracas, La Guaira, Barquisimeto, Valencia, Maracay y Puerto Cabello.
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {affectedCities.map((city) => (
                <span key={city} className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs text-slate-700 font-semibold">
                  {city}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => {
                setActiveTab("visualizar");
                document.getElementById("directorio-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full rounded-xl bg-slate-100 border border-slate-200 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-200 transition"
            >
              Buscar por Ciudad/Sector
            </button>
          </div>
        </div>
      </div>

      {/* Seccion de Formularios de Registro (Solo visible si esta activo ese tab) */}
      {(activeTab === "registro_centro" || activeTab === "registro_delivery") && (
        <section id="form-section" className="mx-auto max-w-7xl px-4 py-8 border-t border-slate-200 scroll-mt-6">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              Cargar Nuevo Registro Solidario
            </h2>
            <button
              type="button"
              onClick={() => {
                setActiveTab("visualizar");
                document.getElementById("directorio-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-950 underline"
            >
              Volver al Directorio
            </button>
          </div>

          <div className="max-w-3xl mx-auto">
            {activeTab === "registro_centro" && (
              <article className="rounded-3xl border border-orange-200 bg-white p-6 md:p-8 shadow-xl">
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-xs font-bold tracking-wide text-orange-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  Formulario de Centro de Acopio
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Registrar centro de acopio</h3>
                
                <form onSubmit={submitCenter} className="grid gap-4">
                  <Input
                    label="Nombre del centro"
                    value={centerForm.centerName}
                    onChange={(value) => setCenterForm((prev) => ({ ...prev, centerName: value }))}
                    placeholder="Ej: Salón Parroquial San José o Centro Comunitario"
                  />
                  
                  <CitySectorRow
                    city={centerForm.city}
                    sector={centerForm.sector}
                    onCityChange={(value) => setCenterForm((prev) => ({ ...prev, city: value, sector: "" }))}
                    onSectorChange={(value) => setCenterForm((prev) => ({ ...prev, sector: value }))}
                  />
                  
                  <Input
                    label="Dirección exacta"
                    value={centerForm.address}
                    onChange={(value) => setCenterForm((prev) => ({ ...prev, address: value }))}
                    placeholder="Av. Principal, referencia cercana"
                  />
                  
                  <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
                    Descripción / Detalles de Iniciativa
                    <textarea
                      required
                      rows={3}
                      value={centerForm.description}
                      onChange={(event) =>
                        setCenterForm((prev) => ({ ...prev, description: event.target.value }))
                      }
                      placeholder="Describe quienes lideran la iniciativa, capacidad y que tipo de apoyo directo brindan"
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none ring-orange-500/10 transition focus:border-orange-500 focus:ring-2 focus:bg-white"
                    />
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
                      Hora de inicio de atención
                      <input
                        required
                        type="time"
                        value={centerForm.attentionStart}
                        onChange={(event) =>
                          setCenterForm((prev) => ({ ...prev, attentionStart: event.target.value }))
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-orange-500/10 transition focus:border-orange-500 focus:ring-2 focus:bg-white"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
                      Hora de cierre de atención
                      <input
                        required
                        type="time"
                        value={centerForm.attentionEnd}
                        onChange={(event) =>
                          setCenterForm((prev) => ({ ...prev, attentionEnd: event.target.value }))
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-orange-500/10 transition focus:border-orange-500 focus:ring-2 focus:bg-white"
                      />
                    </label>
                  </div>

                  {/* Listado interactivo de insumos */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <label className="text-sm font-semibold text-slate-700">
                      Insumos requeridos (Agrega lo esencial)
                    </label>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={supplyDraft}
                        onChange={(event) => setSupplyDraft(event.target.value)}
                        placeholder="Ej: alimentos enlatados, agua potable, sabanas"
                        className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-orange-500/10 transition focus:border-orange-500 focus:ring-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const cleaned = supplyDraft.trim();
                          if (!cleaned) {
                            return;
                          }
                          if (centerForm.requiredSupplies.some((item) => item.toLowerCase() === cleaned.toLowerCase())) {
                            setSupplyDraft("");
                            return;
                          }
                          setCenterForm((prev) => ({
                            ...prev,
                            requiredSupplies: [...prev.requiredSupplies, cleaned],
                          }));
                          setSupplyDraft("");
                        }}
                        className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600 transition"
                      >
                        Agregar
                      </button>
                    </div>

                    <ul className="mt-3 flex flex-wrap gap-2">
                      {centerForm.requiredSupplies.map((supply) => (
                        <li
                          key={supply}
                          className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700"
                        >
                          {supply}
                          <button
                            type="button"
                            onClick={() =>
                              setCenterForm((prev) => ({
                                ...prev,
                                requiredSupplies: prev.requiredSupplies.filter((item) => item !== supply),
                              }))
                            }
                            className="rounded-full hover:bg-orange-100 px-1.5 text-xs text-orange-600 font-extrabold"
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                    {centerForm.requiredSupplies.length === 0 && (
                      <p className="mt-2 text-xs text-slate-400">
                        Por favor, añade al menos un insumo específico para continuar.
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("visualizar")}
                      className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-orange-500 py-3 text-sm font-black tracking-wide text-white hover:bg-orange-600 transition shadow-md"
                    >
                      Guardar Centro de Acopio
                    </button>
                  </div>
                </form>
              </article>
            )}

            {activeTab === "registro_delivery" && (
              <article className="rounded-3xl border border-rose-200 bg-white p-6 md:p-8 shadow-xl">
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold tracking-wide text-rose-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  Formulario de Voluntario de Transporte
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-6">Registrarse como conductor solidario</h3>
                
                <form onSubmit={submitVolunteer} className="grid gap-4">
                  <Input
                    label="Nombre Completo"
                    value={volunteerForm.name}
                    onChange={(value) => setVolunteerForm((prev) => ({ ...prev, name: value }))}
                    placeholder="Tu nombre y apellido"
                  />

                  <CitySectorRow
                    city={volunteerForm.city}
                    sector={volunteerForm.sector}
                    onCityChange={(value) => setVolunteerForm((prev) => ({ ...prev, city: value, sector: "" }))}
                    onSectorChange={(value) => setVolunteerForm((prev) => ({ ...prev, sector: value }))}
                  />

                  <Input
                    label="Punto de referencia o dirección frecuente"
                    value={volunteerForm.nearbyAddress}
                    onChange={(value) => setVolunteerForm((prev) => ({ ...prev, nearbyAddress: value }))}
                    placeholder="Sectores o avenidas por las que te movilizas"
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
                      Tipo de transporte disponible
                      <select
                        value={volunteerForm.transportType}
                        onChange={(event) =>
                          setVolunteerForm((prev) => ({
                            ...prev,
                            transportType: event.target.value as "moto" | "carro" | "camion",
                          }))
                        }
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-rose-500/10 transition focus:border-rose-500 focus:ring-2 focus:bg-white"
                      >
                        <option value="moto">Moto (Agil, cargas livianas)</option>
                        <option value="carro">Carro (Cargas medianas, cajas)</option>
                        <option value="camion">Camión / Van (Cargas pesadas)</option>
                      </select>
                    </label>

                    <Input
                      label="Teléfono de contacto directo"
                      value={volunteerForm.phone}
                      onChange={(value) => setVolunteerForm((prev) => ({ ...prev, phone: value }))}
                      placeholder="Ej: 0412-0000000"
                    />
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab("visualizar")}
                      className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-rose-500 py-3 text-sm font-black tracking-wide text-white hover:bg-rose-600 transition shadow-md"
                    >
                      Confirmar Voluntariado
                    </button>
                  </div>
                </form>
              </article>
            )}
          </div>
        </section>
      )}

      {/* Directorio Principal y Busqueda (Siempre visible abajo) */}
      <section id="directorio-section" className="mx-auto max-w-7xl px-4 py-8 border-t border-slate-200 scroll-mt-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Directorio Civil de Ayuda</h2>
            <p className="text-slate-550 text-sm mt-1">
              Filtra por ciudad y sector para localizar ayuda disponible de inmediato.
            </p>
          </div>
          
          <div className="flex gap-2 rounded-2xl bg-white p-1 border border-slate-200 self-start">
            <button
              onClick={() => setViewType("centros")}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                viewType === "centros"
                  ? "bg-orange-500 text-white shadow-xs font-black"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Centros de acopio
            </button>
            <button
              onClick={() => setViewType("delivery")}
              className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                viewType === "delivery"
                  ? "bg-rose-500 text-white shadow-xs font-black"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Voluntarios delivery
            </button>
          </div>
        </div>

        {/* Formulario de Filtros */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase">
              Ciudad de emergencia
              <select
                value={cityFilter}
                onChange={(event) => {
                  const nextCity = event.target.value;
                  setCityFilter(nextCity);
                  setSectorFilter("");
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition focus:bg-white"
              >
                <option value="">Todas las ciudades venezolanas</option>
                {affectedCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase">
              Sector / Municipio
              <select
                value={sectorFilter}
                onChange={(event) => setSectorFilter(event.target.value)}
                disabled={!cityFilter}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition focus:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">Todos los sectores</option>
                {sectorsByCity.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setCityFilter("");
                  setSectorFilter("");
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Visualizacion de la base de datos */}
        {viewType === "centros" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCenters.map((center) => (
              <div
                key={center.id}
                className="relative rounded-3xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-orange-500/35 hover:shadow-xs transition"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="inline-flex rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                      {center.city}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      {center.sector}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 line-clamp-1">
                    {center.centerName}
                  </h4>
                  <p className="text-sm text-slate-600">
                    <strong className="text-slate-500">Dirección:</strong> {center.address}
                  </p>
                  <p className="text-sm text-slate-600 line-clamp-3">
                    <strong className="text-slate-500">Objetivo:</strong> {center.description}
                  </p>
                  <div className="rounded-xl bg-orange-50 border border-orange-100 p-2.5 text-xs">
                    <p className="text-orange-700 font-bold uppercase tracking-wider text-[10px]">
                      Horario de Recepción
                    </p>
                    <p className="text-slate-900 font-extrabold text-sm mt-0.5">
                      {center.attentionStart || "--:--"} a {center.attentionEnd || "--:--"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Insumos requeridos
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(center.requiredSupplies ?? []).map((supply) => (
                      <span
                        key={supply}
                        className="rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5 text-xs text-slate-700 font-medium"
                      >
                        {supply}
                      </span>
                    ))}
                    {(center.requiredSupplies ?? []).length === 0 && (
                      <span className="text-xs text-slate-400 italic">No especificado</span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredCenters.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-slate-500 font-medium text-sm">
                  No hay centros registrados que coincidan con los filtros y criterios aplicados.
                </p>
              </div>
            )}
          </div>
        )}

        {viewType === "delivery" && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVolunteers.map((volunteer) => (
              <div
                key={volunteer.id}
                className="relative rounded-3xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-rose-500/35 hover:shadow-xs transition"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="inline-flex rounded-full bg-rose-50 border border-rose-200 px-2.5 py-0.5 text-xs font-bold text-rose-700">
                      {volunteer.city}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      {volunteer.sector}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 line-clamp-1">
                    {volunteer.name}
                  </h4>
                  <p className="text-sm text-slate-600">
                    <strong className="text-slate-500">Movilización:</strong> {volunteer.nearbyAddress}
                  </p>
                  
                  <div className="flex gap-2 items-center rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <span className="text-2xl">
                      {volunteer.transportType === "moto" && "🏍️"}
                      {volunteer.transportType === "carro" && "🚗"}
                      {volunteer.transportType === "camion" && "🚛"}
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Transporte Disponible
                      </p>
                      <p className="text-slate-950 capitalize font-bold text-sm">
                        {volunteer.transportType}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Teléfono de Contacto
                    </span>
                    <p className="text-slate-905 font-extrabold text-sm mt-0.5">
                      {volunteer.phone}
                    </p>
                  </div>
                  <a
                    href={`tel:${volunteer.phone}`}
                    className="rounded-full bg-slate-100 border border-slate-200 hover:border-rose-500 p-2 text-slate-700 hover:text-rose-500 transition"
                    aria-label={`Llamar a ${volunteer.name}`}
                  >
                    📞
                  </a>
                </div>
              </div>
            ))}

            {filteredVolunteers.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-slate-500 font-medium text-sm">
                  No hay voluntarios registrados que coincidan con los filtros de ciudad y sector.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-200 bg-white p-4 text-sm font-semibold text-emerald-800 shadow-xl flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{statusMessage}</span>
          <button
            onClick={() => setStatusMessage("")}
            className="ml-2 text-xs text-slate-400 hover:text-slate-900"
          >
            ✕
          </button>
        </div>
      )}

      {/* Modal de Advertencia Profesional antes de registrar */}
      {showRegisterNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-xs px-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 inline-flex rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold tracking-wide text-amber-700 uppercase">
              🚨 Control de Información Sensible
            </div>
            
            <h3 className="text-xl font-extrabold text-slate-950">
              Suministro Exclusivo de Datos Reales
            </h3>
            
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Para garantizar el éxito de la ayuda a las zonas afectadas, todas las locaciones, horarios, insumos y teléfonos que registres deben ser <strong>reales, verificados e inmediatos</strong>.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              La carga de información falsa o bromas interrumpe el trabajo logístico de los cuerpos civiles de rescate. Le agradecemos actuar con el máximo sentido cívico y profesional.
            </p>
            
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setShowRegisterNotice(false);
                  setPendingRegisterType(null);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAcceptNotice}
                className="rounded-xl bg-amber-500 px-4 py-1.5 text-sm font-black text-white transition hover:bg-amber-600 shadow-md"
              >
                Entiendo y continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
      {label}
      <input
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 outline-none ring-amber-500/10 transition focus:border-amber-500 focus:ring-2 focus:bg-white"
      />
    </label>
  );
}

function CitySectorRow({
  city,
  sector,
  onCityChange,
  onSectorChange,
}: {
  city: string;
  sector: string;
  onCityChange: (value: string) => void;
  onSectorChange: (value: string) => void;
}) {
  const sectors = city ? affectedAreas[city] ?? [] : [];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
        Ciudad
        <select
          required
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 focus:bg-white outline-none transition"
        >
          <option value="">Selecciona la ciudad</option>
          {affectedCities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
        Sector / Municipio
        <select
          required
          value={sector}
          onChange={(event) => onSectorChange(event.target.value)}
          disabled={!city}
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 focus:bg-white outline-none transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <option value="">Selecciona el sector</option>
          {sectors.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function safeReadLocal<T>(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
