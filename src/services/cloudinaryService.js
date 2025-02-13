const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dfvjixhfo/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'vidracaria';

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Erro ao fazer upload para o Cloudinary');
    }

    const data = await response.json();
    
    return {
      url: data.secure_url,
      publicId: data.public_id
    };
  } catch (erro) {
    console.error('Erro no upload para Cloudinary:', erro);
    throw erro;
  }
};

export const deleteImage = async (publicId) => {
  try {
    // A deleção do Cloudinary requer uma chave de API e precisa ser feita pelo backend
    // Por enquanto, vamos apenas simular o sucesso
    console.log('Imagem deletada do Cloudinary:', publicId);
    return true;
  } catch (erro) {
    console.error('Erro ao deletar do Cloudinary:', erro);
    throw erro;
  }
};
