import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getBusinessById } from "../actions/services";
import { getServicesByBusinessId } from "../actions/services";
import Modal from "../components/Modal";
import Header from "../components/Header";
import { Star } from "lucide-react";
import { geocodeAddress } from "../utils/geocoding";
import { Business } from "../types/business";
import { Toaster } from "sonner";

const BusinessDetails = () => {
  const { businessId } = useParams<{ businessId: string }>();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  // Función para generar la URL de Uber con la dirección del negocio
  const getUberUrl = () => {
    if (!business || !coordinates) return "https://m.uber.com";
    
    // Crear el objeto de dirección para Uber
    const addressObject = {
      addressLine1: business.street,
      addressLine2: `${business.neighborhood}, ${business.city}, ${business.state}, ${business.country}`,
      id: "", // Este ID es específico de Google Places y no lo tenemos
      source: "SEARCH",
      latitude: coordinates.lat,
      longitude: coordinates.lon,
      provider: "google_places"
    };
    
    // Codificar el objeto para la URL
    const encodedAddress = encodeURIComponent(JSON.stringify(addressObject));
    
    // Formato para ubicación de recogida (pickup)
    return `https://m.uber.com/go/pickup?drop[0]=${encodedAddress}&effect=`;
  };

  useEffect(() => {
    const fetchBusinessData = async () => {
      if (!businessId) return;

      try {
        // Obtener negocio
        const businessData = await getBusinessById(parseInt(businessId)) as Business;
        setBusiness(businessData);

        // Obtener coordenadas
        const address = `${businessData.street}, ${businessData.neighborhood}, ${businessData.city}, ${businessData.state}, ${businessData.country}`;
        const coords = await geocodeAddress(address);
        setCoordinates(coords);

        // Obtener servicios por business_id
        const servicesData = await getServicesByBusinessId(parseInt(businessId));
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching business data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, [businessId]);

  const handleOpenModal = (service: any) => {
    if (!business) return;
    
    const formattedService = {
      ...service,
      provider: {
        name: business.business_name,
        image: business.image,
        rating: 4.5,
        reviews: 150
      }
    };
    setSelectedService(formattedService);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  if (loading) {
    return <div className="text-center text-gray-600">Cargando...</div>;
  }

  if (!business) {
    return <div className="text-center text-red-500">No se encontró información del negocio.</div>;
  }

  return (
    <div className="bg-white min-h-screen">
      <Toaster richColors position="bottom-center" />
      <Header />
      <main className="max-w-5xl mx-auto p-6">
        {/* Imagen del negocio */}
        <div className="w-full h-48 sm:h-56 md:h-64 lg:h-80 mb-6 overflow-hidden">
          <img src={business.image} alt={business.business_name} className="w-full h-full object-cover" />
        </div>

        {/* Información del negocio */}
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">{business.business_name}</h2>
          <p className="text-lg sm:text-xl text-gray-600">{business.description}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Ubicación</h3>
              <p className="text-gray-600">{`${business.street}, ${business.neighborhood}, ${business.city}, ${business.state}, ${business.country}`}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Teléfono</h3>
              <p className="text-gray-600">{business.phone}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Email</h3>
              <p className="text-gray-600">{business.email}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Horario de Operación</h3>
              <p className="text-gray-600">{business.operation_hours}</p>
            </div>
          </div>
        </div>

        {/* Reseñas de clientes */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Reseñas de clientes</h3>
          <div className="text-yellow-500">★★★★★</div>
          <p className="text-gray-600 text-sm mt-2">Absolutely amazing experience! The pictures turned out beautifully.</p>
        </div>

        {/* WhatsApp Button */}
        <div className="mt-6">
          <a 
            href={`https://wa.me/${business.phone}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all w-full sm:w-auto inline-block text-center"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </main>

      {/* Servicios */}
      <section className="max-w-5xl mx-auto mt-12 px-6">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-gray-800">Servicios</h3>
        {services.length === 0 ? (
          <p className="text-gray-600 text-center">No hay servicios disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-40 w-full rounded-t-xl overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.service_name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden border">
                      <img
                        src={business.image}
                        alt={business.business_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{business.business_name}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="w-4 h-4 text-yellow-400 ml-1" />
                        <span>4.5 (150)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg">{service.service_name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm font-medium pt-2">
                    <span>${service.price}</span>
                  </div>

                  <button 
                    className="w-full py-2 text-center bg-purple-200 text-purple-700 font-semibold rounded-lg hover:bg-purple-300 transition"
                    onClick={() => handleOpenModal(service)}
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sección del Mapa */}
      <section className="max-w-5xl mx-auto mt-12 px-6 mb-12">
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-gray-800">Ubicación</h3>
        <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
          <div className="aspect-video w-full">
            {coordinates ? (
              <iframe
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lon - 0.01},${coordinates.lat - 0.01},${coordinates.lon + 0.01},${coordinates.lat + 0.01}&layer=mapnik&marker=${coordinates.lat},${coordinates.lon}`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">Cargando mapa...</p>
              </div>
            )}
          </div>
          <div className="p-6">
            <h4 className="text-xl font-semibold text-gray-900 mb-2">Dirección</h4>
            <p className="text-gray-600">{`${business.street}, ${business.neighborhood}, ${business.city}, ${business.state}, ${business.country}`}</p>
            
            <div className="mt-4">
              {/* Botón de Uber */}
              <a
                href={getUberUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 3c5 0 9 4 9 9s-4 9-9 9-9-4-9-9 4-9 9-9zm.3 13.5l-.3.4v.3c0 .3-.2.5-.5.5s-.5-.2-.5-.5v-.7l-.1-.2-3.2-3.2c-.2-.2-.2-.5 0-.7s.5-.2.7 0l2.8 2.8V6.5c0-.3.2-.5.5-.5s.5.2.5.5v10.8l2.8-2.8c.2-.2.5-.2.7 0s.2.5 0 .7l-3.3 3.2z"/>
                </svg>
                Pedir Uber
              </a>
            </div>
          </div>
        </div>
      </section>

      {isModalOpen && selectedService && (
        <Modal
          service={selectedService}
          onClose={handleCloseModal}
          isOpen={isModalOpen}
        />
      )}
    </div>
  );
};

export default BusinessDetails;
