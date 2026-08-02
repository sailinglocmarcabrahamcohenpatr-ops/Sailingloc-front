export interface CompressedImage {
  /** Aperçu base64 affiché dans le formulaire */
  preview: string;
  /** Fichier JPEG redimensionné — c'est lui qui est envoyé à l'API (les photos brutes d'un téléphone peuvent peser plusieurs Mo et rendent l'upload très lent) */
  file: File;
}

/** Downscales and JPEG-compresses an image file client-side before preview/upload. */
export function compressImage(file: File, maxWidth = 1600, quality = 0.8): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture du fichier impossible"));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Image invalide"));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas non supporté"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const preview = canvas.toDataURL("image/jpeg", quality);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Compression impossible"));
              return;
            }
            const name = file.name.replace(/\.\w+$/, "") + ".jpg";
            resolve({ preview, file: new File([blob], name, { type: "image/jpeg" }) });
          },
          "image/jpeg",
          quality,
        );
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
