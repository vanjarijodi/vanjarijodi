/**
 * Utility to apply a subtle "वंजारी जोडी • Vanjari Jodi" watermark to uploaded images.
 */
export async function applyWatermarkToImage(imageDataUrlOrFile: File | string, watermarkText = 'वंजारी जोडी • Vanjari Jodi'): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const handleLoad = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(typeof imageDataUrlOrFile === 'string' ? imageDataUrlOrFile : URL.createObjectURL(imageDataUrlOrFile));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Calculate font size based on image width
        const fontSize = Math.max(16, Math.floor(canvas.width / 24));
        ctx.font = `900 ${fontSize}px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.strokeStyle = 'rgba(128, 12, 30, 0.75)';
        ctx.lineWidth = Math.max(2, fontSize / 8);

        // Position at bottom right
        const margin = fontSize;
        const textWidth = ctx.measureText(watermarkText).width;
        const x = canvas.width - textWidth - margin;
        const y = canvas.height - margin;

        // Draw semi-transparent background badge
        ctx.fillStyle = 'rgba(128, 12, 30, 0.45)';
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x - 12, y - fontSize, textWidth + 24, fontSize + 12, [8]);
        } else {
          ctx.rect(x - 12, y - fontSize, textWidth + 24, fontSize + 12);
        }
        ctx.fill();

        // Draw text stroke and fill
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeText(watermarkText, x, y);
        ctx.fillText(watermarkText, x, y);

        // Export as JPEG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        resolve(dataUrl);
      } catch (err) {
        console.warn('Watermark applying fallback to original image', err);
        resolve(typeof imageDataUrlOrFile === 'string' ? imageDataUrlOrFile : URL.createObjectURL(imageDataUrlOrFile));
      }
    };

    if (typeof imageDataUrlOrFile === 'string') {
      img.src = imageDataUrlOrFile;
      img.onload = handleLoad;
      img.onerror = () => resolve(imageDataUrlOrFile);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
        img.onload = handleLoad;
        img.onerror = () => resolve(img.src);
      };
      reader.readAsDataURL(imageDataUrlOrFile);
    }
  });
}
