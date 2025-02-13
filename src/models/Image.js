import { db } from '../config/firebase';
import { collection, addDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { uploadImage as uploadToCloudinary, deleteImage as deleteFromCloudinary } from '../services/cloudinaryService';

const COLLECTION_NAME = 'images';

export const addImage = async (file) => {
  try {
    // 1. Upload para o Cloudinary
    const cloudinaryResponse = await uploadToCloudinary(file);
    
    if (!cloudinaryResponse || !cloudinaryResponse.url || !cloudinaryResponse.publicId) {
      throw new Error('Resposta inválida do Cloudinary');
    }

    // 2. Salvar referência no Firestore
    const imageData = {
      url: cloudinaryResponse.url,
      publicId: cloudinaryResponse.publicId,
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), imageData);

    return {
      id: docRef.id,
      ...imageData
    };
  } catch (erro) {
    console.error('Erro ao adicionar imagem:', erro);
    throw erro;
  }
};

export const getAllImages = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const images = [];
    
    querySnapshot.forEach((doc) => {
      images.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Ordenar por data de criação (mais recentes primeiro)
    return images.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  } catch (erro) {
    console.error('Erro ao buscar imagens:', erro);
    throw erro;
  }
};

export const deleteSliderImage = async (id, publicId) => {
  try {
    // 1. Deletar do Cloudinary
    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    // 2. Deletar do Firestore
    await deleteDoc(doc(db, COLLECTION_NAME, id));

    return true;
  } catch (erro) {
    console.error('Erro ao deletar imagem:', erro);
    throw erro;
  }
};
