/**
 * Imágenes placeholder que funcionan sin depender de via.placeholder.com
 * Usa picsum.photos que es un servicio confiable y gratuito
 */

export const PLACEHOLDER_IMAGES = {
  // Banner sizes (1080x300)
  banner: {
    size: '1080x300',
    urls: [
      'https://picsum.photos/1080/300?random=1',
      'https://picsum.photos/1080/300?random=2',
      'https://picsum.photos/1080/300?random=3',
      'https://picsum.photos/1080/300?random=4',
    ]
  },
  
  // List thumbnail (150x80)
  thumbnail: {
    size: '150x80',
    urls: [
      'https://picsum.photos/150/80?random=1',
      'https://picsum.photos/150/80?random=2',
      'https://picsum.photos/150/80?random=3',
    ]
  },

  // Stats thumbnail (40x40)
  small: {
    size: '40x40',
    urls: [
      'https://picsum.photos/40/40?random=1',
      'https://picsum.photos/40/40?random=2',
    ]
  }
};

/**
 * Obtener una imagen placeholder aleatoria para un tamaño específico
 * @param {string} type - 'banner', 'thumbnail', 'small'
 * @returns {string} URL de la imagen
 */
export const getRandomPlaceholder = (type = 'banner') => {
  const images = PLACEHOLDER_IMAGES[type]?.urls || PLACEHOLDER_IMAGES.banner.urls;
  return images[Math.floor(Math.random() * images.length)];
};

/**
 * SVG placeholder por si falla la imagen en línea
 * @param {number} width 
 * @param {number} height 
 * @returns {string} Data URL del SVG
 */
export const getSvgPlaceholder = (width = 400, height = 150) => {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect fill='%23e9ecef' width='${width}' height='${height}'/%3E%3Ctext x='50%' y='50%' font-family='Arial' font-size='16' fill='%23666' text-anchor='middle' dy='.3em'%3EImagen no disponible%3C/text%3E%3C/svg%3E`;
};
