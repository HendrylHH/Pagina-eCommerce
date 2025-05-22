import useArmazenamentoLocal from '../hooks/useLocalStorage';
import { useEffect, useState } from 'react';

interface PropriedadesGaleriaImagensProduto {
  images: string[];
}

const GaleriaImagensProduto: React.FC<PropriedadesGaleriaImagensProduto> = ({ images }) => {
  const [imagemSelecionada, setImagemSelecionada] = useArmazenamentoLocal<number>('selectedImageIndex', 0);
  const [imagemCarregada, setImagemCarregada] = useState<boolean>(false);

  // Resetar estado de carregamento quando a imagem selecionada mudar
  useEffect(() => {
    setImagemCarregada(false);
  }, [imagemSelecionada]);

  if (!images || images.length === 0) {
    return <div className="text-red-500">Nenhuma imagem de produto disponível</div>;
  }
  
  return (
    <div className="w-full">
      {/* Imagem principal */}
      <div className="mb-4 rounded-lg overflow-hidden shadow-md w-full">
        <div className="aspect-[3/4] relative bg-gray-100 flex items-center justify-center">
          {!imagemCarregada && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          <img 
            src={images[imagemSelecionada]} 
            alt={`Visão do produto ${imagemSelecionada + 1}`}
            className={`w-full h-full object-contain ${imagemCarregada ? 'opacity-100' : 'opacity-0'}`}
            style={{ transition: 'opacity 0.3s ease-in-out' }}
            onLoad={() => setImagemCarregada(true)}
            onError={(e) => {
              // Fallback para uma imagem padrão caso a URL não exista
              e.currentTarget.src = `https://via.placeholder.com/400x500/cccccc/333333?text=Imagem+${imagemSelecionada+1}`;
              setImagemCarregada(true);
            }}
          />
        </div>
      </div>

      {/* Miniaturas */}
      <div className="flex space-x-2 overflow-x-auto pb-2 w-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`product-thumb aspect-square w-16 overflow-hidden ${
              imagemSelecionada === index ? 'product-thumb-active ring-2 ring-blue-500' : 'product-thumb-inactive'
            }`}
            onClick={() => setImagemSelecionada(index)}
          >
            <img
              src={image}
              alt={`Miniatura ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>    </div>
  );
};

export default GaleriaImagensProduto;
