"use client";

import Image from "next/image";

export default function PromoImage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 py-10">
      {/* Contenedor exacto de 1080x1080 para formato Instagram / Redes Sociales */}
      <div
        id="promo-card"
        className="relative flex h-[1080px] w-[1080px] flex-col justify-between bg-white p-20 text-slate-900 overflow-hidden shadow-2xl border border-slate-200"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(249, 115, 22, 0.04), transparent 45%),
            radial-gradient(circle at 90% 10%, rgba(14, 165, 233, 0.04), transparent 45%),
            radial-gradient(circle at 50% 80%, rgba(239, 68, 68, 0.02), transparent 50%)
          `,
        }}
      >
        {/* Adornos de fondo */}
        <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-amber-500/5 to-red-500/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-sky-500/5 to-emerald-500/5 blur-[120px] pointer-events-none" />

        {/* Header del Poster */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Image
              src="/Flag_of_Venezuela.svg.webp"
              alt="Bandera de Venezuela"
              width={150}
              height={100}
              className="h-20 w-[225px] rounded-2xl border border-slate-200 object-cover shadow-lg"
              priority
            />
            <div>
              <p className="text-xl font-black tracking-widest text-sky-600 uppercase">
                Terremoto 24 de Junio
              </p>
              <p className="text-3xl font-extrabold text-slate-800">
                Emergencia Nacional
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-50 px-6 py-3">
            <span className="text-xl font-bold tracking-wider text-amber-700">
              #UnidosPorVenezuela
            </span>
          </div>
        </div>

        {/* Contenido Central */}
        <div className="my-auto space-y-8">
          <h2 className="text-7xl font-black leading-[1.1] tracking-tight text-slate-900">
            Red de Centros <br />
            de Acopio y Apoyo
          </h2>
          
          <p className="text-4xl text-slate-600 font-medium leading-relaxed max-w-4xl">
            Plataforma digital para registrar y consultar puntos de ayuda, centros de atencion y voluntarios de delivery gratuito en tiempo real.
          </p>

          {/* Tres Pilares Visuales */}
          <div className="grid grid-cols-3 gap-8 pt-10">
            <div className="rounded-3xl border border-orange-200 bg-orange-50 p-8 shadow-xs">
              <span className="text-5xl">📦</span>
              <h3 className="mt-4 text-2xl font-bold text-orange-700">Centros de Acopio</h3>
              <p className="mt-2 text-lg text-slate-600">
                Registra y localiza donde llevar alimentos, agua, ropa y formulas infantiles.
              </p>
            </div>
            
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 shadow-xs">
              <span className="text-5xl">🏍️</span>
              <h3 className="mt-4 text-2xl font-bold text-rose-700">Delivery Gratis</h3>
              <p className="mt-2 text-lg text-slate-600">
                Registrate como motorizado, conductor o camionero para transporte de insumos.
              </p>
            </div>

            <div className="rounded-3xl border border-sky-200 bg-sky-50 p-8 shadow-xs">
              <span className="text-5xl">⭐</span>
              <h3 className="mt-4 text-2xl font-bold text-sky-700">Ciudades Activas</h3>
              <p className="mt-2 text-lg text-slate-600">
                Caracas, La Guaira, Barquisimeto, Valencia, Maracay, Puerto Cabello y mas.
              </p>
            </div>
          </div>
        </div>

        {/* footer del Poster */}
        <div className="border-t border-slate-205 pt-10 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-2xl font-semibold text-slate-500">Ingresa y suma tu apoyo en:</span>
            <p className="text-4xl font-extrabold tracking-tight text-slate-900">
              http://localhost:3000
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-2xl font-black text-amber-600">¿Tienes informacion?</p>
              <p className="text-lg text-slate-500">¡Registra un punto o voluntario hoy!</p>
            </div>
            <div className="h-28 w-28 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md border border-slate-250">
              {/* QR Mockup */}
              <div className="relative w-full h-full bg-slate-50 flex flex-col justify-between p-2 border-2 border-slate-950 rounded-lg">
                <div className="flex justify-between">
                  <div className="w-4 h-4 bg-slate-950 rounded-xs" />
                  <div className="w-4 h-4 bg-slate-950 rounded-xs" />
                </div>
                <div className="my-1 flex-1 flex flex-wrap gap-1 justify-center items-center content-center">
                  <div className="w-1.5 h-1.5 bg-slate-950" />
                  <div className="w-1.5 h-1.5 bg-slate-950" />
                  <div className="w-1.5 h-1.5 bg-slate-950" />
                  <div className="w-1.5 h-1.5 bg-slate-950" />
                  <div className="w-1.5 h-1.5 bg-slate-950" />
                  <div className="w-1.5 h-1.5 bg-slate-950" />
                  <div className="w-1.5 h-1.5 bg-slate-950" />
                  <div className="w-1.5 h-1.5 bg-slate-955" />
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 bg-slate-950 rounded-xs" />
                  <div className="w-4 h-4 bg-slate-950 rounded-xs" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}